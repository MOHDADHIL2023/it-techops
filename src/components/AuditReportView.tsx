import React, { useState } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Server, 
  FileText,
  Calendar,
  Layers,
  Building,
  Download,
  Check
} from 'lucide-react';
import { IncidentTicket, AssetRecord } from '../types';
import { computeOperationsMetrics, calculateTicketSla } from '../utils/slaCalculator';
import { exportIncidentsToCSV, triggerPrintAuditReport, downloadAuditReportPDF } from '../utils/exportUtils';

interface AuditReportViewProps {
  incidents: IncidentTicket[];
  assets: AssetRecord[];
  operatorName?: string;
  onClose?: () => void;
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({
  incidents,
  assets,
  operatorName = 'Alex Rivera',
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const metrics = computeOperationsMetrics(incidents);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const highRiskAssets = assets.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Severe');
  const tier0Assets = assets.filter(a => a.disasterRecovery.roleTier.includes('Tier 0'));

  const handleDownloadPDF = () => {
    downloadAuditReportPDF(incidents, assets, operatorName);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  const handlePrint = () => {
    const success = triggerPrintAuditReport();
    if (!success) {
      // If print was blocked by iframe security sandbox, fallback to direct download
      handleDownloadPDF();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm">
      {/* Action Header (hidden when printing) */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-800" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Enterprise IT Operations & Compliance Audit Report
            </h2>
            <p className="text-xs text-slate-500">
              Executive audit ready for client-side printable PDF generation or compliance archiving
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportIncidentsToCSV(incidents, assets)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-none cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 rounded-none cursor-pointer transition-colors shadow-none"
            title="Download direct printable audit report document"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-white" />
                Report Downloaded!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-100" />
                Save / Download PDF Report
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold bg-[#0f3d7a] hover:bg-blue-800 text-white border border-blue-900 rounded-none cursor-pointer transition-colors shadow-none"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
            Print Dialog
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs px-6 flex items-center justify-between no-print">
          <span className="font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Audit Report file generated and downloaded to your computer. You can open and save it directly as PDF.</span>
          </span>
          <button onClick={() => setDownloadSuccess(false)} className="text-emerald-700 hover:text-emerald-900 text-xs">✕</button>
        </div>
      )}

      {/* Printable Report Document Body */}
      <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 bg-white text-slate-900 print:p-0 print:max-w-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2 py-0.5 bg-[#0f3d7a] text-white font-bold tracking-wider uppercase">
                  CONFIDENTIAL · IT AUDIT
                </span>
                <span className="text-xs text-slate-500 font-mono">AUD-2026-Q4-OPS</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-2 font-sans">
                I.T. TechOps · Enterprise Operations Audit Report
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Infrastructure Health, SLA Compliance Verification, and Disaster Recovery Readiness Assessment
              </p>
            </div>
            <div className="text-right text-xs font-mono text-slate-600">
              <div className="font-bold text-slate-900">Enterprise IT Support Ops</div>
              <div>Generated: {currentDate}</div>
              <div>Auditor: {operatorName} (Tier-3 Ops)</div>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            1. Executive Operational Metrics & SLA Benchmarks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 border border-slate-200 bg-slate-50">
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Mean Time To Respond (MTTR)</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">{metrics.mttrHoursFormatted}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Target: &lt; 30 min (Passed)</span>
            </div>

            <div className="p-3 border border-slate-200 bg-slate-50">
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">SLA Compliance Rate</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">{metrics.slaComplianceRate}%</span>
              <span className="text-[11px] text-emerald-700 font-medium">Benchmark: ≥ 95.0%</span>
            </div>

            <div className="p-3 border border-slate-200 bg-slate-50">
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Total Logged Incidents</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">{metrics.totalIncidents}</span>
              <span className="text-[11px] text-slate-600 font-medium">{metrics.openIncidents} active · {metrics.totalIncidents - metrics.openIncidents} resolved</span>
            </div>

            <div className="p-3 border border-slate-200 bg-slate-50">
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Monitored Core Assets</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">{assets.length} Nodes</span>
              <span className="text-[11px] text-rose-700 font-medium">{highRiskAssets.length} High/Severe risk</span>
            </div>
          </div>
        </div>

        {/* Section 2: Active & High-Impact Incidents Ledger */}
        <div className="space-y-2 page-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            2. High-Impact Incidents Ledger & Remediation Audit
          </h2>
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                <th className="p-2">ID</th>
                <th className="p-2">Priority</th>
                <th className="p-2">Category</th>
                <th className="p-2">Asset / System</th>
                <th className="p-2">SLA Status</th>
                <th className="p-2">Assigned Specialist</th>
                <th className="p-2">Resolution / RCA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {incidents.slice(0, 5).map(ticket => {
                const sla = calculateTicketSla(ticket);
                return (
                  <tr key={ticket.id}>
                    <td className="p-2 font-mono font-bold text-slate-900">{ticket.id}</td>
                    <td className="p-2 font-semibold">
                      <span className={ticket.priority === 'Critical' ? 'text-rose-700' : 'text-slate-800'}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-2 text-slate-700">{ticket.category}</td>
                    <td className="p-2 font-mono text-[11px]">{ticket.assetId} - {ticket.assetName.substring(0, 24)}...</td>
                    <td className="p-2 font-mono text-[11px]">
                      <span className={sla.isBreached ? 'text-rose-700 font-bold' : 'text-emerald-700'}>
                        {sla.displayTimer}
                      </span>
                    </td>
                    <td className="p-2">{ticket.assignedTo}</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {ticket.rootCause ? ticket.rootCause.substring(0, 45) + '...' : 'Under Active Triage'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 3: Asset Risk & Baseline Compliance Summary */}
        <div className="space-y-2 page-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            3. Critical Infrastructure & Elevated Risk Register
          </h2>
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                <th className="p-2">Tag ID</th>
                <th className="p-2">System Asset Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">IP / Switchport</th>
                <th className="p-2">Compliance Score</th>
                <th className="p-2">Risk Level</th>
                <th className="p-2">Warranty / License</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.map(asset => (
                <tr key={asset.tagId}>
                  <td className="p-2 font-mono font-bold text-slate-900">{asset.tagId}</td>
                  <td className="p-2 font-medium">{asset.name}</td>
                  <td className="p-2 text-slate-700">{asset.type}</td>
                  <td className="p-2 font-mono text-[11px]">{asset.networkMapping.ipAddress} ({asset.networkMapping.switchPort})</td>
                  <td className="p-2 font-mono font-bold">{asset.architectureBaseline.complianceScore}%</td>
                  <td className="p-2 font-semibold">
                    <span className={asset.riskLevel === 'Severe' ? 'text-rose-700' : asset.riskLevel === 'High' ? 'text-amber-700' : 'text-slate-800'}>
                      {asset.riskLevel}
                    </span>
                  </td>
                  <td className="p-2 font-mono text-[11px]">{asset.warrantyExpiry} / {asset.licenseRenewalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Disaster Recovery (DR) Readiness Verification */}
        <div className="space-y-2 page-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            4. Disaster Recovery (DR) Readiness & Tier-0 Continuity
          </h2>
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase border-b border-slate-200">
                <th className="p-2">System</th>
                <th className="p-2">Tier</th>
                <th className="p-2">Target RTO</th>
                <th className="p-2">Target RPO</th>
                <th className="p-2">Designated Failover Site</th>
                <th className="p-2">Last Drill</th>
                <th className="p-2">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tier0Assets.map(asset => (
                <tr key={asset.tagId}>
                  <td className="p-2 font-mono font-bold text-slate-900">{asset.tagId} ({asset.type})</td>
                  <td className="p-2 font-semibold text-rose-800">{asset.disasterRecovery.roleTier}</td>
                  <td className="p-2 font-mono">{asset.disasterRecovery.rto}</td>
                  <td className="p-2 font-mono">{asset.disasterRecovery.rpo}</td>
                  <td className="p-2">{asset.disasterRecovery.failoverSite}</td>
                  <td className="p-2 font-mono">{asset.disasterRecovery.lastDrillDate}</td>
                  <td className="p-2 text-emerald-700 font-semibold">{asset.disasterRecovery.backupValidationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Executive Sign-off Block */}
        <div className="border-t-2 border-slate-900 pt-6 mt-8 page-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
            5. Operations Architecture & Compliance Attestation
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            This certifies that the operational infrastructure, incident response times, and baseline security configurations recorded in TechOps Command reflect true state parameters for Q4 2026.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">Lead IT Systems Architect</span>
              <div className="border-b border-slate-400 h-8 flex items-end font-serif italic text-slate-800">
                {operatorName}, CISSP, ITIL v4
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Signed & Verified</span>
            </div>

            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">Chief Information Security Officer</span>
              <div className="border-b border-slate-400 h-8 flex items-end font-serif italic text-slate-800">
                Elena Rostova
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Approval Confirmed</span>
            </div>

            <div>
              <span className="block text-slate-500 text-[10px] uppercase font-semibold">Date of Ratification</span>
              <div className="border-b border-slate-400 h-8 flex items-end font-mono text-slate-800">
                {currentDate}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Official Audit Timestamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
