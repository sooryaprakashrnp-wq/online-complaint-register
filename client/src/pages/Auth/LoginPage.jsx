import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error('Please fill all fields');
    }
    setLoading(true);
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow"></div>
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-5 col-lg-4">
            <div className="auth-card card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="brand-logo-badge mb-3 d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow-sm" style={{ width: '64px', height: '64px', fontSize: '32px' }}>
                    🎯
                  </div>
                  <h3 className="fw-bold mb-1" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ComplaintHub
                  </h3>
                  <h4 className="auth-title h5 mt-2">Sign In</h4>
                  <p className="text-muted small">Access your ComplaintHub account</p>
                </div>

                <form onSubmit={handleSubmit} id="loginForm">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id="loginEmail"
                      className="form-control"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="loginPassword"
                      className="form-control"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    id="loginSubmitBtn"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Signing In...</>
                    ) : 'Sign In →'}
                  </button>
                </form>

                <div className="demo-creds mt-4 p-3 rounded">
                  <p className="small fw-semibold mb-2 text-muted">🧪 Demo Credentials:</p>
                  <div className="small text-muted">
                    <div>Admin: <code>admin@demo.com / admin123</code></div>
                    <div>Agent: <code>agent@demo.com / agent123</code></div>
                    <div>User: <code>user@demo.com / user123</code></div>
                  </div>
                </div>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="fw-semibold text-primary">Create one →</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
