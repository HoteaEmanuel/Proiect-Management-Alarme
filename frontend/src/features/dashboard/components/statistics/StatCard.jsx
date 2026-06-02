import { formatDuration } from "@features/dashboard/lib/formatDuration";
import "@styles/features/dashboard/components/StatCard.css";

const StatCard = ({ label, value, unit = false, active }) => {
  const formatted = unit ? formatDuration(value) : null;

  // Funcție ajutătoare care separă cifrele de litere și colorează doar literele
  const renderStyledDuration = (durationStr) => {
    if (!durationStr) return null;

    return durationStr.split(" ").map((part, index, arr) => {
      const number = part.replace(/[a-z]/g, ""); // Extrage doar cifrele (ex: "5")
      const unitLetter = part.replace(/[0-9]/g, ""); // Extrage doar litera (ex: "h")

      return (
        <span key={index} className="stat-card-duration-part">
          {number}
          <span className="stat-card-duration-unit stat-card-unit" >
            {unitLetter}
          </span>
          {/* Adăugăm spațiul înapoi între grupuri, mai puțin după ultimul */}
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
        {/* Dacă unit e true, afișăm durata stilizată. Dacă nu, valoarea simplă */}
        {unit ? (
          <span className="stat-card-value">
            {renderStyledDuration(formatted)}
          </span>
        ) : (
          <span className="stat-card-value">{value}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;