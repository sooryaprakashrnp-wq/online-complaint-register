import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import UserDashboard from './pages/User/UserDashboard';
import NewComplaintPage from './pages/User/NewComplaintPage';
import ComplaintDetailPage from './pages/User/ComplaintDetailPage';
import AgentDashboard from './pages/Agent/AgentDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersPage from './pages/Admin/UsersPage';
import AnalyticsPage from './pages/Admin/AnalyticsPage';
import FeedbackPage from './pages/FeedbackPage';

const NotFoundPage = () => (
  <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '70vh' }}>
    <div style={{ fontSize: '80px' }}>🔍</div>
    <h1 className="mt-3">404 - Page Not Found</h1>
    <p className="text-muted">The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary mt-2">← Back to Home</a>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/dashboard'} /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/dashboard'} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['USER']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/complaints/new" element={<ProtectedRoute allowedRoles={['USER']}><NewComplaintPage /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
      <Route path="/feedback/:complaintId" element={<ProtectedRoute allowedRoles={['USER']}><FeedbackPage /></ProtectedRoute>} />

      {/* Agent Routes */}
      <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={['AGENT']}><AgentDashboard /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnalyticsPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
