import { useState, useEffect } from "react";
import { usersApi } from "../../lib/api";
import { LoadingState, StatusBadge, PageHeader, Modal, Alert, FormField, formatDateTime } from "../../components/ui/index";
import { UserCog, Plus, UserX } from "lucide-react";

const ROLES = ["admin","receptionist","doctor","cashier"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", role:"receptionist" });

  useEffect(() => {
    usersApi.list().then(r => { setUsers(r.data || []); setLoading(false); });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    const { data, error: err } = await usersApi.create(form);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setUsers(u => [...u, data]);
    setModalOpen(false);
    setForm({ name:"", email:"", role:"receptionist" });
    setSuccess("User account created. They will be prompted to set their password on first login.");
    setTimeout(()=>setSuccess(""),5000);
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this user account?")) return;
    await usersApi.deactivate(id);
    setUsers(u => u.map(x => x.id===id ? {...x,isActive:false} : x));
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="User Accounts"
        subtitle="Manage staff access"
        action={<button className="btn btn-primary" onClick={()=>setModalOpen(true)}><Plus size={16}/> Add User</button>}
      />
      {success && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="success">{success}</Alert></div>}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Password</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td className="td-primary">{u.name}</td>
                  <td style={{fontFamily:"monospace",fontSize:"var(--text-xs)"}}>{u.email}</td>
                  <td><span className="badge badge-teal" style={{textTransform:"capitalize"}}>{u.role}</span></td>
                  <td><StatusBadge status={u.isActive?"active":"inactive"}/></td>
                  <td>{u.passwordChangeRequired ? <span className="badge badge-amber">Change Required</span> : <span className="badge badge-green">Set</span>}</td>
                  <td>{formatDateTime(u.createdAt)}</td>
                  <td>
                    {u.isActive && (
                      <button className="btn btn-ghost btn-sm" onClick={()=>handleDeactivate(u.id)} title="Deactivate"><UserX size={14}/></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Add User Account">
        {error && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="error">{error}</Alert></div>}
        <div className="alert alert-info" style={{marginBottom:"var(--sp-4)"}}>
          <span>ℹ</span><span>A temporary password will not be set. The user will be prompted to set their own password on first login.</span>
        </div>
        <form onSubmit={handleCreate} style={{display:"flex",flexDirection:"column",gap:"var(--sp-4)"}}>
          <FormField label="Full Name" required>
            <input className="form-input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
          </FormField>
          <FormField label="Email Address" required>
            <input className="form-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required />
          </FormField>
          <FormField label="Role" required>
            <select className="form-select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              {ROLES.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
          </FormField>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving||!form.name||!form.email}>{saving?"Creating…":"Create Account"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
