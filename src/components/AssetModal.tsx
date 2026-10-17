import React, { useState } from 'react';
import { X, Server, Shield, Network, HardDrive, Check } from 'lucide-react';
import { AssetRecord, AssetType, LifecycleStage, RiskLevel } from '../types';

interface AssetModalProps {
  asset: AssetRecord | null;
  isOpen: boolean;
  isCreateMode?: boolean;
  onClose: () => void;
  onSave: (asset: AssetRecord) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  isOpen,
  isCreateMode = false,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [tagId, setTagId] = useState(asset?.tagId || `AST-SRV-0${Math.floor(20 + Math.random() * 80)}`);
  const [name, setName] = useState(asset?.name || '');
  const [type, setType] = useState<AssetType>(asset?.type || 'Server');
  const [modelSpecs, setModelSpecs] = useState(asset?.modelSpecs || '');
  const [assignedUser, setAssignedUser] = useState(asset?.assignedUser || '');
  const [userRole, setUserRole] = useState(asset?.userRole || '');
  const [department, setDepartment] = useState(asset?.department || 'Infrastructure & Cloud');
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>(asset?.lifecycleStage || 'Deployed');
  const [warrantyExpiry, setWarrantyExpiry] = useState(asset?.warrantyExpiry || '2027-12-31');
  const [licenseRenewalDate, setLicenseRenewalDate] = useState(asset?.licenseRenewalDate || '2026-12-31');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(asset?.riskLevel || 'Low');
  const [location, setLocation] = useState(asset?.location || 'Primary Datacenter - Rack 03');

  // Baseline tabs
  const [activeTab, setActiveTab] = useState<'general' | 'baseline' | 'network' | 'dr'>('general');

  // Architecture Baseline
  const [osBaseline, setOsBaseline] = useState(asset?.architectureBaseline.osBaseline || 'Ubuntu 24.04 LTS Hardened');
  const [patchLevel, setPatchLevel] = useState(asset?.architectureBaseline.patchLevel || 'Kernel 6.8.0-31-generic');
  const [firmwareVersion, setFirmwareVersion] = useState(asset?.architectureBaseline.firmwareVersion || 'BIOS v2.4.0');
  const [complianceScore, setComplianceScore] = useState(asset?.architectureBaseline.complianceScore || 95);
  const [encryptionStandard, setEncryptionStandard] = useState(asset?.architectureBaseline.encryptionStandard || 'LUKS2 AES-XTS-256');
  const [syslogDestination, setSyslogDestination] = useState(asset?.architectureBaseline.syslogDestination || 'SIEM-FORWARDER.internal.corp:514');

  // Network Mapping
  const [ipAddress, setIpAddress] = useState(asset?.networkMapping.ipAddress || '10.240.20.50');
  const [subnetMask, setSubnetMask] = useState(asset?.networkMapping.subnetMask || '255.255.255.0');
  const [vlanId, setVlanId] = useState(asset?.networkMapping.vlanId || 20);
  const [vlanName, setVlanName] = useState(asset?.networkMapping.vlanName || 'SRV-TIER-MGMT');
  const [defaultGateway, setDefaultGateway] = useState(asset?.networkMapping.defaultGateway || '10.240.20.1');
  const [macAddress, setMacAddress] = useState(asset?.networkMapping.macAddress || '52:54:00:12:34:56');
  const [switchPort, setSwitchPort] = useState(asset?.networkMapping.switchPort || 'SW-CORE-01:Gig1/0/22');
  const [operationalStatus, setOperationalStatus] = useState<'Online' | 'Degraded' | 'Isolated' | 'Maintenance'>(asset?.networkMapping.operationalStatus || 'Online');

  // DR Role
  const [roleTier, setRoleTier] = useState(asset?.disasterRecovery.roleTier || 'Tier 1 - Business Essential');
  const [rto, setRto] = useState(asset?.disasterRecovery.rto || '< 1 hour');
  const [rpo, setRpo] = useState(asset?.disasterRecovery.rpo || '< 15 min');
  const [failoverSite, setFailoverSite] = useState(asset?.disasterRecovery.failoverSite || 'DR Secondary Datacenter Site B');
  const [replicationCadence, setReplicationCadence] = useState(asset?.disasterRecovery.replicationCadence || 'Daily Snapshot + Asynchronous Replication');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: AssetRecord = {
      tagId,
      name,
      type,
      modelSpecs,
      assignedUser,
      userRole,
      department,
      lifecycleStage,
      warrantyExpiry,
      licenseRenewalDate,
      riskLevel,
      location,
      architectureBaseline: {
        osBaseline,
        patchLevel,
        firmwareVersion,
        complianceScore: Number(complianceScore),
        encryptionStandard,
        syslogDestination,
        lastAudited: new Date().toISOString().split('T')[0],
      },
      networkMapping: {
        ipAddress,
        subnetMask,
        vlanId: Number(vlanId),
        vlanName,
        defaultGateway,
        macAddress,
        switchPort,
        operationalStatus,
      },
      disasterRecovery: {
        roleTier,
        rto,
        rpo,
        failoverSite,
        replicationCadence,
        lastDrillDate: asset?.disasterRecovery.lastDrillDate || new Date().toISOString().split('T')[0],
        backupValidationStatus: asset?.disasterRecovery.backupValidationStatus || 'Verified',
      },
    };

    onSave(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-none shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0f3d7a] text-white flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs px-2 py-0.5 bg-blue-900 border border-blue-600 text-blue-200">
                  {tagId}
                </span>
                <span className="text-xs text-blue-200 uppercase font-semibold">
                  {isCreateMode ? 'Provision New Asset' : 'Hardware & Baseline Registry Profile'}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                {name || 'Asset Configuration'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general' ? 'border-blue-700 text-blue-800 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            1. Core Asset Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('baseline')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'baseline' ? 'border-blue-700 text-blue-800 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            2. Technology Baseline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'network' ? 'border-blue-700 text-blue-800 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            3. Network Node Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dr')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'dr' ? 'border-blue-700 text-blue-800 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            4. Disaster Recovery (DR)
          </button>
        </div>

        {/* Modal Form Content */}
        <form id="asset-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-800">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Asset Tag ID *</label>
                  <input
                    type="text"
                    required
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 font-mono text-xs focus:outline-none focus:border-blue-700 rounded-none bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Asset Canonical Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Edge Perimeter Firewall HA Cluster (FW-PRIMARY)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-blue-700 rounded-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Asset Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none focus:outline-none focus:border-blue-700"
                  >
                    <option value="Server">Server</option>
                    <option value="Network">Network Switch/Router/Firewall</option>
                    <option value="Database">Database Cluster</option>
                    <option value="Storage SAN">Storage SAN</option>
                    <option value="Workstation Fleet">Workstation Fleet</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Lifecycle Stage *</label>
                  <select
                    value={lifecycleStage}
                    onChange={(e) => setLifecycleStage(e.target.value as LifecycleStage)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none focus:outline-none focus:border-blue-700"
                  >
                    <option value="Procured">Procured (In Staging)</option>
                    <option value="Deployed">Deployed (Active Production)</option>
                    <option value="Maintenance">Maintenance (Servicing)</option>
                    <option value="Retired">Retired (Decommissioned)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Risk Level *</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none focus:outline-none focus:border-blue-700 font-semibold"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Severe">Severe Risk (Imminent Action)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Hardware Model & Technical Specifications *</label>
                <textarea
                  required
                  rows={2}
                  value={modelSpecs}
                  onChange={(e) => setModelSpecs(e.target.value)}
                  placeholder="CPU, Memory, Storage, NIC interfaces, Controller model, Form factor..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs focus:outline-none focus:border-blue-700 rounded-none bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Assigned Custodian / User</label>
                  <input
                    type="text"
                    value={assignedUser}
                    onChange={(e) => setAssignedUser(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. SecOps / Cloud"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Physical Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Primary DC Rack 01 (U40)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Warranty Expiry Date</label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">License Renewal Date</label>
                  <input
                    type="date"
                    value={licenseRenewalDate}
                    onChange={(e) => setLicenseRenewalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'baseline' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/50 border border-blue-200">
                <span className="font-semibold text-blue-900 block text-xs">Technology Architecture Baseline Configuration</span>
                <span className="text-[11px] text-blue-700">Enforces enterprise OS hardening standards, patch level governance, and syslog compliance.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">OS Baseline Specification</label>
                  <input
                    type="text"
                    value={osBaseline}
                    onChange={(e) => setOsBaseline(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Patch / Errata Level</label>
                  <input
                    type="text"
                    value={patchLevel}
                    onChange={(e) => setPatchLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Firmware / BIOS Version</label>
                  <input
                    type="text"
                    value={firmwareVersion}
                    onChange={(e) => setFirmwareVersion(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Compliance Hardening Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={complianceScore}
                    onChange={(e) => setComplianceScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Encryption Standard</label>
                  <input
                    type="text"
                    value={encryptionStandard}
                    onChange={(e) => setEncryptionStandard(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Syslog / SIEM Audit Log Destination</label>
                <input
                  type="text"
                  value={syslogDestination}
                  onChange={(e) => setSyslogDestination(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/50 border border-emerald-200">
                <span className="font-semibold text-emerald-900 block text-xs">Network Node Mapping & Interface Topology</span>
                <span className="text-[11px] text-emerald-700">Tracks physical switchport termination, VLAN tagging, IP subnet, and operational carrier status.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Assigned IP Address</label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Subnet Mask</label>
                  <input
                    type="text"
                    value={subnetMask}
                    onChange={(e) => setSubnetMask(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">VLAN ID</label>
                  <input
                    type="number"
                    value={vlanId}
                    onChange={(e) => setVlanId(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">VLAN Name</label>
                  <input
                    type="text"
                    value={vlanName}
                    onChange={(e) => setVlanName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Default Gateway</label>
                  <input
                    type="text"
                    value={defaultGateway}
                    onChange={(e) => setDefaultGateway(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">MAC Address</label>
                  <input
                    type="text"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Core Switch & Port</label>
                  <input
                    type="text"
                    value={switchPort}
                    onChange={(e) => setSwitchPort(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs font-mono bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Port Operational Status</label>
                  <select
                    value={operationalStatus}
                    onChange={(e) => setOperationalStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none focus:outline-none"
                  >
                    <option value="Online">Online (Forwarding)</option>
                    <option value="Degraded">Degraded (Link flap/drops)</option>
                    <option value="Isolated">Isolated (Quarantine)</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dr' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/50 border border-amber-200">
                <span className="font-semibold text-amber-900 block text-xs">Disaster Recovery (DR) Role & Resiliency Designation</span>
                <span className="text-[11px] text-amber-800">Defines Recovery Time Objective (RTO), Recovery Point Objective (RPO), and failover targets.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">DR Role Tier</label>
                  <select
                    value={roleTier}
                    onChange={(e) => setRoleTier(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none font-semibold"
                  >
                    <option value="Tier 0 - Mission Critical">Tier 0 - Mission Critical</option>
                    <option value="Tier 1 - Business Essential">Tier 1 - Business Essential</option>
                    <option value="Tier 2 - Operational">Tier 2 - Operational</option>
                    <option value="Tier 3 - Non-Critical">Tier 3 - Non-Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Target RTO (Time Objective)</label>
                  <input
                    type="text"
                    value={rto}
                    onChange={(e) => setRto(e.target.value)}
                    placeholder="e.g. < 15 min"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Target RPO (Data Point Objective)</label>
                  <input
                    type="text"
                    value={rpo}
                    onChange={(e) => setRpo(e.target.value)}
                    placeholder="e.g. 0 min (Sync)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Designated Failover Site / Node</label>
                  <input
                    type="text"
                    value={failoverSite}
                    onChange={(e) => setFailoverSite(e.target.value)}
                    placeholder="e.g. Frankfurt AZ-2 Standby Replica"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Replication Cadence</label>
                  <input
                    type="text"
                    value={replicationCadence}
                    onChange={(e) => setReplicationCadence(e.target.value)}
                    placeholder="e.g. Continuous Synchronous ActiveCluster"
                    className="w-full px-2.5 py-1.5 border border-slate-300 text-xs bg-white rounded-none"
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="asset-form"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-none cursor-pointer transition-colors border border-emerald-700 flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCreateMode ? 'Register Asset' : 'Save Asset Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
