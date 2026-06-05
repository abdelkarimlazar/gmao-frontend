function EmptyState({
  title = 'Aucune donnée',
  text = 'Aucune information disponible pour le moment.',
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__panel">
        <h3 className="empty-state__title">
          {title}
        </h3>

        <p className="empty-state__text">
          {text}
        </p>
      </div>
    </div>
  );
}

export default EmptyState;