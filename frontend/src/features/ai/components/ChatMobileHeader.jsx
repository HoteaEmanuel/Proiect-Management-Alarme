import Button from "@components/Button";
import React from "react";
import { IoIosMenu } from "react-icons/io";
import "@styles/features/ai/components/ChatMobileHeader.css";

const ChatMobileHeader = ({ onToggle, isOpen }) =>
{
  return (
    <header className="chat-mobile-header">
      {!isOpen && (
        <Button
          className="chat-mobile-header-menu-button"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <IoIosMenu className="chat-mobile-header-menu-icon" />
        </Button>
      )}
    </header>
  );
};

export default ChatMobileHeader;