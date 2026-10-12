// ============================================================
// Shared UI Components
// ============================================================

// --- Modal ---
export function Modal({ isOpen, onClose, title, children, size = "", footer }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`modal ${size}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// --- Spinner ---
export function Spinner({ lg = false }) {
  return <div className={`spinner ${lg ? "spinner-lg" : ""}`} role="status" aria-label="Loading" />;
}

// --- Loading State ---
export function LoadingState() {
  return (
    <div className="loading-overlay">
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
        <Spinner lg />
        <span style={{color:"var(--text-muted)",fontSize:"0.875rem"}}>Loading, please wait…</span>
      </div>
    </div>
  );
}

// --- Empty State ---
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div>
        <div className="empty-state-title">{title}</div>
        <div className="empty-state-desc">{description}</div>
      </div>
      {action}
    </div>
  );
}

// --- Alert ---
export function Alert({ type = "info", children }) {
  const icons = { error:"⚠️", warning:"⚠️", info:"ℹ️", success:"✅" };
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
}

// --- Badge ---
const statusMap = {
  scheduled: { cls:"badge-teal", label:"Scheduled" },
  checked_in: { cls:"badge-blue", label:"Checked In" },
  completed: { cls:"badge-green", label:"Completed" },
  cancelled: { cls:"badge-red", label:"Cancelled" },
  paid: { cls:"badge-green", label:"Paid" },
  pending: { cls:"badge-amber", label:"Pending" },
  partial: { cls:"badge-blue", label:"Partial" },
  voided: { cls:"badge-grey", label:"Voided" },
  active: { cls:"badge-green", label:"Active" },
  inactive: { cls:"badge-grey", label:"Inactive" },
};

export function StatusBadge({ status }) {
  const s = statusMap[status] || { cls:"badge-grey", label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// --- Form Field ---
export function FormField({ label, required, error, hint, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && <span className="required">*</span>}</label>}
      {children}
      {error && <span className="form-error">⚠ {error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}

// --- Confirm Dialog ---
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel="Confirm", danger=false, loading=false }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:400}} role="dialog">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{fontSize:"var(--text-sm)",color:"var(--text-secondary)",lineHeight:1.6}}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={`btn ${danger?"btn-danger":"btn-primary"}`} onClick={onConfirm} disabled={loading}>
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Page Header ---
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// --- LKR formatter ---
export const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", { style:"currency", currency:"LKR", minimumFractionDigits:2 }).format(amount);

// --- Date formatter ---
export const formatDate = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
};
export const formatDateTime = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
};
