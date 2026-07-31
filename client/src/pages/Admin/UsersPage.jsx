import { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../../api/adminService';
import { toast } from 'react-toastify';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const res = await getAllUsers(params);
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateUser(editModal.user._id, {
        role: editModal.user.role,
        isActive: editModal.user.isActive,
      });
      toast.success('User updated successfully');
      setEditModal({ show: false, user: null });
      await fetchUsers();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeleting(userId);
    try {
      await deleteUser(userId);
      toast.success('User deleted');
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { USER: 'primary', AGENT: 'info', ADMIN: 'danger' };

  return (
    <div className="users-page py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="page-title mb-1">User Management</h1>
            <p className="text-muted mb-0">Manage all platform users and their roles</p>
          </div>
          <span className="badge bg-secondary fs-6">{users.length} total users</span>
        </div>

        {/* Filters */}
        <div className="filter-bar card mb-4">
          <div className="card-body py-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-4">
                <input type="text" id="userSearch" className="form-control form-control-sm"
                  placeholder="🔍 Search by name or email..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="col-md-3">
                <select id="roleFilterSelect" className="form-select form-select-sm"
                  value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="USER">User</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" id="usersTable">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-4 text-muted">No users found</td></tr>
                    ) : filtered.map((u, i) => (
                      <tr key={u._id}>
                        <td className="text-muted small">{i + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>
                            <span className="fw-semibold small">{u.name}</span>
                          </div>
                        </td>
                        <td className="small text-muted">{u.email}</td>
                        <td className="small">{u.phone || '—'}</td>
                        <td>
                          <span className={`badge bg-${roleColor[u.role] || 'secondary'}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {u.isActive ? '● Active' : '● Inactive'}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-xs btn-outline-primary"
                              id={`editUser-${u._id}`}
                              onClick={() => setEditModal({ show: true, user: { ...u } })}>
                              Edit
                            </button>
                            {u.role !== 'ADMIN' && (
                              <button className="btn btn-xs btn-outline-danger"
                                id={`deleteUser-${u._id}`}
                                onClick={() => handleDelete(u._id)}
                                disabled={deleting === u._id}>
                                {deleting === u._id ? '...' : 'Del'}
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

      {/* Edit User Modal */}
      {editModal.show && (
        <div className="modal-overlay" onClick={() => setEditModal({ show: false, user: null })}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="card p-4">
              <h5 className="fw-bold mb-1">✏️ Edit User</h5>
              <p className="text-muted small mb-4">{editModal.user?.email}</p>

              <div className="mb-3">
                <label className="form-label fw-semibold">Role</label>
                <select id="editRoleSelect" className="form-select"
                  value={editModal.user?.role}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, role: e.target.value } })}>
                  <option value="USER">USER</option>
                  <option value="AGENT">AGENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Account Status</label>
                <select id="editStatusSelect" className="form-select"
                  value={editModal.user?.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditModal({ ...editModal, user: { ...editModal.user, isActive: e.target.value === 'true' } })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-fill" id="saveUserBtn" onClick={handleUpdate} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => setEditModal({ show: false, user: null })}>
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

export default UsersPage;
