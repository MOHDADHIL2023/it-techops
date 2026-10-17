import React, { useState, useMemo } from 'react';
import { 
  Server, 
  Search, 
  Plus, 
  Shield, 
  Network, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Cpu, 
  HardDrive, 
  Activity,
  Layers,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Headphones
} from 'lucide-react';
import { AssetRecord, RiskLevel, LifecycleStage, AssetType } from '../types';

interface AssetRegisterProps {
  assets: AssetRecord[];
  onSelectAsset: (asset: AssetRecord) => void;
  onOpenCreateAsset: () => void;
  onConsultAI?: (asset: AssetRecord) => void;
}

export const AssetRegister: React.FC<AssetRegisterProps> = ({
  assets,
  onSelectAsset,
  onOpenCreateAsset,
  onConsultAI,
}) => {
  const [activeView, setActiveView] = useState<'register' | 'baseline' | 'network' | 'dr'>('register');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const now = new Date().getTime();

  // Helper to compute days left
  const getDaysLeft = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const departments = useMemo(() => {
    return Array.from(new Set(assets.map(a => a.department))).sort();
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        asset.tagId.toLowerCase().includes(query) ||
        asset.name.toLowerCase().includes(query) ||
        asset.modelSpecs.toLowerCase().includes(query) ||
        asset.assignedUser.toLowerCase().includes(query) ||
        asset.location.toLowerCase().includes(query) ||
        asset.networkMapping.ipAddress.includes(query) ||
        asset.networkMapping.switchPort.toLowerCase().includes(query);

      const matchesType = typeFilter === 'all' || asset.type === typeFilter;
      const matchesDept = departmentFilter === 'all' || asset.department === departmentFilter;
      const matchesLifecycle = lifecycleFilter === 'all' || asset.lifecycleStage === lifecycleFilter;
      const matchesRisk = riskFilter === 'all' || asset.riskLevel === riskFilter;

      return matchesSearch && matchesType && matchesDept && matchesLifecycle && matchesRisk;
    });
  }, [assets, searchTerm, typeFilter, departmentFilter, lifecycleFilter, riskFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setLifecycleFilter('all');
    setRiskFilter('all');
  };

  // Risk styling helper
  const getRiskClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'Severe':
        return 'text-rose-800 bg-rose-50 border-rose-300 font-bold';
      case 'High':
        return 'text-rose-700 bg-rose-50/70 border-rose-200 font-semibold';
      case 'Medium':
        return 'text-amber-800 bg-amber-50 border-amber-300 font-medium';
      case 'Low':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300';
    }
  };

  const getLifecycleClass = (stage: LifecycleStage) => {
    switch (stage) {
      case 'Deployed':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300 font-medium';
      case 'Maintenance':
        return 'text-amber-800 bg-amber-50 border-amber-300 font-medium';
      case 'Procured':
        return 'text-blue-800 bg-blue-50 border-blue-200 font-medium';
      case 'Retired':
        return 'text-slate-600 bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm space-y-0">
      {/* View Switcher Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveView('register')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors cursor-pointer border ${
              activeView === 'register'
                ? 'bg-[#0f3d7a] text-white border-[#0f3d7a]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5 mr-1.5 inline" />
            Asset Register Ledger
          </button>

          <button
            onClick={() => setActiveView('baseline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors cursor-pointer border ${
              activeView === 'baseline'
                ? 'bg-[#0f3d7a] text-white border-[#0f3d7a]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5 mr-1.5 inline" />
            Architecture Baseline Matrix
          </button>

          <button
            onClick={() => setActiveView('network')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors cursor-pointer border ${
              activeView === 'network'
                ? 'bg-[#0f3d7a] text-white border-[#0f3d7a]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <Network className="w-3.5 h-3.5 mr-1.5 inline" />
            Network Node Mapping
          </button>

          <button
            onClick={() => setActiveView('dr')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-none transition-colors cursor-pointer border ${
              activeView === 'dr'
                ? 'bg-[#0f3d7a] text-white border-[#0f3d7a]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 inline" />
            Disaster Recovery (DR) Tiers
          </button>
        </div>

        <button
          onClick={onOpenCreateAsset}
          className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 rounded-none cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Asset Record
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 border-b border-slate-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter Tag ID, Model, IP, Switchport, Custodian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-300 rounded-none focus:outline-none focus:border-blue-600 text-slate-800"
            />
          </div>

          {/* Select filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Types</option>
              <option value="Server">Servers</option>
              <option value="Network">Network Devices</option>
              <option value="Database">Databases</option>
              <option value="Storage SAN">Storage SAN</option>
              <option value="Workstation Fleet">Workstation Fleet</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            </select>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Lifecycle */}
            <select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Lifecycles</option>
              <option value="Procured">Procured</option>
              <option value="Deployed">Deployed</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>

            {/* Risk */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Severe">Severe</option>
            </select>

            {(searchTerm || typeFilter !== 'all' || departmentFilter !== 'all' || lifecycleFilter !== 'all' || riskFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-2 py-1 text-xs text-rose-700 bg-rose-50 border border-rose-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: Asset Register Ledger */}
      {activeView === 'register' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Asset Tag ID</th>
                <th className="py-2.5 px-3">Model & Specifications</th>
                <th className="py-2.5 px-3">Assigned Custodian</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Lifecycle Stage</th>
                <th className="py-2.5 px-3">Warranty Expiry</th>
                <th className="py-2.5 px-3">License Renewal</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.map((asset) => {
                const warrantyDays = getDaysLeft(asset.warrantyExpiry);
                const licenseDays = getDaysLeft(asset.licenseRenewalDate);

                return (
                  <tr
                    key={asset.tagId}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    {/* Tag ID */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-900 group-hover:underline">
                        {asset.tagId}
                      </span>
                      <div className="text-[10px] text-slate-500">{asset.type}</div>
                    </td>

                    {/* Model & Specs */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={asset.modelSpecs}>
                        {asset.modelSpecs}
                      </div>
                    </td>

                    {/* Custodian */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{asset.assignedUser}</div>
                      <div className="text-[10px] text-slate-500">{asset.userRole}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      {asset.department}
                    </td>

                    {/* Lifecycle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] uppercase border ${getLifecycleClass(asset.lifecycleStage)}`}>
                        {asset.lifecycleStage}
                      </span>
                    </td>

                    {/* Warranty */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-800">{asset.warrantyExpiry}</div>
                      <div className={`text-[10px] font-mono ${warrantyDays < 30 ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>
                        {warrantyDays > 0 ? `${warrantyDays}d remaining` : 'Expired'}
                      </div>
                    </td>

                    {/* License Renewal */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-800">{asset.licenseRenewalDate}</div>
                      <div className={`text-[10px] font-mono ${licenseDays < 30 ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>
                        {licenseDays > 0 ? `${licenseDays}d renewal` : 'Due for renewal'}
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] uppercase border ${getRiskClass(asset.riskLevel)}`}>
                        {asset.riskLevel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 whitespace-nowrap text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {onConsultAI && (
                        <button
                          onClick={() => onConsultAI(asset)}
                          title="Consult IT Helpdesk for Hardening & Threat Analysis"
                          className="px-2 py-1 text-xs text-blue-900 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-300 font-semibold cursor-pointer inline-flex items-center rounded-sm"
                        >
                          <Headphones className="w-3 h-3 mr-1 text-emerald-600" />
                          Helpdesk
                        </button>
                      )}
                      <button
                        onClick={() => onSelectAsset(asset)}
                        className="px-2.5 py-1 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100 font-semibold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: Technology Architecture Baseline */}
      {activeView === 'baseline' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Asset & Node</th>
                <th className="py-2.5 px-3">OS Baseline Configuration</th>
                <th className="py-2.5 px-3">Patch / Errata Level</th>
                <th className="py-2.5 px-3">Firmware / BIOS</th>
                <th className="py-2.5 px-3">Hardening Compliance</th>
                <th className="py-2.5 px-3">Encryption Standard</th>
                <th className="py-2.5 px-3">Syslog Audit Destination</th>
                <th className="py-2.5 px-3 text-right">Audit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.tagId}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-900 group-hover:underline">
                      {asset.tagId}
                    </span>
                    <div className="text-[11px] text-slate-600 font-medium truncate max-w-xs">
                      {asset.name}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-800">
                    {asset.architectureBaseline.osBaseline}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    {asset.architectureBaseline.patchLevel}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {asset.architectureBaseline.firmwareVersion}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">
                        {asset.architectureBaseline.complianceScore}%
                      </span>
                      <div className="w-16 bg-slate-200 h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            asset.architectureBaseline.complianceScore >= 95
                              ? 'bg-emerald-600'
                              : asset.architectureBaseline.complianceScore >= 85
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${asset.architectureBaseline.complianceScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {asset.architectureBaseline.encryptionStandard}
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 truncate max-w-xs">
                    {asset.architectureBaseline.syslogDestination}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500 text-right">
                    {asset.architectureBaseline.lastAudited}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: Network Node Mapping */}
      {activeView === 'network' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Node / Tag ID</th>
                <th className="py-2.5 px-3">IP Address & Subnet</th>
                <th className="py-2.5 px-3">VLAN ID & Name</th>
                <th className="py-2.5 px-3">Default Gateway</th>
                <th className="py-2.5 px-3">MAC Address</th>
                <th className="py-2.5 px-3">Switch Termination Port</th>
                <th className="py-2.5 px-3">Port Operational Status</th>
                <th className="py-2.5 px-3 text-right">Physical Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.map((asset) => {
                const net = asset.networkMapping;
                let statusClass = 'text-emerald-800 bg-emerald-50 border-emerald-300';
                if (net.operationalStatus === 'Degraded') statusClass = 'text-amber-800 bg-amber-50 border-amber-300 font-semibold';
                if (net.operationalStatus === 'Isolated') statusClass = 'text-rose-800 bg-rose-50 border-rose-300 font-bold';
                if (net.operationalStatus === 'Maintenance') statusClass = 'text-blue-800 bg-blue-50 border-blue-300';

                return (
                  <tr
                    key={asset.tagId}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-900 group-hover:underline">
                        {asset.tagId}
                      </span>
                      <div className="text-[11px] text-slate-600 truncate max-w-xs">{asset.name}</div>
                    </td>

                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{net.ipAddress}</div>
                      <div className="text-[10px] text-slate-500">/{net.subnetMask}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      <span className="text-blue-800 font-semibold">VLAN {net.vlanId}</span>
                      <div className="text-[10px] text-slate-600">{net.vlanName}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {net.defaultGateway}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 uppercase whitespace-nowrap">
                      {net.macAddress}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {net.switchPort}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] uppercase border ${statusClass}`}>
                        {net.operationalStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 text-right">
                      {asset.location}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 4: Disaster Recovery (DR) Role Designation */}
      {activeView === 'dr' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">System / Asset</th>
                <th className="py-2.5 px-3">DR Tier Designation</th>
                <th className="py-2.5 px-3">Recovery Time (RTO)</th>
                <th className="py-2.5 px-3">Recovery Point (RPO)</th>
                <th className="py-2.5 px-3">Designated Failover Site</th>
                <th className="py-2.5 px-3">Replication Cadence</th>
                <th className="py-2.5 px-3">Last Drill Date</th>
                <th className="py-2.5 px-3 text-right">Backup Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAssets.map((asset) => {
                const dr = asset.disasterRecovery;
                const isTier0 = dr.roleTier.includes('Tier 0');

                return (
                  <tr
                    key={asset.tagId}
                    onClick={() => onSelectAsset(asset)}
                    className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-900 group-hover:underline">
                        {asset.tagId}
                      </span>
                      <div className="text-[11px] text-slate-600 truncate max-w-xs">{asset.name}</div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold border ${
                        isTier0 
                          ? 'text-rose-800 bg-rose-50 border-rose-300' 
                          : 'text-blue-800 bg-blue-50 border-blue-300'
                      }`}>
                        {dr.roleTier}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {dr.rto}
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {dr.rpo}
                    </td>

                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {dr.failoverSite}
                    </td>

                    <td className="py-3 px-3 text-slate-600 truncate max-w-xs">
                      {dr.replicationCadence}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-600">
                      {dr.lastDrillDate}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold border ${
                        dr.backupValidationStatus === 'Verified'
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                          : 'text-amber-800 bg-amber-50 border-amber-300'
                      }`}>
                        {dr.backupValidationStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>Showing {filteredAssets.length} of {assets.length} infrastructure assets</span>
        <span>Baseline Configuration Audited Q4 2026</span>
      </div>
    </div>
  );
};
