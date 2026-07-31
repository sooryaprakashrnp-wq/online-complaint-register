import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getComplaints } from '../../api/complaintService';
import ComplaintCard from '../../components/ComplaintCard';
import StatsCard from '../../components/StatsCard';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      const res = await getComplaints(params);
      const data = res.data.complaints;
      setComplaints(data);
      setStats({
        total: data.length,
        pending: data.filter((c) => c.status === 'Pending').length,
        inProgress: data.filter((c) => c.status === 'In Progress').length,
        resolved: data.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
      });
    } catch (err) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  return (
    <div className="dashboard-page py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="page-title mb-1">My Dashboard</h1>
            <p className="text-muted mb-0">Welcome back, <strong>{user?.name}</strong> 👋</p>
          </div>
          <Link to="/complaints/new" className="btn btn-primary" id="newComplaintBtn">
            + New Complaint
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatsCard title="Total" value={stats.total} icon="📋" color="blue" />
          </div>
          <div className="col-6 col-md-3">
            <StatsCard title="Pending" value={stats.pending} icon="⏳" color="orange" />
          </div>
          <div className="col-6 col-md-3">
            <StatsCard title="In Progress" value={stats.inProgress} icon="🔄" color="purple" />
          </div>
          <div className="col-6 col-md-3">
            <StatsCard title="Resolved" value={stats.resolved} icon="✅" color="green" />
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar card mb-4">
          <div className="card-body py-3">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-auto">
                <label className="form-label mb-0 fw-semibold small">Filter by:</label>
              </div>
              <div className="col-6 col-md-3">
                <select id="statusFilter" className="form-select form-select-sm"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                  <option value="">All Status</option>
                  <option>Pending</option>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
              <div className="col-6 col-md-3">
                <select id="categoryFilter" className="form-select form-select-sm"
                  value={filter.category}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                  <option value="">All Categories</option>
                  <option>Network</option>
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Billing</option>
                  <option>Service</option>
                  <option>Other</option>
                </select>
              </div>
              {(filter.status || filter.category) && (
                <div className="col-auto">
                  <button className="btn btn-outline-secondary btn-sm"
                    onClick={() => setFilter({ status: '', category: '' })}>
                    Clear ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state text-center py-5">
            <div className="empty-icon">📭</div>
            <h5>No complaints found</h5>
            <p className="text-muted">You haven't submitted any complaints yet.</p>
            <Link to="/complaints/new" className="btn btn-primary">Submit Your First Complaint</Link>
          </div>
        ) : (
          <div className="row g-3">
            {complaints.map((c) => (
              <div key={c._id} className="col-md-6 col-lg-4">
                <ComplaintCard complaint={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
