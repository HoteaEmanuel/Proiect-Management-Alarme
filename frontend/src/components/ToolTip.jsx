import "../styles/components/ToolTip.css";

const Tooltip = ({ text, children, ...props }) => {
  return (
    <div className="tooltip" {...props}>
      {children}

      <div className="tooltip-content">
        <span className="tooltip-arrow"></span>
        <span className="tooltip-text">{text}</span>
      </div>
    </div>
  );
};

export default Tooltip;