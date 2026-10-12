import { useState, useEffect } from "react";
import { doctorsApi, appointmentsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, Spinner } from "../../components/ui/index";

const DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

export default function BookAppointmentModal({ patientId, patientName, onClose, onBooked }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1=doctor, 2=date+slot, 3=confirm
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [isLeaveDay, setIsLeaveDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  // Date limits: today to +60 days
  const todayStr = "2026-10-12";
  const maxDate = (() => { const d = new Date("2026-10-12"); d.setDate(d.getDate()+60); return d.toISOString().split("T")[0]; })();

  useEffect(() => {
    doctorsApi.list({ activeOnly: true }).then(r => setDoctors(r.data || []));
  }, []);

  useEffect(() => {
    if (!selectedDoc || !date) return;
    setSlotsLoading(true);
    setSlots([]); setSelectedSlot(null);
    doctorsApi.slots(selectedDoc.id, date).then(r => {
      if (r.data) { setSlots(r.data.slots); setIsLeaveDay(r.data.isLeaveDay); }
      setSlotsLoading(false);
    });
  }, [selectedDoc, date]);

  // Only allow dates when doctor is available
  const dateAllowed = (dateStr) => {
    if (!selectedDoc) return true;
    const day = DAYS[new Date(dateStr).getDay()];
    return !!selectedDoc.availability[day];
  };

  const handleConfirm = async () => {
    setLoading(true); setError("");
    const { data, error: err } = await appointmentsApi.create({
      patientId, doctorId: selectedDoc.id, date,
      slotStart: selectedSlot, isWalkIn
    }, user);
    setLoading(false);
    if (err) { setError(err.message); return; }
    onBooked(data);
  };

  const isPast = (slot) => {
    const slotDt = new Date(`${date}T${slot.start}`);
    return slotDt < new Date();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal modal-lg" role="dialog">
        <div className="modal-header">
          <h2 className="modal-title">Book Appointment — {patientName}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ padding:"var(--sp-5) var(--sp-6)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:0 }}>
          {["Choose Doctor","Pick a Slot","Confirm"].map((label, i) => {
            const n = i+1;
            const done = step > n;
            const cur = step === n;
            return (
              <div key={label} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div className={`stepper-dot ${done?"done":cur?"current":""}`}>{done?"✓":n}</div>
                  <span className={`stepper-label ${done?"done":cur?"current":""}`}>{label}</span>
                </div>
                {i<2 && <div className={`stepper-step-connector ${done?"done":""}`} style={{flex:1,height:2,margin:"0 var(--sp-3)",marginTop:-14}} />}
              </div>
            );
          })}
        </div>

        <div className="modal-body">
          {error && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="error">{error}</Alert></div>}

          {/* Step 1: Choose Doctor */}
          {step===1 && (
            <div>
              <p style={{color:"var(--text-muted)",fontSize:"var(--text-sm)",marginBottom:"var(--sp-4)"}}>Select the doctor you would like to book with.</p>
              <div style={{display:"grid",gap:"var(--sp-3)"}}>
                {doctors.filter(d=>d.isActive).map(doc=>(
                  <div key={doc.id} onClick={()=>setSelectedDoc(doc)}
                    style={{ padding:"var(--sp-4)", border:`2px solid ${selectedDoc?.id===doc.id?"var(--teal-500)":"var(--border)"}`, borderRadius:"var(--radius)", cursor:"pointer", background:selectedDoc?.id===doc.id?"var(--teal-50)":"white", transition:"all 0.15s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{fontWeight:700,color:"var(--text-primary)"}}>{doc.name}</div>
                      <div style={{fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>{doc.specialization}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,color:"var(--teal-600)"}}>LKR {doc.consultationFee.toLocaleString()}</div>
                      <div style={{fontSize:"var(--text-xs)",color:"var(--text-muted)"}}>per consultation</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date + Slot */}
          {step===2 && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"var(--sp-5)",marginBottom:"var(--sp-5)"}}>
                <div className="form-group">
                  <label className="form-label">Appointment Date <span className="required">*</span></label>
                  <input type="date" className="form-input" value={date} min={todayStr} max={maxDate}
                    onChange={e => { setDate(e.target.value); setSelectedSlot(null); }} />
                  {date && !dateAllowed(date) && <span className="form-error">⚠ Dr. {selectedDoc.name} is not available on {new Date(date).toLocaleDateString("en-US",{weekday:"long"})}s. Please choose another day.</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Walk-in Patient?</label>
                  <label style={{display:"flex",alignItems:"center",gap:"var(--sp-2)",cursor:"pointer",height:42}}>
                    <input type="checkbox" checked={isWalkIn} onChange={e=>setIsWalkIn(e.target.checked)} style={{width:18,height:18,accentColor:"var(--teal-500)"}} />
                    <span style={{fontSize:"var(--text-sm)",color:"var(--text-secondary)"}}>Mark as walk-in appointment</span>
                  </label>
                </div>
              </div>

              {date && dateAllowed(date) && (
                <div>
                  <div style={{fontWeight:700,fontSize:"var(--text-sm)",marginBottom:"var(--sp-3)"}}>Available Slots</div>
                  {isLeaveDay && <div className="alert alert-warning" style={{marginBottom:"var(--sp-4)"}}>⚠ Dr. {selectedDoc.name} is on leave on this date.</div>}
                  {slotsLoading && <Spinner />}
                  {!slotsLoading && slots.length===0 && !isLeaveDay && (
                    <p style={{color:"var(--text-muted)",fontSize:"var(--text-sm)"}}>No slots available for this date.</p>
                  )}
                  {!slotsLoading && slots.length>0 && (
                    <div className="slot-grid">
                      {slots.map(s=>{
                        const past = isPast(s);
                        const cls = s.booked?"booked":past?"past":selectedSlot===s.start?"selected":"";
                        return (
                          <button key={s.start} className={`slot-btn ${cls}`}
                            disabled={s.booked||past||isLeaveDay}
                            onClick={()=>setSelectedSlot(s.start)}>
                            {s.start}
                            {s.booked && <div style={{fontSize:"0.65rem",opacity:0.7}}>Taken</div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step===3 && (
            <div>
              <p style={{color:"var(--text-muted)",fontSize:"var(--text-sm)",marginBottom:"var(--sp-5)"}}>Please review the appointment details before confirming.</p>
              <div className="card" style={{background:"var(--surface-1)"}}>
                {[
                  ["Patient", patientName],
                  ["Doctor", selectedDoc?.name],
                  ["Specialization", selectedDoc?.specialization],
                  ["Date", date ? new Date(date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : ""],
                  ["Time", selectedSlot],
                  ["Consultation Fee", `LKR ${selectedDoc?.consultationFee?.toLocaleString()}`],
                  ["Type", isWalkIn ? "Walk-in" : "Booked appointment"],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"var(--sp-3) 0",borderBottom:"1px solid var(--border)"}}>
                    <span style={{fontSize:"var(--text-sm)",color:"var(--text-muted)",fontWeight:600}}>{k}</span>
                    <span style={{fontSize:"var(--text-sm)",color:"var(--text-primary)",fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step>1 && <button className="btn btn-secondary" onClick={()=>setStep(s=>s-1)}>← Back</button>}
          <div style={{flex:1}}/>
          {step===1 && <button className="btn btn-primary" disabled={!selectedDoc} onClick={()=>setStep(2)}>Next: Choose Slot →</button>}
          {step===2 && <button className="btn btn-primary" disabled={!selectedSlot||!date||!dateAllowed(date)} onClick={()=>setStep(3)}>Next: Review →</button>}
          {step===3 && <button className="btn btn-primary" disabled={loading} onClick={handleConfirm}>{loading?"Booking…":"Confirm Appointment"}</button>}
        </div>
      </div>
    </div>
  );
}
