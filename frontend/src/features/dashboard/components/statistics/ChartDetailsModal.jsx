import React from "react";
import {
    Box,
    IconButton,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import { FiX } from "react-icons/fi";
import { GoDownload } from "react-icons/go";
import "@styles/features/dashboard/components/ChartDetailsModal.css";

const ChartDetailsModal = ({
    open,
    selectedChart,
    chartDetails,
    chartDetailsLoading,
    onClose,
    onExport,
}) =>
{
    const alarms = chartDetails ?? [];

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="chart-details-modal">
                <div className="chart-details-header">
                    <div className="chart-details-title-wrapper">
                        <h2 className="chart-details-title">
                            {selectedChart?.category}: {selectedChart?.label}
                        </h2>

                        <p className="chart-details-subtitle">
                            {chartDetailsLoading
                                ? "Loading alarms..."
                                : `${alarms.length} alarms found`}
                        </p>
                    </div>

                    <div className="chart-details-actions">
                        <Tooltip title="Download">
                            <span>
                                <IconButton
                                    className="chart-details-icon-button chart-details-download-button"
                                    onClick={onExport}
                                    disabled={chartDetailsLoading || alarms.length === 0}
                                    aria-label="Download chart details"
                                >
                                    <GoDownload className="chart-details-action-icon" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Close">
                            <IconButton
                                className="chart-details-icon-button chart-details-close-button"
                                onClick={onClose}
                                aria-label="Close chart details"
                            >
                                <FiX className="chart-details-action-icon" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>

                {chartDetailsLoading ? (
                    <p className="chart-details-loading">Loading alarms...</p>
                ) : (
                    <TableContainer
                        component={Paper}
                        className="chart-details-table-container"
                    >
                        <Table stickyHeader size="small" className="chart-details-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell className="chart-details-header-cell">Alarm Number</TableCell>
                                    <TableCell className="chart-details-header-cell">Status</TableCell>
                                    <TableCell className="chart-details-header-cell">Severity ID</TableCell>
                                    <TableCell className="chart-details-header-cell">Server</TableCell>
                                    <TableCell className="chart-details-header-cell">Summary</TableCell>
                                    <TableCell className="chart-details-header-cell">Type</TableCell>
                                    <TableCell className="chart-details-header-cell">Alert Group</TableCell>
                                    <TableCell className="chart-details-header-cell">Project</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {alarms.map((alarm) => (
                                    <TableRow
                                        key={alarm.ALARM_NUMBER}
                                        className="chart-details-row"
                                    >
                                        <TableCell className="chart-details-body-cell">{alarm.ALARM_NUMBER}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.STATUS}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.SEVERITY_ID}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.SERVER_NAME}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.SUMMARY}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.TYPE}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.ALERT_GROUP}</TableCell>
                                        <TableCell className="chart-details-body-cell">{alarm.PROJECT}</TableCell>
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