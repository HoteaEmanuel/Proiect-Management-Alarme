import React from "react";
import { Box, Button, Modal } from "@mui/material";

const modalStyle = {

    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxHeight: "80vh",
    overflow: "auto",
    backgroundColor: "#0f172a",
    border: "1px solid #24324a",
    borderRadius: "8px",
    boxShadow: 24,
    padding: "24px",
    color: "white",
};

const ChartDetailsModal = ({
    open,
    selectedChart,
    chartDetails,
    chartDetailsLoading,
    onClose,
}) => {

    return (

        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <div>
                    <h2>
                        {selectedChart?.category}: {selectedChart?.label}
                    </h2>

                    <Button variant="contained" onClick={onClose}>
                        Close
                    </Button>
                </div>

                {chartDetailsLoading ? (
                    <p>Loading alarms...</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Alarm Number</th>
                                <th>Status</th>
                                <th>Severity ID</th>
                                <th>Server</th>
                                <th>Summary</th>
                                <th>Type</th>
                                <th>Alert Group</th>
                                <th>Project</th>
                            </tr>
                        </thead>

                        <tbody>
                            {chartDetails.map((alarm) => (
                                <tr key={alarm.ALARM_NUMBER}>
                                    <td>{alarm.ALARM_NUMBER}</td>
                                    <td>{alarm.STATUS}</td>
                                    <td>{alarm.SEVERITY_ID}</td>
                                    <td>{alarm.SERVER_NAME}</td>
                                    <td>{alarm.SUMMARY}</td>
                                    <td>{alarm.TYPE}</td>
                                    <td>{alarm.ALERT_GROUP}</td>
                                    <td>{alarm.PROJECT}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Box>
        </Modal>
    );
};

export default ChartDetailsModal;
