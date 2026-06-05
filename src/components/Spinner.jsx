function Spinner({ label = 'Chargement' }) {
  return (
    <span
      className="spinner-wrap"
      aria-label={label}
      role="status"
    >
      <span
        className="spinner"
        aria-hidden="true"
      />

      <span className="spinner__label">
        {label}
      </span>
    </span>
  );
}

export default Spinner;