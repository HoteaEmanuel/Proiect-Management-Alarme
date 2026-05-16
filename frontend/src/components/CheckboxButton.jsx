import { FaCheck } from "react-icons/fa";
import "../styles/components/CheckboxButton.css";

const CheckboxButton = ({ label, checked, onChange }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className="checkbox-button"
    >
      <span
        className={`checkbox-button-box ${
          checked ? "checkbox-button-box-checked" : ""
        }`}
      >
        {checked && <FaCheck className="checkbox-button-icon" />}
      </span>

      {label}
    </button>
  );
};

export default CheckboxButton;