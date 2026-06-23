import { formatDuration } from "@features/dashboard/lib/formatDuration";
import useCountUp from "@hooks/useCountUp";
import "@styles/features/dashboard/components/StatCard.css";

const StatCard = ({ label, value, unit = false, active }) => {
  const animatedValue = useCountUp(value);
  const formatted = unit ? formatDuration(Math.round(animatedValue)) : null;

  const renderStyledDuration = (durationStr) => {
    if (!durationStr) return null;

    return durationStr.split(" ").map((part, index, arr) => {
      const number = part.replace(/[a-z]/g, ""); // Extrage doar cifrele
      const unitLetter = part.replace(/[0-9]/g, ""); // Extrage doar litera

      return (
        <span key={index} className="stat-card-duration-part">
          {number}
          <span className="stat-card-duration-unit stat-card-unit" >
            {unitLetter}
          </span>
    
          {index < arr.length - 1 ? " " : ""}
        </span>
      );
    });
  };

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
        {unit ? (
          <span className="stat-card-value">
            {renderStyledDuration(formatted)}
          </span>
        ) : (
          <span className="stat-card-value">{Math.round(animatedValue)}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;