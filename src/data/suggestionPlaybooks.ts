import { PriorityLevel, TicketCategory } from '../types';

export interface SuggestionPlaybook {
  id: string;
  name: string;
  badge: string;
  category: TicketCategory;
  priority: PriorityLevel;
  assetId: string;
  department: string;
  escalationTier: string;
  title: string;
  description: string;
  rootCause: string;
  resolutionNotes: string;
  recommendedSlaMinutes: number;
}

export const SUGGESTION_PLAYBOOKS: SuggestionPlaybook[] = [
  {
    id: 'pb-db-lock',
    name: 'PostgreSQL Lock Contention & Pool Saturation',
    badge: 'Critical · 30m SLA',
    category: 'Business Systems',
    priority: 'Critical',
    assetId: 'AST-DB-003',
    department: 'Business Systems',
    escalationTier: 'Tier 3 Infrastructure',
    title: 'High latency & connection pool saturation on Production SAP ERP PostgreSQL cluster',
    description: 'Active database connections reached maximum pool capacity (495/500). Multiple batch queries in pg_stat_activity holding RowExclusiveLock on general ledger tables, triggering 504 Gateway Timeouts across ERP services.',
    rootCause: 'Unindexed sequential table scan on general_ledger_postings during concurrent month-end batch write jobs.',
    resolutionNotes: 'Terminated non-responsive blocking query PID. Implemented emergency index creation CONCURRENTLY. Scaled PgBouncer pool limits.',
    recommendedSlaMinutes: 30,
  },
  {
    id: 'pb-vpn-bgp',
    name: 'GlobalProtect VPN & Upstream BGP Route Flap',
    badge: 'High · 2h SLA',
    category: 'Network',
    priority: 'High',
    assetId: 'AST-NET-014',
    department: 'SecOps',
    escalationTier: 'Tier 2 SysOps',
    title: 'Intermittent packet drops (>15%) & latency spike across GlobalProtect VPN gateway',
    description: 'Remote staff reporting recurrent VPN disconnections and high terminal jitter (260ms). MTR trace isolates packet drops between primary Tier-1 carrier e& / du transit and UAE IX / SmartHub peering exchange.',
    rootCause: 'Upstream transit BGP route flapping with primary Tier-1 peering provider.',
    resolutionNotes: 'Applied BGP path prepend on firewall FW-PRIMARY to force symmetric routing over secondary Cogent WAN link.',
    recommendedSlaMinutes: 120,
  },
  {
    id: 'pb-mfa-fatigue',
    name: 'Okta / Azure AD MFA Push Fatigue Attack',
    badge: 'Critical · 30m SLA',
    category: 'Access/Security',
    priority: 'Critical',
    assetId: 'AST-SRV-001',
    department: 'SecOps',
    escalationTier: 'SecOps CIRT',
    title: 'Adversary-in-the-Middle (AiTM) MFA exhaustion alert on privileged corporate account',
    description: '16 repeated push verification prompts triggered within 7 minutes originating from suspicious foreign ASN. Threat actor attempting to exhaust user vigilance into approving unauthorized session.',
    rootCause: 'Cached legacy browser session token phished via adversary reverse-proxy combined with automated credential replay.',
    resolutionNotes: 'Globally revoked Azure AD refresh tokens and Kerberos tickets. Locked account, forced password reset, and enrolled FIDO2 WebAuthn hardware security key.',
    recommendedSlaMinutes: 30,
  },
  {
    id: 'pb-k8s-oom',
    name: 'Billing API Ingress Pod CrashLoopBackOff',
    badge: 'Critical · 30m SLA',
    category: 'Business Systems',
    priority: 'Critical',
    assetId: 'AST-APP-009',
    department: 'Engineering',
    escalationTier: 'Tier 3 Infrastructure',
    title: 'Customer Billing API Kubernetes Ingress replica crashloop due to OOMKilled state',
    description: '4 out of 10 ingress replica pods entering CrashLoopBackOff on /api/v2/checkout endpoint. Error rates peaked at 18% with HTTP 502 Bad Gateway responses.',
    rootCause: 'Kubernetes deployment memory limit was set to 512Mi instead of 2Gi following base container image update.',
    resolutionNotes: 'Patched Helm deployment manifest resource limits to 2Gi. Verified rolling pod restart with 0 HTTP 5xx errors.',
    recommendedSlaMinutes: 30,
  },
  {
    id: 'pb-stp-loop',
    name: 'Core Switch STP BPDU Guard Port Flap',
    badge: 'Medium · 8h SLA',
    category: 'Network',
    priority: 'Medium',
    assetId: 'AST-NET-031',
    department: 'Infrastructure & Cloud',
    escalationTier: 'Tier 2 SysOps',
    title: 'Campus Core Switch trunk interface in err-disabled state due to BPDU Guard trigger',
    description: 'Switchport Gi1/0/18 auto-disabled by BPDU Guard following detection of unauthorized bridge device emitting superior Spanning Tree BPDUs on Floor 2 LAN.',
    rootCause: 'Unauthorized unmanaged 5-port consumer switch bridged to wall jack causing network topology broadcast loop.',
    resolutionNotes: 'Isolated switchport Gi1/0/18, removed unauthorized hub, re-enabled BPDU filter, and restored port-security.',
    recommendedSlaMinutes: 480,
  },
  {
    id: 'pb-san-optical',
    name: 'Pure Storage SAN Fibre Channel Light Loss',
    badge: 'Low · 24h SLA',
    category: 'Hardware',
    priority: 'Low',
    assetId: 'AST-SAN-008',
    department: 'Infrastructure & Cloud',
    escalationTier: 'Tier 2 SysOps',
    title: 'Fibre Channel SAN Controller B SFP optical transceiver degraded receive power',
    description: 'Pure Storage Pure1 telemetry warned of optical receive power drop to -14.2 dBm on FC Port CT0.FC2, approaching bit error rate threshold.',
    rootCause: 'Dust ferrule contamination on LC connector tip during rack cable dressing.',
    resolutionNotes: 'Cleaned LC fiber ferrule with One-Click fiber optic cleaner. Light levels restored to nominal -3.8 dBm.',
    recommendedSlaMinutes: 1440,
  },
  {
    id: 'pb-workstation-thermal',
    name: 'Workstation Battery Degradation & Swell',
    badge: 'High · 2h SLA',
    category: 'Hardware',
    priority: 'High',
    assetId: 'AST-WKS-104',
    department: 'IT Operations',
    escalationTier: 'Tier 2 SysOps',
    title: 'Critical battery pouch swelling & thermal throttling alert on Executive laptop',
    description: 'Hardware diagnostic code BATT-SW-901 flagged. Physical chassis distortion noticed around trackpad. CPU throttling to 800MHz under thermal protection.',
    rootCause: 'Lithium-ion pouch cell degradation under prolonged continuous 135W dock charging.',
    resolutionNotes: 'Issued hot-swap loaner workstation. Backed up user profile via Intune. Isolated suspect unit in fire-retardant safety container.',
    recommendedSlaMinutes: 120,
  },
];
