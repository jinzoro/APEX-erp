# Apex ERP - Business Intelligence System

Apex ERP is a high-performance, commercial-grade ERP solution designed for desktop-first environments. It features a local-first architecture with high-fidelity UI/UX, multi-currency support, and a robust license enforcement system.

## 🔑 License Activation

Licences are issued by the vendor via signed (Ed25519) tokens. No master keys are
published in this repository. See `LEGAL_TODO.md` and `ROADMAP.md`.

- Activation happens through the `activate-licence` Edge Function.
- The app ships the **public** key only; the private key lives in server secrets.
- There is no `keygen.html` and no bypass via `localStorage`.

---

## 🚀 Core Features

### 📊 1. Business Center (Dashboard)
- **Real-time Analytics:** Visualizes revenue, payroll, and asset value.
- **Dynamic Charting:** Interactive sales performance tracking with switchable time ranges (1D to ALL).
- **Profit Monitor:** Live calculation of net margins.

### 📦 2. Asset Portfolio (Inventory)
- **SKU Management:** Automatic generation of unique collision-free SKUs.
- **Stock Tracking:** Real-time volume monitoring with low-stock visual indicators.
- **Categorization:** Separate workflows for Consumables vs. Fixed Assets (Capital).

### 🤝 3. Trade Hub (Sales & Purchases)
- **Dual-mode Invoicing:** Handles both customer sales and supplier purchases.
- **Intelligent Invoicing:** Generates professional PDF-ready invoices in **English, French, or Arabic**.
- **Taxation Engine:** Configurable TVA/Tax rates per transaction.
- **Stock Integration:** Automatic stock decrement/increment upon transaction authorization.

### 👤 4. Client & Vendor Relations (CRM)
- **Lifecycle Tracking:** Monitor total sales impact per customer.
- **Tiering System:** Automatic classification (LEAD, RECURRING, VIP).
- **Vendor Network:** Comprehensive supplier database with rating and spend tracking.

### 💳 5. Treasury (Finance)
- **Multi-currency Ledger:** Global accounting base with live currency conversion.
- **Automated Conversion:** Enter transactions in any currency (USD, EUR, SAR, etc.) and the system auto-calculates the value in your base currency (e.g., MAD).
- **Financial Status:** Real-time visibility of Inflow, Outflow, and Net Position.

### 👥 6. Human Capital (HR)
- **Talent Onboarding:** Enrollment system for staff and collaborators.
- **Payroll Management:** Tracking of monthly net salaries and compensation.
- **Legal Documents:** Quick access to professional certifications.

### 🛡️ 7. Audit Ledger & Security
- **Traceability:** Every system action (Add, Update, Delete, Activate) is logged with a timestamp and user ID.
- **Technical Logs:** Detailed audit trail for compliance and troubleshooting.

---

## 🛠 Technical Architecture

- **Runtime:** React 19 (ESM)
- **Styling:** Tailwind CSS 3.4
- **Animations:** Framer Motion 11
- **Persistence:** Local-first (IndexedDB/LocalStorage wrapper)
- **Data Engine:** Custom `backendSimulator` for high-speed CRUD without server latency.
- **Language Support:** LTR/RTL support for English, French, and Arabic.

---

## ⚠️ Factory Reset (dev only)
To wipe the local node and clear all database records, navigate to **Settings** and select **Factory Reset Node**. This action is irreversible and restores the system to its OOBE (Out of Box Experience) state.
