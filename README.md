# I.T TechOps

[![Live Demo](https://img.shields.io/badge/AI%20Studio-Live%20App-0f3d7a?style=for-the-badge&logo=google)](https://ai.studio/apps/8fe50355-55e0-4781-b9b0-e6253a44fbf8?fullscreenApplet=true)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](#license)

> A centralized IT operations and asset lifecycle management platform engineered to triage incident logs, track hardware/software inventory, maintain infrastructure baselines, and reduce recurring technical support overhead.

🔗 **Direct App Link:** [Launch I.T TechOps on AI Studio](https://ai.studio/apps/8fe50355-55e0-4781-b9b0-e6253a44fbf8?fullscreenApplet=true)

---

## 📌 Overview

**I.T TechOps** provides IT administrators, support specialists, and systems engineers with a single operational dashboard. It bridges daily ticketing with long-term infrastructure governance—helping teams monitor SLA response times, spot recurring hardware/software failures, document network architecture, and maintain audit-ready disaster recovery procedures.

---

## 🚀 Key Modules & Features

### 1. Incident & Ticket Log Analytics
- **Priority Triaging:** Automated classification (P1 Critical through P4 Low) with SLA response/resolution timers.
- **Root-Cause & Trend Identification:** Detection of recurring incident clusters (e.g., VPN drops, specific printer driver crashes).
- **Audit Logging:** Detailed history tracking for support ticket lifecycle management.

### 2. Asset Lifecycle & Maintenance Register
- **Hardware Inventory:** Tracks serial numbers, asset tags, assignment, health status, and warranty periods.
- **Software & License Compliance:** Tracks seat allocation, renewal dates, license keys, and replacement cycles.
- **Maintenance Schedules:** Proactive flagging for routine maintenance and end-of-life (EOL) replacements.

### 3. Core Environment Baseline & Recovery Runbooks
- **Infrastructure Architecture:** Reference baseline covering primary business systems, network topologies, subnets, and identity providers.
- **Support Responsibilities:** Clear RACI matrix across internal Tier 1–3 support and external vendors.
- **System Recovery Runbooks:** Step-by-step procedures for backup validation, failover, and disaster recovery.

### 4. Zero-Dependency Reporting & Exports
- **Excel Export:** Generates standardized CSV workbooks containing filtered incident registers and asset logs.
- **PDF Summaries:** Generates clean, printer-friendly operational reports for stakeholder reviews and compliance audits.

---

## 🎨 Design System & Theme

The interface follows a clean, high-contrast enterprise design:

| Role | Color Name | Hex Code |
| :--- | :--- | :--- |
| **Primary Accent** | Deep Enterprise Blue | `#0f3d7a` |
| **Action & Success** | Vibrant Green | `#10b981` |
| **Background & Surfaces** | Clean White & Off-White | `#ffffff` / `#f8fafc` |
| **Borders & Neutral Text** | Slate Muted | `#e2e8f0` / `#1e293b` |

---

## 🛠️ Tech & Setup

### Architecture
- **Platform:** Google AI Studio (Interactive Web Applet)
- **Data Layer:** In-memory reactive state / Local Storage persistence
- **Export Engines:** Client-side CSV parser & window print CSS styling for PDF

### Local Development / Embedding
If wrapping this app inside an `iframe` or local web portal:

```html
<iframe 
  src="[https://ai.studio/apps/8fe50355-55e0-4781-b9b0-e6253a44fbf8?fullscreenApplet=true](https://ai.studio/apps/8fe50355-55e0-4781-b9b0-e6253a44fbf8?fullscreenApplet=true)" 
  width="100%" 
  height="900px" 
  style="border: none; border-radius: 8px;"
  title="I.T TechOps">
</iframe>