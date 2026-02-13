# 🏥 NitiCare

### Smart Mother & Child Care Platform

*(Under NitiKushal Initiative for Nitikushal Foundation)*

# Live at : https://niticare.vercel.app/

---

## 📌 Overview

NitiCare is a lifecycle-based maternal and child health management platform designed to support government and NGO health programs.

The system tracks beneficiaries from:

* Pregnancy (Antenatal)
* Postnatal phase
* Child care (0–5 years)

It ensures structured monitoring, form tracking, vaccination follow-ups, and data-driven reporting.

---

## 🎯 Objectives

* Reduce missed checkups and vaccinations
* Improve monitoring of high-risk cases
* Provide structured workflows for ASHA / AWC workers
* Enable administrative visibility and analytics
* Maintain accountability through role-based access

---

## 🏗️ Architecture

```
Frontend (React)
        ↓
Backend (Node + Express)
        ↓
PostgreSQL (JSONB supported)
```

---

## 🧰 Tech Stack

### 🔹 Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router
* i18n (Multilingual support)

### 🔹 Backend

* Node.js
* Express.js
* Knex.js (Query Builder)
* JWT Authentication
* Role-Based Access Control (RBAC)

### 🔹 Database

* PostgreSQL
* JSONB (for flexible form schema storage)

### 🔹 Deployment

* Frontend: Vercel
* Backend: Render
* Database: Managed PostgreSQL

---

## 🔐 Role-Based Access

### 1️⃣ Admin (Government / NGO Coordinator)

* Government Data Sync (CSV / structured import)
* Beneficiary allocation to ASHA workers
* Advanced filtering (District / Block / Village)
* Monitoring dashboard
* CSV export
* Analytics & reports

---

### 2️⃣ ASHA / AWC Worker

* View assigned beneficiaries
* Register new pregnancy
* Complete missing government data
* Phase-based dashboard:

  * Antenatal
  * Postnatal
  * Child (0–5 Years)
* Submit structured health forms
* Visit notes & follow-up tracking

---

## 📦 Core Modules

### Module 0 – Authentication & RBAC

* Secure login
* Role-based dashboards
* Strict data isolation

---

### Module 1 – Antenatal Care

* 9-month structured tracking
* Monthly cards
* Form status (Completed / Pending / Missed)
* Visit documentation

---

### Module 2 – Postnatal Care

* Newborn registration
* Mother recovery tracking
* Vaccination forms
* Summary dashboard

---

### Module 3 – Child Care (0–5 Years)

* Growth tracking
* Vaccination tracking
* Development milestones
* Risk indicators

---

## 📊 Data & Analytics

The platform supports:

* Activity summaries
* ASHA performance overview
* Monthly trends
* District-level filtering
* CSV export for reporting

All analytics are powered through PostgreSQL aggregation queries.

---

## 🗄️ Database Design Highlights

* Normalized relational schema
* JSONB support for dynamic form fields
* Referential integrity with foreign keys
* Audit-ready structure

---

## 🚀 Deployment

* Frontend : Vercel
* Backend  : Render
* Database : Supabase ( migrate from local postgres to supabase ) 

## 🛡️ Security Features

* JWT-based authentication
* Role-based access control
* Protected API routes
* CORS configuration
* Secure environment variables

---

## 📈 Scalability

The system is designed to scale through:

* Docker containerization
* Horizontal scaling
* Redis integration (future-ready)
* Kubernetes compatibility

---

## 📁 Project Structure (Simplified)

```
/client
/server
  /controllers
  /routes
  /middleware
  /services
  /db
```

---

## 🧠 Future Enhancements

* Advanced analytics dashboards
* Background job processing (Redis)
* Kubernetes deployment
* Government API integration
* Predictive health risk models
* Asha worker payment module based on performance

---

## 📜 Version

Version: 1.0
Prepared under NitiKushal Initiative

---
