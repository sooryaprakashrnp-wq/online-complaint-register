import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📝', title: 'Easy Registration', desc: 'Submit complaints quickly with category, priority, and attachments.' },
  { icon: '📊', title: 'Real-time Tracking', desc: 'Track your complaint status from Pending to Resolved in real time.' },
  { icon: '💬', title: 'Agent Chat', desc: 'Communicate directly with your assigned agent for quick resolution.' },
  { icon: '⭐', title: 'Feedback System', desc: 'Rate your experience and help us improve service quality.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication and bcrypt encryption protect your data.' },
  { icon: '📈', title: 'Admin Analytics', desc: 'Comprehensive dashboard with charts, stats, and performance insights.' },
];

const steps = [
  { step: '01', title: 'Register & Login', desc: 'Create your account and securely log in to the platform.' },
  { step: '02', title: 'Submit Complaint', desc: 'Fill in complaint details with category, priority, and attachments.' },
  { step: '03', title: 'Agent Assignment', desc: 'Admin assigns a skilled agent to resolve your complaint.' },
  { step: '04', title: 'Track & Communicate', desc: 'Monitor progress and chat with your agent in real time.' },
  { step: '05', title: 'Resolution & Feedback', desc: 'Get your issue resolved and rate the experience.' },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-glow hero-glow-1"></div>
        <div className="hero-bg-glow hero-glow-2"></div>
        <div className="container">
          <div className="row align-items-center min-vh-85">
            <div className="col-lg-6">
              <div className="hero-badge mb-3">
                <span>🚀 MERN Stack Platform</span>
              </div>
              <h1 className="hero-title">
                Smart Complaint
                <span className="hero-highlight"> Management</span>
                <br />System
              </h1>
              <p className="hero-subtitle">
                A centralized platform to register, track, and resolve complaints efficiently.
                Connect users with skilled agents for transparent issue resolution.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {user ? (
                  <Link
                    to={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'AGENT' ? '/agent/dashboard' : '/dashboard'}
                    className="btn btn-primary btn-lg hero-btn"
                  >
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg hero-btn">
                      Get Started Free
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              <div className="hero-stats mt-4 d-flex gap-4 flex-wrap">
                <div className="hero-stat"><strong>3</strong> <span>User Roles</span></div>
                <div className="hero-stat"><strong>5</strong> <span>Status Stages</span></div>
                <div className="hero-stat"><strong>6</strong> <span>Categories</span></div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <div className="hero-illustration">
                <div className="floating-card card-1">
                  <div className="fc-dot fc-green"></div>
                  <span>Complaint Resolved ✅</span>
                </div>
                <div className="floating-card card-2">
                  <div className="fc-dot fc-blue"></div>
                  <span>Agent Assigned 👤</span>
                </div>
                <div className="floating-card card-3">
                  <div className="fc-dot fc-orange"></div>
                  <span>In Progress 🔄</span>
                </div>
                <div className="hero-circle">
                  <div className="hero-icon-large">🎯</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">A complete complaint management solution built with the MERN stack</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="feature-card card h-100">
                  <div className="card-body">
                    <div className="feature-icon">{f.icon}</div>
                    <h5 className="feature-title">{f.title}</h5>
                    <p className="text-muted small">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Five simple steps from submission to resolution</p>
          </div>
          <div className="timeline">
            {steps.map((s, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <div className="step-number">{s.step}</div>
                  <h5>{s.title}</h5>
                  <p className="text-muted small mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container text-center">
          <div className="cta-card">
            <h2>Ready to Resolve Your Issues?</h2>
            <p className="text-muted mb-4">Join thousands of users who trust our platform for efficient complaint resolution.</p>
            {!user && (
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-4">
        <div className="container text-center">
          <p className="text-muted mb-0">© 2024 ComplaintHub. Built with MERN Stack ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
