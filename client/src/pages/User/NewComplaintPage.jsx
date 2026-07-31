import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../../api/complaintService';
import { toast } from 'react-toastify';

const CATEGORIES = ['Network', 'Hardware', 'Software', 'Billing', 'Service', 'Other'];
const PRIORITIES = [
  { value: 'LOW', label: '🟢 Low', desc: 'Minor issue, not urgent' },
  { value: 'MEDIUM', label: '🟡 Medium', desc: 'Moderate impact' },
  { value: 'HIGH', label: '🔴 High', desc: 'Critical, needs immediate attention' },
];

const NewComplaintPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', priority: 'MEDIUM',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) return toast.error('Max 5 files allowed');
    setFiles(selected);
  };

  const validateStep1 = () => {
    if (!formData.category) return toast.error('Please select a category') || false;
    if (!formData.priority) return toast.error('Please select a priority') || false;
    return true;
  };

  const validateStep2 = () => {
    if (!formData.title.trim()) return toast.error('Title is required') || false;
    if (!formData.description.trim()) return toast.error('Description is required') || false;
    if (formData.description.length < 20) return toast.error('Description must be at least 20 characters') || false;
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      files.forEach((f) => data.append('attachments', f));

      await createComplaint(data);
      toast.success('Complaint submitted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-complaint-page py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="mb-4">
              <h1 className="page-title mb-1">Submit New Complaint</h1>
              <p className="text-muted">Fill in the details below to register your complaint</p>
            </div>

            {/* Progress Steps */}
            <div className="step-progress mb-4">
              {['Category & Priority', 'Complaint Details', 'Attachments & Review'].map((label, i) => (
                <div key={i} className={`step-item ${step > i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
                  <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                  <div className="step-label">{label}</div>
                  {i < 2 && <div className="step-connector"></div>}
                </div>
              ))}
            </div>

            <div className="form-card card">
              <div className="card-body p-4">
                {/* Step 1: Category & Priority */}
                {step === 1 && (
                  <div id="step1">
                    <h5 className="mb-4">Step 1: Select Category & Priority</h5>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Category *</label>
                      <div className="row g-2">
                        {CATEGORIES.map((cat) => (
                          <div key={cat} className="col-6 col-md-4">
                            <div
                              className={`category-option ${formData.category === cat ? 'selected' : ''}`}
                              onClick={() => setFormData({ ...formData, category: cat })}
                            >
                              <div className="cat-icon">
                                {cat === 'Network' ? '🌐' : cat === 'Hardware' ? '🖥️' : cat === 'Software' ? '💻' :
                                  cat === 'Billing' ? '💳' : cat === 'Service' ? '🛠️' : '📁'}
                              </div>
                              <span>{cat}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Priority *</label>
                      <div className="row g-2">
                        {PRIORITIES.map((p) => (
                          <div key={p.value} className="col-12 col-md-4">
                            <div
                              className={`priority-option ${formData.priority === p.value ? 'selected' : ''}`}
                              onClick={() => setFormData({ ...formData, priority: p.value })}
                            >
                              <div className="fw-semibold">{p.label}</div>
                              <small className="text-muted">{p.desc}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Title & Description */}
                {step === 2 && (
                  <div id="step2">
                    <h5 className="mb-4">Step 2: Complaint Details</h5>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Title *</label>
                      <input
                        type="text" name="title" id="complaintTitle" className="form-control"
                        placeholder="Brief title for your complaint (e.g., Internet Not Working)"
                        value={formData.title} onChange={handleChange} maxLength={100}
                      />
                      <small className="text-muted">{formData.title.length}/100 characters</small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Description *</label>
                      <textarea
                        name="description" id="complaintDesc" className="form-control"
                        rows={6} placeholder="Describe your issue in detail. Include when it started, what you've tried, and any error messages..."
                        value={formData.description} onChange={handleChange}
                      />
                      <small className="text-muted">{formData.description.length} characters (min. 20)</small>
                    </div>
                    <div className="review-summary p-3 rounded">
                      <strong>Summary: </strong>
                      <span className="badge bg-info me-2">{formData.category}</span>
                      <span className={`badge bg-${formData.priority === 'HIGH' ? 'danger' : formData.priority === 'MEDIUM' ? 'warning text-dark' : 'success'}`}>
                        {formData.priority}
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 3: Attachments & Review */}
                {step === 3 && (
                  <div id="step3">
                    <h5 className="mb-4">Step 3: Attachments & Review</h5>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Attachments <span className="text-muted">(optional, max 5 files, 5MB each)</span></label>
                      <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
                        <input type="file" id="fileInput" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          onChange={handleFileChange} className="d-none" />
                        <div className="upload-icon">📎</div>
                        <p className="mb-1">Click to upload files</p>
                        <small className="text-muted">Images, PDF, DOC supported</small>
                      </div>
                      {files.length > 0 && (
                        <div className="mt-2">
                          {files.map((f, i) => (
                            <div key={i} className="file-item d-flex align-items-center gap-2 mb-1">
                              <span>📄</span>
                              <span className="small">{f.name}</span>
                              <span className="text-muted small">({(f.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="review-card p-4 rounded">
                      <h6 className="fw-bold mb-3">📋 Review Your Complaint</h6>
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr><td className="text-muted fw-semibold" style={{width:'120px'}}>Category</td><td>{formData.category}</td></tr>
                          <tr><td className="text-muted fw-semibold">Priority</td><td>{formData.priority}</td></tr>
                          <tr><td className="text-muted fw-semibold">Title</td><td>{formData.title}</td></tr>
                          <tr><td className="text-muted fw-semibold">Description</td><td className="small">{formData.description}</td></tr>
                          <tr><td className="text-muted fw-semibold">Files</td><td>{files.length} file(s) attached</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-outline-secondary" onClick={() => setStep(step - 1)}
                    disabled={step === 1}>
                    ← Back
                  </button>
                  {step < 3 ? (
                    <button className="btn btn-primary" id={`nextStep${step}Btn`} onClick={handleNext}>
                      Next →
                    </button>
                  ) : (
                    <button className="btn btn-success" id="submitComplaintBtn" onClick={handleSubmit} disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : '✅ Submit Complaint'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewComplaintPage;
