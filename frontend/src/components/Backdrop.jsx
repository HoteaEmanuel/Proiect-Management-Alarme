const Backdrop = ({ isOpen, onClose }) => {
  return isOpen ? (
    <div className="backdrop visible" onClick={onClose}>
    </div>
  ) : null;
};

export default Backdrop;
