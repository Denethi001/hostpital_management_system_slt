import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { billingApi } from "../../lib/api";
import { LoadingState, EmptyState, StatusBadge, PageHeader, formatDate, formatLKR } from "../../components/ui/index";
import { Receipt } from "lucide-react";

export default function BillingPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await billingApi.list({ status: filter==="all" ? undefined : filter });
    setBills(data?.items || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const totals = {
    pending: bills.filter(b=>b.status==="pending").length,
    partial: bills.filter(b=>b.status==="partial").length,
    paid: bills.filter(b=>b.status==="paid").length,
  };

  return (
    <div>
      <PageHeader title="Billing" subtitle="Manage payments and invoices" />

      <div className="grid-3" style={{marginBottom:"var(--sp-5)"}}>
        {[{label:"Pending",val:totals.pending,color:"var(--amber-600)",bg:"var(--amber-50)",status:"pending"},{label:"Partial",val:totals.partial,color:"var(--blue-500)",bg:"var(--blue-50)",status:"partial"},{label:"Paid",val:totals.paid,color:"var(--green-600)",bg:"var(--green-50)",status:"paid"}].map(s=>(
          <div key={s.label} className="stat-card" style={{cursor:"pointer",border:`2px solid ${filter===s.status?"var(--teal-500)":"var(--border)"}`}} onClick={()=>setFilter(f=>f===s.status?"all":s.status)}>
            <div className="stat-card-icon" style={{background:s.bg,color:s.color}}>💳</div>
            <div className="stat-card-value" style={{fontSize:"var(--text-2xl)",color:s.color}}>{s.val}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <LoadingState /> : bills.length===0 ? (
        <EmptyState icon={<Receipt size={32}/>} title="No bills found" description="No billing records match your current filter." />
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Invoices</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setFilter("all")} style={{display:filter==="all"?"none":"inline-flex"}}>Clear Filter</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Patient</th><th>Doctor</th><th>Created</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr>
              </thead>
              <tbody>
                {bills.map(b=>(
                  <tr key={b.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/billing/${b.id}`)}>
                    <td className="td-link">{b.invoiceNumber}</td>
                    <td className="td-primary">{b.patientName}</td>
                    <td>{b.doctorName}</td>
                    <td>{formatDate(b.createdAt)}</td>
                    <td style={{fontWeight:600}}>{formatLKR(b.totalAmount)}</td>
                    <td style={{color:"var(--green-600)"}}>{formatLKR(b.paidAmount)}</td>
                    <td style={{color:b.balanceAmount>0?"var(--red-600)":"var(--text-muted)",fontWeight:b.balanceAmount>0?700:400}}>{formatLKR(b.balanceAmount)}</td>
                    <td><StatusBadge status={b.status}/>{b.isVoided&&<span className="badge badge-red" style={{marginLeft:4}}>Voided</span>}</td>
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
