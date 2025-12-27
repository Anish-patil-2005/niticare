import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout.jsx'; 
import Dashboard from './pages/Admin/Dashboard.jsx';
import AshaManagement from './pages/Admin/AshaManagement.jsx';
import DataSync from './pages/Admin/DataSync.jsx';
import BeneficiaryDirectory from './pages/Admin/BeneficiaryDirectory.jsx';
import TaskAllocation from './pages/Admin/TaskAllocation.jsx';
import { Toaster } from 'react-hot-toast'; 
import FormBuilder from './pages/Admin/FormBuilder.jsx';

// Temporary Components for testing
const Unauthorized = () => <h1 className="text-2xl text-destructive">Access Denied</h1>;
const ComingSoon = () => <h1 className="text-2xl text-destructive">Page Under Construction...</h1>;

function App() {
  return (
    
    <BrowserRouter>
    <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
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
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout /> 
            </ProtectedRoute>
          }
        >
          {/* Redirect /admin to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ashas" element={<AshaManagement />} />

          <Route path="sync-data" element={<DataSync />} />
          <Route path="beneficiaries" element={<BeneficiaryDirectory />} />
          <Route path="assignments" element={<TaskAllocation />} />
          <Route path="/admin/forms" element={<FormBuilder />} />
          <Route path="/admin/export" element={<ComingSoon />} />

        </Route>

        {/* Protected ASHA Routes */}
        <Route 
          path="/asha" 
          element={
            <ProtectedRoute allowedRoles={['asha']}>
              <div className="p-8">ASHA Layout coming soon...</div>
            </ProtectedRoute>
          }
        >
          {/* <Route path="home" element={<AshaHome />} /> */}
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;