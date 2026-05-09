import { FaCheck } from "react-icons/fa";

const CheckboxButton = ({ label, checked, onChange }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className='inline-flex items-center gap-1.5 rounded-md text-sm transition-all'
  >
    <span
      className={`w-3 h-3 rounded-sm border-[1.5px] flex items-center justify-center flex-shrink-0
       ${checked ? "bg-gray-100 border-gray-100" : "border-current"}`}
    >
      {checked && (
        <FaCheck className="size-4 text-gray-900"/>
      )}
    </span>
    {label}
  </button>
);

export default CheckboxButton;
