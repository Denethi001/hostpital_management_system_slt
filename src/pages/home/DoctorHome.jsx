import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState, StatusBadge } from "../../components/ui/index";

const TODAY = "2026-10-12";

export default function DoctorHome() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    appointmentsApi.list({ date: TODAY, doctorId: user?.doctorId }).then(r => {
      setAppts(r.data?.items || []);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <LoadingState />;

  const pending = appts.filter(a => a.status === "checked_in").length;
  const done = appts.filter(a => a.status === "completed").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Day 🩺</h1>
          <p className="page-subtitle">{TODAY} — {appts.length} appointments</p>
        </div>
      </div>
      <div className="grid-3" style={{marginBottom:"var(--sp-6)"}}>
        {[{label:"Scheduled",val:appts.filter(a=>a.status==="scheduled").length,color:"var(--teal-500)",bg:"var(--teal-50)"},{label:"In Progress",val:pending,color:"var(--blue-500)",bg:"var(--blue-50)"},{label:"Completed",val:done,color:"var(--green-600)",bg:"var(--green-50)"}].map(s=>(
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{background:s.bg,color:s.color}}>📋</div>
            <div className="stat-card-value" style={{fontSize:"var(--text-2xl)"}}>{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>My Appointments Today</div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Time</th><th>Patient</th><th>Status</th><th>Walk-In</th></tr></thead>
            <tbody>
              {appts.length===0 && <tr><td colSpan={4} style={{textAlign:"center",color:"var(--text-muted)"}}>No appointments today</td></tr>}
              {appts.map(a=>(
                <tr key={a.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/appointments/${a.id}`)}>
                  <td className="font-semibold">{a.slotStart}</td>
                  <td className="td-primary">{a.patientName}</td>
                  <td><StatusBadge status={a.status}/></td>
                  <td>{a.isWalkIn ? <span className="badge badge-amber">Walk-In</span> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
