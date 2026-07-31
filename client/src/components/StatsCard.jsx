const StatsCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className="stats-card card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="stats-label text-muted mb-1">{title}</p>
            <h2 className="stats-value">{value}</h2>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`stats-icon stats-icon-${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
