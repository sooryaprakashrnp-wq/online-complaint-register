import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitFeedback, getFeedback } from '../api/feedbackService';
import { getComplaint } from '../api/complaintService';
import { toast } from 'react-toastify';

const FeedbackPage = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes] = await Promise.all([
          getComplaint(complaintId),
        ]);
        setComplaint(compRes.data.complaint);

        // Check if feedback already submitted
        try {
          const fbRes = await getFeedback(complaintId);
          setExisting(fbRes.data.feedback);
        } catch {
          // No existing feedback - fine
        }
      } catch {
        toast.error('Complaint not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [complaintId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await submitFeedback({ complaintId, rating, comment });
      toast.success('Feedback submitted! Thank you 🙏');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="feedback-page py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {existing ? (
              <div className="feedback-card card text-center p-5">
                <div className="mb-3" style={{ fontSize: '60px' }}>✅</div>
                <h3>Feedback Already Submitted</h3>
                <p className="text-muted">You've already rated this complaint.</p>
                <div className="my-3">
                  <div style={{ fontSize: '32px' }}>{'⭐'.repeat(existing.rating)}</div>
                  <p className="mt-2 fst-italic">"{existing.comment}"</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                  ← Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="feedback-card card">
                <div className="card-body p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div style={{ fontSize: '48px' }} className="mb-2">⭐</div>
                    <h2 className="auth-title">Rate Your Experience</h2>
                    <p className="text-muted small">How was your experience resolving this complaint?</p>
                  </div>

                  {complaint && (
                    <div className="complaint-preview p-3 rounded mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{complaint.title}</div>
                          <small className="text-muted">{complaint.category}</small>
                        </div>
                        <span className="badge bg-success">✅ Resolved</span>
                      </div>
                      {complaint.assignedAgent && (
                        <div className="mt-2 small text-muted">
                          Handled by: <strong>{complaint.assignedAgent.name}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} id="feedbackForm">
                    <div className="mb-4 text-center">
                      <label className="form-label fw-semibold d-block mb-3">Your Rating *</label>
                      <div className="star-rating d-flex justify-content-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            id={`star-${star}`}
                            className={`star-btn ${star <= (hovered || rating) ? 'active' : ''}`}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <div className="mt-2 text-muted small">
                          {['', 'Poor 😞', 'Fair 😐', 'Good 😊', 'Very Good 😄', 'Excellent 🤩'][rating]}
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Comment <span className="text-muted">(optional)</span></label>
                      <textarea
                        id="feedbackComment"
                        className="form-control"
                        rows={4}
                        placeholder="Tell us about your experience. What went well? What could be improved?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                      />
                      <small className="text-muted">{comment.length}/500</small>
                    </div>

                    <button type="submit" id="submitFeedbackBtn"
                      className="btn btn-success w-100 py-2 fw-semibold" disabled={submitting}>
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                      ) : '🙏 Submit Feedback'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
