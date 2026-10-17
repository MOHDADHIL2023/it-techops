export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In-Progress' | 'Resolved' | 'Escalated';
export type TicketCategory = 'Network' | 'Hardware' | 'Business Systems' | 'Access/Security';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  note?: string;
}

export interface IncidentTicket {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  priority: PriorityLevel;
  status: TicketStatus;
  category: TicketCategory;
  createdAt: string; // ISO string
  updatedAt?: string;
  slaTargetMinutes: number; // SLA threshold
  firstResponseMinutes: number | null;
  resolvedAt: string | null;
  assignedTo: string;
  department: string;
  description: string;
  rootCause?: string;
  resolutionNotes?: string;
  escalationTier?: string;
  activityLog: ActivityLogItem[];
}

export type LifecycleStage = 'Procured' | 'Deployed' | 'Maintenance' | 'Retired';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Severe';
export type AssetType = 'Server' | 'Network' | 'Database' | 'Storage SAN' | 'Workstation Fleet' | 'Cloud Infrastructure';

export interface ArchitectureBaseline {
  osBaseline: string;
  patchLevel: string;
  firmwareVersion: string;
  complianceScore: number; // 0-100%
  encryptionStandard: string;
  syslogDestination: string;
  lastAudited: string;
}

export interface NetworkMapping {
  ipAddress: string;
  subnetMask: string;
  vlanId: number;
  vlanName: string;
  defaultGateway: string;
  macAddress: string;
  switchPort: string;
  operationalStatus: 'Online' | 'Degraded' | 'Isolated' | 'Maintenance';
}

export interface DisasterRecovery {
  roleTier: 'Tier 0 - Mission Critical' | 'Tier 1 - Business Essential' | 'Tier 2 - Operational' | 'Tier 3 - Non-Critical';
  rto: string; // e.g., "< 15 min"
  rpo: string; // e.g., "0 min (Sync)"
  failoverSite: string;
  replicationCadence: string;
  lastDrillDate: string;
  backupValidationStatus: 'Verified' | 'Pending Review' | 'Warning';
}

export interface AssetRecord {
  tagId: string;
  name: string;
  type: AssetType;
  modelSpecs: string;
  assignedUser: string;
  userRole: string;
  department: string;
  lifecycleStage: LifecycleStage;
  warrantyExpiry: string; // YYYY-MM-DD
  licenseRenewalDate: string; // YYYY-MM-DD
  riskLevel: RiskLevel;
  location: string;
  architectureBaseline: ArchitectureBaseline;
  networkMapping: NetworkMapping;
  disasterRecovery: DisasterRecovery;
}

export interface DiagnosticStep {
  id: string;
  title: string;
  description: string;
  commandSnippet?: {
    tool: string; // e.g. "bash", "PowerShell", "kubectl", "netstat"
    command: string;
    description: string;
  };
  expectedResult: string;
  remediationAction?: string;
  isTerminal?: boolean; // final resolution reached or hard failure
  recommendedPriority?: PriorityLevel;
  nextSteps?: {
    yesLabel?: string;
    yesStepId?: string;
    noLabel?: string;
    noStepId?: string;
  };
}

export interface DiagnosticTree {
  id: string;
  title: string;
  category: TicketCategory;
  symptomSummary: string;
  initialStepId: string;
  steps: Record<string, DiagnosticStep>;
  sopChecklist: string[];
}
