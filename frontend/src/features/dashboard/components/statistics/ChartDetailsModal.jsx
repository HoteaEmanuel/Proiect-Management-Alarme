import React from "react";
import {
    Box,
    Button,
    Modal,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "78%",
    maxHeight: "82vh",
    overflow: "hidden",
    backgroundColor: "#0f172a",
    border: "1px solid #24324a",
    borderRadius: "8px",
    boxShadow: 24,
    padding: "24px",
    color: "white",
};

const headerCellStyle = {
    backgroundColor: "#182235",
    color: "#dbeafe",
    borderBottom: "1px solid #334155",
    fontWeight: 700,
    whiteSpace: "nowrap",
};

const bodyCellStyle = {
    color: "#e5e7eb",
    borderBottom: "1px solid #24324a",
    whiteSpace: "nowrap",
};

const ChartDetailsModal = ({
    open,
    selectedChart,
    chartDetails,
    chartDetailsLoading,
    onClose,
    onExport,
}) => {

    return (

        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                        marginBottom: "18px",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "22px",
                                fontWeight: 700,
                            }}
                        >
                            {selectedChart?.category}: {selectedChart?.label}
                        </h2>

                        <p
                            style={{
                                margin: "6px 0 0",
                                color: "#94a3b8",
                                fontSize: "14px",
                            }}
                        >
                            {chartDetailsLoading
                                ? "Loading alarms..."
                                : `${chartDetails.length} alarms found`}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={onExport}
                            disabled={chartDetailsLoading || chartDetails.length === 0}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                            }}
                        >
                            Download
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                color: "#e5e7eb",
                                borderColor: "#334155",
                                textTransform: "none",
                                fontWeight: 700,
                                "&:hover": {
                                    borderColor: "#60a5fa",
                                    backgroundColor: "#172033",
                                },
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </div>

                {chartDetailsLoading ? (
                    <p style={{ color: "#cbd5e1" }}>Loading alarms...</p>
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: "60vh",
                            backgroundColor: "#111827",
                            border: "1px solid #24324a",
                            boxShadow: "none",
                        }}
                    >
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={headerCellStyle}>Alarm Number</TableCell>
                                    <TableCell sx={headerCellStyle}>Status</TableCell>
                                    <TableCell sx={headerCellStyle}>Severity ID</TableCell>
                                    <TableCell sx={headerCellStyle}>Server</TableCell>
                                    <TableCell sx={headerCellStyle}>Summary</TableCell>
                                    <TableCell sx={headerCellStyle}>Type</TableCell>
                                    <TableCell sx={headerCellStyle}>Alert Group</TableCell>
                                    <TableCell sx={headerCellStyle}>Project</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {chartDetails.map((alarm) => (
                                    <TableRow
                                        key={alarm.ALARM_NUMBER}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "#162033",
                                            },
                                        }}
                                    >
                                        <TableCell sx={bodyCellStyle}>{alarm.ALARM_NUMBER}</TableCell>
                                        <TableCell sx={bodyCellStyle}>{alarm.STATUS}</TableCell>
                                        <TableCell sx={bodyCellStyle}>{alarm.SEVERITY_ID}</TableCell>
                                        <TableCell sx={bodyCellStyle}>{alarm.SERVER_NAME}</TableCell>  
                                        <TableCell sx={bodyCellStyle}>{alarm.SUMMARY}</TableCell>
                                        <TableCell sx={bodyCellStyle}>{alarm.TYPE}</TableCell>
                                        <TableCell sx={bodyCellStyle}>{alarm.ALERT_GROUP}</TableCell>
                                        <TableCell sx={bodyCellStyle}>{alarm.PROJECT}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Modal>
    );
};

export default ChartDetailsModal;