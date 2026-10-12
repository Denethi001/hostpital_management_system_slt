import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../lib/permissions";
import {
  LayoutDashboard, Users, Calendar, Stethoscope,
  Receipt, UserCog, FileText, LogOut, Search, X
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { patientsApi } from "../../lib/api";


const NAV_ITEMS = [
  { to:"/", icon:<LayoutDashboard/>, label:"Home", permission:"nav.home", exact:true },
  { to:"/patients", icon:<Users/>, label:"Patients", permission:"nav.patients" },
  { to:"/appointments", icon:<Calendar/>, label:"Appointments", permission:"nav.appointments" },
  { to:"/doctors", icon:<Stethoscope/>, label:"Doctors", permission:"nav.doctors" },
  { to:"/billing", icon:<Receipt/>, label:"Billing", permission:"nav.billing" },
  { to:"/users", icon:<UserCog/>, label:"Users", permission:"nav.users" },
  { to:"/audit", icon:<FileText/>, label:"Audit Log", permission:"nav.audit" },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await patientsApi.list({ search: query, limit: 6 });
      setResults(data?.items || []);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const go = (id) => { navigate(`/patients/${id}`); setQuery(""); setOpen(false); };

  return (
    <div className="topbar-search" ref={ref}>
      <Search className="topbar-search-icon" size={16} />
      <input
        type="text"
        placeholder="Search patients by name, ID or phone…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {query && <button onClick={()=>{setQuery("");setOpen(false);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",display:"flex"}}><X size={14}/></button>}
      {open && (
        <div className="search-dropdown">
          {loading && <div style={{padding:"12px 16px",color:"var(--text-muted)",fontSize:"0.8rem"}}>Searching…</div>}
          {!loading && results.length === 0 && <div style={{padding:"12px 16px",color:"var(--text-muted)",fontSize:"0.8rem"}}>No patients found for "{query}"</div>}
          {results.map(p => (
            <div key={p.id} className="search-result-item" onClick={() => go(p.id)}>
              <span className="search-result-id">{p.id}</span>
              <div>
                <div className="search-result-name">{p.fullName}</div>
                <div className="search-result-meta">{p.phone || "No phone"} • {p.nicMasked || "Minor"}</div>
              </div>
              {!p.isActive && <span className="badge badge-grey" style={{marginLeft:"auto"}}>Inactive</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();

  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏥</div>
          <div>
            <div className="sidebar-brand-text">MediCore</div>
            <div className="sidebar-brand-sub">HMS</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.filter(item => can(user, item.permission)).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-nav-item${isActive ? " active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-nav-item w-full btn-ghost" onClick={() => logout()} style={{background:"none",border:"none",width:"100%",textAlign:"left"}}>
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <GlobalSearch />
          <div className="topbar-spacer" />
          <div className="topbar-user">
            <div className="topbar-user-info">
              <div className="topbar-user-name">{user?.name}</div>
              <div className="topbar-user-role">{user?.role}</div>
            </div>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
