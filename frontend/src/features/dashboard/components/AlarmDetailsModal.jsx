import React from "react";
import { Box, Modal } from "@mui/material";
import { FiAlertTriangle } from "react-icons/fi";
import "@styles/features/dashboard/components/AlarmDetailsModal.css";

const AlarmDetailsModal = ({ open, alarm, onClose }) => {

    if (!alarm)
        return null;

    const alarmFields = [

        { label: "Alarm number", value: alarm.alarm_number },
        { label: "Status", value: alarm.status },
        { label: "Severity", value: alarm.severity },
        { label: "Company", value: alarm.company },
        { label: "Project", value: alarm.project },
        { label: "Server", value: alarm.server_name },
        { label: "Alert description", value: alarm.alert_description },
        { label: "Alert key", value: alarm.alert_key },
        { label: "Node", value: alarm.node },
        { label: "Summary", value: alarm.summary },
        { label: "Type", value: alarm.type },
        { label: "Alert group", value: alarm.alert_group },
        { label: "First occurrence", value: alarm.first_occurence_datetime },
        { label: "Last occurrence", value: alarm.last_occurence_datetime },
        { label: "Clear occurrence", value: alarm.clear_occurence_datetime },
        { label: "Deleted datetime", value: alarm.deleted_datetime },
        { label: "Category tier 1", value: alarm.category_tier_1 },
        { label: "Category tier 2", value: alarm.category_tier_2 },
        { label: "Category tier 3", value: alarm.category_tier_3 },
    ];

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="alarm-details-modal">
                <div className="alarm-details-header">
                    <div className="alarm-details-title-group">
                        <div className="alarm-details-icon-wrapper">
                            <FiAlertTriangle className="alarm-details-icon" />
                        </div>

                        <div>
                            <h2 className="alarm-details-title">{alarm.alarm_number}</h2>
                            <p className="alarm-details-subtitle">{alarm.summary}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="alarm-details-close-button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                <div className="alarm-details-badges">
                    <span className="alarm-details-badge">{alarm.status}</span>
                    <span className="alarm-details-badge">{alarm.severity}</span>
                    <span className="alarm-details-badge">{alarm.type}</span>
                </div>

                <div className="alarm-details-grid">
                    {alarmFields.map((field) => (
                        <div
                            key={field.label}
                            className={`alarm-details-field ${field.wide ? "alarm-details-field-wide" : ""}`}
                        >
                            <span className="alarm-details-label">{field.label}</span>
                            <strong className="alarm-details-value">
                                {field.value || "N/A"}
                            </strong>
                        </div>
                    ))}
                </div>
            </Box>
        </Modal>
    );
};

export default AlarmDetailsModal;