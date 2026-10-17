import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Server, 
  ArrowUpRight, 
  Send, 
  ShieldAlert,
  User,
  Building,
  Tag,
  Bot,
  Zap,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { IncidentTicket, PriorityLevel, TicketStatus, TicketCategory, AssetRecord } from '../types';
import { calculateTicketSla } from '../utils/slaCalculator';
import { SUGGESTION_PLAYBOOKS, SuggestionPlaybook } from '../data/suggestionPlaybooks';

interface TicketModalProps {
  ticket: IncidentTicket | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSaveTicket: (ticket: IncidentTicket) => void;
  assets: AssetRecord[];
  onConsultAI?: (ticket: IncidentTicket) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  ticket,
  isOpen,
  isCreateMode = false,
  onClose,
  onSaveTicket,
  assets,
  onConsultAI,
}) => {
  if (!isOpen) return null;

  // Form states
  const [title, setTitle] = useState(ticket?.title || '');
  const [assetId, setAssetId] = useState(ticket?.assetId || (assets[0]?.tagId ?? ''));
  const [priority, setPriority] = useState<PriorityLevel>(ticket?.priority || 'Medium');
  const [status, setStatus] = useState<TicketStatus>(ticket?.status || 'Open');
  const [category, setCategory] = useState<TicketCategory>(ticket?.category || 'Network');
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo || 'Alex Rivera');
  const [department, setDepartment] = useState(ticket?.department || 'IT Operations');
  const [description, setDescription] = useState(ticket?.description || '');
  const [rootCause, setRootCause] = useState(ticket?.rootCause || '');
  const [resolutionNotes, setResolutionNotes] = useState(ticket?.resolutionNotes || '');
  const [escalationTier, setEscalationTier] = useState(ticket?.escalationTier || 'None');
  const [newLogNote, setNewLogNote] = useState('');

  // Suggestion Playbooks state
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);
  const [playbookCategoryFilter, setPlaybookCategoryFilter] = useState<string>('all');
  const [isPlaybooksExpanded, setIsPlaybooksExpanded] = useState<boolean>(true);
  const [playbookToast, setPlaybookToast] = useState<string | null>(null);
  const [aiDraftPrompt, setAiDraftPrompt] = useState<string>('');
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState<boolean>(false);

  const handleApplyPlaybook = (pb: SuggestionPlaybook) => {
    setTitle(pb.title);
    setDescription(pb.description);
    setCategory(pb.category);
    setPriority(pb.priority);
    setAssetId(pb.assetId);
    setDepartment(pb.department);
    setRootCause(pb.rootCause);
    setResolutionNotes(pb.resolutionNotes);
    setEscalationTier(pb.escalationTier);
    setSelectedPlaybookId(pb.id);
    setPlaybookToast(`Playbook applied: "${pb.name}"`);
    setTimeout(() => setPlaybookToast(null), 3500);
  };

  const handleGenerateAiDraft = async () => {
    if (!aiDraftPrompt.trim() || isGeneratingAiDraft) return;
    setIsGeneratingAiDraft(true);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a structured enterprise incident ticket for I.T. TechOps based on this incident summary or error log: "${aiDraftPrompt}".
Respond ONLY with a JSON object in this format (no markdown code fence, just raw JSON):
{
  "title": "Clear concise incident title",
  "description": "Detailed technical problem description with error codes and affected systems",
  "category": "Network",
  "priority": "Critical",
  "rootCause": "Hypothesized technical root cause",
  "resolutionNotes": "Immediate remediation actions and commands",
  "escalationTier": "Tier 3 Infrastructure"
}
Valid categories: "Network" | "Hardware" | "Business Systems" | "Access/Security"
Valid priorities: "Critical" | "High" | "Medium" | "Low"`
          }]
        })
      });
      const data = await res.json();
      if (data.reply) {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.category) setCategory(parsed.category as TicketCategory);
          if (parsed.priority) setPriority(parsed.priority as PriorityLevel);
          if (parsed.rootCause) setRootCause(parsed.rootCause);
          if (parsed.resolutionNotes) setResolutionNotes(parsed.resolutionNotes);
          if (parsed.escalationTier) setEscalationTier(parsed.escalationTier);
          setPlaybookToast('AI Auto-Draft populated successfully!');
          setTimeout(() => setPlaybookToast(null), 3500);
        }
      }
    } catch (e) {
      console.error('Failed to generate AI incident draft:', e);
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const selectedAsset = assets.find(a => a.tagId === assetId);

  const handleAddLogNote = () => {
    if (!newLogNote.trim() || !ticket) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: 'Alex Rivera (IT Support Specialist)',
      action: 'Progress Update',
      note: newLogNote.trim(),
    };

    const updated: IncidentTicket = {
      ...ticket,
      activityLog: [...ticket.activityLog, newActivity],
    };
    onSaveTicket(updated);
    setNewLogNote('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const slaMap: Record<PriorityLevel, number> = {
      'Critical': 30,
      'High': 120,
      'Medium': 480,
      'Low': 1440,
    };

    if (isCreateMode) {
      const newTicket: IncidentTicket = {
        id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        assetId,
        assetName: selectedAsset?.name || 'Unspecified Asset',
        priority,
        status,
        category,
        createdAt: new Date().toISOString(),
        slaTargetMinutes: slaMap[priority],
        firstResponseMinutes: null,
        resolvedAt: status === 'Resolved' ? new Date().toISOString() : null,
        assignedTo,
        department,
        description,
        rootCause: rootCause || undefined,
        resolutionNotes: resolutionNotes || undefined,
        escalationTier: escalationTier !== 'None' ? escalationTier : undefined,
        activityLog: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: assignedTo,
            action: 'Ticket Created',
            note: 'Incident logged manually in TechOps Command.',
          },
        ],
      };
      onSaveTicket(newTicket);
    } else if (ticket) {
      const wasResolved = ticket.status !== 'Resolved' && status === 'Resolved';
      const updatedTicket: IncidentTicket = {
        ...ticket,
        title,
        assetId,
        assetName: selectedAsset?.name || ticket.assetName,
        priority,
        status,
        category,
        assignedTo,
        department,
        description,
        rootCause,
        resolutionNotes,
        escalationTier: escalationTier !== 'None' ? escalationTier : undefined,
        resolvedAt: wasResolved ? new Date().toISOString() : ticket.resolvedAt,
        activityLog: [
          ...ticket.activityLog,
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: 'Alex Rivera',
            action: 'Record Updated',
            note: `Status updated to ${status}. Priority set to ${priority}.`,
          },
        ],
      };
      onSaveTicket(updatedTicket);
    }

    onClose();
  };

  const sla = ticket ? calculateTicketSla(ticket) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-none shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0f3d7a] text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2 py-0.5 bg-blue-900 border border-blue-600 text-blue-200">
                  {isCreateMode ? 'NEW INCIDENT LOG' : ticket?.id}
                </span>
                {!isCreateMode && sla && (
                  <span className={`text-xs px-2 py-0.5 font-mono ${sla.badgeClass}`}>
                    {sla.displayTimer}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {isCreateMode ? 'Log New Incident Ticket' : ticket?.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-none hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
          {/* Playbook notification alert */}
          {playbookToast && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-xs flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{playbookToast}</span>
              </span>
              <button onClick={() => setPlaybookToast(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">✕</button>
            </div>
          )}

          {/* Quick Suggestion Playbooks Section (Shown on Create Mode) */}
          {isCreateMode && (
            <div className="border border-slate-300 bg-slate-50/80 rounded-none overflow-hidden">
              <div className="p-3 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-amber-500 text-white rounded-none">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      Quick Incident Suggestion Playbooks
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pre-engineered standard operational scenarios to log recurring enterprise incidents with 1 click
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Category Filter Pills */}
                  <div className="flex items-center space-x-1 text-[11px]">
                    {(['all', 'Network', 'Business Systems', 'Access/Security', 'Hardware'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPlaybookCategoryFilter(cat)}
                        className={`px-2 py-0.5 border cursor-pointer transition-colors ${
                          playbookCategoryFilter === cat
                            ? 'bg-[#0f3d7a] text-white border-blue-900 font-bold'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border-slate-300'
                        }`}
                      >
                        {cat === 'all' ? 'All Playbooks' : cat}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPlaybooksExpanded(!isPlaybooksExpanded)}
                    className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer border border-slate-300 bg-white"
                  >
                    {isPlaybooksExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isPlaybooksExpanded && (
                <div className="p-3 space-y-3 bg-white">
                  {/* Grid of Playbook Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {SUGGESTION_PLAYBOOKS.filter(pb => playbookCategoryFilter === 'all' || pb.category === playbookCategoryFilter).map(pb => {
                      const isSelected = selectedPlaybookId === pb.id;
                      let priorityClass = 'text-slate-700 bg-slate-100 border-slate-300';
                      if (pb.priority === 'Critical') priorityClass = 'text-rose-800 bg-rose-50 border-rose-300 font-bold';
                      if (pb.priority === 'High') priorityClass = 'text-amber-800 bg-amber-50 border-amber-300 font-semibold';
                      if (pb.priority === 'Medium') priorityClass = 'text-blue-800 bg-blue-50 border-blue-300';
                      if (pb.priority === 'Low') priorityClass = 'text-slate-700 bg-slate-100 border-slate-300';

                      return (
                        <div
                          key={pb.id}
                          onClick={() => handleApplyPlaybook(pb)}
                          className={`p-2.5 border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                            isSelected
                              ? 'border-blue-700 bg-blue-50/70 shadow-xs'
                              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-mono font-bold text-blue-900 bg-white px-1 py-0.2 border border-slate-300">
                                {pb.assetId}
                              </span>
                              <span className={`px-1.5 py-0.2 border text-[9px] uppercase ${priorityClass}`}>
                                {pb.badge}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-blue-900">
                              {pb.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                              {pb.description}
                            </p>
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">{pb.category}</span>
                            <span className={`font-bold flex items-center ${isSelected ? 'text-blue-800' : 'text-emerald-700 group-hover:underline'}`}>
                              {isSelected ? (
                                <>
                                  <Check className="w-3 h-3 mr-0.5 text-blue-700" />
                                  Applied
                                </>
                              ) : (
                                'Apply Playbook →'
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Auto-Draft From Raw Telemetry or Log Input */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                      <span className="font-bold flex items-center space-x-1 text-blue-950">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>IT Helpdesk Smart Auto-Draft (Describe or paste any symptom / log snippet):</span>
                      </span>
                      <span className="text-slate-400 font-mono">Gemini-3.8-Flash</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiDraftPrompt}
                        onChange={(e) => setAiDraftPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleGenerateAiDraft();
                          }
                        }}
                        placeholder="e.g. Ingress pod billing-ingress crashed with OOMKilled, error 502 on /api/v2/charge"
                        className="flex-1 px-3 py-1.5 border border-slate-300 text-xs bg-white text-slate-900 rounded-none focus:outline-none focus:border-blue-700"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAiDraft}
                        disabled={!aiDraftPrompt.trim() || isGeneratingAiDraft}
                        className="px-3.5 py-1.5 bg-[#0f3d7a] hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-none cursor-pointer disabled:cursor-not-allowed transition-colors border border-blue-900 inline-flex items-center space-x-1"
                      >
                        {isGeneratingAiDraft ? (
                          <>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                            <span>Drafting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Auto-Draft Form</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form id="ticket-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Incident Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Core switch trunk interface flap causing intermittent packet loss"
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700 rounded-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Technical Problem Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail symptoms, error codes, affected users, and initial impact metrics..."
                  className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-700 rounded-none bg-white"
                />
              </div>
            </div>

            {/* Asset Selection & Classification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-slate-50 border border-slate-200">
              {/* Asset Affected */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Asset Affected *
                </label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700"
                >
                  {assets.map((ast) => (
                    <option key={ast.tagId} value={ast.tagId}>
                      {ast.tagId} - {ast.name.substring(0, 35)}...
                    </option>
                  ))}
                </select>
                {selectedAsset && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Type: <span className="font-semibold text-slate-700">{selectedAsset.type}</span> · {selectedAsset.location}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700"
                >
                  <option value="Network">Network</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Business Systems">Business Systems</option>
                  <option value="Access/Security">Access/Security</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Priority / SLA Tier *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700 font-semibold"
                >
                  <option value="Critical">Critical (P1) · 30m SLA</option>
                  <option value="High">High (P2) · 2h SLA</option>
                  <option value="Medium">Medium (P3) · 8h SLA</option>
                  <option value="Low">Low (P4) · 24h SLA</option>
                </select>
              </div>
            </div>

            {/* Lifecycle & Operational Management */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700"
                >
                  <option value="Open">Open (Pending Assignment)</option>
                  <option value="In-Progress">In-Progress (Active Triage)</option>
                  <option value="Escalated">Escalated (Higher Tier Hand-off)</option>
                  <option value="Resolved">Resolved (Work Completed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Specialist
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs text-slate-800 bg-white rounded-none focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Escalation Tier
                </label>
                <select
                  value={escalationTier}
                  onChange={(e) => setEscalationTier(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700"
                >
                  <option value="None">None (Standard Operations)</option>
                  <option value="Tier 2 SysOps">Tier 2 SysOps</option>
                  <option value="Tier 3 Infrastructure">Tier 3 Infrastructure</option>
                  <option value="SecOps CIRT">SecOps CIRT (Cyber Incident Response)</option>
                  <option value="Vendor OEM Support">Vendor OEM Escalation</option>
                </select>
              </div>
            </div>

            {/* Root Cause & Resolution Documentation */}
            <div className="space-y-3 p-3 bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">
                Root Cause & Remediation Record
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Root Cause Analysis (RCA)
                  </label>
                  <textarea
                    rows={2}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    placeholder="Underlying technical failure, firmware defect, configuration error..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Resolution & Post-Incident Action
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Steps applied to remediate, patch verified, post-action follow-up..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white text-slate-800 rounded-none focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Activity Log & Audit Trail (viewable in existing ticket mode) */}
          {!isCreateMode && ticket && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold uppercase tracking-wider text-slate-800 text-xs">
                  Incident Audit Trail & Work Notes
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {ticket.activityLog.length} events logged
                </span>
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Append triage note, diagnostic run result, or update..."
                  value={newLogNote}
                  onChange={(e) => setNewLogNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLogNote();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-300 text-xs bg-white rounded-none focus:outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  onClick={handleAddLogNote}
                  className="px-3 py-1.5 bg-[#0f3d7a] hover:bg-blue-800 text-white font-medium text-xs rounded-none transition-colors flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Note</span>
                </button>
              </div>

              {/* History Timeline */}
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50 p-3 border border-slate-200">
                {ticket.activityLog.slice().reverse().map((log) => (
                  <div key={log.id} className="pt-2 first:pt-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{log.author}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-blue-800">{log.action}</span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-slate-700 text-xs mt-1 bg-white p-2 border border-slate-200">
                        {log.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-none cursor-pointer"
            >
              Cancel
            </button>
            {!isCreateMode && ticket && onConsultAI && (
              <button
                type="button"
                onClick={() => {
                  onConsultAI(ticket);
                  onClose();
                }}
                className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-emerald-300 text-xs font-bold border border-emerald-500/50 rounded-none cursor-pointer flex items-center space-x-1.5"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask AI Agent for RCA & Fix</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              form="ticket-form"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-none cursor-pointer transition-colors border border-emerald-700"
            >
              {isCreateMode ? 'Create Incident Ticket' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
