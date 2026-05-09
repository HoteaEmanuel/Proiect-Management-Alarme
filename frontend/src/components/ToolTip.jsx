const Tooltip = ({ text, children, ...props }) => (
  <div className="group relative inline-flex" {...props}>
    {children}
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50
                 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap
                 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150
                 shadow-lg"
    >
      {/* Arrow */}
      <span
        className="absolute -top-1 left-1/2 -translate-x-1/2
                   w-2 h-2 bg-gray-800 rotate-45 "
      />
      <span className="text-xs"> {text}</span>
    </div>
  </div>
);
export default Tooltip;
