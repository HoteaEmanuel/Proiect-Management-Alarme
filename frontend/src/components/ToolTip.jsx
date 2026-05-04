const Tooltip = ({ text, children }) => (
  <div className="group relative inline-flex">
    {children}
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 z-50
                    bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap
                    pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {text}
    </div>
  </div>
);

export default Tooltip;
