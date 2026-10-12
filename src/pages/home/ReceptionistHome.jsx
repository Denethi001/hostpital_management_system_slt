import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentsApi } from "../../lib/api";
import { LoadingState, StatusBadge } from "../../components/ui/index";
import { Plus } from "lucide-react";

const TODAY = "2026-10-12";

export default function ReceptionistHome() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    appointmentsApi.list({ date: TODAY }).then(r => { setAppts(r.data?.items || []); setLoading(false); });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning 👋</h1>
          <p className="page-subtitle">Here is your schedule for today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/patients/new")}>
          <Plus size={16} /> Register Patient
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Today's Appointments</div>
          <span className="badge badge-teal">{appts.length} total</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Type</th></tr></thead>
            <tbody>
              {appts.length===0 && <tr><td colSpan={5} style={{textAlign:"center",color:"var(--text-muted)"}}>No appointments today</td></tr>}
              {appts.map(a=>(
                <tr key={a.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/appointments/${a.id}`)}>
                  <td className="font-semibold">{a.slotStart}</td>
                  <td className="td-primary">{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td><StatusBadge status={a.status}/></td>
                  <td>{a.isWalkIn ? <span className="badge badge-amber">Walk-In</span> : "Booked"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
