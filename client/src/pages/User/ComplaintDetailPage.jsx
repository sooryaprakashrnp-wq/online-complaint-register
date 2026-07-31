import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getComplaint, addMessage, updateComplaint, addInternalNote } from '../../api/complaintService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const STATUS_FLOW = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const chatEndRef = useRef(null);

  const fetchComplaint = async () => {
    try {
      const res = await getComplaint(id);
      setComplaint(res.data.complaint);
    } catch (err) {
      toast.error('Failed to load complaint');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaint(); }, [id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [complaint?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSendingMsg(true);
    try {
      const res = await addMessage(id, message);
      setComplaint((prev) => ({ ...prev, messages: res.data.messages }));
      setMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateComplaint(id, { status: newStatus });
      setComplaint((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;
    setSendingNote(true);
    try {
      const res = await addInternalNote(id, internalNoteText);
      setComplaint((prev) => ({ ...prev, internalNotes: res.data.internalNotes }));
      setInternalNoteText('');
      toast.success('Internal note added');
    } catch {
      toast.error('Failed to add internal note');
    } finally {
      setSendingNote(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary"></div>
    </div>
  );

  if (!complaint) return null;

  const currentStatusIdx = STATUS_FLOW.indexOf(complaint.status);
  const isOverdue = complaint.slaDueDate && new Date(complaint.slaDueDate) < new Date() && complaint.status !== 'Resolved' && complaint.status !== 'Closed';

  return (
    <div className="complaint-detail-page py-4">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to={user?.role === 'AGENT' ? '/agent/dashboard' : '/dashboard'}>Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Complaint #{id.slice(-6).toUpperCase()}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Left Column - Complaint Info */}
          <div className="col-lg-8">
            {/* Header Card */}
            <div className="detail-card card mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <h2 className="complaint-detail-title mb-1">{complaint.title}</h2>
                    <div className="d-flex gap-2 flex-wrap align-items-center">
                      <span className="badge bg-light text-dark border">{complaint.category}</span>
                      <PriorityBadge priority={complaint.priority} />
                      {isOverdue ? (
                        <span className="badge bg-danger">⚠️ Overdue SLA</span>
                      ) : complaint.slaDueDate ? (
                        <span className="badge bg-light text-secondary border">⏱️ SLA: {new Date(complaint.slaDueDate).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      ) : null}
                    </div>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                <p className="complaint-description">{complaint.description}</p>

                <div className="complaint-meta row g-2">
                  <div className="col-6 col-md-3">
                    <small className="text-muted d-block">Submitted by</small>
                    <span className="fw-semibold small">{complaint.createdBy?.name}</span>
                  </div>
                  <div className="col-6 col-md-3">
                    <small className="text-muted d-block">Date</small>
                    <span className="fw-semibold small">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="col-6 col-md-3">
                    <small className="text-muted d-block">Assigned Agent</small>
                    <span className="fw-semibold small">{complaint.assignedAgent?.name || '—'}</span>
                  </div>
                  {complaint.resolvedAt && (
                    <div className="col-6 col-md-3">
                      <small className="text-muted d-block">Resolved On</small>
                      <span className="fw-semibold small">{new Date(complaint.resolvedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {complaint.attachments?.length > 0 && (
                  <div className="mt-3">
                    <small className="text-muted fw-semibold">Attachments:</small>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {complaint.attachments.map((a, i) => (
                        <a key={i} href={`http://localhost:5000/${a.path}`} target="_blank" rel="noreferrer"
                          className="attachment-chip">
                          📎 {a.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update (Agent/Admin) */}
            {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
              <div className="card mb-4">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3">🔄 Update Status</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {['In Progress', 'Resolved', 'Closed'].map((s) => (
                      <button key={s}
                        className={`btn btn-sm ${complaint.status === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handleStatusChange(s)}
                        disabled={updatingStatus || complaint.status === s}
                      >
                        {updatingStatus ? '...' : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Button (User, Resolved) */}
            {user?.role === 'USER' && complaint.status === 'Resolved' && (
              <div className="card mb-4 border-success">
                <div className="card-body p-4 text-center">
                  <div className="mb-2">⭐</div>
                  <h6>Complaint Resolved!</h6>
                  <p className="text-muted small">Please share your feedback to help us improve.</p>
                  <Link to={`/feedback/${complaint._id}`} className="btn btn-success" id="giveFeedbackBtn">
                    Give Feedback
                  </Link>
                </div>
              </div>
            )}

            {/* Chat Section */}
            <div className="chat-card card">
              <div className="card-header py-3">
                <h6 className="mb-0 fw-bold">💬 Messages ({complaint.messages?.length || 0})</h6>
              </div>
              <div className="chat-messages" id="chatMessages">
                {complaint.messages?.length === 0 ? (
                  <div className="text-center text-muted py-4 small">No messages yet. Start the conversation!</div>
                ) : (
                  complaint.messages.map((msg, i) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                    return (
                      <div key={i} className={`message-bubble ${isMe ? 'message-me' : 'message-other'}`}>
                        <div className="message-meta">
                          <span className="fw-semibold">{msg.senderName || 'Unknown'}</span>
                          <span className={`ms-1 badge bg-light text-dark border small`}>{msg.senderRole}</span>
                          <span className="ms-2 text-muted" style={{ fontSize: '11px' }}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="message-text">{msg.text}</div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              {complaint.status !== 'Closed' && (
                <div className="card-footer p-3">
                  <form onSubmit={handleSendMessage} id="chatForm" className="d-flex gap-2">
                    <input
                      type="text" id="chatInput" className="form-control"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" id="sendMessageBtn" className="btn btn-primary px-3" disabled={sendingMsg}>
                      {sendingMsg ? '...' : '➤'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Internal Notes Section (AGENT & ADMIN ONLY) */}
            {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
              <div className="card mt-4 border-warning">
                <div className="card-header bg-warning bg-opacity-10 py-3">
                  <h6 className="mb-0 fw-bold text-dark">🔒 Internal Notes (Visible to Agents & Admins Only)</h6>
                </div>
                <div className="card-body p-3">
                  {complaint.internalNotes?.length === 0 ? (
                    <p className="text-muted small mb-3">No internal notes added yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2 mb-3">
                      {complaint.internalNotes?.map((note, idx) => (
                        <div key={idx} className="p-2 rounded bg-light border">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold small">{note.authorName}</span>
                            <small className="text-muted" style={{ fontSize: '11px' }}>
                              {new Date(note.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </div>
                          <p className="mb-0 small text-secondary">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAddInternalNote} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Add private note for agents/admins..."
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-sm btn-warning" disabled={sendingNote}>
                      {sendingNote ? '...' : 'Add Note'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status Timeline */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '80px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-4">📍 Status Timeline</h6>
                <div className="timeline-vertical">
                  {STATUS_FLOW.map((s, i) => (
                    <div key={s} className={`timeline-v-item ${i <= currentStatusIdx ? 'done' : ''} ${i === currentStatusIdx ? 'current' : ''}`}>
                      <div className="timeline-v-dot"></div>
                      {i < STATUS_FLOW.length - 1 && <div className="timeline-v-line"></div>}
                      <div className="timeline-v-content">
                        <div className="fw-semibold small">{s}</div>
                        {i === currentStatusIdx && <div className="text-muted" style={{ fontSize: '11px' }}>Current Status</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailPage;
