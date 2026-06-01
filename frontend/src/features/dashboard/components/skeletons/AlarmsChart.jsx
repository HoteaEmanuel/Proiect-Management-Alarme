import "@styles/features/dashboard/components/skeletons/AlarmsSkeleton.css";
export const AlarmChartSkeleton = () => (
  <div className="alarm-chart-wrapper">
    <div className="alarm-chart-header">
      <div className="sk" style={{ width: 160, height: 14 }} />
      <div className="sk" style={{ width: 90, height: 28, borderRadius: 6 }} />
    </div>

    <div className="alarm-chart-container" style={{ position: "relative" }}>
      <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}>
        <polyline points="0,160 80,120 160,140 240,80 320,100 400,60 500,90"
          fill="none" stroke="#1a2d50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="0,190 80,170 160,180 240,150 320,165 400,140 500,155"
          fill="none" stroke="#0f2a1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="0,200 80,195 160,205 240,190 320,200 400,185 500,195"
          fill="none" stroke="#2a1a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
      {[80, 66, 72].map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="sk sk-pill" style={{ width: 12, height: 12 }} />
          <div className="sk" style={{ width: w, height: 10 }} />
        </div>
      ))}
    </div>
  </div>
);