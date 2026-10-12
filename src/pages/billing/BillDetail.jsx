import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { billingApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../lib/permissions";
import { LoadingState, StatusBadge, Alert, formatLKR, formatDate, formatDateTime } from "../../components/ui/index";
import { ChevronLeft, Printer } from "lucide-react";

export default function BillDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [payForm, setPayForm] = useState({ amount:"", method:"cash" });
  const [discountForm, setDiscountForm] = useState({ discountAmount:"", discountReason:"" });
  const [voidReason, setVoidReason] = useState("");
  const [voidOpen, setVoidOpen] = useState(false);
  const [payErrors, setPayErrors] = useState({});
  const [tab, setTab] = useState("invoice");

  useEffect(() => {
    billingApi.get(id).then(r => { setBill(r.data); setLoading(false); });
  }, [id]);

  const toast = (msg, type="success") => {
    if (type==="success") setSuccess(msg); else setError(msg);
    setTimeout(()=>{setSuccess("");setError("");},4000);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!payForm.amount || Number(payForm.amount)<=0) errs.amount = "Enter a valid amount.";
    if (Number(payForm.amount) > bill.balanceAmount) errs.amount = `Amount exceeds balance due (${formatLKR(bill.balanceAmount)}).`;
    if (Object.keys(errs).length) { setPayErrors(errs); return; }
    setPayErrors({});
    setSaving(true); setError("");
    const { data, error: err } = await billingApi.addPayment(id, payForm, user);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setBill(data);
    setPayForm({ amount:"", method:"cash" });
    toast("Payment recorded successfully!");
  };

  const handleDiscount = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    const { data, error: err } = await billingApi.applyDiscount(id, discountForm, user);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setBill(data);
    setDiscountForm({ discountAmount:"", discountReason:"" });
    toast("Discount applied.");
  };

  const handleVoid = async () => {
    setSaving(true); setError("");
    const { data, error: err } = await billingApi.void(id, voidReason, user);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setBill(data);
    setVoidOpen(false);
    toast("Bill voided.");
  };

  const handlePrint = () => window.print();

  if (loading) return <LoadingState />;
  if (!bill) return <div className="alert alert-error">Bill not found.</div>;

  const locked = !!bill.lockedAt;
  const isAdmin = user.role==="admin";
  const isCashier = can(user,"billing.payment");

  return (
    <div style={{maxWidth:900}}>
      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",gap:"var(--sp-2)",marginBottom:"var(--sp-5)",fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>
        <button className="btn btn-ghost btn-sm" onClick={()=>navigate(-1)} style={{padding:"0 var(--sp-2)"}}><ChevronLeft size={16}/></button>
        <Link to="/billing" style={{color:"var(--teal-600)"}}>Billing</Link>
        <span>/</span>
        <span>{bill.invoiceNumber}</span>
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"var(--sp-5)"}}>
        <div>
          <h1 style={{fontSize:"var(--text-2xl)",fontWeight:800}}>{bill.invoiceNumber}</h1>
          <div style={{color:"var(--text-muted)",fontSize:"var(--text-sm)",marginTop:4}}>
            Patient: <Link to={`/patients/${bill.patientId}`} style={{color:"var(--teal-600)",fontWeight:600}}>{bill.patientName}</Link>
          </div>
        </div>
        <div style={{display:"flex",gap:"var(--sp-3)",alignItems:"center"}}>
          <StatusBadge status={bill.status}/>
          {locked && <span className="badge badge-grey">🔒 Locked</span>}
          <button className="btn btn-secondary btn-sm no-print" onClick={handlePrint}><Printer size={14}/> Print</button>
          {isAdmin && !locked && !bill.isVoided && <button className="btn btn-danger btn-sm" onClick={()=>setVoidOpen(true)}>Void Bill</button>}
        </div>
      </div>

      {error && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="error">{error}</Alert></div>}
      {success && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="success">{success}</Alert></div>}
      {bill.isVoided && <div style={{marginBottom:"var(--sp-4)"}}><Alert type="error">⚠ This bill has been voided. Reason: {bill.voidReason}</Alert></div>}

      {/* Tabs */}
      <div className="tabs no-print">
        {["invoice","payments"].map(t=>(
          <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {t==="payments"&&<span className="badge badge-grey" style={{marginLeft:6}}>{bill.payments.length}</span>}
          </button>
        ))}
      </div>

      {/* Invoice Tab */}
      {tab==="invoice" && (
        <div ref={printRef}>
          <div className="invoice-paper">
            <div className="invoice-header">
              <div>
                <div className="invoice-logo">🏥 MediCore HMS</div>
                <div style={{fontSize:"var(--text-xs)",color:"var(--text-muted)",marginTop:4}}>Medical Excellence, Personal Care</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontWeight:700,fontSize:"var(--text-lg)"}}>{bill.invoiceNumber}</div>
                <div className="invoice-number">Issued: {formatDateTime(bill.createdAt)}</div>
                {locked && <div className="invoice-number">Paid: {formatDateTime(bill.lockedAt)}</div>}
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"var(--sp-5)",marginBottom:"var(--sp-6)"}}>
              <div>
                <div style={{fontSize:"var(--text-xs)",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"var(--sp-2)"}}>Bill To</div>
                <div style={{fontWeight:700}}>{bill.patientName}</div>
                <div style={{fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>{bill.patientId}</div>
              </div>
              <div>
                <div style={{fontSize:"var(--text-xs)",fontWeight:700,textTransform:"uppercase",color:"var(--text-muted)",marginBottom:"var(--sp-2)"}}>Consulting Doctor</div>
                <div style={{fontWeight:700}}>{bill.doctorName}</div>
                <div style={{fontSize:"var(--text-sm)",color:"var(--text-muted)"}}>{bill.appointmentId}</div>
              </div>
            </div>

            <table className="invoice-table">
              <thead><tr><th style={{flex:1}}>Description</th><th style={{textAlign:"right"}}>Amount (LKR)</th></tr></thead>
              <tbody>
                {bill.items.map((item,i)=>(
                  <tr key={i}><td>{item.description}</td><td style={{textAlign:"right"}}>{formatLKR(item.amount)}</td></tr>
                ))}
              </tbody>
            </table>

            <div style={{maxWidth:280,marginLeft:"auto"}}>
              <div className="invoice-total-row"><span>Subtotal</span><span>{formatLKR(bill.subtotal)}</span></div>
              {bill.discountAmount>0 && (
                <div className="invoice-total-row" style={{color:"var(--green-600)"}}>
                  <span>Discount {bill.discountReason && <span style={{fontWeight:400,fontSize:"var(--text-xs)"}}>({bill.discountReason})</span>}</span>
                  <span>– {formatLKR(bill.discountAmount)}</span>
                </div>
              )}
              <div className="invoice-total-row grand"><span>Total</span><span>{formatLKR(bill.totalAmount)}</span></div>
              <div className="invoice-total-row" style={{color:"var(--green-600)"}}><span>Paid</span><span>{formatLKR(bill.paidAmount)}</span></div>
              <div className="invoice-total-row" style={{color:bill.balanceAmount>0?"var(--red-600)":"var(--green-600)",fontWeight:700}}>
                <span>Balance Due</span><span>{formatLKR(bill.balanceAmount)}</span>
              </div>
            </div>

            {locked && (
              <div style={{marginTop:"var(--sp-6)",padding:"var(--sp-4)",background:"var(--green-50)",borderRadius:"var(--radius)",textAlign:"center",color:"var(--green-600)",fontWeight:600,fontSize:"var(--text-sm)"}}>
                ✓ Payment received in full on {formatDate(bill.lockedAt)}
              </div>
            )}
          </div>

          {/* Actions on invoice tab */}
          {!locked && !bill.isVoided && (
            <div className="card no-print" style={{marginTop:"var(--sp-5)"}}>
              <div style={{display:"flex",gap:"var(--sp-5)",flexWrap:"wrap"}}>
                {/* Payment form */}
                {isCashier && bill.balanceAmount>0 && (
                  <form onSubmit={handlePayment} style={{flex:1,minWidth:250}}>
                    <div style={{fontWeight:700,marginBottom:"var(--sp-3)"}}>Record Payment</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"var(--sp-3)"}}>
                      <div className="form-group">
                        <label className="form-label">Amount (LKR) <span className="required">*</span></label>
                        <input className={`form-input ${payErrors.amount?"error":""}`} type="number" step="0.01" min="1" value={payForm.amount} onChange={e=>setPayForm(f=>({...f,amount:e.target.value}))} placeholder={formatLKR(bill.balanceAmount)} />
                        {payErrors.amount && <span className="form-error">⚠ {payErrors.amount}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Method</label>
                        <select className="form-select" value={payForm.method} onChange={e=>setPayForm(f=>({...f,method:e.target.value}))}>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="bank_transfer">Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{marginTop:"var(--sp-3)"}} disabled={saving}>
                      {saving?"Processing…":"Record Payment"}
                    </button>
                  </form>
                )}

                {/* Discount form (admin only) */}
                {isAdmin && !bill.discountAmount && (
                  <form onSubmit={handleDiscount} style={{flex:1,minWidth:250}}>
                    <div style={{fontWeight:700,marginBottom:"var(--sp-3)"}}>Apply Discount</div>
                    <div className="form-group" style={{marginBottom:"var(--sp-3)"}}>
                      <label className="form-label">Discount Amount (LKR) <span className="required">*</span></label>
                      <input className="form-input" type="number" step="0.01" min="1" value={discountForm.discountAmount} onChange={e=>setDiscountForm(f=>({...f,discountAmount:e.target.value}))} />
                    </div>
                    <div className="form-group" style={{marginBottom:"var(--sp-3)"}}>
                      <label className="form-label">Reason <span className="required">*</span></label>
                      <input className="form-input" value={discountForm.discountReason} onChange={e=>setDiscountForm(f=>({...f,discountReason:e.target.value}))} placeholder="Reason for discount…" />
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={saving||!discountForm.discountAmount||!discountForm.discountReason}>{saving?"Applying…":"Apply Discount"}</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {tab==="payments" && (
        <div className="card">
          <div className="card-title" style={{marginBottom:"var(--sp-4)"}}>Payment History</div>
          {bill.payments.length===0 ? (
            <p style={{color:"var(--text-muted)",fontSize:"var(--text-sm)"}}>No payments recorded yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Payment ID</th><th>Amount</th><th>Method</th><th>Date & Time</th></tr></thead>
                <tbody>
                  {bill.payments.map(p=>(
                    <tr key={p.id}>
                      <td style={{fontFamily:"monospace",fontSize:"var(--text-xs)"}}>{p.id}</td>
                      <td style={{fontWeight:700,color:"var(--green-600)"}}>{formatLKR(p.amount)}</td>
                      <td><span className="badge badge-grey" style={{textTransform:"capitalize"}}>{p.method.replace("_"," ")}</span></td>
                      <td>{formatDateTime(p.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Void Bill Modal */}
      {voidOpen && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setVoidOpen(false)}>
          <div className="modal" style={{maxWidth:480}} role="dialog">
            <div className="modal-header">
              <h2 className="modal-title">Void Bill</h2>
              <button className="btn btn-ghost btn-sm" onClick={()=>setVoidOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-error" style={{marginBottom:"var(--sp-4)"}}>
                <span>⚠</span><span>Voiding a bill is a permanent action and cannot be undone. Please provide a reason.</span>
              </div>
              <div className="form-group">
                <label className="form-label">Void Reason <span className="required">*</span></label>
                <textarea className="form-textarea" rows={3} value={voidReason} onChange={e=>setVoidReason(e.target.value)} placeholder="Enter reason for voiding this bill…" autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setVoidOpen(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-danger" onClick={handleVoid} disabled={saving||!voidReason.trim()}>
                {saving ? "Voiding…" : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
