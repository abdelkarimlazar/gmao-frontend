function DashboardChart({ items = [] }) {
  const maxValue = Math.max(
    ...items.map((item) => item.value),
    1
  );

  return (
    <div className="dashboard-chart">
      {items.map((item) => {
        const percentage = Math.max(
          8,
          (item.value / maxValue) * 100
        );

        return (
          <div
            key={item.label}
            className="dashboard-chart__row"
          >
            <div className="dashboard-chart__meta">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>

            <div className="dashboard-chart__track">
              <div
                className="dashboard-chart__bar"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardChart;