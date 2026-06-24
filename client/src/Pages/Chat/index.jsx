import { useState } from "react";
import { IoChatbubbleEllipsesOutline, IoClose } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "94715264449";
const WHATSAPP_DISPLAY = "0715264449";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello CraftzLK, I need help with..."
)}`;

const ClientChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="chatbox-wrapper">
      <button
        type="button"
        className="chatbox-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close support center" : "Open support center"}
        aria-expanded={isOpen}
      >
        {isOpen ? <IoClose /> : <IoChatbubbleEllipsesOutline />}
      </button>

      <div
        className={`chatbox-message-wrapper ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-label="Support Center"
        aria-hidden={!isOpen}
      >
        <div className="chatbox-message-header">
          <div className="chatbox-message-profile">
            <div className="chatbox-message-avatar" aria-hidden="true">
              <FaWhatsapp />
            </div>
            <div>
              <h4 className="chatbox-message-name">Support Center</h4>
              <p className="chatbox-message-status">CraftzLK · WhatsApp</p>
            </div>
          </div>
        </div>

        <div className="chatbox-support-body">
          <p className="chatbox-support-lead">
            Need help with an order, custom gift, or artisan enquiry? Our team is ready on
            WhatsApp.
          </p>
          <ul className="chatbox-support-list">
            <li>Order updates &amp; delivery</li>
            <li>Custom hampers &amp; bulk requests</li>
            <li>Product questions &amp; returns</li>
          </ul>
          <button type="button" className="chatbox-whatsapp-btn" onClick={openWhatsApp}>
            <FaWhatsapp aria-hidden />
            Chat on WhatsApp
          </button>
          <p className="chatbox-support-note">
            Or message us at{" "}
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
              {WHATSAPP_DISPLAY}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientChatBox;
