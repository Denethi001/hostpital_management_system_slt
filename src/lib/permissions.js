// Role-based permissions matrix
export const ROLES = { ADMIN:"admin", RECEPTIONIST:"receptionist", DOCTOR:"doctor", CASHIER:"cashier" };

export const PERMISSIONS = {
  // Navigation
  "nav.home": ["admin","receptionist","doctor","cashier"],
  "nav.patients": ["admin","receptionist","doctor","cashier"],
  "nav.appointments": ["admin","receptionist","doctor"],
  "nav.doctors": ["admin","receptionist"],
  "nav.billing": ["admin","cashier"],
  "nav.users": ["admin"],
  "nav.audit": ["admin"],

  // Patients
  "patients.register": ["admin","receptionist"],
  "patients.edit": ["admin","receptionist"],
  "patients.deactivate": ["admin"],
  "patients.view_nic": ["admin","receptionist","doctor"],
  "patients.view_address": ["admin","receptionist"],

  // Appointments
  "appointments.book": ["admin","receptionist"],
  "appointments.checkin": ["admin","receptionist"],
  "appointments.complete": ["admin","doctor"],
  "appointments.cancel": ["admin","receptionist","doctor"],
  "appointments.noshow": ["admin","receptionist"],
  "appointments.view_all": ["admin","receptionist"],
  "appointments.view_own": ["doctor"],

  // Billing
  "billing.view": ["admin","cashier"],
  "billing.payment": ["admin","cashier"],
  "billing.discount": ["admin"],
  "billing.void": ["admin"],
  "billing.refund": ["admin"],

  // Users
  "users.manage": ["admin"],
  "audit.view": ["admin"],
};

export const can = (user, permission) => {
  if (!user) return false;
  const allowed = PERMISSIONS[permission] || [];
  return allowed.includes(user.role);
};
