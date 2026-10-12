import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../lib/api";

export default function ForcePasswordChange() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: err } = await auth.changePassword(user.id, { newPassword: pw });
    setLoading(false);
    if (err) { setError(err.message); return; }
    updateUser({ passwordChangeRequired: false });
    navigate("/");
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--surface-1)", padding:"var(--sp-6)" }}>
      <div style={{ width:"100%", maxWidth:"440px" }}>
        <div className="card">
          <div style={{ textAlign:"center", marginBottom:"var(--sp-6)" }}>
            <div style={{ fontSize:40, marginBottom:8 }}>🔑</div>
            <h1 style={{ fontSize:"var(--text-xl)", fontWeight:700 }}>Set Your Password</h1>
            <p style={{ color:"var(--text-muted)", fontSize:"var(--text-sm)", marginTop:4 }}>This is your first login. Please create a strong password to continue.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"var(--sp-4)" }}>
            <div className="form-group">
              <label className="form-label">New Password <span className="required">*</span></label>
              <input className="form-input" type="password" value={pw} onChange={e=>setPw(e.target.value)} required minLength={8} autoFocus />
              <span className="form-hint">At least 8 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <input className={`form-input ${error.includes("match") ? "error" : ""}`} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
            </div>
            {error && <div className="alert alert-error"><span>⚠</span><span>{error}</span></div>}
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? "Updating…" : "Set Password & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
