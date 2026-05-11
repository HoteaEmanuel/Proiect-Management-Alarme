import React from "react";
import { Box, Button, Modal } from "@mui/material";

const modalStyle = {

    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    maxHeight: "80vh",
    overflowY: "auto",
    backgroundColor: "#0f172a",
    border: "1px solid #24324a",
    borderRadius: "8px",
    boxShadow: 24,
    padding: "24px",
    color: "white",
};

const AlarmDetailsModal = ({ open, alarm, onClose }) => {

    if (!alarm) 
        return null;

    return (
        
        <Modal open={open} onClose={onClose}>
        <Box sx={modalStyle}>
            <div>
            <h2>{alarm.alarm_number}</h2>
            <p>{alarm.summary}</p>
            </div>

            <Button variant="outlined" onClick={onClose}>
            Close
            </Button>
        </Box>
        </Modal>
    );
};

export default AlarmDetailsModal;