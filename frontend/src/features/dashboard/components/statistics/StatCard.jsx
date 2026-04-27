import '@styles/features/dashboard/components/StatCard.css';

const StatCard = ({ label, value, unit }) => {

  return (
    <div className="stat-card">

      <p className="stat-card-label">{label}</p>

      <div className="stat-card-value-row">
        <span className="stat-card-value">
          {value}
        </span>
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>

    </div>
  )
}

export default StatCard;
