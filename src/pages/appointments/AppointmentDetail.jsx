import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { appointmentsApi, billingApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../lib/permissions";
import { LoadingState, StatusBadge, Alert, ConfirmDialog, formatDate, formatDateTime } from "../../components/ui/index";
import { ChevronLeft, Check, X } from "lucide-react";

const STEPS = [
  { key:"scheduled", label:"Scheduled", icon:"📅" },
  { key:"checked_in", label:"Checked In", icon:"✅" },
  { key:"completed", label:"Completed", icon:"🏁" },
];

function AppointmentStepper({ status }) {
  const cancelledOrNoShow = status==="cancelled";
  const stepIdx = STEPS.findIndex(s=>s.key===status);
  return (
    <div style={{padding:"var(--sp-6)",background:"var(--surface-1)",borderRadius:"var(--radius)",marginBottom:"var(--sp-5)"}}>
      {cancelledOrNoShow ? (
        <div className="alert alert-error"><X size={18}/><span>This appointment has been cancelled.</span></div>
      ) : (
        <div style={{display:"flex",alignItems:"center"}}>
          {STEPS.map((s,i)=>{
            const done = stepIdx > i;
            const cur = stepIdx === i;
            return (
              <div key={s.key} style={{display:"flex",alignItems:"center",flex: i<STEPS.length-1 ? 1 : "none"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"var(--sp-2)"}}>
                  <div className={`stepper-dot ${done?"done":cur?"current":""}`} style={{width:40,height:40,fontSize:16}}>
                    {done ? <Check size={18}/> : s.icon}
                  </div>
                  <span className={`stepper-label ${done?"done":cur?"current":""}`} style={{fontSize:"var(--text-xs)",fontWeight:600}}>{s.label}</span>
                </div>
                {i<STEPS.length-1 && <div className={`stepper-step-connector ${done?"done":""}`} style={{flex:1,height:2,margin:"0 var(--sp-4)",marginTop:-20}} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AppointmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appt, setAppt] = useState(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [noShowOpen, setNoShowOpen] = useState(false);

  useEffect(() => {
    appointmentsApi.get(id).then(r => {
      setAppt(r.data);
      if (r.data?.status==="checked_in" || r.data?.status==="completed") {
        billingApi.list({ patientId: r.data?.patientId }).then(br => {
          const b = br.data?.items?.find(b=>b.appointmentId===id);
          setBill(b || null);
        });
      }
      setLoading(false);
    });
  }, [id]);

  const doAction = async (fn, successMsg) => {
    setActionLoading(true); setError(""); setSuccess("");
    const { data, error: err } = await fn();
    setActionLoading(false);
    if (err) { setError(err.message); return; }
    if (data?.appointment) setAppt(data.appointment);
    else if (data?.id) setAppt(data);
    if (data?.bill) setBill(data.bill);
    setSuccess(successMsg);
    setTimeout(()=>setSuccess(""),4000);
  };

  const checkIn = () => doAction(() => appointmentsApi.checkIn(id, user), "Patient checked in successfully. Bill has been created.");
  const complete = () => doAction(() => appointmentsApi.complete(id, user), "Appointment marked as completed.");
  const doCancel = async () => {
    setActionLoading(true); setError("");
    const { data, error: err } = await appointmentsApi.cancel(id, cancelReason, user);
    setActionLoading(false);
    if (err) { setError(err.message); return; }
    setAppt(data);
    setCancelOpen(false);
    setSuccess("Appointment cancelled.");
    setTimeout(()=>setSuccess(""),4000);
  };
  const doNoShow = () => doAction(() => appointmentsApi.noShow(id, user), "Appointment marked as no-show.");

  if (loading) return <LoadingState />;
  if (!appt) return <div className="alert alert-error">Appointment not found.</div>;

  return (
    <div style={{ maxWidth:800 }}>
      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",gap:"var(--sp-2)",marginBottom:"var(--sp-5)",fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>navigate(-1)} style={{padding:"0 var(--sp-2)"}}><ChevronLeft size={16}/></button>
        <Link to="/appointments" style={{color:"var(--teal-600)"}}>Appointments</Link>
        <span>/</span>
        <span>{appt.id}</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"var(--sp-5)",gap:"var(--sp-4)"}}>
        <div>
          <h1 style={{fontSize:"var(--text-2xl)",fontWeight:800}}>{appt.id}</h1>
          <div style={{color:"var(--text-muted)",fontSize:"var(--text-sm)",marginTop:4}}>
            {formatDate(appt.date)} at {appt.slotStart} – {appt.slotEnd}
            {appt.isWalkIn && <span className="badge badge-amber" style={{marginLeft:8}}>Walk-In</span>}
          </div>
        </div>
        <StatusBadge status={appt.status}/>
      </div>

      {error && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="error">{error}</Alert></div>}
      {success && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="success">{success}</Alert></div>}

      <AppointmentStepper status={appt.status}/>

      <div className="grid-2" style={{marginBottom:"var(--sp-5)"}}>
        <div className="card">
          <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Patient</div>
          <div style={{fontWeight:700,marginBottom:4}}>{appt.patientName}</div>
          <Link to={`/patients/${appt.patientId}`} style={{color:"var(--teal-600)",fontSize:"var(--text-sm)"}}>
            <span className="patient-id-badge" style={{fontSize:"var(--text-xs)"}}>{appt.patientId}</span>
          </Link>
        </div>
        <div className="card">
          <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Doctor</div>
          <div style={{fontWeight:700}}>{appt.doctorName}</div>
        </div>
      </div>

      {appt.cancelReason && (
        <div className="card" style={{marginBottom:"var(--sp-5)",background:"var(--red-50)",border:"1px solid #fecaca"}}>
          <div style={{fontWeight:700,color:"var(--red-600)",marginBottom:4}}>Cancellation Reason</div>
          <div style={{fontSize:"var(--text-sm)",color:"var(--red-600)"}}>{appt.cancelReason}</div>
        </div>
      )}

      {/* Actions */}
      {!["cancelled"].includes(appt.status) && (
        <div className="card" style={{marginBottom:"var(--sp-5)"}}>
          <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Actions</div>
          <div style={{display:"flex",gap:"var(--sp-3)",flexWrap:"wrap"}}>
            {appt.status==="scheduled" && can(user,"appointments.checkin") && (
              <button className="btn btn-primary" disabled={actionLoading} onClick={checkIn}>✅ Check In Patient</button>
            )}
            {appt.status==="checked_in" && can(user,"appointments.complete") && (
              <button className="btn btn-primary" disabled={actionLoading} onClick={complete}>🏁 Mark as Completed</button>
            )}
            {appt.status==="checked_in" && bill && can(user,"billing.view") && (
              <button className="btn btn-secondary" onClick={()=>navigate(`/billing/${bill.id}`)}><span>💰</span> View Bill ({bill.invoiceNumber})</button>
            )}
            {["scheduled","checked_in"].includes(appt.status) && can(user,"appointments.cancel") && (
              <button className="btn btn-danger" disabled={actionLoading} onClick={()=>setCancelOpen(true)}><X size={16}/> Cancel</button>
            )}
            {appt.status==="scheduled" && can(user,"appointments.noshow") && (
              <button className="btn btn-secondary" disabled={actionLoading} onClick={()=>setNoShowOpen(true)}>🚶 Mark No-Show</button>
            )}
          </div>
          {actionLoading && <div style={{marginTop:"var(--sp-3)",color:"var(--text-muted)",fontSize:"var(--text-sm)"}}>Processing…</div>}
        </div>
      )}

      {/* Bill summary */}
      {bill && (
        <div className="card" style={{cursor:"pointer"}} onClick={()=>navigate(`/billing/${bill.id}`)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div className="card-title">Invoice: {bill.invoiceNumber}</div>
              <div style={{fontSize:"var(--text-sm)",color:"var(--text-muted)",marginTop:4}}>Created {formatDateTime(bill.createdAt)}</div>
            </div>
            <StatusBadge status={bill.status}/>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelOpen && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setCancelOpen(false)}>
          <div className="modal" role="dialog">
            <div className="modal-header"><h2 className="modal-title">Cancel Appointment</h2><button className="btn btn-ghost btn-sm" onClick={()=>setCancelOpen(false)}>✕</button></div>
            <div className="modal-body">
              <p style={{color:"var(--text-muted)",fontSize:"var(--text-sm)",marginBottom:"var(--sp-4)"}}>Please provide a reason for cancelling this appointment. A reason is required.</p>
              <div className="form-group">
                <label className="form-label">Cancellation Reason <span className="required">*</span></label>
                <textarea className="form-textarea" value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="Enter reason…" rows={3} />
                {cancelReason.trim().length<5 && cancelReason.length>0 && <span className="form-error">⚠ Please enter at least 5 characters.</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setCancelOpen(false)}>Go Back</button>
              <button className="btn btn-danger" onClick={doCancel} disabled={actionLoading||cancelReason.trim().length<5}>{actionLoading?"Cancelling…":"Cancel Appointment"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={noShowOpen}
        onClose={()=>setNoShowOpen(false)}
        onConfirm={doNoShow}
        title="Mark as No-Show"
        message="Are you sure this patient did not attend their appointment? This will cancel the appointment and mark it as a no-show."
        confirmLabel="Mark No-Show"
        danger
        loading={actionLoading}
      />
    </div>
  );
}
