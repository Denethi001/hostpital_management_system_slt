import { useNavigate } from "react-router-dom";
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"var(--sp-12)", textAlign:"center", gap:"var(--sp-4)" }}>
      <div style={{ fontSize:64 }}>🔍</div>
      <h1 style={{ fontSize:"var(--text-2xl)", fontWeight:700 }}>Page Not Found</h1>
      <p style={{ color:"var(--text-muted)", maxWidth:360 }}>The page you are looking for does not exist or has been moved.</p>
      <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}
