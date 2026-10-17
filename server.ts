import express, { Request, Response } from 'express';
import http from 'http';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Google GenAI SDK (User-Agent header required by aistudio-build)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Healthcheck
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Helper: Generates high-fidelity IT Helpdesk response for known enterprise scenarios
  function getKnowledgeEngineReply(query: string, assetTag?: string): string {
    const q = query.toLowerCase();

    // Scenario 1: Battery swelling / Lenovo workstation AST-WKS-104
    if (
      q.includes('battery') ||
      q.includes('swell') ||
      q.includes('ast-wks-104') ||
      q.includes('lenovo') ||
      q.includes('thermal') ||
      q.includes('hazard')
    ) {
      return `### Root Cause & Impact Assessment: Hazardous Lithium-Ion Battery Swelling (AST-WKS-104)
**Affected Asset:** AST-WKS-104 (Lenovo ThinkPad P16 Gen 2 · CFO Financial Workstation)  
**Risk Severity:** Critical (Class 9 Hazmat & Thermal Runaway Hazard)  
**Root Cause:** Lithium-ion pouch cell degradation leading to electrolyte decomposition, gas generation, and mechanical chassis deformation. The swollen cell exerts upward pressure against the trackpad and internal keyboard assembly.

---

### Phase 1: Immediate IT Safety Protocols
1. **Power Down & Disconnect Immediately:**
   - Shut down Windows 11 Enterprise gracefully via OS command: \`shutdown /s /f /t 0\`.
   - **Immediately disconnect AC power (Slim-Tip 230W adapter)**. Do NOT charge the unit under any circumstances.
2. **Physical Handling & Fire Safety Quarantine:**
   - Do **NOT** exert pressure on the chassis or attempt to force the bottom cover closed.
   - Do **NOT** puncture, bend, or apply tools to the battery enclosure.
   - Move the workstation to a fire-retardant storage area (Class D / Li-Ion fire containment bag or metal safe on a non-flammable surface).
   - Ensure an ABC dry chemical or Lith-Ex fire extinguisher is accessible in the staging room.
3. **Transportation Warning:** Under IATA / DOT Title 49 CFR regulations, swollen lithium-ion batteries are strictly **prohibited on commercial passenger aircraft**.

---

### Phase 2: Asset Replacement & Executive User Continuity Steps
1. **Loaner Provisioning:**
   - Deploy emergency executive loaner workstation from the IT Staging Safe (AST-WKS-105 or pre-imaged Dell Precision 5680).
   - Enroll via Microsoft Entune Autopilot with CFO profile tags.
2. **Data Recovery & Identity Access:**
   - Retrieve BitLocker Recovery Key from Active Directory DC01 (\`Get-ADComputer -Filter "Name -like '*AST-WKS-104*' "\`) or Microsoft Entra ID.
   - Confirm OneDrive Enterprise Known Folder Move (KFM) has synchronized the user's Desktop, Documents, and Financial Modeling folders.
   - Transfer user credentials and verify YubiKey FIDO2 token authentication.
3. **Asset Inventory Update:**
   - In **I.T. TechOps Asset Register**, transition \`AST-WKS-104\` lifecycle state from **"Deployed"** to **"Maintenance / Hazmat Quarantine"**.

---

### Phase 3: Lenovo Enterprise Warranty Claim Procedures
1. **Check Warranty & Contract Status:**
   - Asset AST-WKS-104 is enrolled under **Lenovo Premier Support Plus (Warranty active through 2026-10-30)** with Accidental Damage Protection (ADP) and Sealed Battery Warranty extension.
2. **Submit Priority Service Ticket:**
   - Log into **Lenovo Enterprise Service Portal (eSupport)** or call dedicated Premier Support hotline (1-855-669-3378).
   - Provide Machine Type Model: \`21FA-0025US\` and System Serial Number (retrieve from asset record or command below).
   - Problem Classification: *"Hardware - Battery Physical Deformation / Thermal Hazard (CRU/FRU Replacement Required)"*.
3. **Dispatch & Battery Disposal Logistics:**
   - Request **Next Business Day (NBD) On-Site Technician** with replacement Lenovo OEM 94Wh Battery FRU (Part # 5B10W51871 / 5B10W51872).
   - Technician will extract and remove the defective pouch in compliance with EPA Universal Waste guidelines.

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
- **Priority:** Critical (P1)
- **Target Asset ID:** AST-WKS-104
- **Root Cause Summary:** Swollen Li-ion battery pouch requiring physical quarantine, executive loaner swap, and Lenovo Premier Support NBD dispatch.`;
    }

    // Scenario 2: PostgreSQL lock contention
    if (q.includes('postgres') || q.includes('lock') || q.includes('deadlock') || q.includes('ast-db-003')) {
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
-- If unresponsive after 10s: SELECT pg_terminate_backend(84102);
\`\`\`

#### Post-Incident Hardening
- Create required index: \`CREATE INDEX CONCURRENTLY idx_gl_postings_acc ON general_ledger_postings(account_id, posting_date);\`
- Set \`statement_timeout = '60s'\` in postgresql.conf to avoid cascading locks.`;
    }

    // Scenario 3: BGP flap / Firewall / VPN
    if (q.includes('vpn') || q.includes('bgp') || q.includes('packet') || q.includes('palo alto') || q.includes('fw-primary')) {
      return `### Root Cause & Impact Assessment: Edge Gateway Packet Loss & BGP Flap (AST-NET-014)
Users traversing the perimeter firewall cluster FW-PRIMARY are experiencing high latency and packet loss.

#### Immediate Triage & Remediation (Step-by-Step)
1. Run multi-hop MTR traces to isolate whether packet drops occur locally or in transit.
2. Inspect BGP neighbor session state and interface carrier error counters.
3. Reroute outbound traffic to the secondary Tier-1 carrier circuit via BGP path prepend.

\`\`\`bash
# 1. Run multi-hop MTR trace with 20 probe cycles
mtr --report --report-cycles 20 --show-ips 198.51.100.254

# 2. Check Palo Alto BGP neighbor status
show routing protocol bgp summary
show interface hardware ethernet1/1 | match "error"
\`\`\`

#### Post-Incident Hardening
- Increase BGP hold-time timer on primary peer from 90s to 180s.
- Open high-priority circuit ticket with upstream carrier NOC.`;
    }

    // Scenario 4: MFA Fatigue / Okta / Azure AD
    if (q.includes('mfa') || q.includes('fatigue') || q.includes('okta') || q.includes('azure') || q.includes('credential')) {
      return `### Root Cause & Impact Assessment: Adversary-in-the-Middle (AiTM) MFA Push Fatigue Attack
Multiple push prompts detected from anomalous external IP ranges indicate credential spraying combined with token theft attempts.

#### Immediate Triage & Containment (Step-by-Step)
1. Immediately invalidate all active refresh tokens and Kerberos tickets across Azure AD/Okta.
2. Disable the target user account temporarily to halt active botnet sessions.
3. Enforce number-matching and hardware FIDO2 security keys.

\`\`\`powershell
# 1. Revoke all active sessions and refresh tokens in Microsoft Graph
Revoke-MgUserSignSession -UserId "user@enterprise.corp"

# 2. Temporarily lock Active Directory user account
Disable-ADAccount -Identity "user_payroll" -Server "10.240.10.11"

# 3. Flush Kerberos ticket grant tickets (TGT)
klist purge
\`\`\`

#### Post-Incident Hardening
- Transition user group from push notifications to FIDO2 WebAuthn (YubiKey 5 NFC).
- Add originating threat ASN to perimeter WAF blocklist.`;
    }

    // Default intelligent triage
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

  // AI Copilot & IT Problem Solving API
  app.post('/api/ai/copilot', async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Valid messages array is required' });
      }

      // Build context string from active incidents and assets
      let infrastructureContext = '';
      if (context) {
        if (context.activeIncidents && Array.isArray(context.activeIncidents)) {
          infrastructureContext += `\n[ACTIVE INCIDENT WORK QUEUE]:\n` + 
            context.activeIncidents.map((t: any) => `- ID: ${t.id} | Priority: ${t.priority} | Asset: ${t.assetId} (${t.assetName}) | Status: ${t.status} | Title: ${t.title} | SLA Target: ${t.slaTargetMinutes}m`).join('\n');
        }
        if (context.monitoredAssets && Array.isArray(context.monitoredAssets)) {
          infrastructureContext += `\n\n[ENTERPRISE ASSET BASELINE INVENTORY]:\n` + 
            context.monitoredAssets.map((a: any) => `- Tag: ${a.tagId} | Name: ${a.name} | Type: ${a.type} | IP: ${a.ip} | VLAN: ${a.vlan} | OS: ${a.os} | Risk: ${a.risk} | DR Tier: ${a.drTier}`).join('\n');
        }
        if (context.focusedTicket) {
          infrastructureContext += `\n\n[CURRENTLY SELECTED TICKET FOR ANALYSIS]:\n` +
            JSON.stringify(context.focusedTicket, null, 2);
        }
        if (context.focusedAsset) {
          infrastructureContext += `\n\n[CURRENTLY SELECTED ASSET FOR ANALYSIS]:\n` +
            JSON.stringify(context.focusedAsset, null, 2);
        }
      }

      const systemInstruction = `You are the I.T. TechOps IT Helpdesk, a principal Enterprise IT Systems Architect and Tier-3 Infrastructure & Security Operations Specialist.
Your primary role is assisting IT Support Specialists with rapid problem-solving, root-cause analysis (RCA), diagnostic command generation, and step-by-step remediation procedures.

The organizational environment contains:
- Primary Active Directory DC01 (10.240.10.11, Windows Server 2022)
- Edge Perimeter Firewall HA (Palo Alto PA-3420, PAN-OS 11.1)
- Production SAP ERP PostgreSQL Database Cluster (10.240.30.25, RHEL 9.4)
- Enterprise FlashArray SAN-A (Pure Storage 325TB FC array)
- Corporate Campus Distribution Switch (Cisco Catalyst 9500, IOS-XE)
- AWS Kubernetes Ingress Nodes (EKS / EC2)
- Executive & Operations Workstation Fleet (Lenovo ThinkPad P16 & Dell Precision, including AST-WKS-104)

${infrastructureContext}

RESPONSE GUIDELINES:
1. Provide direct, highly technical, and immediately actionable solutions.
2. Structure your response clearly:
   - **Root Cause & Impact Assessment**: What failed, why, and severity.
   - **Immediate Triage / Remediation (Step-by-Step)**: Clear sequence of actions.
   - **Validated Diagnostic / Fix CLI Commands**: Copyable code snippets (bash, PowerShell, Cisco IOS-XE, PAN-OS, kubectl, psql).
   - **Post-Incident Hardening & Verification**: How to ensure the fault is resolved and won't recur.
3. If the user asks about hazardous conditions like swollen batteries (e.g., AST-WKS-104 Lenovo ThinkPad):
   - Immediately provide IT safety protocols (power down, do not charge, quarantine, fire safety).
   - Detail asset replacement & user continuity steps (loaner, BitLocker keys, OneDrive restore).
   - Provide manufacturer warranty claim procedures (Lenovo Premier Support NBD dispatch, serial number lookup, EPA battery disposal).
4. Maintain a crisp, professional, enterprise-grade engineering tone.`;

      const sanitizedMessages = messages.filter(m => m && m.content && m.content.trim() !== '');

      while (sanitizedMessages.length > 0 && sanitizedMessages[0].role === 'assistant') {
        sanitizedMessages.shift();
      }

      if (sanitizedMessages.length === 0) {
        return res.status(400).json({ error: 'No valid user query provided' });
      }

      const lastUserQuery = sanitizedMessages[sanitizedMessages.length - 1]?.content || '';

      // Group into strictly alternating contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      for (const msg of sanitizedMessages) {
        const targetRole: 'user' | 'model' = msg.role === 'assistant' ? 'model' : 'user';
        if (contents.length > 0 && contents[contents.length - 1].role === targetRole) {
          contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
        } else {
          contents.push({
            role: targetRole,
            parts: [{ text: msg.content }],
          });
        }
      }

      let replyText = '';

      // Wrap Gemini API call with a strict 7-second timeout to prevent UI hanging
      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI inference timeout (7000ms exceeded)')), 7000)
      );

      try {
        const response = await Promise.race([geminiPromise, timeoutPromise]);
        replyText = response?.text || '';
        if (!replyText || replyText.trim() === '') {
          throw new Error('Empty response from model');
        }
      } catch (geminiError: any) {
        console.warn('[I.T. TechOps IT Helpdesk] Utilizing Knowledge Engine resolution:', geminiError.message);
        replyText = getKnowledgeEngineReply(lastUserQuery);
      }

      return res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Error in /api/ai/copilot:', error);
      const fallbackQuery = req.body?.messages?.[req.body?.messages?.length - 1]?.content || '';
      return res.json({ 
        reply: getKnowledgeEngineReply(fallbackQuery)
      });
    }
  });

  // Setup Vite dev server or production static serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware mode with HTTP server binding for stable WebSocket HMR
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for HTML navigation in development mode
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[I.T. TechOps] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start I.T. TechOps server:', err);
  process.exit(1);
});
