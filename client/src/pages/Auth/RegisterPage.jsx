import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      toast.success(`Welcome, ${user.name}! Account created successfully 🎉`);
      if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow"></div>
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-4">
          <div className="col-md-6 col-lg-5">
            <div className="auth-card card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="auth-logo mb-3">🚀</div>
                  <h2 className="auth-title">Create Account</h2>
                  <p className="text-muted small">Join ComplaintHub and get started today</p>
                </div>

                <form onSubmit={handleSubmit} id="registerForm">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text">👤</span>
                      <input
                        type="text" name="name" id="regName" className="form-control"
                        placeholder="Soorya Prakash" value={formData.name}
                        onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">✉️</span>
                      <input
                        type="email" name="email" id="regEmail" className="form-control"
                        placeholder="soorya@gmail.com" value={formData.email}
                        onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone Number <span className="text-muted">(optional)</span></label>
                    <div className="input-group">
                      <span className="input-group-text">📱</span>
                      <input
                        type="tel" name="phone" id="regPhone" className="form-control"
                        placeholder="+91 9876543210" value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Register As</label>
                    <select
                      name="role" id="regRole" className="form-select"
                      value={formData.role} onChange={handleChange}
                    >
                      <option value="USER">👤 User (Submit Complaints)</option>
                      <option value="AGENT">🛠️ Agent (Handle Complaints)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">🔒</span>
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" id="regPassword"
                        className="form-control" placeholder="Min. 6 characters"
                        value={formData.password} onChange={handleChange} required
                      />
                      <button type="button" className="input-group-text btn"
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text">🔐</span>
                      <input
                        type={showPassword ? 'text' : 'password'} name="confirmPassword" id="regConfirmPassword"
                        className="form-control" placeholder="Re-enter password"
                        value={formData.confirmPassword} onChange={handleChange} required
                      />
                    </div>
                  </div>

                  <button type="submit" id="registerSubmitBtn"
                    className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</>
                    ) : 'Create Account →'}
                  </button>
                </form>

                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-semibold text-primary">Sign in →</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
