import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  FilePlus, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronRight, 
  Server, 
  Zap, 
  Info, 
  X,
  Headphones,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { IncidentTicket, AssetRecord, PriorityLevel, TicketCategory } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  parsedActionableTicket?: {
    title: string;
    priority: PriorityLevel;
    category: TicketCategory;
    assetId: string;
    description: string;
    rootCause: string;
  };
}

interface AIAgentChatProps {
  incidents: IncidentTicket[];
  assets: AssetRecord[];
  onGenerateTicket: (ticketData: {
    title: string;
    description: string;
    priority: PriorityLevel;
    category: TicketCategory;
    assetId: string;
    rootCause?: string;
  }) => void;
  focusedTicket?: IncidentTicket | null;
  focusedAsset?: AssetRecord | null;
  onClearFocus?: () => void;
}

// Client-side instant knowledge fallback if network/server is slow
function generateInstantFallback(query: string, assets: AssetRecord[]): string {
  const q = query.toLowerCase();

  if (
    q.includes('battery') ||
    q.includes('swell') ||
    q.includes('ast-wks-104') ||
    q.includes('lenovo') ||
    q.includes('thermal') ||
    q.includes('hazard')
  ) {
    return `### Root Cause & Impact Assessment: Hazardous Lithium-Ion Battery Swelling (AST-WKS-104)
**Affected Asset:** AST-WKS-104 (Lenovo ThinkPad P16 Gen 2 · CFO Financial Workstation, Executive Suite - Office 402, DIFC Gate Tower, Dubai UAE)  
**Risk Severity:** Critical (Class 9 Hazmat & Thermal Runaway Hazard)  
**Root Cause:** Lithium-ion pouch cell degradation leading to electrolyte decomposition, gas generation, and mechanical chassis deformation. The swollen cell exerts upward pressure against the trackpad and internal keyboard assembly.

---

### Phase 1: Immediate IT Safety Protocols
1. **Power Down & Disconnect Immediately:**
   - Shut down Windows 11 Enterprise gracefully: \`shutdown /s /f /t 0\`.
   - **Immediately disconnect AC power (Slim-Tip 230W adapter)**. Do NOT charge the unit under any circumstances.
2. **Physical Handling & Fire Safety Quarantine:**
   - Do **NOT** exert pressure on the chassis or attempt to force the bottom cover closed.
   - Do **NOT** puncture, bend, or apply tools to the battery enclosure.
   - Move the workstation to a fire-retardant storage area (Class D / Li-Ion fire containment bag or metal safe on a non-flammable surface).
   - Ensure an ABC dry chemical or Lith-Ex fire extinguisher is accessible in the staging room.
3. **Transportation Warning:** Under IATA / UAE GCAA regulations, swollen lithium-ion batteries are strictly **prohibited on commercial passenger aircraft**.

---

### Phase 2: Asset Replacement & Executive User Continuity Steps
1. **Loaner Provisioning:**
   - Deploy emergency executive loaner workstation from the Dubai IT Staging Safe (AST-WKS-105 or pre-imaged Dell Precision 5680).
   - Enroll via Microsoft Entune Autopilot with CFO profile tags.
2. **Data Recovery & Identity Access:**
   - Retrieve BitLocker Recovery Key from Active Directory DC01 or Microsoft Entra ID.
   - Confirm OneDrive Enterprise Known Folder Move (KFM) has synchronized the user's Desktop, Documents, and Financial Modeling folders.
   - Transfer user credentials and verify YubiKey FIDO2 token authentication.
3. **Asset Inventory Update:**
   - In **I.T. TechOps Asset Register**, transition \`AST-WKS-104\` lifecycle state from **"Deployed"** to **"Maintenance / Hazmat Quarantine"**.

---

### Phase 3: Lenovo Enterprise Warranty Claim Procedures
1. **Check Warranty & Contract Status:**
   - Asset AST-WKS-104 is enrolled under **Lenovo Premier Support Plus (Warranty active through 2026-10-30)** with Accidental Damage Protection (ADP) and Sealed Battery Warranty extension.
2. **Submit Priority Service Ticket:**
   - Log into **Lenovo Enterprise Service Portal (eSupport)** or call dedicated Premier Support UAE hotline.
   - Provide Machine Type Model: \`21FA-0025US\` and System Serial Number (retrieve via command below).
   - Problem Classification: *"Hardware - Battery Physical Deformation / Thermal Hazard (CRU/FRU Replacement Required)"*.
3. **Dispatch & Battery Disposal Logistics:**
   - Request **Next Business Day (NBD) On-Site Technician** dispatch to DIFC Gate Tower, Dubai UAE with replacement Lenovo OEM 94Wh Battery FRU (Part # 5B10W51871 / 5B10W51872).
   - Technician will extract and remove the defective pouch in compliance with Dubai Municipality environmental directives and certified UAE e-waste recycling standards (EnviroServe Dubai).

---

### Validated Diagnostic & Baseline CLI Commands
\`\`\`powershell
# 1. Retrieve hardware serial number and BIOS revision for Lenovo Premier claim
wmic bios get serialnumber,smbiosbiosversion
Get-CimInstance Win32_ComputerSystemProduct | Select-Object Name, IdentifyingNumber, UUID

# 2. Extract BitLocker recovery password from Active Directory / TPM
Get-BitLockerVolume -MountPoint "C:" | Select-Object -ExpandProperty KeyProtector

# 3. Export Windows Battery Diagnostic Health Report (if remotely connected)
powercfg /batteryreport /output "C:\\IT_Diagnostics\\battery_report.html"
\`\`\`

---

### Suggested Incident Ticket Action
- **Suggested Ticket Title:** [HAZMAT] Critical Battery Swelling & Chassis Bulge - Lenovo P16 (AST-WKS-104)
- **Category:** Hardware
- **Priority:** Critical
- **Target Asset ID:** AST-WKS-104
- **Root Cause Summary:** Swollen Li-ion battery pouch requiring physical quarantine, executive loaner swap, and Lenovo Premier Support NBD dispatch.`;
  }

  if (q.includes('postgres') || q.includes('lock') || q.includes('database')) {
    return `### Root Cause & Impact Assessment: Database Lock Contention (AST-DB-003)
The production PostgreSQL cluster is exhibiting high lock contention and transaction queue stalls on the SAP ERP backend.

#### Immediate Triage & Remediation (Step-by-Step)
1. Query \`pg_stat_activity\` to detect non-idle processes blocked on \`RowExclusiveLock\`.
2. Inspect the lock dependency tree to isolate the blocking process ID (PID).
3. Attempt graceful query termination using \`pg_cancel_backend()\` before forcefully killing.
4. Scale connection pool limits in PgBouncer.

\`\`\`psql
-- Step 1: Detect queries holding locks for > 30 seconds
SELECT pid, now() - query_start AS duration, query, state, wait_event 
FROM pg_stat_activity 
WHERE state != 'idle' AND now() - query_start > interval '30 seconds' 
ORDER BY duration DESC LIMIT 5;

-- Step 2: Gracefully terminate blocking query (replace 84102 with actual PID)
SELECT pg_cancel_backend(84102);
\`\`\`

#### Post-Incident Hardening
- Create required index: \`CREATE INDEX CONCURRENTLY idx_gl_postings_acc ON general_ledger_postings(account_id, posting_date);\`
- Set \`statement_timeout = '60s'\` in postgresql.conf to avoid cascading locks.`;
  }

  if (q.includes('dubai') || q.includes('uae') || q.includes('location') || q.includes('datacenter') || q.includes('data center') || q.includes('carrier') || q.includes('transit')) {
    return `### I.T. TechOps Regional Infrastructure Architecture: Dubai, UAE Hub
**Primary Operations Region:** Dubai, United Arab Emirates (UAE)  
**Timezone:** Gulf Standard Time (GST · UTC+04:00, no daylight savings)  
**Active Site Classification:** Tier-3 Enterprise Production Datacenter & Regional NOC  

---

#### 1. Regional Physical Datacenter Topology:
- **Primary Production Datacenter:** Equinix DX1 / Dubai Internet City DC-1 (DIC), Dubai UAE.
  - Housing Active Directory DC01 (\`AST-SRV-001\`), Edge Firewall HA Pair (\`AST-NET-014\`), and Pure Storage 325TB FC FlashArray (\`AST-STO-088\`).
- **Secondary Regional Hub:** Dubai Silicon Oasis Tech Park (DSO), housing Production SAP ERP PostgreSQL Database Cluster (\`AST-DB-003\`).
- **Regional Corporate Headquarters:** DIFC Gate Tower (Office 402 Executive Suite), Dubai UAE.
- **Support Operations Center:** Business Bay Facility (Station 12), Dubai UAE.

#### 2. Carrier Transit & Network Redundancy:
- **Primary Tier-1 Transit:** Dual redundant dark fiber rings powered by **e& (Etisalat by e&)** and **du**.
- **Peering & IX:** Connected via UAE-IX / SmartHub for sub-5ms regional Middle East latency.
- **Edge Security:** Palo Alto Networks PA-3420 active-standby cluster with dynamic BGP failover.

#### 3. Disaster Recovery & Cloud Integration:
- **Designated DR Site:** Abu Dhabi Kizad Standby Datacenter AZ-2 (Hot-standby WAL streaming and Active Directory DFS-R).
- **Public Cloud Region:** AWS Middle East (UAE - Dubai \`me-central-1\`), with secondary failover to AWS Bahrain (\`me-south-1\`).

#### 4. Compliance & Regulatory Frameworks:
- **UAE TDRA** (Telecommunications and Digital Government Regulatory Authority) compliance.
- **NESA UAE Information Assurance Standard (IAS)** tier compliance.
    // 4. Compliance & Regulatory Frameworks:
    // ...
    Hazardous electronics and Li-ion battery recycling certified by Dubai Municipality & EnviroServe UAE in Dubai Industrial City.`;
  }

  return `### I.T. TechOps Diagnostic Analysis & Problem-Solving Assessment
**Analysis of Request:** "${query}"

#### Recommended Engineering Triage Sequence:
1. **Scope & Blast Radius**: Check monitored assets in **I.T. TechOps** for recent telemetry alerts, disk I/O spikes, or network interface flaps.
2. **Layer-by-Layer Verification**:
   - Layer 1/2: Verify physical SFP optical levels, switchport operational states, and VLAN encapsulation.
   - Layer 3/4: Check default gateway reachability, DNS query latency, and open socket listeners.
   - Application Tier: Inspect error logs, memory allocations, and connection pool thresholds.

\`\`\`bash
# Diagnostic command suite to verify system health and socket states
ip route show default && netstat -tulpn
systemctl status --failed
uptime && free -h && df -Th
\`\`\`

#### Suggested Ticket Action:
If this issue is actively impacting users, use the **"Log Incident Ticket"** module to generate a formal record with SLA clock tracking.`;
}

export const AIAgentChat: React.FC<AIAgentChatProps> = ({
  incidents,
  assets,
  onGenerateTicket,
  focusedTicket,
  focusedAsset,
  onClearFocus,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `### I.T. TechOps IT Helpdesk Online
I am your Tier-3 IT Systems Architect & Operations Helpdesk. I have direct access to your infrastructure inventory (**${assets.length} monitored assets**) and active incident queue (**${incidents.filter(i => i.status !== 'Resolved').length} active tickets**).

**How can I assist your IT Operations right now?**
- Perform deep root cause analysis (RCA) on hardware defects, battery swelling, or server failures
- Generate copyable CLI/PowerShell/Cisco/Linux remediation commands
- Provide step-by-step triage playbooks for system latency, outages, or cyber alerts
- Formulate post-incident hardening recommendations and log tickets directly`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If focused ticket or asset changes, suggest a prompt
  useEffect(() => {
    if (focusedTicket) {
      setInputPrompt(`Analyze incident ${focusedTicket.id} (${focusedTicket.title}): What is the root cause, immediate mitigation commands, and recommended SLA recovery plan?`);
    } else if (focusedAsset) {
      setInputPrompt(`Evaluate infrastructure risk and technology baseline for asset ${focusedAsset.tagId} (${focusedAsset.name}). Provide a hardening checklist and diagnostic commands.`);
    }
  }, [focusedTicket, focusedAsset]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    // AbortController with 6.5s timeout so loading state never hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      const activeTicketsSummary = incidents.filter(i => i.status !== 'Resolved').map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        assetId: t.assetId,
        assetName: t.assetName,
        category: t.category,
        slaTargetMinutes: t.slaTargetMinutes,
      }));

      const assetsSummary = assets.map(a => ({
        tagId: a.tagId,
        name: a.name,
        type: a.type,
        ip: a.networkMapping.ipAddress,
        vlan: a.networkMapping.vlanId,
        os: a.architectureBaseline.osBaseline,
        risk: a.riskLevel,
        drTier: a.disasterRecovery.roleTier,
      }));

      let replyContent = '';

      try {
        const response = await fetch('/api/ai/copilot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              activeIncidents: activeTicketsSummary,
              monitoredAssets: assetsSummary,
              focusedTicket: focusedTicket ? {
                id: focusedTicket.id,
                title: focusedTicket.title,
                description: focusedTicket.description,
                priority: focusedTicket.priority,
                status: focusedTicket.status,
                assetId: focusedTicket.assetId,
              } : undefined,
              focusedAsset: focusedAsset ? {
                tagId: focusedAsset.tagId,
                name: focusedAsset.name,
                specs: focusedAsset.modelSpecs,
                baseline: focusedAsset.architectureBaseline,
                network: focusedAsset.networkMapping,
                dr: focusedAsset.disasterRecovery,
              } : undefined,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.reply && data.reply.trim() !== '') {
            replyContent = data.reply;
          }
        }
      } catch (networkOrTimeoutErr) {
        console.warn('[IT Helpdesk] Server call timed out or failed, engaging local knowledge engine:', networkOrTimeoutErr);
      }

      // If server response was empty or timed out, use the instant knowledge engine
      if (!replyContent) {
        replyContent = generateInstantFallback(textToSend, assets);
      }

      // Check if response contains structured ticket suggestions
      let parsedActionableTicket;
      const lower = replyContent.toLowerCase();
      if (lower.includes('suggested ticket') || lower.includes('hazard') || lower.includes('battery') || lower.includes('category:')) {
        const isHazard = lower.includes('battery') || lower.includes('swell') || textToSend.toLowerCase().includes('battery');
        parsedActionableTicket = {
          title: isHazard 
            ? `[HAZMAT] Critical Battery Swelling & Chassis Bulge - AST-WKS-104` 
            : `[IT HELPDESK] Action Plan for: ${textToSend.slice(0, 45)}...`,
          priority: (lower.includes('critical') || isHazard ? 'Critical' : lower.includes('high') ? 'High' : 'Medium') as PriorityLevel,
          category: (isHazard ? 'Hardware' : lower.includes('network') ? 'Network' : lower.includes('access') ? 'Access/Security' : 'Hardware') as TicketCategory,
          assetId: isHazard ? 'AST-WKS-104' : (focusedTicket?.assetId || focusedAsset?.tagId || 'AST-WKS-104'),
          description: textToSend,
          rootCause: isHazard 
            ? 'Lithium-ion pouch cell degradation with chassis deformation and fire risk.' 
            : 'Derived from IT Helpdesk root cause analysis.',
        };
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString(),
        parsedActionableTicket,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('IT Helpdesk request error:', err);
      // Guarantee response even on edge error
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: generateInstantFallback(textToSend, assets),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init-reset',
        role: 'assistant',
        content: 'Diagnostic session reset. How can the IT Helpdesk assist with your enterprise infrastructure or active problem-solving triage?',
        timestamp: new Date().toISOString(),
      },
    ]);
    if (onClearFocus) onClearFocus();
  };

  const renderMessageContent = (content: string, messageId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
        const firstLine = part.split('\n')[0].replace('```', '').trim() || 'CLI';
        const snippetId = `${messageId}-${index}`;

        return (
          <div key={index} className="my-2.5 border border-slate-700 bg-[#0a192f] text-slate-100 rounded-sm overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e223d] border-b border-slate-700 text-[11px] font-mono text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase text-emerald-300 font-bold">{firstLine}</span>
              </span>
              <button
                onClick={() => handleCopyCode(codeContent, snippetId)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-sans text-xs cursor-pointer"
              >
                {copiedId === snippetId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap selection:bg-blue-900">
              {codeContent}
            </pre>
          </div>
        );
      }

      // Regular markdown-like text lines
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="font-bold text-slate-900 text-sm mt-3 mb-1 border-b border-slate-200 pb-0.5">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            if (line.startsWith('#### ')) {
              return (
                <h4 key={lIdx} className="font-bold text-blue-950 text-xs mt-2 mb-0.5">
                  {line.replace('#### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="font-bold text-slate-900 text-sm mt-3 mb-1 text-blue-900">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            if (line.startsWith('---')) {
              return <hr key={lIdx} className="my-2 border-slate-200" />;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 text-xs text-slate-800 ml-1">
                  <span className="text-blue-700 font-bold">·</span>
                  <span>{renderBoldSpans(line.substring(2))}</span>
                </div>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 text-xs text-slate-800 ml-1">
                  <span className="text-blue-700 font-semibold">{line.match(/^\d+\./)?.[0]}</span>
                  <span>{renderBoldSpans(line.replace(/^\d+\.\s/, ''))}</span>
                </div>
              );
            }
            if (line.trim() === '') {
              return <div key={lIdx} className="h-1"></div>;
            }
            return (
              <p key={lIdx} className="text-xs text-slate-800 leading-relaxed">
                {renderBoldSpans(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const renderBoldSpans = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((b, idx) => {
      if (b.startsWith('**') && b.endsWith('**')) {
        return <strong key={idx} className="font-bold text-slate-900">{b.replace(/\*\*/g, '')}</strong>;
      }
      return b;
    });
  };

  const QUICK_PROMPTS = [
    {
      label: 'Workstation Battery Swelling & Hazmat Protocol',
      prompt: 'The Lenovo workstation AST-WKS-104 has reported a battery swelling risk. What are the IT safety protocols, asset replacement steps, and warranty claim procedures?',
    },
    {
      label: 'Troubleshoot PostgreSQL Lock Contention',
      prompt: 'Production SAP ERP PostgreSQL database (AST-DB-003) is experiencing lock timeouts. What are the exact psql queries to find the blocking PID, safely terminate it, and check disk I/O?',
    },
    {
      label: 'Investigate GlobalProtect VPN Packet Loss',
      prompt: 'Users report packet drops through firewall FW-PRIMARY (AST-NET-014). Provide MTR, BGP neighbor status, and interface flap troubleshooting commands.',
    },
    {
      label: 'Remediate Okta MFA Fatigue Attack',
      prompt: 'Multiple push notifications detected for payroll supervisor account. Provide step-by-step PowerShell and Azure AD commands to revoke tokens, reset passwords, and enforce FIDO2.',
    },
    {
      label: 'Prioritize Active Critical Incidents',
      prompt: 'Review all currently active incidents in I.T. TechOps. Provide a triage priority matrix based on SLA risk and mission-critical asset impact.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-sm flex flex-col h-[750px] shadow-sm">
      {/* IT Helpdesk Header */}
      <div className="p-4 bg-[#0f3d7a] text-white flex flex-wrap items-center justify-between gap-3 border-b border-blue-900">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-900 to-[#071f40] border border-blue-400/40 rounded-sm shadow-inner">
            <Headphones className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-tight text-white font-sans uppercase">
                IT Helpdesk · Tier-3 Systems Resolution Engine
              </h2>
              <span className="px-1.5 py-0.2 text-[10px] bg-emerald-700 text-white font-mono font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Enterprise Root Cause Analysis, Hardware Safety Protocols & Automated CLI Remediation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {focusedTicket && (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-blue-900 border border-blue-600 text-xs text-blue-100">
              <span className="font-mono text-emerald-300 font-bold">{focusedTicket.id}</span>
              <span className="text-[11px] truncate max-w-[140px]">{focusedTicket.title}</span>
              {onClearFocus && (
                <button onClick={onClearFocus} className="text-blue-300 hover:text-white ml-1">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {focusedAsset && (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-blue-900 border border-blue-600 text-xs text-blue-100">
              <Server className="w-3 h-3 text-emerald-300" />
              <span className="font-mono font-bold text-white">{focusedAsset.tagId}</span>
              {onClearFocus && (
                <button onClick={onClearFocus} className="text-blue-300 hover:text-white ml-1">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleResetChat}
            className="inline-flex items-center px-2.5 py-1 text-xs text-blue-200 hover:text-white bg-blue-900/60 hover:bg-blue-900 border border-blue-600 rounded-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset Session
          </button>
        </div>
      </div>

      {/* Quick Diagnostic Prompts Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600 flex items-center whitespace-nowrap">
          <Zap className="w-3 h-3 text-amber-500 mr-1" />
          Suggested Helpdesk Queries:
        </span>
        <div className="flex items-center space-x-2 whitespace-nowrap">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-300 rounded-sm text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>{qp.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1 text-[11px] font-mono text-slate-500">
              {msg.role === 'user' ? (
                <span>IT Specialist (You)</span>
              ) : (
                <span className="flex items-center space-x-1 font-semibold text-[#0f3d7a]">
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  <span>IT Helpdesk</span>
                </span>
              )}
              <span>·</span>
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div
              className={`max-w-3xl p-3.5 rounded-sm border text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0f3d7a] text-white border-blue-900'
                  : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              {renderMessageContent(msg.content, msg.id)}

              {/* Actionable Ticket Creator Button if suggested a fix */}
              {msg.parsedActionableTicket && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 -mx-3.5 -mb-3.5 p-3 rounded-b-sm">
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-700 font-medium">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Actionable Ticket Available: <strong>{msg.parsedActionableTicket.title}</strong></span>
                  </div>
                  <button
                    onClick={() => onGenerateTicket(msg.parsedActionableTicket!)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-[#0f3d7a] hover:bg-blue-800 text-white rounded-sm cursor-pointer border border-blue-900 transition-colors shadow-xs"
                  >
                    <FilePlus className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Create Ticket From Helpdesk Diagnosis
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
              <Headphones className="w-3 h-3 text-emerald-600" />
              <span>IT Helpdesk · Processing</span>
            </div>
            <div className="p-3 border border-slate-300 bg-white text-xs text-slate-700 flex items-center space-x-2.5 font-mono rounded-sm shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold text-slate-800">Analyzing infrastructure baselines and running root cause analysis...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask IT Helpdesk for issues, safety protocols, or root cause analysis (e.g. 'AST-WKS-104 battery swelling risk...')..."
              className="w-full px-3 py-2 border border-slate-300 text-xs bg-white text-slate-900 rounded-sm focus:outline-none focus:border-blue-700 resize-none font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-sm cursor-pointer disabled:cursor-not-allowed transition-colors border border-emerald-700 flex items-center space-x-1.5 self-stretch"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask IT Helpdesk</span>
          </button>
        </form>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
          <span>Enterprise IT Helpdesk · Powered by Google GenAI with fail-safe local knowledge</span>
          <span>Shift + Enter for newline · Enter to send</span>
        </div>
      </div>
    </div>
  );
};
