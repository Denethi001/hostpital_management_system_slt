import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { billingApi } from "../../lib/api";
import { LoadingState, StatusBadge, formatLKR } from "../../components/ui/index";

export default function CashierHome() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    billingApi.list({ status: "pending" }).then(r => { setBills(r.data?.items || []); setLoading(false); });
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing Dashboard 💳</h1>
          <p className="page-subtitle">{bills.length} bills awaiting payment</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/billing")}>View All Bills</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Pending Payments</div>
          <span className="badge badge-amber">{bills.length} pending</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Invoice</th><th>Patient</th><th>Doctor</th><th>Total</th><th>Balance Due</th><th>Status</th></tr></thead>
            <tbody>
              {bills.length===0 && <tr><td colSpan={6} style={{textAlign:"center",color:"var(--text-muted)"}}>All bills are settled ✓</td></tr>}
              {bills.map(b=>(
                <tr key={b.id} style={{cursor:"pointer"}} onClick={()=>navigate(`/billing/${b.id}`)}>
                  <td className="td-link">{b.invoiceNumber}</td>
                  <td className="td-primary">{b.patientName}</td>
                  <td>{b.doctorName}</td>
                  <td>{formatLKR(b.totalAmount)}</td>
                  <td style={{color:"var(--red-600)",fontWeight:700}}>{formatLKR(b.balanceAmount)}</td>
                  <td><StatusBadge status={b.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
