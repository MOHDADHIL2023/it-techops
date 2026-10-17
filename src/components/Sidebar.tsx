import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Server, 
  GitBranch, 
  FileText, 
  Headphones, 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Activity, 
  Clock, 
  Check, 
  Edit2, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { ITTechOpsLogo } from './ITTechOpsLogo';

interface SidebarProps {
  activeTab: 'incidents' | 'assets' | 'sop' | 'audit' | 'ai';
  setActiveTab: (tab: 'incidents' | 'assets' | 'sop' | 'audit' | 'ai') => void;
  openCount: number;
  criticalCount: number;
  assetsCount: number;
  operatorName: string;
  onChangeOperatorName: (name: string) => void;
  onOpenNewTicket: () => void;
  onOpenAIAgent: () => void;
  onOpenImportCSV: () => void;
  onExportCSV: () => void;
  onDirectDownloadPDF?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openCount,
  criticalCount,
  assetsCount,
  operatorName,
  onChangeOperatorName,
  onOpenNewTicket,
  onOpenAIAgent,
  onOpenImportCSV,
  onExportCSV,
  onDirectDownloadPDF,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [tempOperatorName, setTempOperatorName] = useState(operatorName);

  const handleSaveOperator = () => {
    if (tempOperatorName.trim()) {
      onChangeOperatorName(tempOperatorName.trim());
    }
    setIsEditingOperator(false);
  };

  const navItems = [
    {
      id: 'incidents' as const,
      label: 'Incident Log & SLA',
      fullName: 'Incident Ticket Log & Analytics',
      icon: ShieldAlert,
      badge: openCount > 0 ? `${openCount}` : undefined,
      badgeColor: criticalCount > 0 ? 'bg-rose-500 text-white' : 'bg-blue-800 text-blue-200',
    },
    {
      id: 'assets' as const,
      label: 'Asset Register',
      fullName: 'Hardware & Software Asset Register',
      icon: Server,
      badge: `${assetsCount}`,
      badgeColor: 'bg-blue-900 text-blue-200',
    },
    {
      id: 'sop' as const,
      label: 'Diagnostic SOP Trees',
      fullName: 'Troubleshooting & Diagnostic SOP Trees',
      icon: GitBranch,
    },
    {
      id: 'ai' as const,
      label: 'IT Helpdesk',
      fullName: 'IT Helpdesk · Problem Solving',
      icon: Headphones,
      badge: 'ONLINE',
      badgeColor: 'bg-emerald-600 text-white animate-pulse',
    },
    {
      id: 'audit' as const,
      label: 'Audit & Compliance',
      fullName: 'Executive Audit & Compliance Report',
      icon: FileText,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a1e38] text-white border-r border-blue-950/80 select-none">
      {/* Top Header / Branding */}
      <div className="p-4 border-b border-blue-900/60 bg-[#07172c]">
        <div className="flex items-center justify-between">
          <ITTechOpsLogo size="md" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-blue-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Real-time System Status Pill */}
        <div className="mt-3.5 px-2.5 py-1.5 bg-blue-950/70 border border-blue-800/60 rounded-xs flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-300">NOC: OPTIMAL</span>
          </div>
          <span className="font-mono text-blue-300 text-[10px]">HA CLUSTER ONLINE</span>
        </div>
      </div>

      {/* Main Navigation Modules */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-blue-400/80 font-bold">
            Core Operations Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-sm transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-700 to-[#1e40af] text-white shadow-md border-l-4 border-emerald-400 font-bold'
                      : 'text-blue-200 hover:bg-blue-900/50 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-300' : 'text-blue-300'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs tracking-wider ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Workflows */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-blue-400/80 font-bold">
            Operational Actions
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => {
                onOpenNewTicket();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-sm border border-emerald-400/50 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Incident Ticket</span>
            </button>

            <button
              onClick={() => {
                onOpenAIAgent();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-900 to-[#0e2c56] hover:bg-blue-850 text-emerald-300 text-xs font-bold rounded-sm border border-emerald-500/50 cursor-pointer transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
              <span>IT Helpdesk Diagnostic</span>
            </button>

            <button
              onClick={() => {
                onOpenImportCSV();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center space-x-2 px-3 py-1.5 bg-[#0f2d57] hover:bg-blue-900 text-blue-100 text-xs font-medium rounded-sm border border-blue-700/50 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Import Incident CSV</span>
            </button>

            <button
              onClick={() => {
                onExportCSV();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center space-x-2 px-3 py-1.5 bg-[#0f2d57] hover:bg-blue-900 text-blue-100 text-xs font-medium rounded-sm border border-blue-700/50 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              onClick={() => {
                if (onDirectDownloadPDF) onDirectDownloadPDF();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center space-x-2 px-3 py-1.5 bg-[#0f2d57] hover:bg-blue-900 text-blue-100 text-xs font-medium rounded-sm border border-blue-700/50 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-200" />
              <span>Download PDF Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operator & Shift Specialist Footer */}
      <div className="p-3.5 border-t border-blue-900/60 bg-[#071629] text-xs">
        <div className="flex items-center justify-between text-blue-300 text-[11px] mb-1.5">
          <span className="font-mono flex items-center space-x-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>UTC {new Date().toISOString().substring(11, 16)}</span>
          </span>
          <span className="px-1.5 py-0.2 bg-blue-900 text-[9px] font-mono text-blue-200">SHIFT 1</span>
        </div>

        <div className="pt-1.5 border-t border-blue-900/40">
          <div className="text-[10px] text-blue-400 font-medium">Logged-In IT Specialist:</div>
          {isEditingOperator ? (
            <div className="flex items-center space-x-1 mt-1">
              <input
                type="text"
                value={tempOperatorName}
                onChange={(e) => setTempOperatorName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveOperator();
                  if (e.key === 'Escape') setIsEditingOperator(false);
                }}
                autoFocus
                className="w-full px-1.5 py-0.5 bg-blue-950 border border-blue-400 text-white text-xs font-semibold focus:outline-none"
              />
              <button
                onClick={handleSaveOperator}
                className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                title="Save Operator Name"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => {
                setTempOperatorName(operatorName);
                setIsEditingOperator(true);
              }}
              className="flex items-center justify-between mt-0.5 text-white cursor-pointer hover:text-emerald-300 group"
              title="Click to edit operator name"
            >
              <span className="font-bold truncate text-xs group-hover:underline">{operatorName}</span>
              <Edit2 className="w-3 h-3 text-blue-400 group-hover:text-emerald-300 opacity-70 group-hover:opacity-100" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar (Fixed on lg screens) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 no-print shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-[#0a1e38] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
