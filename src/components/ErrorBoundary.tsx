import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[I.T. TechOps ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetAll = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('techops_incidents');
        window.localStorage.removeItem('techops_assets');
        window.localStorage.removeItem('techops_operator');
      }
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-md border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide">
                  I.T. TechOps · Runtime Recovery Mode
                </h1>
                <p className="text-xs text-slate-400">
                  Operations Console intercepted an unexpected rendering exception.
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded p-3 mb-5 font-mono text-xs text-rose-300 break-words max-h-40 overflow-y-auto">
              <p className="font-semibold text-rose-400 mb-1">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Attempt Component Retry
              </button>

              <button
                onClick={this.handleResetAll}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded cursor-pointer transition-colors border border-slate-600"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Reset Cache & Reload Console
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-4">
              I.T. TechOps Command · Regional Operations Hub Dubai, UAE (GST UTC+4)
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
