import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  ServerCrash
} from 'lucide-react';
import { OperationsMetrics } from '../utils/slaCalculator';

interface MetricsDashboardProps {
  metrics: OperationsMetrics;
  onFilterCategory?: (category: string) => void;
  onFilterPriority?: (priority: string) => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  onFilterCategory,
  onFilterPriority,
}) => {
  return (
    <div className="space-y-4">
      {/* 4 Core Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MTTR Metric Card */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-600">Mean Time to Respond</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {metrics.mttrHoursFormatted}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5 inline" /> -4.2m vs 30d
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Target Benchmark: &lt; 30 min</span>
            <span className="font-semibold text-emerald-700">Healthy</span>
          </p>
        </div>

        {/* SLA Compliance Rate Card */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-600">SLA Compliance Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {metrics.slaComplianceRate}%
            </span>
            <span className={`text-xs font-semibold ${metrics.slaComplianceRate >= 95 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {metrics.slaComplianceRate >= 95 ? 'Target Met (≥95%)' : 'Sub-target'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-2.5 rounded-none overflow-hidden">
            <div 
              className={`h-full ${metrics.slaComplianceRate >= 95 ? 'bg-emerald-600' : 'bg-amber-500'}`} 
              style={{ width: `${Math.min(100, metrics.slaComplianceRate)}%` }}
            />
          </div>
        </div>

        {/* Active Open Incidents & Severity Card */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-600">Active Work Queue</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.criticalIncidents > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {metrics.openIncidents}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              tickets pending ({metrics.criticalIncidents} Critical)
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
            <span className="text-rose-700 font-semibold">{metrics.criticalIncidents} Critical</span>
            <span>·</span>
            <span className="text-amber-700 font-medium">{metrics.escalatedIncidents} Escalated</span>
            <span>·</span>
            <span className="text-slate-600">{metrics.totalIncidents - metrics.openIncidents} Resolved</span>
          </div>
        </div>

        {/* Recurring Issue Concentration */}
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-600">Primary Incident Domain</span>
            <Layers className="w-4 h-4 text-blue-700" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-slate-900 truncate">
              {metrics.categoryBreakdown[0]?.category || 'None'}
            </span>
            <span className="text-xs font-mono font-semibold text-blue-700">
              {metrics.categoryBreakdown[0]?.percentage || 0}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>{metrics.categoryBreakdown[0]?.count || 0} occurrences logged</span>
            <span className="text-blue-700 hover:underline cursor-pointer" onClick={() => onFilterCategory && metrics.categoryBreakdown[0] && onFilterCategory(metrics.categoryBreakdown[0].category)}>
              Filter domain &rarr;
            </span>
          </p>
        </div>
      </div>

      {/* Secondary Analytic Row: Recurring Category Breakdown + Top Impacted Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recurring Issue Breakdown by Category */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-4 rounded-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recurring Incident Breakdown by Category
              </h2>
              <p className="text-[11px] text-slate-500">Distribution across infrastructure operational domains</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{metrics.totalIncidents} total</span>
          </div>

          <div className="mt-3 space-y-2.5">
            {metrics.categoryBreakdown.map((item) => (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <button 
                    onClick={() => onFilterCategory && onFilterCategory(item.category)}
                    className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors cursor-pointer text-left flex items-center space-x-1.5"
                  >
                    <span>{item.category}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-slate-600 font-semibold">{item.count} tickets</span>
                    <span className="text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-[#1e40af] transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top-Impacted Systems Register */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-4 rounded-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Top-Impacted Systems & Infrastructure Nodes
              </h2>
              <p className="text-[11px] text-slate-500">Assets exhibiting repeated ticket clustering</p>
            </div>
            <ServerCrash className="w-4 h-4 text-slate-500" />
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {metrics.topImpactedSystems.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No recurring asset failures logged.</div>
            ) : (
              metrics.topImpactedSystems.map((asset) => (
                <div key={asset.assetId} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-semibold text-blue-900 bg-blue-50 px-1 py-0.5 border border-blue-200">
                        {asset.assetId}
                      </span>
                      <span className="text-xs font-medium text-slate-800 truncate" title={asset.assetName}>
                        {asset.assetName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs flex-shrink-0">
                    {asset.criticalCount > 0 && (
                      <span className="text-[11px] text-rose-700 font-semibold font-mono">
                        {asset.criticalCount} Critical
                      </span>
                    )}
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5">
                      {asset.incidentCount} {asset.incidentCount === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
