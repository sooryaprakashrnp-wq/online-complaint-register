import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'AGENT') return '/agent/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" id="mainNavbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to={getDashboardLink()}>
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">ComplaintHub</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to={getDashboardLink()}>Dashboard</Link>
              </li>
            )}
            {user?.role === 'USER' && (
              <li className="nav-item">
                <Link className="nav-link" to="/complaints/new">New Complaint</Link>
              </li>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">Users</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/analytics">Analytics</Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="user-badge d-flex align-items-center gap-2">
                  <div className="avatar-circle">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="d-none d-md-block">
                    <div className="user-name">{user.name}</div>
                    <div className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</div>
                  </div>
                </div>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
