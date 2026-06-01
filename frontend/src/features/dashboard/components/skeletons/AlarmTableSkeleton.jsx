import "@styles/features/dashboard/components/skeletons/AlarmsSkeleton.css";
export const AlarmsTableSkeleton = () => (
  <div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <div className="sk sk-btn" style={{ width: 90, height: 32 }} />
        <div
          className="sk sk-btn"
          style={{ width: 76, height: 32, opacity: 0.7 }}
        />
        <div
          className="sk sk-btn"
          style={{ width: 82, height: 32, opacity: 0.5 }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div
          className="sk sk-btn"
          style={{ width: 130, height: 32, opacity: 0.6 }}
        />
        <div
          className="sk sk-btn"
          style={{ width: 32, height: 32, opacity: 0.5 }}
        />
      </div>
    </div>

    <div
      className="dashboard-filters dashboard-filters-open"
      style={{ marginBottom: 14 }}
    >
      {[
        "Start date",
        "End date",
        "Status",
        "Severity",
        "Type",
        "Summary",
        "Server",
        "Description",
      ].map((label) => (
        <div key={label} className="dashboard-filter">
          <div
            className="sk"
            style={{ height: 11, width: 60, marginBottom: 5, opacity: 0.6 }}
          />
          <div className="sk sk-btn" style={{ height: 30, width: "100%" }} />
        </div>
      ))}
    </div>

    <div className="alarm-table-wrapper">
      <table className="alarm-table" style={{ tableLayout: "fixed" }}>
        <thead className="alarm-table-head">
          <tr className="alarm-table-row">
            {[90, 72, 72, 88, null, 66, 88, 104, 76].map((w, i) => (
              <th
                key={i}
                className="alarm-table-heading"
                style={w ? { width: w } : {}}
              >
                <div className="sk" style={{ height: 12, width: "65%" }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="alarm-table-body">
          {Array.from({ length: 7 }).map((_, r) => (
            <tr key={r} className="alarm-table-row">
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "70%" }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk sk-pill" style={{ height: 20, width: 54 }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk sk-pill" style={{ height: 20, width: 60 }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "60%" }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "55%" }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "68%" }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "50%" }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "82%" }} />
              </td>
              <td className="alarm-table-cell">
                <div className="sk" style={{ height: 12, width: "55%" }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="alarm-table-actions">
        <div className="sk" style={{ width: 110, height: 12, opacity: 0.5 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <div className="sk sk-btn" style={{ width: 70, height: 28 }} />
          <div className="sk sk-btn" style={{ width: 28, height: 28 }} />
          <div className="sk sk-btn" style={{ width: 28, height: 28 }} />
        </div>
      </div>
    </div>
  </div>
);
