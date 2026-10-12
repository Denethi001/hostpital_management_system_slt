import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { statsApi, appointmentsApi } from "../../lib/api";
import { LoadingState, StatusBadge, formatLKR, formatDate } from "../../components/ui/index";
import { Users, Calendar, DollarSign, Clock } from "lucide-react";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const TODAY = "2026-10-12";

  useEffect(() => {
    Promise.all([
      statsApi.summary(),
      appointmentsApi.list({ date: TODAY })
    ]).then(([s, a]) => {
      setStats(s.data);
      setAppts(a.data?.items || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState />;

  const cards = [
    { label:"Active Patients", value: stats.totalPatients, icon:<Users size={22}/>, color:"var(--teal-500)", bg:"var(--teal-50)" },
    { label:"Today's Appointments", value: stats.todayAppointments, icon:<Calendar size={22}/>, color:"var(--blue-500)", bg:"var(--blue-50)" },
    { label:"Today's Revenue", value: formatLKR(stats.todayRevenue), icon:<DollarSign size={22}/>, color:"var(--green-600)", bg:"var(--green-50)", wide:true },
    { label:"Pending Bills", value: stats.pendingBills, icon:<Clock size={22}/>, color:"var(--amber-600)", bg:"var(--amber-50)" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, Admin 👋</h1>
          <p className="page-subtitle">{new Date(TODAY).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:"var(--sp-8)"}}>
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={c.wide ? {gridColumn:"span 1"} : {}}>
            <div className="stat-card-icon" style={{background:c.bg,color:c.color}}>{c.icon}</div>
            <div className="stat-card-value">{c.value}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Today's Appointments</div><div className="card-subtitle">{TODAY}</div></div>
          <button className="btn btn-secondary btn-sm" onClick={()=>navigate("/appointments")}>View All</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Walk-In</th></tr>
            </thead>
            <tbody>
              {appts.length === 0 && <tr><td colSpan={6} style={{textAlign:"center",color:"var(--text-muted)"}}>No appointments today</td></tr>}
              {appts.map(a => (
                <tr key={a.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/appointments/${a.id}`)}>
                  <td className="td-link">{a.id}</td>
                  <td className="td-primary">{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.slotStart}</td>
                  <td><StatusBadge status={a.status} /></td>
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
