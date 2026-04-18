const StatCard = ({ label, value, unit }) => {
  return (
    <div className="border rounded-xl p-5 flex flex-col gap-1 w-full h-full
      shadow-[0_0_15px_rgba(99,102,241,0.4)] 
      hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] 
      transition-shadow duration-300
      border-indigo-400/30">
      <p className="text-xs uppercase tracking-widest">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-bold">
          {value}
        </span>
        {unit && <span className="text-sm mb-1 text-indigo-300">{unit}</span>}
      </div>
    </div>
  )
}

export default StatCard