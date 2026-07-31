const STATUS_CONFIG = {
  Pending: { bg: 'warning', text: 'dark', icon: '⏳' },
  Assigned: { bg: 'info', text: 'white', icon: '📋' },
  'In Progress': { bg: 'primary', text: 'white', icon: '🔄' },
  Resolved: { bg: 'success', text: 'white', icon: '✅' },
  Closed: { bg: 'secondary', text: 'white', icon: '🔒' },
};

const PRIORITY_CONFIG = {
  LOW: { bg: 'success', icon: '🟢' },
  MEDIUM: { bg: 'warning text-dark', icon: '🟡' },
  HIGH: { bg: 'danger', icon: '🔴' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { bg: 'secondary', text: 'white', icon: '❓' };
  return (
    <span className={`badge bg-${config.bg} text-${config.text} status-badge`}>
      {config.icon} {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || { bg: 'secondary', icon: '' };
  return (
    <span className={`badge bg-${config.bg} priority-badge`}>
      {config.icon} {priority}
    </span>
  );
};
