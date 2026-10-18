import React, { useState, useEffect } from 'react';
import { 
  INITIAL_ASSETS, 
  INITIAL_INCIDENTS, 
  DIAGNOSTIC_TREES 
} from './mockData';
import { 
  IncidentTicket, 
  AssetRecord, 
  TicketStatus, 
  PriorityLevel, 
  TicketCategory 
} from './types';
import { SuggestionPlaybook } from './data/suggestionPlaybooks';
import { computeOperationsMetrics } from './utils/slaCalculator';
import { exportIncidentsToCSV, downloadAuditReportPDF, triggerPrintAuditReport } from './utils/exportUtils';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricsDashboard } from './components/MetricsDashboard';
import { IncidentLedger } from './components/IncidentLedger';
import { TicketModal } from './components/TicketModal';
import { AssetRegister } from './components/AssetRegister';
import { AssetModal } from './components/AssetModal';
import { DiagnosticSOP } from './components/DiagnosticSOP';
import { AuditReportView } from './components/AuditReportView';
import { AIAgentChat } from './components/AIAgentChat';
import { CSVImportModal } from './components/CSVImportModal';
import { CheckCircle2, AlertTriangle, ShieldCheck, Headphones } from 'lucide-react';

// Safe localStorage helpers that never throw in sandboxed iframe environments
const safeGetStorage = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
  } catch (e) {
    return null;
  }
};

const safeSetStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    // Ignore SecurityError in sandboxed iframe environments
  }
};

export default function App() {
  // State with LocalStorage persistence fallback & strict validation
  const [incidents, setIncidents] = useState<IncidentTicket[]>(() => {
    const saved = safeGetStorage('techops_incidents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    return INITIAL_INCIDENTS;
  });

  const [assets, setAssets] = useState<AssetRecord[]>(() => {
    const saved = safeGetStorage('techops_assets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    return INITIAL_ASSETS;
  });

  // Duty IT Support Specialist profile state (Adil Hossain)
  const [operatorName, setOperatorName] = useState<string>(() => {
    const saved = safeGetStorage('techops_operator');
    if (saved && saved !== 'Alex Rivera') {
      return saved;
    }
    return 'Adil Hossain';
  });

  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<'incidents' | 'assets' | 'sop' | 'audit' | 'ai'>('incidents');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<IncidentTicket | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState<boolean>(false);
  const [ticketModalPrefill, setTicketModalPrefill] = useState<Partial<IncidentTicket> | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null);
  const [isCreateAssetOpen, setIsCreateAssetOpen] = useState<boolean>(false);

  // CSV Import Modal state
  const [isImportCSVOpen, setIsImportCSVOpen] = useState<boolean>(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // Context focus for IT Helpdesk
  const [focusedTicket, setFocusedTicket] = useState<IncidentTicket | null>(null);
  const [focusedAsset, setFocusedAsset] = useState<AssetRecord | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    safeSetStorage('techops_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    safeSetStorage('techops_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    safeSetStorage('techops_operator', operatorName);
  }, [operatorName]);

  // SLA clock trigger: re-render every 30 seconds to keep live SLA timer fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics computation
  const metrics = computeOperationsMetrics(incidents);
  const criticalCount = metrics.criticalIncidents;
  const openCount = metrics.openIncidents;

  // Handlers for Tickets
  const handleSaveTicket = (ticketToSave: IncidentTicket) => {
    setIncidents(prev => {
      const exists = prev.some(t => t.id === ticketToSave.id);
      if (exists) {
        return prev.map(t => t.id === ticketToSave.id ? ticketToSave : t);
      }
      return [ticketToSave, ...prev];
    });
    showToast(`Incident ${ticketToSave.id} saved successfully`);
    setSelectedTicket(null);
    setIsCreateTicketOpen(false);
    setTicketModalPrefill(null);
  };

  const handleQuickStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setIncidents(prev => prev.map(t => {
      if (t.id === ticketId) {
        const resolvedAt = newStatus === 'Resolved' ? new Date().toISOString() : t.resolvedAt;
        const newLog = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: operatorName,
          action: 'Status Transition',
          note: `Quick state transition: ${t.status} -> ${newStatus}`,
        };
        return {
          ...t,
          status: newStatus,
          resolvedAt,
          activityLog: [...t.activityLog, newLog],
        };
      }
      return t;
    }));
    showToast(`Ticket ${ticketId} status updated to ${newStatus}`);
  };

  // Handlers for Assets
  const handleSaveAsset = (assetToSave: AssetRecord) => {
    setAssets(prev => {
      const exists = prev.some(a => a.tagId === assetToSave.tagId);
      if (exists) {
        return prev.map(a => a.tagId === assetToSave.tagId ? assetToSave : a);
      }
      return [assetToSave, ...prev];
    });
    showToast(`Asset record ${assetToSave.tagId} saved`);
    setSelectedAsset(null);
    setIsCreateAssetOpen(false);
  };

  // Handlers for Diagnostics SOP
  const handleGenerateIncidentFromDiag = (diagData: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: PriorityLevel;
    recommendedNotes: string;
  }) => {
    const nextNum = incidents.length + 1;
    const newId = `INC-2026-${String(nextNum).padStart(4, '0')}`;

    const newTicket: IncidentTicket = {
      id: newId,
      title: diagData.title,
      description: diagData.description,
      priority: diagData.priority,
      status: 'Open',
      category: diagData.category,
      assetId: 'AST-NET-014',
      assetName: 'Core Diagnostic Asset Node',
      slaTargetMinutes: diagData.priority === 'Critical' ? 15 : diagData.priority === 'High' ? 60 : 240,
      assignedTo: operatorName,
      department: 'IT Operations',
      escalationTier: 'Tier 2 Engineering',
      firstResponseMinutes: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activityLog: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Diagnostic SOP Engine',
          action: 'Ticket Generated',
          note: 'Created via automated diagnostic decision path.',
        },
      ],
      rootCause: 'Identified during SOP execution.',
      resolutionNotes: diagData.recommendedNotes,
    };

    setIncidents(prev => [newTicket, ...prev]);
    showToast(`Incident ${newId} created from Diagnostic SOP!`);
    setActiveTab('incidents');
    setSelectedTicket(newTicket);
  };

  // Handlers for IT Helpdesk consultations
  const handleConsultHelpdeskOnAsset = (asset: AssetRecord) => {
    setFocusedAsset(asset);
    setFocusedTicket(null);
    setActiveTab('ai');
  };

  const handleConsultHelpdeskOnSOP = (query: string) => {
    setFocusedTicket(null);
    setFocusedAsset(null);
    setActiveTab('ai');
  };

  const handleGenerateTicketFromAI = (ticketData: {
    title: string;
    description: string;
    priority: PriorityLevel;
    category: TicketCategory;
    assetId: string;
    rootCause?: string;
  }) => {
    const nextNum = incidents.length + 1;
    const newId = `INC-2026-${String(nextNum).padStart(4, '0')}`;
    const targetAsset = assets.find(a => a.tagId === ticketData.assetId);

    const newTicket: IncidentTicket = {
      id: newId,
      title: ticketData.title,
      description: ticketData.description,
      priority: ticketData.priority,
      status: 'Open',
      category: ticketData.category,
      assetId: ticketData.assetId,
      assetName: targetAsset ? targetAsset.name : 'Enterprise Asset',
      slaTargetMinutes: ticketData.priority === 'Critical' ? 15 : ticketData.priority === 'High' ? 60 : 240,
      assignedTo: operatorName,
      department: targetAsset ? targetAsset.department : 'IT Operations',
      escalationTier: ticketData.priority === 'Critical' ? 'Tier 3 Infrastructure' : 'Tier 2 Engineering',
      firstResponseMinutes: null,
      resolvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activityLog: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'IT Helpdesk',
          action: 'Ticket Created',
          note: 'Ticket originated from IT Helpdesk root cause analysis & safety triage.',
        },
      ],
      rootCause: ticketData.rootCause || 'Derived from IT Helpdesk root cause investigation.',
      resolutionNotes: 'Follow safety and remediation procedures documented in IT Helpdesk session.',
    };

    setIncidents(prev => [newTicket, ...prev]);
    showToast(`Created ticket ${newId} from IT Helpdesk recommendation!`);
    setActiveTab('incidents');
    setSelectedTicket(newTicket);
  };

  // Export handlers
  const handleExportCSV = () => {
    exportIncidentsToCSV(incidents, assets);
    showToast('Incident ledger CSV exported successfully');
  };

  const handleOpenAuditReport = () => {
    setActiveTab('audit');
    showToast('Switched to Executive Audit Report view');
  };

  const handleDirectDownloadPDF = () => {
    downloadAuditReportPDF(incidents, assets, operatorName);
    showToast('Audit Report generated for print / PDF download');
  };

  // CSV Import handlers
  const handleImportCSVSuccess = (importedTickets: IncidentTicket[], mode: 'append' | 'replace' = 'append') => {
    if (mode === 'replace') {
      setIncidents(importedTickets);
      showToast(`Incident ledger replaced with ${importedTickets.length} records`);
      return;
    }
    setIncidents(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newItems = importedTickets.filter(t => !existingIds.has(t.id));
      const updatedExisting = prev.map(t => {
        const matching = importedTickets.find(imp => imp.id === t.id);
        return matching || t;
      });
      return [...newItems, ...updatedExisting];
    });
    showToast(`Imported ${importedTickets.length} tickets successfully`);
  };

  const handleFileDropOnLedger = (file: File) => {
    setDroppedFile(file);
    setIsImportCSVOpen(true);
  };

  const handleApplyPlaybookFromLedger = (pb: SuggestionPlaybook) => {
    setTicketModalPrefill({
      title: pb.title,
      description: pb.description,
      category: pb.category,
      priority: pb.priority,
      assetId: pb.assetId,
      department: pb.department,
      rootCause: pb.rootCause,
      resolutionNotes: pb.resolutionNotes,
      escalationTier: pb.escalationTier,
    });
    setIsCreateTicketOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl border border-slate-700 animate-in fade-in duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {toastMessage.type === 'info' && <ShieldCheck className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Left Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCount={openCount}
        criticalCount={criticalCount}
        assetsCount={assets.length}
        operatorName={operatorName}
        onChangeOperatorName={(newName) => {
          setOperatorName(newName);
          showToast(`Officer profile updated to: ${newName}`);
        }}
        onOpenNewTicket={() => {
          setTicketModalPrefill(null);
          setIsCreateTicketOpen(true);
        }}
        onOpenAIAgent={() => {
          setFocusedTicket(null);
          setFocusedAsset(null);
          setActiveTab('ai');
        }}
        onOpenImportCSV={() => {
          setDroppedFile(null);
          setIsImportCSVOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onDirectDownloadPDF={handleDirectDownloadPDF}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openCount={openCount}
          criticalCount={criticalCount}
          operatorName={operatorName}
          onChangeOperatorName={(newName) => {
            setOperatorName(newName);
            showToast(`Officer profile updated to: ${newName}`);
          }}
          onOpenNewTicket={() => {
            setTicketModalPrefill(null);
            setIsCreateTicketOpen(true);
          }}
          onExportCSV={handleExportCSV}
          onOpenImportCSV={() => {
            setDroppedFile(null);
            setIsImportCSVOpen(true);
          }}
          onOpenAuditReport={handleOpenAuditReport}
          onDirectDownloadPDF={handleDirectDownloadPDF}
          onOpenAIAgent={() => {
            setFocusedTicket(null);
            setFocusedAsset(null);
            setActiveTab('ai');
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Floating Quick Action Button for IT Helpdesk */}
        {activeTab !== 'ai' && (
          <button
            onClick={() => {
              setFocusedTicket(null);
              setFocusedAsset(null);
              setActiveTab('ai');
            }}
            className="fixed bottom-6 right-6 z-40 bg-[#0f3d7a] hover:bg-blue-800 text-white px-4 py-2.5 shadow-xl border border-blue-400/60 rounded-sm text-xs font-bold flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105 no-print"
            title="Open IT Helpdesk & Issue Resolver"
          >
            <Headphones className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Ask IT Helpdesk</span>
          </button>
        )}

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Module 1: Incident Ticket Log & Analytics */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              {/* Real-time Metrics Dashboard */}
              <MetricsDashboard
                metrics={metrics}
                onFilterCategory={(cat) => setActiveCategoryFilter(cat)}
              />

              {/* Filterable Incident Ledger */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Incident Ticket Ledger & Real-Time SLA Response Queue
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time active ticketing with countdown SLA breach alerts, CSV drag-and-drop import, and custodian assignment
                    </p>
                  </div>
                </div>

                <IncidentLedger
                  incidents={incidents}
                  onSelectTicket={(ticket) => setSelectedTicket(ticket)}
                  onQuickStatusChange={handleQuickStatusChange}
                  onCreateNewTicket={() => {
                    setTicketModalPrefill(null);
                    setIsCreateTicketOpen(true);
                  }}
                  onExportCSV={handleExportCSV}
                  onOpenImportCSV={() => {
                    setDroppedFile(null);
                    setIsImportCSVOpen(true);
                  }}
                  onFileDrop={handleFileDropOnLedger}
                  activeCategoryFilter={activeCategoryFilter}
                  onClearCategoryFilter={() => setActiveCategoryFilter(null)}
                  onApplyPlaybook={handleApplyPlaybookFromLedger}
                />
              </div>
            </div>
          )}

          {/* Module 2: Hardware & Software Asset Register */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Hardware & Software Asset Register
                </h2>
                <p className="text-xs text-slate-500">
                  Architecture baseline standards, network node port mapping, and disaster recovery role designation
                </p>
              </div>

              <AssetRegister
                assets={assets}
                onSelectAsset={(asset) => setSelectedAsset(asset)}
                onOpenCreateAsset={() => setIsCreateAssetOpen(true)}
                onConsultAI={handleConsultHelpdeskOnAsset}
              />
            </div>
          )}

          {/* Module 3: Troubleshooting & Standard Operating Procedures (SOP) */}
          {activeTab === 'sop' && (
            <DiagnosticSOP
              diagnosticTrees={DIAGNOSTIC_TREES}
              onGenerateIncidentFromDiag={handleGenerateIncidentFromDiag}
              onConsultAI={handleConsultHelpdeskOnSOP}
            />
          )}

          {/* Module 4: IT Helpdesk · Problem-Solving & Diagnostics */}
          {activeTab === 'ai' && (
            <AIAgentChat
              incidents={incidents}
              assets={assets}
              focusedTicket={focusedTicket}
              focusedAsset={focusedAsset}
              onClearFocus={() => {
                setFocusedTicket(null);
                setFocusedAsset(null);
              }}
              onGenerateTicket={handleGenerateTicketFromAI}
            />
          )}

          {/* Module 5: Audit & Export Report View */}
          {activeTab === 'audit' && (
            <AuditReportView
              incidents={incidents}
              assets={assets}
              operatorName={operatorName}
            />
          )}
        </main>
      </div>

      {/* Incident Ticket Modal (Create / Edit / Details) */}
      {(selectedTicket || isCreateTicketOpen) && (
        <TicketModal
          ticket={isCreateTicketOpen ? (ticketModalPrefill as any) : selectedTicket}
          isOpen={true}
          isCreateMode={isCreateTicketOpen}
          onClose={() => {
            setSelectedTicket(null);
            setIsCreateTicketOpen(false);
            setTicketModalPrefill(null);
          }}
          onSaveTicket={handleSaveTicket}
          assets={assets}
          operatorName={operatorName}
          onConsultAI={(t) => {
            setFocusedTicket(t);
            setFocusedAsset(null);
            setActiveTab('ai');
            setSelectedTicket(null);
            setIsCreateTicketOpen(false);
          }}
        />
      )}

      {/* Asset Modal (Create / Edit) */}
      {(selectedAsset || isCreateAssetOpen) && (
        <AssetModal
          asset={selectedAsset}
          isOpen={true}
          isCreateMode={isCreateAssetOpen}
          onClose={() => {
            setSelectedAsset(null);
            setIsCreateAssetOpen(false);
          }}
          onSave={handleSaveAsset}
        />
      )}

      {/* CSV Import Modal */}
      {isImportCSVOpen && (
        <CSVImportModal
          isOpen={true}
          onClose={() => {
            setIsImportCSVOpen(false);
            setDroppedFile(null);
          }}
          onImportTickets={handleImportCSVSuccess}
          initialFile={droppedFile}
        />
      )}
    </div>
  );
}
