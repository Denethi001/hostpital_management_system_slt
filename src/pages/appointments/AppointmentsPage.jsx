import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState, EmptyState, StatusBadge, PageHeader, formatDate } from "../../components/ui/index";
import { Calendar, Filter } from "lucide-react";

const TODAY = "2026-10-12";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ date: TODAY, status: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    const params = { ...filter };
    if (user.role === "doctor") params.doctorId = user.doctorId;
    const { data } = await appointmentsApi.list(params);
    setAppts(data?.items || []);
    setLoading(false);
  }, [filter, user]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div>
      <PageHeader title="Appointments" subtitle={`${appts.length} results`} />

      <div className="card" style={{marginBottom:"var(--sp-5)"}}>
        <div style={{display:"flex",gap:"var(--sp-4)",alignItems:"center",flexWrap:"wrap"}}>
          <div className="form-group" style={{flex:1,minWidth:160}}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={filter.date} onChange={e=>setFilter(f=>({...f,date:e.target.value}))} />
          </div>
          <div className="form-group" style={{flex:1,minWidth:160}}>
            <label className="form-label">Status</label>
            <select className="form-select" value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="checked_in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{paddingTop:24}}>
            <button className="btn btn-secondary" onClick={()=>setFilter({date:TODAY,status:""})}>Reset</button>
          </div>
        </div>
      </div>

      {loading ? <LoadingState /> : appts.length===0 ? (
        <EmptyState icon={<Calendar size={32}/>} title="No appointments" description="No appointments match your current filters." />
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Type</th></tr>
              </thead>
              <tbody>
                {appts.map(a=>(
                  <tr key={a.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/appointments/${a.id}`)}>
                    <td className="td-link">{a.id}</td>
                    <td className="td-primary">{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td>{formatDate(a.date)}</td>
                    <td>{a.slotStart} – {a.slotEnd}</td>
                    <td><StatusBadge status={a.status}/>{a.noShow && <span className="badge badge-red" style={{marginLeft:4}}>No-Show</span>}</td>
                    <td>{a.isWalkIn?<span className="badge badge-amber">Walk-In</span>:"Booked"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
