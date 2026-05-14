import Button from "@components/Button";
import React from "react";
import { IoIosMenu } from "react-icons/io";
const ChatMobileHeader = ({ onToggle, isOpen }) => {
  return (
    <header className="mobile-header">
      {!isOpen && (
        <Button
          className="cursor-pointer hover:scale-105 menuBtn"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <IoIosMenu className="size-7" />
        </Button>
      )}
    </header>
  );
};

export default ChatMobileHeader;
