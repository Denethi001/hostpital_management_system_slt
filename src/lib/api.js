// ============================================================
// Mock API – mirrors /api/v1 REST endpoints
// All functions return { data, error } shaped promises
// Simulate ~300ms network delay
// ============================================================
import {
  MOCK_USERS, MOCK_DOCTORS, MOCK_PATIENTS,
  MOCK_APPOINTMENTS, MOCK_BILLS, MOCK_AUDIT_LOGS,
  SLOT_DURATION_MINUTES
} from "./mockData";

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
const ok = (data) => ({ data, error: null });
const err = (code, message, fields = {}) => ({
  data: null,
  error: { code, message, fields }
});

// ----------- In-memory state -----------
let users = [...MOCK_USERS];
let doctors = [...MOCK_DOCTORS];
let patients = [...MOCK_PATIENTS];
let appointments = [...MOCK_APPOINTMENTS];
let bills = [...MOCK_BILLS];
let auditLogs = [...MOCK_AUDIT_LOGS];
let nextPatientNum = 6;
let nextApptNum = 7;
let nextBillNum = 4;

const addAudit = (userId, userName, userRole, action, entity, entityId, description) => {
  auditLogs = [{ id:`AL-${Date.now()}`, userId, userName, userRole, action, entity, entityId, description, ipAddress:"127.0.0.1", timestamp: new Date().toISOString() }, ...auditLogs];
};

// ============================================================
// AUTH
// ============================================================
export const auth = {
  login: async ({ email, password }) => {
    await delay();
    const user = users.find(u => u.email === email);
    if (!user) return err("AUTH_INVALID", "Invalid email or password.");
    if (password === "wrong") return err("AUTH_LOCKED", "Your account has been locked after 5 failed attempts. Please contact Admin.");
    if (!user.isActive) return err("AUTH_INACTIVE", "This account has been deactivated.");
    return ok({ user, token: `mock-token-${user.id}` });
  },
  changePassword: async (userId, { newPassword }) => {
    await delay();
    users = users.map(u => u.id === userId ? { ...u, passwordChangeRequired: false } : u);
    return ok({ message: "Password updated successfully." });
  },
};

// ============================================================
// PATIENTS
// ============================================================
export const patientsApi = {
  list: async ({ search = "", page = 1, limit = 20 } = {}) => {
    await delay();
    let result = patients;
    if (search) result = result.filter(p =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search))
    );
    const total = result.length;
    const items = result.slice((page-1)*limit, page*limit);
    return ok({ items, total, page, limit });
  },
  get: async (id) => {
    await delay();
    const p = patients.find(p => p.id === id);
    if (!p) return err("NOT_FOUND", "Patient not found.");
    return ok(p);
  },
  create: async (data) => {
    await delay();
    // NIC dupe check
    if (data.nic && patients.some(p => p.nic === data.nic && p.isActive)) {
      return err("DUPLICATE_NIC", "A patient with this NIC already exists.", { nic: "NIC already registered." });
    }
    const numStr = String(nextPatientNum).padStart(6, "0");
    const dob = new Date(data.dateOfBirth);
    const age = new Date().getFullYear() - dob.getFullYear();
    const isMinor = age < 18;
    if (isMinor && !data.guardianPhone) {
      return err("VALIDATION", "Guardian phone is required for patients under 18.", { guardianPhone: "Required for minors." });
    }
    const patient = {
      id: `P-${numStr}`,
      fullName: `${data.firstName} ${data.lastName}`,
      nicMasked: data.nic ? `${data.nic.slice(0,3)}****${data.nic.slice(-3)}` : null,
      addressMasked: data.address ? `${data.address.split(",").slice(0,-1).join(",")}, ****` : null,
      isMinor,
      isActive: true,
      hasDuplicateWarning: false,
      registeredAt: new Date().toISOString(),
      ...data,
    };
    patients = [...patients, patient];
    nextPatientNum++;
    return ok(patient);
  },
  update: async (id, data) => {
    await delay();
    const idx = patients.findIndex(p => p.id === id);
    if (idx < 0) return err("NOT_FOUND", "Patient not found.");
    patients[idx] = { ...patients[idx], ...data, fullName: `${data.firstName || patients[idx].firstName} ${data.lastName || patients[idx].lastName}` };
    return ok(patients[idx]);
  },
  deactivate: async (id) => {
    await delay();
    const idx = patients.findIndex(p => p.id === id);
    if (idx < 0) return err("NOT_FOUND", "Patient not found.");
    patients[idx] = { ...patients[idx], isActive: false };
    return ok(patients[idx]);
  },
  appointments: async (patientId) => {
    await delay();
    const result = appointments.filter(a => a.patientId === patientId);
    return ok(result);
  },
  bills: async (patientId) => {
    await delay();
    const result = bills.filter(b => b.patientId === patientId);
    return ok(result);
  },
};

// ============================================================
// DOCTORS
// ============================================================
export const doctorsApi = {
  list: async ({ search = "", activeOnly = false } = {}) => {
    await delay();
    let result = doctors;
    if (activeOnly) result = result.filter(d => d.isActive);
    if (search) result = result.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()));
    return ok(result);
  },
  get: async (id) => {
    await delay();
    const d = doctors.find(d => d.id === id);
    if (!d) return err("NOT_FOUND", "Doctor not found.");
    return ok(d);
  },
  create: async (data) => {
    await delay();
    const newDoc = { id:`D-${String(doctors.length+1).padStart(3,"0")}`, isActive:true, leavedays:[], availability:{}, ...data };
    doctors = [...doctors, newDoc];
    return ok(newDoc);
  },
  update: async (id, data) => {
    await delay();
    const idx = doctors.findIndex(d => d.id === id);
    if (idx < 0) return err("NOT_FOUND", "Doctor not found.");
    doctors[idx] = { ...doctors[idx], ...data };
    return ok(doctors[idx]);
  },
  slots: async (doctorId, date) => {
    await delay();
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc) return err("NOT_FOUND", "Doctor not found.");
    const dayName = new Date(date).toLocaleDateString("en-US",{weekday:"long"}).toLowerCase();
    const avail = doc.availability[dayName];
    if (!avail || doc.leavedays.includes(date)) return ok({ slots: [], isLeaveDay: doc.leavedays.includes(date) });
    const slots = [];
    const [sh,sm] = avail.start.split(":").map(Number);
    const [eh,em] = avail.end.split(":").map(Number);
    let cur = sh*60+sm;
    const end = eh*60+em;
    while (cur + SLOT_DURATION_MINUTES <= end) {
      const hh = String(Math.floor(cur/60)).padStart(2,"0");
      const mm = String(cur%60).padStart(2,"0");
      const start = `${hh}:${mm}`;
      const endMin = cur + SLOT_DURATION_MINUTES;
      const eh2 = String(Math.floor(endMin/60)).padStart(2,"0");
      const em2 = String(endMin%60).padStart(2,"0");
      const slotEnd = `${eh2}:${em2}`;
      const booked = appointments.some(a => a.doctorId===doctorId && a.date===date && a.slotStart===start && a.status!=="cancelled");
      slots.push({ start, end: slotEnd, booked });
      cur += SLOT_DURATION_MINUTES;
    }
    return ok({ slots, isLeaveDay: false });
  },
};

// ============================================================
// APPOINTMENTS
// ============================================================
export const appointmentsApi = {
  list: async ({ date, doctorId, patientId, status, page=1, limit=50 } = {}) => {
    await delay();
    let result = appointments;
    if (date) result = result.filter(a => a.date === date);
    if (doctorId) result = result.filter(a => a.doctorId === doctorId);
    if (patientId) result = result.filter(a => a.patientId === patientId);
    if (status) result = result.filter(a => a.status === status);
    const total = result.length;
    const items = result.slice((page-1)*limit, page*limit);
    return ok({ items, total, page, limit });
  },
  get: async (id) => {
    await delay();
    const a = appointments.find(a => a.id === id);
    if (!a) return err("NOT_FOUND", "Appointment not found.");
    return ok(a);
  },
  create: async (data, currentUser) => {
    await delay();
    // slot conflict
    const conflict = appointments.some(a => a.doctorId===data.doctorId && a.date===data.date && a.slotStart===data.slotStart && a.status!=="cancelled");
    if (conflict) return err("SLOT_CONFLICT", "This slot is already booked. Please choose another time.", { slotStart:"Slot unavailable." });
    // past date check
    if (new Date(`${data.date}T${data.slotStart}`) < new Date()) return err("PAST_SLOT","Cannot book a slot in the past.");
    const numStr = String(nextApptNum).padStart(5,"0");
    const patient = patients.find(p => p.id === data.patientId);
    const doctor = doctors.find(d => d.id === data.doctorId);
    const [sh,sm] = data.slotStart.split(":").map(Number);
    const endMin = sh*60+sm+SLOT_DURATION_MINUTES;
    const slotEnd = `${String(Math.floor(endMin/60)).padStart(2,"0")}:${String(endMin%60).padStart(2,"0")}`;
    const appt = { id:`A-${numStr}`, patientName:patient?.fullName, doctorName:doctor?.name, slotEnd, status:"scheduled", cancelReason:null, noShow:false, createdAt:new Date().toISOString(), ...data };
    appointments = [...appointments, appt];
    nextApptNum++;
    if(currentUser) addAudit(currentUser.id, currentUser.name, currentUser.role, "APPOINTMENT_BOOKED","Appointment",appt.id,`Booked appointment ${appt.id}`);
    return ok(appt);
  },
  checkIn: async (id, currentUser) => {
    await delay();
    const idx = appointments.findIndex(a => a.id === id);
    if (idx<0) return err("NOT_FOUND","Appointment not found.");
    if (appointments[idx].status !== "scheduled") return err("INVALID_STATUS","Only scheduled appointments can be checked in.");
    appointments[idx] = { ...appointments[idx], status:"checked_in" };
    // create bill at check-in
    const appt = appointments[idx];
    const doc = doctors.find(d => d.id === appt.doctorId);
    const numStr = String(nextBillNum).padStart(6,"0");
    const bill = { id:`B-${numStr}`, invoiceNumber:`INV-${new Date().getFullYear()}-${numStr}`, appointmentId:id, patientId:appt.patientId, patientName:appt.patientName, doctorId:appt.doctorId, doctorName:appt.doctorName, items:[{description:"Consultation Fee",amount:doc?.consultationFee||1500}], subtotal:doc?.consultationFee||1500, discountAmount:0, discountReason:null, totalAmount:doc?.consultationFee||1500, paidAmount:0, balanceAmount:doc?.consultationFee||1500, status:"pending", payments:[], isVoided:false, voidReason:null, createdAt:new Date().toISOString(), lockedAt:null };
    bills = [...bills, bill];
    nextBillNum++;
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"APPOINTMENT_CHECKED_IN","Appointment",id,`Checked in patient for ${id}`);
    return ok({ appointment:appointments[idx], bill });
  },
  complete: async (id, currentUser) => {
    await delay();
    const idx = appointments.findIndex(a => a.id === id);
    if (idx<0) return err("NOT_FOUND","Appointment not found.");
    if (appointments[idx].status !== "checked_in") return err("INVALID_STATUS","Only checked-in appointments can be completed.");
    appointments[idx] = { ...appointments[idx], status:"completed" };
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"APPOINTMENT_COMPLETED","Appointment",id,`Completed appointment ${id}`);
    return ok(appointments[idx]);
  },
  cancel: async (id, reason, currentUser) => {
    await delay();
    if (!reason || reason.trim().length < 5) return err("VALIDATION","A reason is required to cancel an appointment (min 5 characters).", { reason:"Required." });
    const idx = appointments.findIndex(a => a.id === id);
    if (idx<0) return err("NOT_FOUND","Appointment not found.");
    if (!["scheduled","checked_in"].includes(appointments[idx].status)) return err("INVALID_STATUS","This appointment cannot be cancelled.");
    appointments[idx] = { ...appointments[idx], status:"cancelled", cancelReason:reason };
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"APPOINTMENT_CANCELLED","Appointment",id,`Cancelled appointment ${id}: ${reason}`);
    return ok(appointments[idx]);
  },
  noShow: async (id, currentUser) => {
    await delay();
    const idx = appointments.findIndex(a => a.id === id);
    if (idx<0) return err("NOT_FOUND","Appointment not found.");
    const slotTime = new Date(`${appointments[idx].date}T${appointments[idx].slotStart}`);
    if (new Date() < slotTime) return err("TOO_EARLY","Cannot mark no-show before the appointment time.");
    appointments[idx] = { ...appointments[idx], noShow:true, status:"cancelled", cancelReason:"No-show" };
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"APPOINTMENT_NO_SHOW","Appointment",id,`Marked no-show for ${id}`);
    return ok(appointments[idx]);
  },
};

// ============================================================
// BILLING
// ============================================================
export const billingApi = {
  list: async ({ patientId, status, page=1, limit=50 } = {}) => {
    await delay();
    let result = bills;
    if (patientId) result = result.filter(b => b.patientId===patientId);
    if (status) result = result.filter(b => b.status===status);
    return ok({ items:result.slice((page-1)*limit,page*limit), total:result.length, page, limit });
  },
  get: async (id) => {
    await delay();
    const b = bills.find(b => b.id===id);
    if (!b) return err("NOT_FOUND","Bill not found.");
    return ok(b);
  },
  addPayment: async (billId, { amount, method }, currentUser) => {
    await delay();
    const idx = bills.findIndex(b => b.id===billId);
    if (idx<0) return err("NOT_FOUND","Bill not found.");
    if (bills[idx].lockedAt) return err("BILL_LOCKED","This bill is locked and cannot accept payments.");
    if (bills[idx].isVoided) return err("BILL_VOIDED","This bill has been voided.");
    const newPaid = bills[idx].paidAmount + Number(amount);
    if (newPaid > bills[idx].totalAmount) return err("OVERPAYMENT","Payment exceeds balance due.");
    const newStatus = newPaid >= bills[idx].totalAmount ? "paid" : "partial";
    const payment = { id:`PAY-${Date.now()}`, amount:Number(amount), method, paidAt:new Date().toISOString() };
    bills[idx] = { ...bills[idx], paidAmount:newPaid, balanceAmount:bills[idx].totalAmount-newPaid, status:newStatus, payments:[...bills[idx].payments, payment], lockedAt: newStatus==="paid" ? new Date().toISOString() : null };
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"PAYMENT_RECORDED","Bill",billId,`Payment LKR ${amount} for ${bills[idx].invoiceNumber}`);
    return ok(bills[idx]);
  },
  applyDiscount: async (billId, { discountAmount, discountReason }, currentUser) => {
    await delay();
    const idx = bills.findIndex(b => b.id===billId);
    if (idx<0) return err("NOT_FOUND","Bill not found.");
    if (bills[idx].lockedAt) return err("BILL_LOCKED","Bill is locked.");
    if (!discountReason) return err("VALIDATION","A reason is required for discount.",{discountReason:"Required."});
    const newTotal = bills[idx].subtotal - Number(discountAmount);
    bills[idx] = { ...bills[idx], discountAmount:Number(discountAmount), discountReason, totalAmount:newTotal, balanceAmount:newTotal-bills[idx].paidAmount };
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"DISCOUNT_APPLIED","Bill",billId,`Discount LKR ${discountAmount}: ${discountReason}`);
    return ok(bills[idx]);
  },
  void: async (billId, reason, currentUser) => {
    await delay();
    const idx = bills.findIndex(b => b.id===billId);
    if (idx<0) return err("NOT_FOUND","Bill not found.");
    if (!reason) return err("VALIDATION","A reason is required to void a bill.",{reason:"Required."});
    bills[idx] = { ...bills[idx], isVoided:true, voidReason:reason, status:"voided" };
    if(currentUser) addAudit(currentUser.id,currentUser.name,currentUser.role,"BILL_VOIDED","Bill",billId,`Bill voided: ${reason}`);
    return ok(bills[idx]);
  },
};

// ============================================================
// USERS (Admin only)
// ============================================================
export const usersApi = {
  list: async () => { await delay(); return ok(users); },
  get: async (id) => { await delay(); const u=users.find(u=>u.id===id); return u ? ok(u) : err("NOT_FOUND","User not found."); },
  create: async (data) => {
    await delay();
    if (users.some(u=>u.email===data.email)) return err("DUPLICATE_EMAIL","Email already in use.",{email:"Already registered."});
    const user = { id:`U-${String(users.length+1).padStart(3,"0")}`, passwordChangeRequired:true, isActive:true, createdAt:new Date().toISOString(), doctorId:null, ...data };
    users = [...users, user];
    return ok(user);
  },
  update: async (id, data) => {
    await delay();
    const idx = users.findIndex(u=>u.id===id);
    if (idx<0) return err("NOT_FOUND","User not found.");
    users[idx] = { ...users[idx], ...data };
    return ok(users[idx]);
  },
  deactivate: async (id) => {
    await delay();
    const idx = users.findIndex(u=>u.id===id);
    if (idx<0) return err("NOT_FOUND","User not found.");
    users[idx] = { ...users[idx], isActive:false };
    return ok(users[idx]);
  },
};

// ============================================================
// AUDIT LOG (Admin only)
// ============================================================
export const auditApi = {
  list: async ({ page=1, limit=50, userId, action, dateFrom, dateTo } = {}) => {
    await delay();
    let result = auditLogs;
    if (userId) result = result.filter(l=>l.userId===userId);
    if (action) result = result.filter(l=>l.action===action);
    if (dateFrom) result = result.filter(l=>l.timestamp>=dateFrom);
    if (dateTo) result = result.filter(l=>l.timestamp<=dateTo);
    return ok({ items:result.slice((page-1)*limit,page*limit), total:result.length, page, limit });
  },
};

// ============================================================
// STATS (Admin dashboard)
// ============================================================
export const statsApi = {
  summary: async () => {
    await delay(200);
    const today = "2026-10-12";
    const todayAppts = appointments.filter(a=>a.date===today);
    const todayRevenue = bills.filter(b=>b.payments.some(p=>p.paidAt.startsWith(today))).reduce((s,b)=>s+b.payments.filter(p=>p.paidAt.startsWith(today)).reduce((a,p)=>a+p.amount,0),0);
    return ok({ totalPatients:patients.filter(p=>p.isActive).length, todayAppointments:todayAppts.length, todayRevenue, pendingBills:bills.filter(b=>b.status==="pending"||b.status==="partial").length });
  },
};
