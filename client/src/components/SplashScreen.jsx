import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen d-flex flex-column justify-content-center align-items-center min-vh-100 position-fixed top-0 start-0 w-100 text-center" style={{ backgroundColor: '#0f172a', zIndex: 9999 }}>
      <div className="splash-glow position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(40px)', animation: 'pulse 2s infinite' }}></div>
      
      <div className="splash-content position-relative z-1">
        <div className="splash-logo-badge mb-4 d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle shadow-lg" style={{ width: '100px', height: '100px', fontSize: '50px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', boxShadow: '0 0 30px rgba(79, 70, 229, 0.6)' }}>
          🎯
        </div>
        <h1 className="fw-bold text-white mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
          ComplaintHub
        </h1>
        <p className="text-white-50 lead mb-4" style={{ fontSize: '1.1rem' }}>
          Online Complaint Registration & Management System
        </p>

        <div className="spinner-border text-primary mt-2" role="status" style={{ width: '2rem', height: '2rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
