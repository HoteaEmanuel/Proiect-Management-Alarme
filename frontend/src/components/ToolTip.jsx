import "../styles/components/ToolTip.css";

const Tooltip = ({ text, children,textSize, ...props }) => {
  return (
    <div className="tooltip" {...props}>
      {children}

      <div className="tooltip-content">
        <span className="tooltip-arrow"></span>
        <span className="tooltip-text" style={ { fontSize:textSize} }>{text}</span>
      </div>
    </div>
  );
};

export default Tooltip;