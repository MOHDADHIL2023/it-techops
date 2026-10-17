import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Headphones, 
  Clock, 
  Check, 
  Edit2, 
  Menu,
  ShieldCheck,
  Search,
  Zap,
  Activity
} from 'lucide-react';
import { ITTechOpsLogo } from './ITTechOpsLogo';

interface HeaderProps {
  activeTab: 'incidents' | 'assets' | 'sop' | 'audit' | 'ai';
  setActiveTab: (tab: 'incidents' | 'assets' | 'sop' | 'audit' | 'ai') => void;
  openCount: number;
  criticalCount: number;
  onOpenNewTicket: () => void;
  onExportCSV: () => void;
  onOpenImportCSV: () => void;
  onOpenAuditReport: () => void;
  onDirectDownloadPDF?: () => void;
  onOpenAIAgent: () => void;
  operatorName: string;
  onChangeOperatorName: (name: string) => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openCount,
  criticalCount,
  onOpenNewTicket,
  onExportCSV,
  onOpenImportCSV,
  onOpenAuditReport,
  onDirectDownloadPDF,
  onOpenAIAgent,
  operatorName,
  onChangeOperatorName,
  onToggleMobileSidebar,
}) => {
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [tempOperatorName, setTempOperatorName] = useState(operatorName);

  const handleSaveOperator = () => {
    if (tempOperatorName.trim()) {
      onChangeOperatorName(tempOperatorName.trim());
    }
    setIsEditingOperator(false);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'incidents':
        return 'Incident Ticket Log & Real-Time SLA Response Ledger';
      case 'assets':
        return 'Hardware & Software Enterprise Asset Register';
      case 'sop':
        return 'Interactive Diagnostic Trees & Standard Operating Procedures';
      case 'ai':
        return 'IT Helpdesk · Tier-3 Infrastructure Systems Resolution';
      case 'audit':
        return 'Executive IT Operations & Compliance Audit Report';
      default:
        return 'I.T. TechOps Management Console';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 select-none no-print sticky top-0 z-20 shadow-xs">
      {/* Top Banner on Mobile / Top Bar on Desktop */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & View Breadcrumb */}
        <div className="flex items-center space-x-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Mobile Logo display */}
          <div className="lg:hidden">
            <ITTechOpsLogo size="sm" showSubtitle={false} />
          </div>

          {/* Desktop Breadcrumb View Title */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
              <span className="font-semibold text-blue-900">I.T. TechOps</span>
              <span>/</span>
              <span className="text-slate-700 capitalize font-medium">{activeTab}</span>
            </div>
            <h1 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              {getTabTitle()}
            </h1>
          </div>
        </div>

        {/* Right: Quick Action Hub & Helpdesk button */}
        <div className="flex items-center space-x-2">
          {/* IT Helpdesk Quick Launcher */}
          <button
            onClick={onOpenAIAgent}
            title="Open IT Helpdesk for problem-solving, root cause analysis and CLI commands"
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-sm bg-[#0f3d7a] hover:bg-blue-900 text-white transition-colors cursor-pointer border border-blue-900 shadow-xs"
          >
            <Headphones className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>IT Helpdesk</span>
          </button>

          {/* Log Ticket Button */}
          <button
            onClick={onOpenNewTicket}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer border border-emerald-700 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Log Ticket</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={onOpenImportCSV}
            title="Import or drop CSV file"
            className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-amber-600" />
            <span>Import</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            title="Export CSV to Excel"
            className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* PDF Audit */}
          <button
            onClick={() => {
              if (onDirectDownloadPDF) {
                onDirectDownloadPDF();
              } else {
                onOpenAuditReport();
              }
            }}
            title="Download audit report PDF"
            className="hidden md:inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-blue-700" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
