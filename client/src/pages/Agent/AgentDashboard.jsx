import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAgentDashboard } from '../../api/agentService';
import { updateComplaint } from '../../api/complaintService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import StatsCard from '../../components/StatsCard';
import { toast } from 'react-toastify';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: {}, complaints: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getAgentDashboard();
      setData({
        stats: res.data?.stats || {},
        complaints: res.data?.complaints || [],
      });
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateComplaint(complaintId, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      await fetchData();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter
    ? data.complaints.filter((c) => c.status === filter)
    : data.complaints;

  return (
    <div className="agent-dashboard py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="page-title mb-1">Agent Dashboard</h1>
            <p className="text-muted mb-0">Welcome, <strong>{user?.name}</strong> 🛠️</p>
          </div>
          <span className="badge bg-info fs-6 px-3 py-2">Agent Panel</span>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatsCard title="Total Assigned" value={data.stats.total || 0} icon="📋" color="blue" />
          </div>
          <div className="col-6 col-md-3">
            <StatsCard title="New/Assigned" value={data.stats.pending || 0} icon="📥" color="orange" />
          </div>
          <div className="col-6 col-md-3">
            <StatsCard title="In Progress" value={data.stats.inProgress || 0} icon="🔄" color="purple" />
          </div>
          <div className="col-6 col-md-3">
            <StatsCard title="Resolved" value={data.stats.resolved || 0} icon="✅" color="green" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs mb-4 d-flex gap-2 flex-wrap">
          {['', 'Assigned', 'In Progress', 'Resolved'].map((s) => (
            <button key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s || 'All'} {!s && `(${data.complaints.length})`}
              {s === 'Assigned' && ` (${data.stats.pending || 0})`}
              {s === 'In Progress' && ` (${data.stats.inProgress || 0})`}
              {s === 'Resolved' && ` (${data.stats.resolved || 0})`}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state text-center py-5">
            <div className="empty-icon">📭</div>
            <h5>No complaints found</h5>
            <p className="text-muted">No complaints assigned to you yet.</p>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" id="agentComplaintsTable">
                  <thead className="table-dark">
                    <tr>
                      <th>Complaint</th>
                      <th>User</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div className="fw-semibold small">{c.title}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>#{c._id.slice(-6).toUpperCase()}</div>
                        </td>
                        <td className="small">{c.createdBy?.name}</td>
                        <td><span className="badge bg-light text-dark border">{c.category}</span></td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <Link to={`/complaints/${c._id}`} className="btn btn-xs btn-outline-primary">
                              View
                            </Link>
                            {c.status === 'Assigned' && (
                              <button className="btn btn-xs btn-warning"
                                onClick={() => handleStatusUpdate(c._id, 'In Progress')}
                                disabled={updatingId === c._id}>
                                {updatingId === c._id ? '...' : 'Start'}
                              </button>
                            )}
                            {c.status === 'In Progress' && (
                              <button className="btn btn-xs btn-success"
                                onClick={() => handleStatusUpdate(c._id, 'Resolved')}
                                disabled={updatingId === c._id}>
                                {updatingId === c._id ? '...' : 'Resolve'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
