// ============================================================
// HMS Mock Data – mirrors /api/v1 REST API shape
// ============================================================

export const MOCK_USERS = [
  { id: "U-001", name: "Admin User", email: "admin@medicore.lk", role: "admin", passwordChangeRequired: false, isActive: true, createdAt: "2025-01-01T00:00:00Z", doctorId: null },
  { id: "U-002", name: "Priya Samaraweera", email: "receptionist@medicore.lk", role: "receptionist", passwordChangeRequired: false, isActive: true, createdAt: "2025-01-05T00:00:00Z", doctorId: null },
  { id: "U-003", name: "Dr. Nimal Perera", email: "doctor@medicore.lk", role: "doctor", passwordChangeRequired: false, isActive: true, createdAt: "2025-01-05T00:00:00Z", doctorId: "D-001" },
  { id: "U-004", name: "Kasun Fernando", email: "cashier@medicore.lk", role: "cashier", passwordChangeRequired: false, isActive: true, createdAt: "2025-01-05T00:00:00Z", doctorId: null },
  { id: "U-005", name: "New Staff Member", email: "newstaff@medicore.lk", role: "receptionist", passwordChangeRequired: true, isActive: true, createdAt: "2026-10-01T00:00:00Z", doctorId: null },
];

export const MOCK_DOCTORS = [
  { id: "D-001", name: "Dr. Nimal Perera", specialization: "General Medicine", email: "nimal.perera@medicore.lk", phone: "0771234567", consultationFee: 1500.00, isActive: true, leavedays: ["2026-10-14","2026-10-20","2026-10-21"], availability: { monday:{start:"08:00",end:"16:00"}, tuesday:{start:"08:00",end:"16:00"}, wednesday:{start:"08:00",end:"12:00"}, thursday:{start:"08:00",end:"16:00"}, friday:{start:"08:00",end:"16:00"} } },
  { id: "D-002", name: "Dr. Amara Silva", specialization: "Cardiology", email: "amara.silva@medicore.lk", phone: "0779876543", consultationFee: 2500.00, isActive: true, leavedays: ["2026-10-15"], availability: { monday:{start:"09:00",end:"17:00"}, wednesday:{start:"09:00",end:"17:00"}, friday:{start:"09:00",end:"13:00"} } },
  { id: "D-003", name: "Dr. Ravi Jayawardena", specialization: "Pediatrics", email: "ravi.j@medicore.lk", phone: "0761112233", consultationFee: 2000.00, isActive: true, leavedays: [], availability: { tuesday:{start:"08:00",end:"16:00"}, thursday:{start:"08:00",end:"16:00"}, saturday:{start:"08:00",end:"12:00"} } },
  { id: "D-004", name: "Dr. Sandya Wickramasinghe", specialization: "Dermatology", email: "sandya.w@medicore.lk", phone: "0754445566", consultationFee: 2200.00, isActive: false, leavedays: [], availability: {} },
];

export const MOCK_PATIENTS = [
  { id:"P-000001", firstName:"Kumari", lastName:"Bandara", fullName:"Kumari Bandara", dateOfBirth:"1985-06-15", gender:"female", nic:"855667890V", nicMasked:"855****90V", phone:"0712345678", email:"kumari.b@gmail.com", address:"12/A, Galle Road, Colombo 03", addressMasked:"12/A, Galle Road, ****", bloodGroup:"B+", guardianName:null, guardianPhone:null, isMinor:false, isActive:true, hasDuplicateWarning:false, registeredAt:"2025-03-10T09:30:00Z" },
  { id:"P-000002", firstName:"Saman", lastName:"Wickrama", fullName:"Saman Wickrama", dateOfBirth:"1978-11-22", gender:"male", nic:"781234567V", nicMasked:"781****67V", phone:"0723456789", email:null, address:"45, Temple Road, Kandy", addressMasked:"45, Temple Road, ****", bloodGroup:"O+", guardianName:null, guardianPhone:null, isMinor:false, isActive:true, hasDuplicateWarning:false, registeredAt:"2025-04-22T11:00:00Z" },
  { id:"P-000003", firstName:"Dilini", lastName:"Rathnayake", fullName:"Dilini Rathnayake", dateOfBirth:"2015-03-08", gender:"female", nic:null, nicMasked:null, phone:null, email:null, address:"78, Kurunegala Road, Chilaw", addressMasked:"78, Kurunegala Road, ****", bloodGroup:"A+", guardianName:"Sunil Rathnayake", guardianPhone:"0745556677", isMinor:true, isActive:true, hasDuplicateWarning:false, registeredAt:"2026-01-15T08:00:00Z" },
  { id:"P-000004", firstName:"Arun", lastName:"Kumar", fullName:"Arun Kumar", dateOfBirth:"1965-09-30", gender:"male", nic:"654321098V", nicMasked:"654****98V", phone:"0776667788", email:"arun.kumar@email.com", address:"23, Station Road, Jaffna", addressMasked:"23, Station Road, ****", bloodGroup:"AB-", guardianName:null, guardianPhone:null, isMinor:false, isActive:false, hasDuplicateWarning:false, registeredAt:"2025-08-01T10:00:00Z" },
  { id:"P-000005", firstName:"Nilanthi", lastName:"Fernando", fullName:"Nilanthi Fernando", dateOfBirth:"1992-02-14", gender:"female", nic:"929876543V", nicMasked:"929****43V", phone:"0788889900", email:"nilanthi.f@outlook.com", address:"9, Lake View, Battaramulla", addressMasked:"9, Lake View, ****", bloodGroup:"O-", guardianName:null, guardianPhone:null, isMinor:false, isActive:true, hasDuplicateWarning:false, registeredAt:"2026-09-05T14:00:00Z" },
];

const TODAY = "2026-10-12";
export const MOCK_APPOINTMENTS = [
  { id:"A-00001", patientId:"P-000001", patientName:"Kumari Bandara", doctorId:"D-001", doctorName:"Dr. Nimal Perera", date:TODAY, slotStart:"09:00", slotEnd:"09:15", status:"scheduled", isWalkIn:false, cancelReason:null, noShow:false, createdAt:"2026-10-10T08:00:00Z" },
  { id:"A-00002", patientId:"P-000002", patientName:"Saman Wickrama", doctorId:"D-001", doctorName:"Dr. Nimal Perera", date:TODAY, slotStart:"09:15", slotEnd:"09:30", status:"checked_in", isWalkIn:true, cancelReason:null, noShow:false, createdAt:"2026-10-12T09:10:00Z" },
  { id:"A-00003", patientId:"P-000003", patientName:"Dilini Rathnayake", doctorId:"D-003", doctorName:"Dr. Ravi Jayawardena", date:TODAY, slotStart:"10:00", slotEnd:"10:15", status:"completed", isWalkIn:false, cancelReason:null, noShow:false, createdAt:"2026-10-01T15:00:00Z" },
  { id:"A-00004", patientId:"P-000005", patientName:"Nilanthi Fernando", doctorId:"D-002", doctorName:"Dr. Amara Silva", date:"2026-10-13", slotStart:"09:00", slotEnd:"09:15", status:"scheduled", isWalkIn:false, cancelReason:null, noShow:false, createdAt:"2026-10-08T10:00:00Z" },
  { id:"A-00005", patientId:"P-000001", patientName:"Kumari Bandara", doctorId:"D-002", doctorName:"Dr. Amara Silva", date:"2026-09-30", slotStart:"11:00", slotEnd:"11:15", status:"completed", isWalkIn:false, cancelReason:null, noShow:false, createdAt:"2026-09-20T09:00:00Z" },
  { id:"A-00006", patientId:"P-000002", patientName:"Saman Wickrama", doctorId:"D-001", doctorName:"Dr. Nimal Perera", date:"2026-09-28", slotStart:"14:00", slotEnd:"14:15", status:"cancelled", isWalkIn:false, cancelReason:"Patient called to reschedule due to travel", noShow:false, createdAt:"2026-09-15T11:00:00Z" },
];

export const MOCK_BILLS = [
  { id:"B-000001", invoiceNumber:"INV-2026-000001", appointmentId:"A-00003", patientId:"P-000003", patientName:"Dilini Rathnayake", doctorId:"D-003", doctorName:"Dr. Ravi Jayawardena", items:[{description:"Consultation Fee",amount:2000.00}], subtotal:2000.00, discountAmount:0, discountReason:null, totalAmount:2000.00, paidAmount:2000.00, balanceAmount:0, status:"paid", payments:[{id:"PAY-001",amount:2000.00,method:"cash",paidAt:"2026-10-12T10:30:00Z"}], isVoided:false, voidReason:null, createdAt:"2026-10-12T10:00:00Z", lockedAt:"2026-10-12T10:31:00Z" },
  { id:"B-000002", invoiceNumber:"INV-2026-000002", appointmentId:"A-00002", patientId:"P-000002", patientName:"Saman Wickrama", doctorId:"D-001", doctorName:"Dr. Nimal Perera", items:[{description:"Consultation Fee",amount:1500.00}], subtotal:1500.00, discountAmount:0, discountReason:null, totalAmount:1500.00, paidAmount:0, balanceAmount:1500.00, status:"pending", payments:[], isVoided:false, voidReason:null, createdAt:"2026-10-12T09:15:00Z", lockedAt:null },
  { id:"B-000003", invoiceNumber:"INV-2026-000003", appointmentId:"A-00005", patientId:"P-000001", patientName:"Kumari Bandara", doctorId:"D-002", doctorName:"Dr. Amara Silva", items:[{description:"Consultation Fee",amount:2500.00}], subtotal:2500.00, discountAmount:250.00, discountReason:"Regular patient loyalty discount", totalAmount:2250.00, paidAmount:1000.00, balanceAmount:1250.00, status:"partial", payments:[{id:"PAY-002",amount:1000.00,method:"card",paidAt:"2026-09-30T11:30:00Z"}], isVoided:false, voidReason:null, createdAt:"2026-09-30T11:00:00Z", lockedAt:null },
];

export const MOCK_AUDIT_LOGS = [
  { id:"AL-001", userId:"U-002", userName:"Priya Samaraweera", userRole:"receptionist", action:"PATIENT_REGISTERED", entity:"Patient", entityId:"P-000005", description:"Registered new patient Nilanthi Fernando", ipAddress:"192.168.1.10", timestamp:"2026-09-05T14:00:00Z" },
  { id:"AL-002", userId:"U-002", userName:"Priya Samaraweera", userRole:"receptionist", action:"APPOINTMENT_BOOKED", entity:"Appointment", entityId:"A-00004", description:"Booked appointment A-00004 for Nilanthi Fernando", ipAddress:"192.168.1.10", timestamp:"2026-10-08T10:00:00Z" },
  { id:"AL-003", userId:"U-002", userName:"Priya Samaraweera", userRole:"receptionist", action:"APPOINTMENT_CHECKED_IN", entity:"Appointment", entityId:"A-00002", description:"Checked in Saman Wickrama for appointment A-00002", ipAddress:"192.168.1.10", timestamp:"2026-10-12T09:12:00Z" },
  { id:"AL-004", userId:"U-004", userName:"Kasun Fernando", userRole:"cashier", action:"PAYMENT_RECORDED", entity:"Bill", entityId:"B-000001", description:"Full payment LKR 2,000.00 received for INV-2026-000001", ipAddress:"192.168.1.15", timestamp:"2026-10-12T10:30:00Z" },
  { id:"AL-005", userId:"U-001", userName:"Admin User", userRole:"admin", action:"DISCOUNT_APPLIED", entity:"Bill", entityId:"B-000003", description:"Discount LKR 250.00 applied to INV-2026-000003", ipAddress:"192.168.1.5", timestamp:"2026-09-30T11:05:00Z" },
  { id:"AL-006", userId:"U-003", userName:"Dr. Nimal Perera", userRole:"doctor", action:"APPOINTMENT_COMPLETED", entity:"Appointment", entityId:"A-00003", description:"Marked appointment A-00003 as completed", ipAddress:"192.168.1.12", timestamp:"2026-10-12T10:00:00Z" },
];

export const SLOT_DURATION_MINUTES = 15;
