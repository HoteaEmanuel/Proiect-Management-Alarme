import "@styles/features/dashboard/components/skeletons/HeatMapSkeleton.css";

export const HeatMapSkeleton = () => {
  return (
    <div className="heatmap-skeleton-wrapper">
      <div className="heatmap-skeleton-header">
        <div className="sk" style={{ width: 140, height: 16 }} />
      </div>

      <div className="heatmap-skeleton-filters">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="sk heatmap-skeleton-pill"
            style={{ width: 80, height: 28 }}
          />
        ))}
      </div>

      <div className="heatmap-skeleton-grid">
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={row} className="heatmap-skeleton-row">
            <div className="sk" style={{ width: 40, height: 12 }} />

            <div className="heatmap-skeleton-cells">
              {Array.from({ length: 24 }).map((_, col) => (
                <div
                  key={col}
                  className="heatmap-skeleton-cell sk"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="heatmap-skeleton-legend">
        <div className="sk" style={{ width: 30, height: 10 }} />

        <div className="heatmap-skeleton-gradient sk" />

        <div className="sk" style={{ width: 30, height: 10 }} />
      </div>
    </div>
  );
};