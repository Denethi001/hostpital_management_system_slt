import { useNavigate } from "react-router-dom";
export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"var(--sp-12)", textAlign:"center", gap:"var(--sp-4)" }}>
      <div style={{ fontSize:64 }}>🚫</div>
      <h1 style={{ fontSize:"var(--text-2xl)", fontWeight:700, color:"var(--text-primary)" }}>Access Not Permitted</h1>
      <p style={{ color:"var(--text-muted)", maxWidth:360 }}>You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.</p>
      <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}
