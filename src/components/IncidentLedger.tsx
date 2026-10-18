import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  ArrowUpDown, 
  CheckCircle, 
  ExternalLink,
  ShieldAlert,
  X,
  FileSpreadsheet,
  Zap,
  Upload
} from 'lucide-react';
import { IncidentTicket, PriorityLevel, TicketStatus, TicketCategory } from '../types';
import { calculateTicketSla } from '../utils/slaCalculator';
import { SUGGESTION_PLAYBOOKS, SuggestionPlaybook } from '../data/suggestionPlaybooks';

interface IncidentLedgerProps {
  incidents: IncidentTicket[];
  onSelectTicket: (ticket: IncidentTicket) => void;
  onQuickStatusChange: (ticketId: string, newStatus: TicketStatus) => void;
  onCreateNewTicket: () => void;
  onExportCSV: () => void;
  onOpenImportCSV?: () => void;
  onFileDrop?: (file: File) => void;
  activeCategoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
  onApplyPlaybook?: (playbook: SuggestionPlaybook) => void;
}

export const IncidentLedger: React.FC<IncidentLedgerProps> = ({
  incidents,
  onSelectTicket,
  onQuickStatusChange,
  onCreateNewTicket,
  onExportCSV,
  onOpenImportCSV,
  onFileDrop,
  activeCategoryFilter,
  onClearCategoryFilter,
  onApplyPlaybook,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(activeCategoryFilter || 'all');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'sla'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sync category filter if changed from outside
  React.useEffect(() => {
    if (activeCategoryFilter) {
      setCategoryFilter(activeCategoryFilter);
    }
  }, [activeCategoryFilter]);

  const priorityOrder: Record<PriorityLevel, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
  };

  const filteredIncidents = useMemo(() => {
    return (incidents || []).filter(ticket => {
      if (!ticket) return false;
      // Search match
      const query = (searchTerm || '').toLowerCase();
      const matchesSearch = !query || 
        (ticket.id || '').toLowerCase().includes(query) ||
        (ticket.title || '').toLowerCase().includes(query) ||
        (ticket.assetId || '').toLowerCase().includes(query) ||
        (ticket.assetName || '').toLowerCase().includes(query) ||
        (ticket.assignedTo || '').toLowerCase().includes(query) ||
        (ticket.department || '').toLowerCase().includes(query);

      // Filters
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const pA = priorityOrder[a.priority] || 0;
        const pB = priorityOrder[b.priority] || 0;
        const diff = pB - pA;
        return sortOrder === 'asc' ? -diff : diff;
      }
      if (sortBy === 'sla') {
        const slaA = calculateTicketSla(a)?.remainingMinutes ?? 0;
        const slaB = calculateTicketSla(b)?.remainingMinutes ?? 0;
        return sortOrder === 'asc' ? slaA - slaB : slaB - slaA;
      }
      // default: created time
      const timeA = new Date(a?.createdAt || 0).getTime() || 0;
      const timeB = new Date(b?.createdAt || 0).getTime() || 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [incidents, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder]);

  const toggleSort = (field: 'created' | 'priority' | 'sla') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    if (onClearCategoryFilter) onClearCategoryFilter();
  };

  return (
    <div 
      className="bg-white border border-slate-200 rounded-sm relative"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onFileDrop) {
          onFileDrop(e.dataTransfer.files[0]);
        }
      }}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 bg-[#0f3d7a]/90 backdrop-blur-xs text-white flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-400">
          <Upload className="w-10 h-10 text-emerald-400 animate-bounce mb-2" />
          <h3 className="text-base font-bold">Drop CSV File to Import Incident Ledger</h3>
          <p className="text-xs text-blue-200 mt-1">Release file to parse records and load into active work queue</p>
        </div>
      )}

      {/* Quick Incident Playbooks Strip */}
      {onApplyPlaybook && (
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-700 flex items-center whitespace-nowrap">
            <Zap className="w-3 h-3 text-amber-600 mr-1" />
            Quick Suggestion Playbooks:
          </span>
          <div className="flex items-center space-x-1.5 whitespace-nowrap">
            {SUGGESTION_PLAYBOOKS.map((pb) => (
              <button
                key={pb.id}
                onClick={() => onApplyPlaybook(pb)}
                title={`Click to pre-populate ticket with ${pb.name}`}
                className="px-2 py-0.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-900 border border-slate-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center space-x-1.5 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{pb.name}</span>
                <span className="text-[9px] font-mono font-bold text-slate-500 group-hover:text-blue-700">[{pb.badge.split('·')[0].trim()}]</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Action Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Ticket ID, Asset, Title, Specialist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <label htmlFor="filter-status" className="text-slate-500 font-medium">Status:</label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-sm px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <label htmlFor="filter-priority" className="text-slate-500 font-medium">Priority:</label>
              <select
                id="filter-priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-sm px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical (P1)</option>
                <option value="High">High (P2)</option>
                <option value="Medium">Medium (P3)</option>
                <option value="Low">Low (P4)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <label htmlFor="filter-category" className="text-slate-500 font-medium">Category:</label>
              <select
                id="filter-category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  if (onClearCategoryFilter && e.target.value === 'all') onClearCategoryFilter();
                }}
                className="bg-white border border-slate-300 rounded-sm px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
              >
                <option value="all">All Categories</option>
                <option value="Network">Network</option>
                <option value="Hardware">Hardware</option>
                <option value="Business Systems">Business Systems</option>
                <option value="Access/Security">Access/Security</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-2 py-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-sm"
              >
                <X className="w-3 h-3 mr-1" />
                Reset
              </button>
            )}

            <div className="flex items-center space-x-1.5 ml-auto">
              {onOpenImportCSV && (
                <button
                  type="button"
                  onClick={onOpenImportCSV}
                  title="Import or drag & drop CSV file"
                  className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Import CSV
                </button>
              )}

              <button
                type="button"
                onClick={onExportCSV}
                title="Download full incident ledger as CSV"
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-2.5 px-3">
                <button 
                  onClick={() => toggleSort('priority')} 
                  className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Ticket ID</th>
              <th className="py-2.5 px-3">Incident Summary & Asset</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">
                <button 
                  onClick={() => toggleSort('sla')} 
                  className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>SLA Response Timer</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Assigned Custodian</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium">No incident tickets matching the selected filters.</span>
                    <button 
                      onClick={resetFilters}
                      className="text-xs text-blue-700 hover:underline"
                    >
                      Clear active filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredIncidents.map((ticket) => {
                const sla = calculateTicketSla(ticket);
                
                // Priority color badges
                let priorityClass = 'text-slate-700 bg-slate-100 border-slate-300';
                if (ticket.priority === 'Critical') priorityClass = 'text-white bg-rose-700 border-rose-800 font-bold';
                if (ticket.priority === 'High') priorityClass = 'text-rose-800 bg-rose-50 border-rose-300 font-semibold';
                if (ticket.priority === 'Medium') priorityClass = 'text-amber-800 bg-amber-50 border-amber-300 font-medium';
                if (ticket.priority === 'Low') priorityClass = 'text-blue-800 bg-blue-50 border-blue-200';

                // Status visual
                let statusBadge = 'text-slate-700 bg-slate-100 border-slate-300';
                if (ticket.status === 'Open') statusBadge = 'text-amber-800 bg-amber-50 border-amber-300 font-medium';
                if (ticket.status === 'In-Progress') statusBadge = 'text-blue-800 bg-blue-50 border-blue-300 font-semibold';
                if (ticket.status === 'Escalated') statusBadge = 'text-purple-800 bg-purple-50 border-purple-300 font-bold';
                if (ticket.status === 'Resolved') statusBadge = 'text-emerald-800 bg-emerald-50 border-emerald-300';

                return (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectTicket(ticket)}
                  >
                    {/* Priority */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded-none ${priorityClass}`}>
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Ticket ID */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-blue-900 group-hover:underline">
                        {ticket.id}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Summary & Asset */}
                    <td className="py-3 px-3 max-w-xs sm:max-w-md">
                      <div className="font-medium text-slate-900 truncate" title={ticket.title}>
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                        <span className="font-mono text-blue-800 font-semibold bg-slate-100 px-1 border border-slate-200">
                          {ticket.assetId}
                        </span>
                        <span>·</span>
                        <span className="truncate">{ticket.assetName}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-slate-700 font-medium">
                        {ticket.category}
                      </span>
                    </td>

                    {/* SLA Timer */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Clock className={`w-3.5 h-3.5 ${sla.isBreached ? 'text-rose-600' : sla.isWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
                        <span className={`inline-block px-1.5 py-0.5 text-[11px] font-mono border ${sla.badgeClass}`}>
                          {sla.displayTimer}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Target: {ticket.slaTargetMinutes}m
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        aria-label={`Update status for ticket ${ticket.id}`}
                        value={ticket.status}
                        onChange={(e) => onQuickStatusChange(ticket.id, e.target.value as TicketStatus)}
                        className={`text-xs px-2 py-1 font-medium border rounded-none cursor-pointer focus:outline-none ${statusBadge}`}
                      >
                        <option value="Open">Open</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Custodian / Assigned */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <div className="font-medium">{ticket.assignedTo}</div>
                      <div className="text-[10px] text-slate-500">{ticket.department}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectTicket(ticket)}
                        className="inline-flex items-center px-2 py-1 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-none font-semibold transition-colors"
                      >
                        Details
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Showing {filteredIncidents.length} of {incidents.length} incident tickets</span>
        <span>Real-time SLA tracking enabled</span>
      </div>
    </div>
  );
};
