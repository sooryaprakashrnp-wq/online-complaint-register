import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../../api/adminService';
import { getComplaints } from '../../api/complaintService';
import { getAgents, assignAgent } from '../../api/agentService';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import StatsCard from '../../components/StatsCard';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ show: false, complaintId: null, agentId: '' });
  const [assigning, setAssigning] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, complaintsRes, agentsRes] = await Promise.all([
        getStats(),
        getComplaints(filter ? { status: filter } : {}),
        getAgents(),
      ]);
      setStats(statsRes.data.stats);
      setComplaints(complaintsRes.data.complaints);
      setAgents(agentsRes.data.agents);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAssign = async () => {
    if (!assignModal.agentId) return toast.error('Please select an agent');
    setAssigning(true);
    try {
      const res = await assignAgent({ complaintId: assignModal.complaintId, agentId: assignModal.agentId });
      toast.success(res.data.message);
      setAssignModal({ show: false, complaintId: null, agentId: '' });
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="admin-dashboard py-4">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="page-title mb-1">Admin Dashboard</h1>
            <p className="text-muted mb-0">System overview and complaint management</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/users" className="btn btn-outline-primary btn-sm">👥 Manage Users</Link>
            <Link to="/admin/analytics" className="btn btn-outline-info btn-sm">📊 Analytics</Link>
          </div>
        </div>

        {/* Stats Row */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-xl-2">
                <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" color="blue" />
              </div>
              <div className="col-6 col-xl-2">
                <StatsCard title="Total Agents" value={stats?.totalAgents || 0} icon="🛠️" color="purple" />
              </div>
              <div className="col-6 col-xl-2">
                <StatsCard title="Complaints" value={stats?.totalComplaints || 0} icon="📋" color="orange" />
              </div>
              <div className="col-6 col-xl-2">
                <StatsCard title="Pending" value={stats?.pendingComplaints || 0} icon="⏳" color="red" />
              </div>
              <div className="col-6 col-xl-2">
                <StatsCard title="Resolved" value={stats?.resolvedComplaints || 0} icon="✅" color="green" />
              </div>
              <div className="col-6 col-xl-2">
                <StatsCard title="Avg Rating" value={`${stats?.avgRating || 0} ⭐`} icon="📈" color="yellow" subtitle="From feedback" />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {['', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                <button key={s}
                  className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(s)}>
                  {s || 'All'}
                </button>
              ))}
            </div>

            {/* Complaints Table */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center py-3">
                <h6 className="mb-0 fw-bold">📋 Complaints Management</h6>
                <span className="badge bg-secondary">{complaints.length} records</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" id="adminComplaintsTable">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>User</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Agent</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr><td colSpan="9" className="text-center py-4 text-muted">No complaints found</td></tr>
                      ) : complaints.map((c) => (
                        <tr key={c._id}>
                          <td><code className="small">#{c._id.slice(-6).toUpperCase()}</code></td>
                          <td><div className="fw-semibold small" style={{ maxWidth: '180px' }}>{c.title}</div></td>
                          <td className="small">{c.createdBy?.name}</td>
                          <td><span className="badge bg-light text-dark border small">{c.category}</span></td>
                          <td><PriorityBadge priority={c.priority} /></td>
                          <td><StatusBadge status={c.status} /></td>
                          <td className="small">{c.assignedAgent?.name || <span className="text-muted">Unassigned</span>}</td>
                          <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Link to={`/complaints/${c._id}`} className="btn btn-xs btn-outline-primary">View</Link>
                              {c.status !== 'Closed' && (
                                <button className="btn btn-xs btn-outline-secondary"
                                  id={`assignBtn-${c._id}`}
                                  onClick={() => setAssignModal({ show: true, complaintId: c._id, agentId: c.assignedAgent?._id || '' })}>
                                  {c.assignedAgent ? 'Reassign' : 'Assign'}
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
          </>
        )}
      </div>

      {/* Assign Agent Modal */}
      {assignModal.show && (
        <div className="modal-overlay" onClick={() => setAssignModal({ show: false, complaintId: null, agentId: '' })}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="card p-4">
              <h5 className="fw-bold mb-3">🛠️ Assign Agent</h5>
              <p className="text-muted small mb-3">Select an agent to handle this complaint:</p>
              <select id="agentSelectModal" className="form-select mb-4"
                value={assignModal.agentId}
                onChange={(e) => setAssignModal({ ...assignModal, agentId: e.target.value })}>
                <option value="">-- Select Agent --</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                ))}
              </select>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-fill" onClick={handleAssign} disabled={assigning} id="confirmAssignBtn">
                  {assigning ? 'Assigning...' : 'Confirm Assign'}
                </button>
                <button className="btn btn-outline-secondary"
                  onClick={() => setAssignModal({ show: false, complaintId: null, agentId: '' })}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
