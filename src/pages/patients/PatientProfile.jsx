import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { patientsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../lib/permissions";
import { LoadingState, StatusBadge, Alert, ConfirmDialog, formatDate, formatDateTime, formatLKR } from "../../components/ui/index";
import { Edit, Calendar, Receipt, UserX, ChevronRight } from "lucide-react";
import BookAppointmentModal from "../appointments/BookAppointmentModal";

export default function PatientProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    Promise.all([
      patientsApi.get(id),
      patientsApi.appointments(id),
      patientsApi.bills(id)
    ]).then(([p, a, b]) => {
      setPatient(p.data);
      setAppointments(a.data || []);
      setBills(b.data || []);
      setLoading(false);
    });
  }, [id]);

  const handleDeactivate = async () => {
    setDeactivating(true);
    await patientsApi.deactivate(id);
    setPatient(prev => ({ ...prev, isActive: false }));
    setDeactivateOpen(false);
    setDeactivating(false);
    setSuccessMsg("Patient deactivated successfully.");
  };

  const handleBooked = (appt) => {
    setAppointments(prev => [...prev, appt]);
    setBookOpen(false);
    setSuccessMsg("Appointment booked successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  if (loading) return <LoadingState />;
  if (!patient) return <div className="alert alert-error">Patient not found.</div>;

  const showNIC = can(user, "patients.view_nic");
  const showAddr = can(user, "patients.view_address");

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"var(--sp-6)", gap:"var(--sp-4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"var(--sp-4)" }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"linear-gradient(135deg,var(--teal-200),var(--teal-500))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"white", fontWeight:700 }}>
            {patient.fullName[0]}
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"var(--sp-3)", flexWrap:"wrap" }}>
              <h1 style={{ fontSize:"var(--text-2xl)", fontWeight:800 }}>{patient.fullName}</h1>
              <span className="patient-id-badge">{patient.id}</span>
              <StatusBadge status={patient.isActive ? "active" : "inactive"} />
              {patient.isMinor && <span className="badge badge-blue">Minor</span>}
              {patient.hasDuplicateWarning && <span className="badge badge-amber">⚠ Possible Duplicate</span>}
            </div>
            <div style={{ color:"var(--text-muted)", fontSize:"var(--text-sm)", marginTop:4 }}>
              {patient.gender} • Born {formatDate(patient.dateOfBirth)} • {patient.bloodGroup || "Blood group unknown"}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"var(--sp-2)", flexWrap:"wrap" }}>
          {can(user, "appointments.book") && patient.isActive && (
            <button className="btn btn-primary" onClick={() => setBookOpen(true)}><Calendar size={16} /> Book Appointment</button>
          )}
          {can(user, "patients.edit") && (
            <button className="btn btn-secondary" onClick={() => navigate(`/patients/${id}/edit`)}><Edit size={16} /> Edit</button>
          )}
          {can(user, "patients.deactivate") && patient.isActive && (
            <button className="btn btn-danger" onClick={() => setDeactivateOpen(true)}><UserX size={16} /> Deactivate</button>
          )}
        </div>
      </div>

      {successMsg && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="success">{successMsg}</Alert></div>}

      {/* Tabs */}
      <div className="tabs">
        {["overview","appointments","billing"].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==="appointments" && <span className="badge badge-grey" style={{marginLeft:6}}>{appointments.length}</span>}
            {t==="billing" && <span className="badge badge-grey" style={{marginLeft:6}}>{bills.length}</span>}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab==="overview" && (
        <div className="grid-2">
          <div className="card">
            <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Contact Information</div>
            <dl style={{ display:"grid", gap:"var(--sp-3)" }}>
              <Row label="Phone" value={patient.phone || "Not provided"} />
              <Row label="Email" value={patient.email || "Not provided"} />
              <Row label="Address" value={showAddr ? patient.address : (patient.addressMasked || "—")} note={!showAddr?"(masked)":null} />
              <Row label="NIC" value={showNIC ? (patient.nic || "—") : (patient.nicMasked || "Not provided")} note={!showNIC?"(masked)":null} mono />
            </dl>
          </div>
          <div className="card">
            <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Medical Details</div>
            <dl style={{ display:"grid", gap:"var(--sp-3)" }}>
              <Row label="Blood Group" value={patient.bloodGroup || "Unknown"} />
              <Row label="Registered" value={formatDateTime(patient.registeredAt)} />
              {patient.isMinor && <>
                <Row label="Guardian Name" value={patient.guardianName || "—"} />
                <Row label="Guardian Phone" value={patient.guardianPhone || "—"} />
              </>}
            </dl>
          </div>
        </div>
      )}

      {/* Appointments tab */}
      {tab==="appointments" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Appointment History</div>
            {can(user,"appointments.book") && patient.isActive && (
              <button className="btn btn-primary btn-sm" onClick={()=>setBookOpen(true)}><Calendar size={14}/> Book New</button>
            )}
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>ID</th><th>Date</th><th>Time</th><th>Doctor</th><th>Status</th><th>Type</th><th></th></tr></thead>
              <tbody>
                {appointments.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"var(--text-muted)"}}>No appointments yet</td></tr>}
                {[...appointments].sort((a,b)=>b.date.localeCompare(a.date)).map(a=>(
                  <tr key={a.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/appointments/${a.id}`)}>
                    <td className="td-link">{a.id}</td>
                    <td>{formatDate(a.date)}</td>
                    <td>{a.slotStart}</td>
                    <td>{a.doctorName}</td>
                    <td><StatusBadge status={a.status}/></td>
                    <td>{a.isWalkIn?<span className="badge badge-amber">Walk-In</span>:"Booked"}</td>
                    <td><ChevronRight size={14} style={{color:"var(--text-muted)"}}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing tab */}
      {tab==="billing" && (
        <div className="card">
          <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Billing History</div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Invoice</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bills.length===0 && <tr><td colSpan={7} style={{textAlign:"center",color:"var(--text-muted)"}}>No bills yet</td></tr>}
                {[...bills].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(b=>(
                  <tr key={b.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/billing/${b.id}`)}>
                    <td className="td-link">{b.invoiceNumber}</td>
                    <td>{formatDate(b.createdAt)}</td>
                    <td>{formatLKR(b.totalAmount)}</td>
                    <td>{formatLKR(b.paidAmount)}</td>
                    <td style={{color:b.balanceAmount>0?"var(--red-600)":"var(--green-600)",fontWeight:600}}>{formatLKR(b.balanceAmount)}</td>
                    <td><StatusBadge status={b.status}/></td>
                    <td><ChevronRight size={14} style={{color:"var(--text-muted)"}}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {bookOpen && (
        <BookAppointmentModal
          patientId={patient.id}
          patientName={patient.fullName}
          onClose={() => setBookOpen(false)}
          onBooked={handleBooked}
        />
      )}

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Patient"
        message={`Are you sure you want to deactivate ${patient.fullName}? Their record will be preserved but they will no longer appear in active lists. This action can be reversed by an administrator.`}
        confirmLabel="Deactivate Patient"
        danger
        loading={deactivating}
      />
    </div>
  );
}

function Row({ label, value, note, mono }) {
  return (
    <div style={{ display:"flex", gap:"var(--sp-4)", alignItems:"flex-start" }}>
      <dt style={{ fontSize:"var(--text-xs)", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", minWidth:120 }}>{label}</dt>
      <dd style={{ fontSize:"var(--text-sm)", color:"var(--text-primary)", fontFamily: mono ? "monospace" : "inherit" }}>
        {value}{note && <span style={{color:"var(--text-muted)",marginLeft:4,fontSize:"var(--text-xs)"}}>{note}</span>}
      </dd>
    </div>
  );
}
