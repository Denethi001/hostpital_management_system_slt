import { useState, useEffect, useCallback } from "react";
import { auditApi } from "../../lib/api";
import { LoadingState, EmptyState, PageHeader, formatDateTime } from "../../components/ui/index";
import { FileText } from "lucide-react";

const ACTION_COLORS = {
  PATIENT_REGISTERED: "badge-teal",
  APPOINTMENT_BOOKED: "badge-blue",
  APPOINTMENT_CHECKED_IN: "badge-blue",
  APPOINTMENT_COMPLETED: "badge-green",
  APPOINTMENT_CANCELLED: "badge-red",
  APPOINTMENT_NO_SHOW: "badge-red",
  PAYMENT_RECORDED: "badge-green",
  DISCOUNT_APPLIED: "badge-amber",
  BILL_VOIDED: "badge-red",
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action:"", dateFrom:"", dateTo:"" });
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await auditApi.list({ ...filter, page, limit:LIMIT });
    setLogs(data?.items || []);
    setTotal(data?.total || 0);
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalPages = Math.ceil(total/LIMIT);
  const allActions = [...new Set(["PATIENT_REGISTERED","APPOINTMENT_BOOKED","APPOINTMENT_CHECKED_IN","APPOINTMENT_COMPLETED","APPOINTMENT_CANCELLED","APPOINTMENT_NO_SHOW","PAYMENT_RECORDED","DISCOUNT_APPLIED","BILL_VOIDED"])];

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="A complete record of all system actions" />

      <div className="card" style={{marginBottom:"var(--sp-5)"}}>
        <div style={{display:"flex",gap:"var(--sp-4)",flexWrap:"wrap",alignItems:"flex-end"}}>
          <div className="form-group" style={{flex:1,minWidth:200}}>
            <label className="form-label">Filter by Action</label>
            <select className="form-select" value={filter.action} onChange={e=>setFilter(f=>({...f,action:e.target.value}))}>
              <option value="">All actions</option>
              {allActions.map(a=><option key={a} value={a}>{a.replace(/_/g," ")}</option>)}
            </select>
          </div>
          <div className="form-group" style={{flex:1,minWidth:160}}>
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" value={filter.dateFrom} onChange={e=>setFilter(f=>({...f,dateFrom:e.target.value}))} />
          </div>
          <div className="form-group" style={{flex:1,minWidth:160}}>
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" value={filter.dateTo} onChange={e=>setFilter(f=>({...f,dateTo:e.target.value}))} />
          </div>
          <button className="btn btn-secondary" onClick={()=>setFilter({action:"",dateFrom:"",dateTo:""})}>Clear</button>
        </div>
      </div>

      {loading ? <LoadingState /> : logs.length===0 ? (
        <EmptyState icon={<FileText size={32}/>} title="No audit records" description="No log entries match your current filters." />
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Activity Log</div>
            <span style={{fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>{total} entries</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Entity</th><th>Description</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map(log=>(
                  <tr key={log.id}>
                    <td style={{fontSize:"var(--text-xs)",fontFamily:"monospace",whiteSpace:"nowrap"}}>{formatDateTime(log.timestamp)}</td>
                    <td className="td-primary">{log.userName}</td>
                    <td><span className="badge badge-grey" style={{textTransform:"capitalize"}}>{log.userRole}</span></td>
                    <td><span className={`badge ${ACTION_COLORS[log.action]||"badge-grey"}`} style={{fontSize:"0.65rem"}}>{log.action.replace(/_/g," ")}</span></td>
                    <td style={{fontSize:"var(--text-xs)",fontFamily:"monospace",color:"var(--text-muted)"}}>{log.entityId}</td>
                    <td style={{fontSize:"var(--text-xs)",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.description}</td>
                    <td style={{fontSize:"var(--text-xs)",fontFamily:"monospace",color:"var(--text-muted)"}}>{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages>1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                <button key={n} className={`page-btn ${n===page?"active":""}`} onClick={()=>setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
