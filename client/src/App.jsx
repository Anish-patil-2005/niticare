import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import AshaManagement from "./pages/Admin/AshaManagement.jsx";
import DataSync from "./pages/Admin/DataSync.jsx";
import BeneficiaryDirectory from "./pages/Admin/BeneficiaryDirectory.jsx";
import TaskAllocation from "./pages/Admin/TaskAllocation.jsx";
import { Toaster } from "react-hot-toast";
import FormBuilder from "./pages/Admin/FormBuilder.jsx";
import AshaLayout from "./components/layout/AshaLayout.jsx";
import RegisterBeneficiary from "./pages/Asha/RegisterBeneficiary.jsx";
import BeneficiaryDashboard from "./pages/Admin/BeneficiaryDashboard.jsx";
import { AntenatalDashboard } from "./pages/Asha/Antenatal/AntenatalDashboard.jsx";
import FillForm from "./pages/Asha/FillForm.jsx";

// Temporary Components for testing
const Unauthorized = () => (
  <h1 className="text-2xl text-destructive">Access Denied</h1>
);
const ComingSoon = () => (
  <h1 className="text-2xl text-destructive">Page Under Construction...</h1>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ashas" element={<AshaManagement />} />

          <Route path="sync-data" element={<DataSync />} />
          <Route path="beneficiaries" element={<BeneficiaryDirectory mode="admin" />} />
          <Route path="beneficiary/:id" element={<BeneficiaryDashboard mode="admin" />} />

          <Route path="assignments" element={<TaskAllocation />} />
          <Route path="/admin/forms" element={<FormBuilder />} />
          <Route path="/admin/export" element={<ComingSoon />} />

          <Route path="fill-form/:formId/:beneficiaryId" element={<FillForm />} />

        </Route>

        {/* Protected ASHA Routes */}
        <Route
          path="/asha"
          element={
            <ProtectedRoute allowedRoles={["asha"]}>
              <AshaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="beneficiaries" element={<BeneficiaryDirectory mode="asha" />} />
          <Route path="beneficiary/:id" element={<BeneficiaryDashboard mode="asha" />} />
          <Route path="antenatal/:beneficiaryId" element={<AntenatalDashboard />} />

          <Route path="register" element={<RegisterBeneficiary />} />
          <Route path="edit/:id" element={<RegisterBeneficiary />} />
          <Route path="fill-form/:formId/:beneficiaryId" element={<FillForm />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
