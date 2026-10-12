import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { patientsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Alert, FormField, PageHeader } from "../../components/ui/index";

function calcAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const GENDERS = ["male","female","other"];

export default function RegisterPatient() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName:"", lastName:"", dateOfBirth:"", gender:"", nic:"", phone:"", email:"",
    address:"", bloodGroup:"", guardianName:"", guardianPhone:""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    patientsApi.get(id).then(({ data }) => {
      if (data) setForm({
        firstName: data.firstName, lastName: data.lastName,
        dateOfBirth: data.dateOfBirth, gender: data.gender,
        nic: data.nic || "", phone: data.phone || "", email: data.email || "",
        address: data.address || "", bloodGroup: data.bloodGroup || "",
        guardianName: data.guardianName || "", guardianPhone: data.guardianPhone || ""
      });
      setLoadingData(false);
    });
  }, [id, isEdit]);

  const age = calcAge(form.dateOfBirth);
  const isMinor = age !== null && age < 18;

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
    if (!form.gender) e.gender = "Gender is required.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (form.nic && !/^[0-9]{9}[VXvx]$|^[0-9]{12}$/.test(form.nic)) e.nic = "NIC must be 9 digits + V/X or 12 digits.";
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) e.phone = "Phone must be 10 digits starting with 0.";
    if (isMinor && !form.guardianPhone) e.guardianPhone = "Guardian phone is required for patients under 18.";
    if (isMinor && !form.guardianName) e.guardianName = "Guardian name is required for patients under 18.";
    return e;
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true); setServerError("");
    const payload = {
      ...form,
      guardianName: isMinor ? form.guardianName : null,
      guardianPhone: isMinor ? form.guardianPhone : null,
    };
    const { data, error } = isEdit
      ? await patientsApi.update(id, payload)
      : await patientsApi.create(payload);
    setLoading(false);
    if (error) {
      setServerError(error.message);
      if (error.fields) setErrors(prev => ({ ...prev, ...error.fields }));
      return;
    }
    navigate(`/patients/${data.id}`);
  };

  if (loadingData) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;

  return (
    <div style={{ maxWidth:720 }}>
      <PageHeader
        title={isEdit ? "Edit Patient" : "Register New Patient"}
        subtitle={isEdit ? `Editing patient record ${id}` : "All required fields must be completed before saving."}
        action={<button className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>}
      />

      {serverError && <div style={{marginBottom:"var(--sp-5)"}}><Alert type="error">{serverError}</Alert></div>}

      <form className="card" onSubmit={handleSubmit} noValidate>
        <div className="form-section-title">Personal Information</div>
        <div className="form-grid form-grid-2" style={{marginBottom:"var(--sp-5)"}}>
          <FormField label="First Name" required error={errors.firstName}>
            <input className={`form-input ${errors.firstName?"error":""}`} value={form.firstName} onChange={set("firstName")} />
          </FormField>
          <FormField label="Last Name" required error={errors.lastName}>
            <input className={`form-input ${errors.lastName?"error":""}`} value={form.lastName} onChange={set("lastName")} />
          </FormField>
          <FormField label="Date of Birth" required error={errors.dateOfBirth} hint={age!==null ? `Age: ${age} years${isMinor?" (Minor – guardian required)":""}`:""}>
            <input className={`form-input ${errors.dateOfBirth?"error":""}`} type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} max={new Date().toISOString().split("T")[0]} />
          </FormField>
          <FormField label="Gender" required error={errors.gender}>
            <select className={`form-select ${errors.gender?"error":""}`} value={form.gender} onChange={set("gender")}>
              <option value="">Select gender…</option>
              {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
            </select>
          </FormField>
          <FormField label="Blood Group" error={errors.bloodGroup}>
            <select className="form-select" value={form.bloodGroup} onChange={set("bloodGroup")}>
              <option value="">Select…</option>
              {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </FormField>
          <FormField label="NIC Number" error={errors.nic} hint="Old NIC: 9 digits + V/X. New NIC: 12 digits.">
            <input className={`form-input ${errors.nic?"error":""}`} value={form.nic} onChange={set("nic")} placeholder="e.g. 855667890V or 198506700123" />
          </FormField>
        </div>

        <div className="form-section-title">Contact Details</div>
        <div className="form-grid form-grid-2" style={{marginBottom:"var(--sp-5)"}}>
          <FormField label="Phone Number" error={errors.phone}>
            <input className={`form-input ${errors.phone?"error":""}`} value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX" />
          </FormField>
          <FormField label="Email Address" error={errors.email}>
            <input className="form-input" type="email" value={form.email} onChange={set("email")} placeholder="patient@email.com" />
          </FormField>
          <FormField label="Address" required error={errors.address} style={{gridColumn:"span 2"}}>
            <input className={`form-input ${errors.address?"error":""}`} value={form.address} onChange={set("address")} placeholder="Street, City" />
          </FormField>
        </div>

        {isMinor && (
          <>
            <div className="form-section-title" style={{color:"var(--amber-600)"}}>⚠ Guardian Information (Required – Patient is a Minor)</div>
            <div className="form-grid form-grid-2" style={{marginBottom:"var(--sp-5)"}}>
              <FormField label="Guardian Full Name" required error={errors.guardianName}>
                <input className={`form-input ${errors.guardianName?"error":""}`} value={form.guardianName} onChange={set("guardianName")} />
              </FormField>
              <FormField label="Guardian Phone" required error={errors.guardianPhone}>
                <input className={`form-input ${errors.guardianPhone?"error":""}`} value={form.guardianPhone} onChange={set("guardianPhone")} placeholder="07XXXXXXXX" />
              </FormField>
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
