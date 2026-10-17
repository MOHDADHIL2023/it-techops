import { IncidentTicket, PriorityLevel } from '../types';

export interface SlaStatusResult {
  remainingMinutes: number;
  elapsedMinutes: number;
  isBreached: boolean;
  isWarning: boolean;
  isResolved: boolean;
  displayTimer: string;
  badgeClass: string;
}

export function calculateTicketSla(ticket: IncidentTicket): SlaStatusResult {
  const created = new Date(ticket.createdAt).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - created) / (60 * 1000));
  const remainingMinutes = ticket.slaTargetMinutes - elapsedMinutes;

  if (ticket.status === 'Resolved') {
    const isBreached = (ticket.firstResponseMinutes ?? elapsedMinutes) > ticket.slaTargetMinutes;
    return {
      remainingMinutes: 0,
      elapsedMinutes: ticket.firstResponseMinutes ?? elapsedMinutes,
      isBreached,
      isWarning: false,
      isResolved: true,
      displayTimer: isBreached ? 'Breached (Resolved)' : 'Met SLA (Resolved)',
      badgeClass: isBreached ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }

  const isBreached = remainingMinutes <= 0;
  const isWarning = remainingMinutes > 0 && remainingMinutes <= 20;

  let displayTimer = '';
  if (isBreached) {
    const overdue = Math.abs(remainingMinutes);
    const hrs = Math.floor(overdue / 60);
    const mins = overdue % 60;
    displayTimer = hrs > 0 ? `-${hrs}h ${mins}m breached` : `-${mins}m breached`;
  } else {
    const hrs = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    displayTimer = hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
  }

  let badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (isBreached) {
    badgeClass = 'text-rose-700 bg-rose-50 border-rose-300 font-semibold';
  } else if (isWarning) {
    badgeClass = 'text-amber-800 bg-amber-50 border-amber-300 font-semibold';
  }

  return {
    remainingMinutes,
    elapsedMinutes,
    isBreached,
    isWarning,
    isResolved: false,
    displayTimer,
    badgeClass,
  };
}

export interface OperationsMetrics {
  mttrMinutes: number; // Mean Time to Respond
  mttrHoursFormatted: string;
  slaComplianceRate: number; // %
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  escalatedIncidents: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  topImpactedSystems: { assetId: string; assetName: string; incidentCount: number; criticalCount: number }[];
  priorityDistribution: { priority: PriorityLevel; count: number }[];
}

export function computeOperationsMetrics(incidents: IncidentTicket[]): OperationsMetrics {
  if (incidents.length === 0) {
    return {
      mttrMinutes: 0,
      mttrHoursFormatted: '0m',
      slaComplianceRate: 100,
      totalIncidents: 0,
      openIncidents: 0,
      criticalIncidents: 0,
      escalatedIncidents: 0,
      categoryBreakdown: [],
      topImpactedSystems: [],
      priorityDistribution: [
        { priority: 'Critical', count: 0 },
        { priority: 'High', count: 0 },
        { priority: 'Medium', count: 0 },
        { priority: 'Low', count: 0 },
      ],
    };
  }

  // Calculate Mean Time to Respond (MTTR)
  const respondedTickets = incidents.filter(i => i.firstResponseMinutes !== null);
  const totalResponseTime = respondedTickets.reduce((sum, i) => sum + (i.firstResponseMinutes || 0), 0);
  const mttrMinutes = respondedTickets.length > 0 ? Math.round(totalResponseTime / respondedTickets.length) : 0;
  
  const mttrHours = Math.floor(mttrMinutes / 60);
  const mttrRemain = mttrMinutes % 60;
  const mttrHoursFormatted = mttrHours > 0 ? `${mttrHours}h ${mttrRemain}m` : `${mttrRemain}m`;

  // Calculate SLA compliance rate
  let compliantCount = 0;
  incidents.forEach(ticket => {
    const responseTime = ticket.firstResponseMinutes;
    if (responseTime !== null) {
      if (responseTime <= ticket.slaTargetMinutes) {
        compliantCount++;
      }
    } else {
      const sla = calculateTicketSla(ticket);
      if (!sla.isBreached) {
        compliantCount++;
      }
    }
  });

  const slaComplianceRate = Math.round((compliantCount / incidents.length) * 100);

  // Status counts
  const openIncidents = incidents.filter(i => i.status === 'Open' || i.status === 'In-Progress').length;
  const criticalIncidents = incidents.filter(i => i.priority === 'Critical' && i.status !== 'Resolved').length;
  const escalatedIncidents = incidents.filter(i => i.status === 'Escalated').length;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  incidents.forEach(i => {
    categoryMap.set(i.category, (categoryMap.get(i.category) || 0) + 1);
  });
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / incidents.length) * 100),
  })).sort((a, b) => b.count - a.count);

  // Top impacted systems
  const assetMap = new Map<string, { assetName: string; count: number; critical: number }>();
  incidents.forEach(i => {
    const existing = assetMap.get(i.assetId) || { assetName: i.assetName, count: 0, critical: 0 };
    existing.count += 1;
    if (i.priority === 'Critical') {
      existing.critical += 1;
    }
    assetMap.set(i.assetId, existing);
  });

  const topImpactedSystems = Array.from(assetMap.entries())
    .map(([assetId, data]) => ({
      assetId,
      assetName: data.assetName,
      incidentCount: data.count,
      criticalCount: data.critical,
    }))
    .sort((a, b) => b.incidentCount - a.incidentCount)
    .slice(0, 5);

  // Priority distribution
  const priorityDistribution: { priority: PriorityLevel; count: number }[] = [
    { priority: 'Critical', count: incidents.filter(i => i.priority === 'Critical').length },
    { priority: 'High', count: incidents.filter(i => i.priority === 'High').length },
    { priority: 'Medium', count: incidents.filter(i => i.priority === 'Medium').length },
    { priority: 'Low', count: incidents.filter(i => i.priority === 'Low').length },
  ];

  return {
    mttrMinutes,
    mttrHoursFormatted,
    slaComplianceRate,
    totalIncidents: incidents.length,
    openIncidents,
    criticalIncidents,
    escalatedIncidents,
    categoryBreakdown,
    topImpactedSystems,
    priorityDistribution,
  };
}
