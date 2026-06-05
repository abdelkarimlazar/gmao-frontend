const statusStyles = {
  active: 'success',
  operational: 'success',
  completed: 'success',
  resolved: 'success',
  closed: 'success',

  open: 'warning',
  pending: 'warning',
  inprogress: 'warning',
  'in progress': 'warning',
  assigned: 'warning',

  broken: 'danger',
  failure: 'danger',
  inactive: 'danger',
  cancelled: 'danger',
};

function StatusBadge({ status }) {
  const safeStatus = String(status || 'Non renseigné');
  const normalizedStatus = safeStatus.toLowerCase();
  const tone = statusStyles[normalizedStatus] || 'neutral';

  return (
    <span className={`status-badge status-badge--${tone}`}>
      {safeStatus}
    </span>
  );
}

export default StatusBadge;