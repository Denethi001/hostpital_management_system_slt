import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const DEMO_CREDENTIALS = [
  { email:"admin@medicore.lk", password:"admin123", role:"Admin" },
  { email:"receptionist@medicore.lk", password:"recept123", role:"Receptionist" },
  { email:"doctor@medicore.lk", password:"doc123", role:"Doctor" },
  { email:"cashier@medicore.lk", password:"cash123", role:"Cashier" },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("admin@medicore.lk");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  const idleReason = params.get("reason") === "idle";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const { user: u, error: err } = await login(email, password);
    setLoading(false);
    if (err) {
      setFailCount(c => c+1);
      setError(err.message);
      return;
    }
    if (u.passwordChangeRequired) { navigate("/change-password"); return; }
    navigate("/");
  };

  const quickLogin = (cred) => { setEmail(cred.email); setPassword(cred.password); };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--surface-1)", padding:"var(--sp-6)" }}>
      <div style={{ width:"100%", maxWidth:"400px" }}>
        {/* Brand */}
        <div style={{ textAlign:"center", marginBottom:"var(--sp-8)" }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:56, height:56, background:"linear-gradient(135deg,var(--teal-500),var(--teal-700))", borderRadius:"var(--radius)", fontSize:28, marginBottom:"var(--sp-4)" }}>🏥</div>
          <h1 style={{ fontSize:"var(--text-2xl)", fontWeight:800, color:"var(--text-primary)" }}>MediCore HMS</h1>
          <p style={{ color:"var(--text-muted)", fontSize:"var(--text-sm)", marginTop:4 }}>Hospital Management System</p>
        </div>

        {idleReason && (
          <div className="alert alert-warning" style={{marginBottom:"var(--sp-4)"}}>
            <span>⏱</span><span>You were logged out due to inactivity. Please log in again.</span>
          </div>
        )}
        {failCount >= 5 && (
          <div className="alert alert-error" style={{marginBottom:"var(--sp-4)"}}>
            <span>🔒</span><span>Account locked after 5 failed attempts. Contact your administrator.</span>
          </div>
        )}

        <div className="card">
          <h2 style={{ fontSize:"var(--text-lg)", fontWeight:700, marginBottom:"var(--sp-5)" }}>Welcome back</h2>
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"var(--sp-4)" }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input id="login-email" className={`form-input ${error ? "error" : ""}`} type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="login-password" className={`form-input ${error ? "error" : ""}`} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            {error && <div className="alert alert-error"><span>⚠</span><span>{error}</span></div>}
            <button id="login-submit" className="btn btn-primary btn-lg" type="submit" disabled={loading || failCount>=5} style={{marginTop:"var(--sp-2)"}}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Quick login buttons for demo */}
        <div style={{ marginTop:"var(--sp-5)" }}>
          <p style={{ textAlign:"center", fontSize:"var(--text-xs)", color:"var(--text-muted)", marginBottom:"var(--sp-3)" }}>Quick demo login:</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--sp-2)" }}>
            {DEMO_CREDENTIALS.map(c => (
              <button key={c.role} className="btn btn-secondary btn-sm" onClick={() => quickLogin(c)} type="button">
                {c.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
