import React, { useState } from 'react';
import { 
  GitBranch, 
  Terminal, 
  Check, 
  Copy, 
  RotateCcw, 
  AlertTriangle, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  FilePlus,
  ShieldCheck,
  ChevronRight,
  Info,
  Headphones
} from 'lucide-react';
import { DiagnosticTree, DiagnosticStep, TicketCategory, PriorityLevel } from '../types';

interface DiagnosticSOPProps {
  diagnosticTrees: DiagnosticTree[];
  onGenerateIncidentFromDiag: (data: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: PriorityLevel;
    recommendedNotes: string;
  }) => void;
  onConsultAI?: (query: string) => void;
}

export const DiagnosticSOP: React.FC<DiagnosticSOPProps> = ({
  diagnosticTrees,
  onGenerateIncidentFromDiag,
  onConsultAI,
}) => {
  const [selectedTreeId, setSelectedTreeId] = useState<string>(diagnosticTrees[0]?.id || '');
  const [currentStepId, setCurrentStepId] = useState<string>(diagnosticTrees[0]?.initialStepId || '');
  const [historyStepIds, setHistoryStepIds] = useState<string[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});

  const activeTree = diagnosticTrees.find(t => t.id === selectedTreeId) || diagnosticTrees[0];
  const activeStep: DiagnosticStep | undefined = activeTree?.steps[currentStepId];

  // Switch trees
  const handleSelectTree = (treeId: string) => {
    const tree = diagnosticTrees.find(t => t.id === treeId);
    if (!tree) return;
    setSelectedTreeId(treeId);
    setCurrentStepId(tree.initialStepId);
    setHistoryStepIds([]);
    setCopiedSnippet(false);
  };

  const handleStepChoice = (nextStepId?: string) => {
    if (!nextStepId) return;
    setHistoryStepIds(prev => [...prev, currentStepId]);
    setCurrentStepId(nextStepId);
    setCopiedSnippet(false);
  };

  const handleRestartTree = () => {
    if (!activeTree) return;
    setCurrentStepId(activeTree.initialStepId);
    setHistoryStepIds([]);
    setCopiedSnippet(false);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const toggleChecklistItem = (item: string) => {
    setCheckedChecklist(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleCreateTicketFromDiagnostic = () => {
    if (!activeTree || !activeStep) return;

    const pathSteps = [...historyStepIds, currentStepId].map((id, idx) => {
      const step = activeTree.steps[id];
      return `${idx + 1}. ${step?.title || id}: ${step?.description || ''}`;
    }).join('\n');

    onGenerateIncidentFromDiag({
      title: `[DIAGNOSTIC] ${activeTree.title}: ${activeStep.title}`,
      description: `Diagnostic flow completed on SOP tree: ${activeTree.title}\n\nSymptoms: ${activeTree.symptomSummary}\n\nDiagnostic Path Executed:\n${pathSteps}\n\nFinal Finding: ${activeStep.description}`,
      category: activeTree.category,
      priority: activeStep.recommendedPriority || 'High',
      recommendedNotes: activeStep.remediationAction || 'Remediation in progress according to SOP checklist.',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-blue-700" />
            <span>Interactive Troubleshooting & SOP Diagnostic Trees</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step branching decision trees with validated terminal syntax and SOP protocol checklists
          </p>
        </div>

        {/* Tree Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sop-tree-select" className="text-xs font-semibold text-slate-700 whitespace-nowrap">Active SOP Playbook:</label>
          <select
            id="sop-tree-select"
            value={selectedTreeId}
            onChange={(e) => handleSelectTree(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 rounded-none focus:outline-none focus:border-blue-700"
          >
            {diagnosticTrees.map(tree => (
              <option key={tree.id} value={tree.id}>
                [{tree.category}] {tree.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Diagnostic Step Engine + SOP Checklist Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Step Interactive Runner */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-sm flex flex-col justify-between">
          <div>
            {/* Step Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 text-xs font-mono font-bold">
                  STEP ID: {currentStepId}
                </span>
                <span className="text-xs text-slate-500">
                  {historyStepIds.length} prior step{historyStepIds.length === 1 ? '' : 's'} executed
                </span>
              </div>
              <button
                onClick={handleRestartTree}
                className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Reset Diagnostic Tree
              </button>
            </div>

            {/* Tree Info Banner */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block">{activeTree.title}</span>
              <span className="text-[11px] text-slate-500">{activeTree.symptomSummary}</span>
            </div>

            {/* Active Step Details */}
            {activeStep ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeStep.title}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1">
                    {activeStep.description}
                  </p>
                </div>

                {/* Command Snippet box */}
                {activeStep.commandSnippet && (
                  <div className="border border-slate-300 bg-[#0a192f] text-slate-100 p-3 rounded-none font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-slate-200 uppercase">{activeStep.commandSnippet.tool} Command</span>
                      </span>
                      <button
                        onClick={() => handleCopyCommand(activeStep.commandSnippet!.command)}
                        className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer font-sans"
                      >
                        {copiedSnippet ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied to Clipboard
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Command
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="mt-2.5 overflow-x-auto text-emerald-300 font-mono text-xs whitespace-pre-wrap select-all">
                      {activeStep.commandSnippet.command}
                    </pre>

                    <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800 pt-1.5">
                      {activeStep.commandSnippet.description}
                    </div>
                  </div>
                )}

                {/* Expected Results Callout */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 block uppercase tracking-wider text-[11px]">
                    Expected Baseline Output:
                  </span>
                  <span className="text-slate-800 font-mono text-xs block mt-0.5">
                    {activeStep.expectedResult}
                  </span>
                </div>

                {/* Remediation Action if Terminal Node */}
                {activeStep.remediationAction && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-xs">
                    <span className="font-bold text-amber-900 block uppercase tracking-wider text-[11px]">
                      Remediation Action Required:
                    </span>
                    <p className="text-slate-800 mt-0.5 font-medium">
                      {activeStep.remediationAction}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Step not found. Please reset the diagnostic tree.
              </div>
            )}
          </div>

          {/* Interactive Branching Controls */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            {activeStep?.nextSteps ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Diagnostic Outcome:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeStep.nextSteps.yesStepId && (
                    <button
                      onClick={() => handleStepChoice(activeStep.nextSteps?.yesStepId)}
                      className="p-3 border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-none cursor-pointer text-left transition-colors flex items-center justify-between"
                    >
                      <span>{activeStep.nextSteps.yesLabel || 'Outcome Verified (Yes)'}</span>
                      <ArrowRight className="w-4 h-4 ml-2 text-emerald-700 flex-shrink-0" />
                    </button>
                  )}

                  {activeStep.nextSteps.noStepId && (
                    <button
                      onClick={() => handleStepChoice(activeStep.nextSteps?.noStepId)}
                      className="p-3 border border-rose-400 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-semibold rounded-none cursor-pointer text-left transition-colors flex items-center justify-between"
                    >
                      <span>{activeStep.nextSteps.noLabel || 'Anomaly Observed (No)'}</span>
                      <ArrowRight className="w-4 h-4 ml-2 text-rose-700 flex-shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Terminal Diagnostic Node Reached</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCreateTicketFromDiagnostic}
                    className="px-4 py-2 bg-[#0f3d7a] hover:bg-blue-800 text-white text-xs font-bold rounded-none cursor-pointer transition-colors border border-blue-900 inline-flex items-center space-x-1.5"
                  >
                    <FilePlus className="w-4 h-4 text-emerald-400" />
                    <span>Generate Incident Ticket From Diagnostic Path</span>
                  </button>
                  {onConsultAI && activeStep && (
                    <button
                      onClick={() => onConsultAI(`SOP Playbook "${activeTree.title}" reached terminal step "${activeStep.title}". Description: ${activeStep.description}. Remediation needed: ${activeStep.remediationAction || 'N/A'}. What are the next deep-level commands and recovery steps?`)}
                      className="px-3 py-2 bg-[#0f3d7a] hover:bg-blue-900 text-white text-xs font-bold border border-blue-900 rounded-sm cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Consult IT Helpdesk for Advanced Fix</span>
                    </button>
                  )}
                  <button
                    onClick={handleRestartTree}
                    className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-none cursor-pointer"
                  >
                    Run Another Diagnostic
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Standard Operating Procedure (SOP) Checklist */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>SOP Compliance Checklist</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mandatory operational steps to execute during incident triage
              </p>
            </div>

            {/* Checklist items */}
            <div className="mt-3 space-y-2">
              {activeTree.sopChecklist.map((item, index) => {
                const isChecked = !!checkedChecklist[item];
                return (
                  <div
                    key={index}
                    onClick={() => toggleChecklistItem(item)}
                    className={`p-2.5 border text-xs cursor-pointer transition-colors flex items-start space-x-2.5 ${
                      isChecked ? 'bg-emerald-50/50 border-emerald-300 text-slate-900' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <button type="button" className="mt-0.5 flex-shrink-0 text-slate-600">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <span className={`text-[11px] ${isChecked ? 'line-through text-slate-500 font-medium' : 'font-normal'}`}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Ticket Action at bottom of checklist */}
          <div className="mt-6 pt-3 border-t border-slate-200">
            <button
              onClick={handleCreateTicketFromDiagnostic}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-none cursor-pointer border border-emerald-700 flex items-center justify-center space-x-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Log Ticket from this Diagnostic</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              Transfers command logs and diagnostic path to new incident ticket
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
