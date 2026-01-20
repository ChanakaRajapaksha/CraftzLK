import { useEffect, useState } from 'react';
import './handcraftAlert.css';

const HandcraftAlert = ({ open, onClose, message, type = 'success' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      
      // Auto close after 6 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!open && !isVisible) return null;

  const isError = type === 'error' || type === false;
  const icon = isError ? '⚠' : '✓';
  const alertClass = isError ? 'handcraft-alert-error' : 'handcraft-alert-success';

  return (
    <div
      className={`handcraft-alert ${alertClass} ${isVisible && !isExiting ? 'show' : ''} ${isExiting ? 'hide' : ''}`}
      onClick={handleClose}
    >
      <div className="alert-content">
        <div className="alert-icon-wrapper">
          <span className="alert-icon">{icon}</span>
          <div className="icon-ring"></div>
        </div>
        <div className="alert-message">
          <p className="alert-text">{message}</p>
        </div>
        <button className="alert-close" onClick={handleClose} aria-label="Close">
          <span>×</span>
        </button>
      </div>
      <div className="alert-progress-bar"></div>
    </div>
  );
};

export default HandcraftAlert;

