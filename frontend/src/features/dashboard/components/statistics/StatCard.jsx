import "@styles/features/dashboard/components/StatCard.css";

const StatCard = ({ label, value, unit, active }) => {

  return (
    <div className="stat-card">
      <div className="stat-card-label-row">
        <p className="stat-card-label">{label}</p>

        {active && (
          <span className="stat-card-active-status">
            <span className="stat-card-active-pulse"></span>
            <span className="stat-card-active-dot"></span>
          </span>
        )}
      </div>

      <div className="stat-card-value-row">
        <span className="stat-card-value">{value}</span>

        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;