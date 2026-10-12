import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { can } from "./lib/permissions";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import ForcePasswordChange from "./pages/auth/ForcePasswordChange";
import ForbiddenPage from "./pages/auth/ForbiddenPage";
import NotFoundPage from "./pages/auth/NotFoundPage";
import AdminHome from "./pages/home/AdminHome";
import ReceptionistHome from "./pages/home/ReceptionistHome";
import DoctorHome from "./pages/home/DoctorHome";
import CashierHome from "./pages/home/CashierHome";
import PatientsPage from "./pages/patients/PatientsPage";
import PatientProfile from "./pages/patients/PatientProfile";
import RegisterPatient from "./pages/patients/RegisterPatient";
import AppointmentsPage from "./pages/appointments/AppointmentsPage";
import AppointmentDetail from "./pages/appointments/AppointmentDetail";
import DoctorsPage from "./pages/doctors/DoctorsPage";
import BillingPage from "./pages/billing/BillingPage";
import BillDetail from "./pages/billing/BillDetail";
import UsersPage from "./pages/users/UsersPage";
import AuditPage from "./pages/audit/AuditPage";
import IdleWarning from "./components/ui/IdleWarning";


function RequirePermission({ permission, children }) {
  const { user } = useAuth();
  if (!can(user, permission)) return <ForbiddenPage />;
  return children;
}

// Layout route that guards auth and renders the sidebar shell
function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.passwordChangeRequired) return <Navigate to="/change-password" replace />;
  return <AppLayout />;
}

function HomeRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const homes = { admin:<AdminHome/>, receptionist:<ReceptionistHome/>, doctor:<DoctorHome/>, cashier:<CashierHome/> };
  return homes[user.role] || <AdminHome />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ForcePasswordChange />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomeRouter />} />
            <Route path="/patients" element={<RequirePermission permission="nav.patients"><PatientsPage /></RequirePermission>} />
            <Route path="/patients/new" element={<RequirePermission permission="patients.register"><RegisterPatient /></RequirePermission>} />
            <Route path="/patients/:id" element={<RequirePermission permission="nav.patients"><PatientProfile /></RequirePermission>} />
            <Route path="/patients/:id/edit" element={<RequirePermission permission="patients.edit"><RegisterPatient /></RequirePermission>} />
            <Route path="/appointments" element={<RequirePermission permission="nav.appointments"><AppointmentsPage /></RequirePermission>} />
            <Route path="/appointments/:id" element={<RequirePermission permission="nav.appointments"><AppointmentDetail /></RequirePermission>} />
            <Route path="/doctors" element={<RequirePermission permission="nav.doctors"><DoctorsPage /></RequirePermission>} />
            <Route path="/billing" element={<RequirePermission permission="nav.billing"><BillingPage /></RequirePermission>} />
            <Route path="/billing/:id" element={<RequirePermission permission="nav.billing"><BillDetail /></RequirePermission>} />
            <Route path="/users" element={<RequirePermission permission="nav.users"><UsersPage /></RequirePermission>} />
            <Route path="/audit" element={<RequirePermission permission="nav.audit"><AuditPage /></RequirePermission>} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <IdleWarning />
      </BrowserRouter>
    </AuthProvider>
  );
}

