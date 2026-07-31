import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './StatusBadge';

const ComplaintCard = ({ complaint }) => {
  const date = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="complaint-card card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="complaint-category">{complaint.category}</span>
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h5 className="complaint-title card-title">{complaint.title}</h5>
        <p className="card-text text-muted small line-clamp-2">{complaint.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <StatusBadge status={complaint.status} />
          <small className="text-muted">{date}</small>
        </div>
        {complaint.assignedAgent && (
          <div className="mt-2 small">
            <span className="text-muted">Agent: </span>
            <span className="fw-semibold">{complaint.assignedAgent.name}</span>
          </div>
        )}
      </div>
      <div className="card-footer bg-transparent border-0 pt-0">
        <Link to={`/complaints/${complaint._id}`} className="btn btn-sm btn-outline-primary w-100">
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
