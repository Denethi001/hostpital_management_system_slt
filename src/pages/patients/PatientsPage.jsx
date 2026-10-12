import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { patientsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { can } from "../../lib/permissions";
import { LoadingState, EmptyState, StatusBadge, PageHeader, formatDate } from "../../components/ui/index";
import { Users, Plus, Search } from "lucide-react";

export default function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const { data } = await patientsApi.list({ search, page, limit: LIMIT });
    setPatients(data?.items || []);
    setTotal(data?.total || 0);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const totalPages = Math.ceil(total / LIMIT);
  const canRegister = can(user, "patients.register");

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${total} patient records`}
        action={canRegister && <button className="btn btn-primary" onClick={() => navigate("/patients/new")}><Plus size={16} /> Register Patient</button>}
      />

      <div className="card">
        <div style={{ display:"flex", gap:"var(--sp-4)", marginBottom:"var(--sp-4)", alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, maxWidth:360 }}>
            <Search size={16} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
            <input
              className="form-input"
              style={{ paddingLeft:40 }}
              placeholder="Search by name, ID or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? <LoadingState /> : patients.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="No patients found"
            description={search ? `No results for "${search}". Try a different search term.` : "No patients registered yet."}
            action={canRegister && <button className="btn btn-primary" onClick={() => navigate("/patients/new")}><Plus size={16}/> Register First Patient</button>}
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Full Name</th>
                    <th>Date of Birth</th>
                    <th>NIC</th>
                    <th>Phone</th>
                    <th>Blood Group</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} style={{ cursor:"pointer" }} onClick={() => navigate(`/patients/${p.id}`)}>
                      <td><span className="patient-id-badge">{p.id}</span></td>
                      <td className="td-primary">
                        {p.fullName}
                        {p.isMinor && <span className="badge badge-blue" style={{marginLeft:6}}>Minor</span>}
                        {p.hasDuplicateWarning && <span className="badge badge-amber" style={{marginLeft:6}}>⚠ Duplicate</span>}
                      </td>
                      <td>{formatDate(p.dateOfBirth)}</td>
                      <td style={{ fontFamily:"monospace" }}>
                        {can(user,"patients.view_nic") ? (p.nic || "—") : (p.nicMasked || "—")}
                      </td>
                      <td>{p.phone || "—"}</td>
                      <td><span className="badge badge-grey">{p.bloodGroup || "—"}</span></td>
                      <td><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
                  <button key={n} className={`page-btn ${n===page?"active":""}`} onClick={()=>setPage(n)}>{n}</button>
                ))}
                <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
