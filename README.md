# MediCore HMS – Frontend

React + Vite + React Router frontend for the Hospital Management System MVP.

## Quick Start

```bash
cd client
npm install
npm run dev
```

Then open http://localhost:5173

## Demo Logins

| Role         | Email                         | Password    |
|-------------|-------------------------------|-------------|
| Admin        | admin@medicore.lk             | admin123    |
| Receptionist | receptionist@medicore.lk      | recept123   |
| Doctor       | doctor@medicore.lk            | doc123      |
| Cashier      | cashier@medicore.lk           | cash123     |

Use the **quick demo login buttons** on the login screen — no need to type.

## Project Layout (section 7)

```
client/
  src/
    lib/
      api.js          – Mock API (swap for real Axios client)
      mockData.js     – Seed data
      permissions.js  – Role permission matrix
    contexts/
      AuthContext.jsx – Auth state + 15-min idle logout
    components/
      layout/AppLayout.jsx    – Sidebar + topbar shell
      ui/index.jsx            – Shared primitives
      ui/IdleWarning.jsx      – Idle session banner
    pages/
      auth/       – Login, ForcePasswordChange, Forbidden, NotFound
      home/       – Role-specific dashboards (Admin/Receptionist/Doctor/Cashier)
      patients/   – PatientsPage, PatientProfile, RegisterPatient
      appointments/ – AppointmentsPage, AppointmentDetail, BookAppointmentModal
      doctors/    – DoctorsPage
      billing/    – BillingPage, BillDetail (invoice + payment + discount + void)
      users/      – UsersPage (Admin only)
      audit/      – AuditPage (Admin only)
```

## Replacing the Mock API

Every page imports from `src/lib/api.js`. All functions return `{ data, error }`.
Replace each function body with a real `fetch`/`axios` call to `/api/v1/...`
and keep the same return shape — nothing else needs to change.

## Theme: Clinical Calm

See [design_notes.md] for full token reference.
- Accent: `#0ea5b0` (teal)
- Font: Inter (Google Fonts)
- Radius: 12px standard
- Status: green = completed/paid, amber = scheduled/pending, red = cancelled/error
