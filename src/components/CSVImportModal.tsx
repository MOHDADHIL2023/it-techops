import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Plus, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { IncidentTicket } from '../types';
import { parseCSV, mapCsvRowsToTickets } from '../utils/csvParser';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTickets: (tickets: IncidentTicket[], mode: 'append' | 'replace') => void;
  initialFile?: File | null;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportTickets,
  initialFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedTickets, setParsedTickets] = useState<IncidentTicket[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If an initial file was passed via drag-drop on page
  React.useEffect(() => {
    if (initialFile) {
      handleProcessFile(initialFile);
    }
  }, [initialFile]);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setParseErrors(['Selected file is not a CSV or text file (.csv / .txt required).']);
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setParseErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        const { tickets, errors } = mapCsvRowsToTickets(rows);

        setParsedTickets(tickets);
        setParseErrors(errors);
      } catch (err: any) {
        setParseErrors([`Failed to parse CSV: ${err.message || 'Malformed structure'}`]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setParseErrors(['Error reading file from disk.']);
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (parsedTickets.length === 0) return;
    onImportTickets(parsedTickets, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-300 w-full max-w-3xl flex flex-col rounded-none shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f3d7a] text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Import CSV Incident Ledger
              </h2>
              <p className="text-xs text-blue-200">
                Drag and drop your exported CSV file or browse local disk
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/70'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className={`w-8 h-8 ${isDragging ? 'text-emerald-600' : 'text-blue-700'}`} />
              <div className="font-semibold text-slate-800 text-sm">
                {fileName ? fileName : 'Drop your CSV incident log file here'}
              </div>
              <p className="text-xs text-slate-500">
                Compatible with TechOps Command CSV exports, ServiceNow, Jira, and standard Excel CSV formats
              </p>
              <button
                type="button"
                className="mt-2 px-3 py-1.5 bg-[#0f3d7a] hover:bg-blue-800 text-white font-semibold text-xs border border-blue-900"
              >
                Browse CSV File
              </button>
            </div>
          </div>

          {/* Parsing State & Errors */}
          {isLoading && (
            <div className="p-4 bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-mono">
              Parsing and mapping CSV columns...
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <span className="font-bold flex items-center">
                <AlertCircle className="w-4 h-4 mr-1 text-rose-600" />
                Parsing Warnings:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedTickets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Preview: {parsedTickets.length} Incident Tickets Parsed</span>
                </span>
                <span className="font-mono text-xs text-slate-500">{fileName}</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-1.5">ID</th>
                      <th className="p-1.5">Priority</th>
                      <th className="p-1.5">Category</th>
                      <th className="p-1.5">Title</th>
                      <th className="p-1.5">Asset ID</th>
                      <th className="p-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedTickets.slice(0, 10).map((t, i) => (
                      <tr key={i} className="hover:bg-blue-50/40">
                        <td className="p-1.5 font-mono font-bold text-blue-900">{t.id}</td>
                        <td className="p-1.5 font-semibold">{t.priority}</td>
                        <td className="p-1.5 text-slate-600">{t.category}</td>
                        <td className="p-1.5 font-medium truncate max-w-xs">{t.title}</td>
                        <td className="p-1.5 font-mono">{t.assetId}</td>
                        <td className="p-1.5">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedTickets.length > 10 && (
                <div className="text-[10px] text-slate-500 font-mono text-center">
                  Showing first 10 rows of {parsedTickets.length} total parsed records
                </div>
              )}

              {/* Import Mode Selection */}
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Import Mode:</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-blue-700"
                    />
                    <span><strong>Append</strong> to current ledger ({parsedTickets.length} new records)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-700"
                    />
                    <span className="text-rose-800"><strong>Replace</strong> current ledger completely</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedTickets.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-none cursor-pointer disabled:cursor-not-allowed transition-colors border border-emerald-700 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import {parsedTickets.length} Tickets into Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
};
