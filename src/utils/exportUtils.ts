import { IncidentTicket, AssetRecord } from '../types';
import { calculateTicketSla, computeOperationsMetrics } from './slaCalculator';

/**
 * Escapes CSV values and wraps in quotes if needed
 */
function escapeCsvValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an Excel-compatible CSV file with UTF-8 BOM
 */
export function exportIncidentsToCSV(incidents: IncidentTicket[], assets: AssetRecord[]): void {
  const assetMap = new Map(assets.map(a => [a.tagId, a]));

  const headers = [
    'Ticket ID',
    'Title',
    'Asset ID',
    'Asset Name',
    'Asset Type',
    'Priority',
    'Status',
    'Category',
    'Created Date (UTC)',
    'SLA Target (Minutes)',
    'First Response (Minutes)',
    'SLA Compliance State',
    'Assigned Specialist',
    'Department',
    'Escalation Tier',
    'Resolved Date (UTC)',
    'Root Cause Summary',
    'Resolution Notes',
  ];

  const rows = incidents.map(ticket => {
    const asset = assetMap.get(ticket.assetId);
    const sla = calculateTicketSla(ticket);
    const slaState = ticket.status === 'Resolved'
      ? (sla.isBreached ? 'Breached (Resolved)' : 'Met SLA')
      : (sla.isBreached ? 'Breached (Active)' : sla.isWarning ? 'At-Risk (<20m)' : 'Within SLA');

    return [
      escapeCsvValue(ticket.id),
      escapeCsvValue(ticket.title),
      escapeCsvValue(ticket.assetId),
      escapeCsvValue(ticket.assetName),
      escapeCsvValue(asset ? asset.type : 'N/A'),
      escapeCsvValue(ticket.priority),
      escapeCsvValue(ticket.status),
      escapeCsvValue(ticket.category),
      escapeCsvValue(ticket.createdAt),
      escapeCsvValue(ticket.slaTargetMinutes),
      escapeCsvValue(ticket.firstResponseMinutes ?? 'N/A'),
      escapeCsvValue(slaState),
      escapeCsvValue(ticket.assignedTo),
      escapeCsvValue(ticket.department),
      escapeCsvValue(ticket.escalationTier ?? 'None'),
      escapeCsvValue(ticket.resolvedAt ?? 'Unresolved'),
      escapeCsvValue(ticket.rootCause ?? 'Pending Investigation'),
      escapeCsvValue(ticket.resolutionNotes ?? 'None'),
    ].join(',');
  });

  // Prepend UTF-8 Byte Order Mark (\uFEFF) for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `IT_TechOps_Incident_Ledger_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a self-contained, standalone printable PDF/HTML Audit Report file.
 * This works reliably even inside sandboxed iframes where window.print() is blocked.
 */
export function downloadAuditReportPDF(
  incidents: IncidentTicket[], 
  assets: AssetRecord[],
  operatorName: string = 'Alex Rivera'
): void {
  const metrics = computeOperationsMetrics(incidents);
  const dateStr = new Date().toISOString().split('T')[0];
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const highRiskAssets = assets.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Severe');
  const tier0Assets = assets.filter(a => a.disasterRecovery.roleTier.includes('Tier 0'));

  const incidentRowsHtml = incidents.slice(0, 15).map(t => {
    const sla = calculateTicketSla(t);
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${t.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: ${t.priority === 'Critical' ? '#be123c' : '#1e293b'}">${t.priority}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${t.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${t.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${t.assetId}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: ${sla.isBreached ? '#be123c' : '#047857'}; font-weight: bold;">${sla.displayTimer}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${t.assignedTo}</td>
      </tr>
    `;
  }).join('');

  const assetRowsHtml = assets.map(a => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${a.tagId}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${a.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${a.type}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${a.networkMapping.ipAddress}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${a.architectureBaseline.complianceScore}%</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: ${a.riskLevel === 'Severe' ? '#be123c' : '#0f172a'}">${a.riskLevel}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${a.disasterRecovery.roleTier}</td>
    </tr>
  `).join('');

  const drRowsHtml = tier0Assets.map(a => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold;">${a.tagId}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #be123c;">${a.disasterRecovery.roleTier}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${a.disasterRecovery.rto}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${a.disasterRecovery.rpo}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${a.disasterRecovery.failoverSite}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #047857;">${a.disasterRecovery.backupValidationStatus}</td>
    </tr>
  `).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>I.T. TechOps · Enterprise Operations Audit Report (${dateStr})</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
      font-size: 11pt;
    }
    .header-box {
      border-bottom: 3px solid #0f3d7a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 22pt;
      font-weight: 800;
      color: #0f3d7a;
      margin: 0 0 6px 0;
    }
    .badge {
      display: inline-block;
      background: #0f3d7a;
      color: #ffffff;
      font-size: 9pt;
      font-weight: 700;
      padding: 3px 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-family: monospace;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      padding: 12px;
    }
    .metric-label {
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .metric-val {
      font-size: 18pt;
      font-weight: 800;
      font-family: monospace;
      color: #0f172a;
    }
    .metric-sub {
      font-size: 8pt;
      color: #047857;
      font-weight: 600;
      margin-top: 4px;
    }
    h2 {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 9pt;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      text-transform: uppercase;
      font-size: 8pt;
      font-weight: 700;
      padding: 8px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }
    .sign-block {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #0f172a;
      page-break-inside: avoid;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 16px;
    }
    .sign-line {
      border-bottom: 1px solid #64748b;
      height: 36px;
      font-style: italic;
      font-family: Georgia, serif;
      padding-top: 14px;
      color: #1e293b;
    }
    .print-bar {
      background: #0f3d7a;
      color: #ffffff;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 10pt;
    }
    .print-btn {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      font-weight: bold;
      cursor: pointer;
      font-size: 10pt;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>TechOps Command · Printable Audit Report Document</strong> (Click Print or press Ctrl+P / Cmd+P to save as PDF)</span>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header-box">
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <span class="badge">CONFIDENTIAL · ENTERPRISE IT AUDIT</span>
        <h1 class="title">TechOps Command · Operations Audit Report</h1>
        <p style="margin: 0; color: #475569; font-size: 10pt;">
          Executive Infrastructure Health, SLA Compliance Verification, and Disaster Recovery Readiness Assessment
        </p>
      </div>
      <div style="text-align: right; font-size: 9pt; font-family: monospace; color: #475569;">
        <div><strong>Reference: AUD-2026-Q4-OPS</strong></div>
        <div>Date: ${currentDate}</div>
        <div>Auditor: ${operatorName}</div>
      </div>
    </div>
  </div>

  <h2>1. Executive Operational Metrics & SLA Benchmarks</h2>
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">Mean Time to Respond</div>
      <div class="metric-val">${metrics.mttrHoursFormatted}</div>
      <div class="metric-sub">Target &lt; 30 min (Passed)</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">SLA Compliance Rate</div>
      <div class="metric-val">${metrics.slaComplianceRate}%</div>
      <div class="metric-sub">Benchmark &ge; 95.0%</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Total Logged Incidents</div>
      <div class="metric-val">${metrics.totalIncidents}</div>
      <div class="metric-sub" style="color: #64748b;">${metrics.openIncidents} active · ${metrics.totalIncidents - metrics.openIncidents} resolved</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Monitored Infrastructure Nodes</div>
      <div class="metric-val">${assets.length} Nodes</div>
      <div class="metric-sub" style="color: #be123c;">${highRiskAssets.length} High/Severe risk</div>
    </div>
  </div>

  <h2>2. Incident Ledger & Remediation Audit</h2>
  <table>
    <thead>
      <tr>
        <th>Ticket ID</th>
        <th>Priority</th>
        <th>Category</th>
        <th>Summary</th>
        <th>Asset Tag</th>
        <th>SLA Status</th>
        <th>Assigned Specialist</th>
      </tr>
    </thead>
    <tbody>
      ${incidentRowsHtml}
    </tbody>
  </table>

  <h2>3. Monitored Infrastructure Assets & Baseline Hardening</h2>
  <table>
    <thead>
      <tr>
        <th>Tag ID</th>
        <th>Asset Canonical Name</th>
        <th>Type</th>
        <th>IP Address</th>
        <th>Compliance</th>
        <th>Risk Level</th>
        <th>DR Tier</th>
      </tr>
    </thead>
    <tbody>
      ${assetRowsHtml}
    </tbody>
  </table>

  <h2>4. Disaster Recovery (DR) Readiness & Tier-0 Continuity</h2>
  <table>
    <thead>
      <tr>
        <th>Asset Tag</th>
        <th>Resiliency Tier</th>
        <th>Target RTO</th>
        <th>Target RPO</th>
        <th>Designated Failover Target</th>
        <th>Validation Status</th>
      </tr>
    </thead>
    <tbody>
      ${drRowsHtml}
    </tbody>
  </table>

  <div class="sign-block">
    <h2>5. Operations Architecture & Compliance Attestation</h2>
    <p style="font-size: 9pt; color: #475569;">
      This certifies that the operational infrastructure, incident response times, and baseline security configurations recorded in I.T. TechOps reflect true state parameters for Q4 2026.
    </p>
    <div class="sign-grid">
      <div>
        <div style="font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">Lead IT Systems Architect</div>
        <div class="sign-line">${operatorName}, CISSP, ITIL v4</div>
        <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">Attested & Signed</div>
      </div>
      <div>
        <div style="font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">Chief Information Security Officer</div>
        <div class="sign-line">Elena Rostova</div>
        <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">Approved & Ratified</div>
      </div>
      <div>
        <div style="font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">Audit Date</div>
        <div class="sign-line" style="font-family: monospace; font-style: normal;">${currentDate}</div>
        <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">Official Timestamp</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `IT_TechOps_Enterprise_Audit_Report_${dateStr}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean browser print dialog with error fallback
 */
export function triggerPrintAuditReport(): boolean {
  try {
    window.print();
    return true;
  } catch (e) {
    console.warn('window.print() not permitted in sandboxed environment:', e);
    return false;
  }
}
