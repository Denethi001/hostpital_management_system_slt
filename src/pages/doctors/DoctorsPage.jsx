import { useState, useEffect } from "react";
import { doctorsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState, EmptyState, StatusBadge, PageHeader, Modal, Alert, FormField } from "../../components/ui/index";
import { Stethoscope, Plus, Edit } from "lucide-react";

const SPECIALIZATIONS = ["General Medicine","Cardiology","Pediatrics","Dermatology","Neurology","Orthopedics","Gynecology","Ophthalmology","ENT","Psychiatry"];

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

export default function DoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", specialization:"", email:"", phone:"", consultationFee:"" });
  const isAdmin = user.role === "admin";

  useEffect(() => {
    doctorsApi.list().then(r => { setDoctors(r.data || []); setLoading(false); });
  }, []);

  const openAdd = () => { setEditing(null); setForm({name:"",specialization:"",email:"",phone:"",consultationFee:""}); setModalOpen(true); };
  const openEdit = (doc) => {
    setEditing(doc);
    setForm({ name:doc.name, specialization:doc.specialization, email:doc.email, phone:doc.phone||"", consultationFee:doc.consultationFee });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true); setError("");
    const { data, error: err } = editing
      ? await doctorsApi.update(editing.id, { ...form, consultationFee: Number(form.consultationFee) })
      : await doctorsApi.create({ ...form, consultationFee: Number(form.consultationFee) });
    setSaving(false);
    if (err) { setError(err.message); return; }
    if (editing) setDoctors(d => d.map(doc => doc.id===data.id ? data : doc));
    else setDoctors(d => [...d, data]);
    setModalOpen(false);
    setSuccess(editing ? "Doctor updated." : "Doctor added successfully.");
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} doctors on record`}
        action={isAdmin && <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/> Add Doctor</button>}
      />
      {success && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="success">{success}</Alert></div>}

      <div className="grid-2">
        {doctors.map(doc => (
          <div key={doc.id} className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"var(--sp-4)"}}>
              <div style={{display:"flex",gap:"var(--sp-3)",alignItems:"center"}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,var(--teal-100),var(--teal-300))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"var(--teal-700)"}}>
                  {doc.name.split(" ").pop()[0]}
                </div>
                <div>
                  <div style={{fontWeight:700,color:"var(--text-primary)"}}>{doc.name}</div>
                  <div style={{fontSize:"var(--text-sm)",color:"var(--teal-600)"}}>{doc.specialization}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"var(--sp-2)",alignItems:"center"}}>
                <StatusBadge status={doc.isActive?"active":"inactive"}/>
                {isAdmin && <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(doc)}><Edit size={14}/></button>}
              </div>
            </div>
            <div style={{display:"grid",gap:"var(--sp-2)"}}>
              <div style={{fontSize:"var(--text-sm)",color:"var(--text-secondary)"}}><span style={{color:"var(--text-muted)",fontWeight:600}}>Fee: </span>LKR {doc.consultationFee?.toLocaleString()}</div>
              <div style={{fontSize:"var(--text-sm)",color:"var(--text-secondary)"}}><span style={{color:"var(--text-muted)",fontWeight:600}}>Email: </span>{doc.email}</div>
              <div style={{fontSize:"var(--text-sm)",color:"var(--text-secondary)"}}><span style={{color:"var(--text-muted)",fontWeight:600}}>Phone: </span>{doc.phone || "—"}</div>
              {doc.leavedays.length>0 && (
                <div style={{fontSize:"var(--text-xs)",color:"var(--amber-600)",background:"var(--amber-50)",padding:"4px 10px",borderRadius:"var(--radius-sm)",display:"inline-block",marginTop:4}}>
                  ⚠ {doc.leavedays.length} leave day(s) scheduled
                </div>
              )}
            </div>
            <div style={{marginTop:"var(--sp-4)"}}>
              <div style={{fontSize:"var(--text-xs)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--text-muted)",marginBottom:"var(--sp-2)"}}>Available Days</div>
              <div style={{display:"flex",gap:"var(--sp-1)",flexWrap:"wrap"}}>
                {DAYS.map(day => (
                  <span key={day} className={`badge ${doc.availability[day] ? "badge-teal" : "badge-grey"}`} style={{opacity:doc.availability[day]?1:0.4}}>
                    {day.slice(0,3).charAt(0).toUpperCase()+day.slice(1,3)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing ? "Edit Doctor" : "Add Doctor"}>
        {error && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="error">{error}</Alert></div>}
        <div className="form-grid form-grid-2" style={{gap:"var(--sp-4)"}}>
          <FormField label="Full Name" required>
            <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          </FormField>
          <FormField label="Specialization" required>
            <select className="form-select" value={form.specialization} onChange={e=>setForm(f=>({...f,specialization:e.target.value}))}>
              <option value="">Select…</option>
              {SPECIALIZATIONS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Email" required>
            <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
          </FormField>
          <FormField label="Phone">
            <input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          </FormField>
          <FormField label="Consultation Fee (LKR)" required>
            <input className="form-input" type="number" value={form.consultationFee} onChange={e=>setForm(f=>({...f,consultationFee:e.target.value}))} />
          </FormField>
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving||!form.name||!form.specialization}>{saving?"Saving…":editing?"Save Changes":"Add Doctor"}</button>
        </div>
      </Modal>
    </div>
  );
}
