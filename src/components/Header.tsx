import React, { useState, useEffect } from 'react';
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
  Activity,
  MapPin,
  Globe,
  Building2,
  X,
  User,
  UserCheck,
  Mail
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
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const getInitials = (name: string) => {
    const parts = (name || 'AH').trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'AH').toUpperCase();
  };

  // Live Dubai Time (Gulf Standard Time, UTC+4)
  const [dubaiTime, setDubaiTime] = useState<string>(() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
    } catch (e) {
      const d = new Date(Date.now() + 4 * 3600 * 1000);
      return d.toISOString().substring(11, 16);
    }
  });

  useEffect(() => {
    const updateTime = () => {
      try {
        setDubaiTime(new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Dubai',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()));
      } catch (e) {
        const d = new Date(Date.now() + 4 * 3600 * 1000);
        setDubaiTime(d.toISOString().substring(11, 16));
      }
    };
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

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
          {/* Location Badge: Dubai, UAE */}
          <div className="relative">
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              title="Regional Hub: Dubai, UAE (Click to view infrastructure telemetry)"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-300 hover:border-blue-400 rounded-sm text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span className="font-bold">Dubai, UAE</span>
              <span className="text-slate-400 hidden sm:inline">·</span>
              <span className="font-mono text-[11px] text-blue-900 font-bold hidden sm:inline">
                {dubaiTime} GST
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
            </button>

            {/* Dubai Operations Hub Telemetry Flyout */}
            {showLocationModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-300 shadow-2xl rounded-sm p-4 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Dubai Operations Hub</h3>
                      <p className="text-[10px] text-slate-500 font-mono">United Arab Emirates (GST · UTC+4)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLocationModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-slate-700">
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">Local Dubai Time:</span>
                    <span className="font-mono font-bold text-blue-900">{dubaiTime} GST (UTC+04:00)</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-medium">Primary DC Facility:</span>
                      <span className="font-semibold text-slate-900 text-right">Dubai Internet City (DIC DC-1)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-medium">Regional HQ:</span>
                      <span className="font-semibold text-slate-900 text-right">DIFC Gate Tower, Dubai</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-medium">DR Failover Site:</span>
                      <span className="font-semibold text-slate-900 text-right">Abu Dhabi Kizad Standby AZ-2</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-medium">Cloud Region:</span>
                      <span className="font-semibold text-slate-900 text-right font-mono">AWS me-central-1 (UAE)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500 font-medium">Carrier Transit:</span>
                      <span className="font-semibold text-slate-900 text-right">e& (Etisalat) + du Dark Fiber</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Regulatory Body:</span>
                      <span className="font-semibold text-emerald-700 text-right">UAE TDRA / NESA IAS</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      NOC Status: 100% Operational
                    </span>
                    <span className="text-slate-500 font-mono">Ping: 3.2ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Icon: Duty IT Support Specialist (Adil Hossain) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserModal(!showUserModal);
                setShowLocationModal(false);
              }}
              title={`Duty IT Support Specialist: ${operatorName} (adil2030hossain@gmail.com)`}
              className="inline-flex items-center space-x-2 pl-2 pr-2.5 py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-950 border border-blue-300 hover:border-blue-400 rounded-sm text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              <div className="relative flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-bold text-[9px] flex items-center justify-center border border-blue-800 shadow-2xs">
                  {getInitials(operatorName)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" title="Active Duty" />
              </div>
              <div className="text-left hidden sm:block leading-tight">
                <div className="text-[9px] uppercase tracking-wider text-blue-700 font-bold leading-none">Duty IT Specialist</div>
                <div className="font-bold text-slate-900 text-xs leading-none mt-0.5 truncate max-w-[110px]">{operatorName}</div>
              </div>
            </button>

            {/* Duty Specialist Profile Flyout */}
            {showUserModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-300 shadow-2xl rounded-sm p-4 z-50 text-xs">
                <div className="flex items-start justify-between border-b border-slate-200 pb-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 text-white font-bold text-base flex items-center justify-center border-2 border-blue-500 shadow-sm">
                        {getInitials(operatorName)}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active On-Duty" />
                    </div>
                    <div>
                      <div className="inline-block px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-xs mb-0.5">
                        ● Active On-Duty
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{operatorName}</h3>
                      <p className="text-[11px] text-blue-700 font-medium">Duty IT Support Specialist</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-500 font-medium flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Specialist Email:
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">adil2030hossain@gmail.com</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-500 font-medium flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                      Assigned NOC Hub:
                    </span>
                    <span className="font-semibold text-slate-900">Dubai Internet City (DIC DC-1)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-500 font-medium flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      Active Shift:
                    </span>
                    <span className="font-mono font-semibold text-emerald-800">GST 08:00 – 18:00 (UTC+4)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xs">
                    <span className="text-slate-500 font-medium flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                      Operational Role:
                    </span>
                    <span className="font-semibold text-purple-900">Tier-3 Escalation Specialist</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                      <span>Edit Specialist Name</span>
                      <span className="text-[9px] text-slate-400 font-normal">Press Enter to save</span>
                    </div>
                    {isEditingOperator ? (
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={tempOperatorName}
                          onChange={(e) => setTempOperatorName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveOperator();
                            if (e.key === 'Escape') setIsEditingOperator(false);
                          }}
                          className="w-full px-2 py-1 bg-white border border-blue-500 text-slate-900 text-xs font-semibold focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveOperator}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs cursor-pointer"
                          title="Save Specialist Name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setTempOperatorName(operatorName);
                          setIsEditingOperator(true);
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xs border border-slate-300 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Modify Duty Specialist Name</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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
