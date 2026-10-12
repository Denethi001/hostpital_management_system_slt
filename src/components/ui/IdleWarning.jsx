import { useAuth } from "../../contexts/AuthContext";

export default function IdleWarning() {
  const { idleWarning, logout, resetIdleTimer } = useAuth();
  if (!idleWarning) return null;
  return (
    <div className="idle-warning-banner" role="alert">
      <span>⏱ Your session will expire in 2 minutes due to inactivity.</span>
      <div style={{display:"flex",gap:"8px"}}>
        <button className="btn btn-secondary btn-sm" onClick={resetIdleTimer}>Stay Logged In</button>
        <button className="btn btn-ghost btn-sm" onClick={() => logout("idle")}>Log Out Now</button>
      </div>
    </div>
  );
}
