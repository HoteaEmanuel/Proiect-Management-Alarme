import React, { useState } from "react";
import Input from "../../../components/Input";
import { IoSend } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import { useParams } from "react-router-dom";
const MessageInput = ({ onSubmit, message, placeholder }) => {
  const [hasText, setHasText] = useState(false);

  const { id } = useParams();
  console.log(id);
  const MAX_HEIGHT = 300;

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    setHasText(el.value.trim().length > 0 ? true : false);

    // Daca elementul are heightul mai mare decat MAX_HEIGHT atunci ii adaugam scroll ( overflow y auto)
    if (el.scrollHeight > MAX_HEIGHT) {
      el.style.height = MAX_HEIGHT + "px";
      el.classList.add("overflow-y-auto");
      el.classList.remove("overflow-hidden");
    } else {
      el.classList.add("overflow-hidden");
      el.classList.remove("overflow-y-auto");
    }
  };

  const handleKeyDown = (e) => {
    // Daca se apasa enter, fara shift atunci se da submit la message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("TO SUBMIT" + new Date());
      onSubmit();
      return;
    }
  };

  return (
    <div className="w-1/2 relative flex items-center mx-auto">
      <textarea
        placeholder={placeholder}
        ref={message}
        rows={1}
        type={"text-area"}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="w-full resize-none overflow-hidden rounded-md border border-input border-gray-800
                 bg-background px-4 py-4 min-h-9 max-h-50 pr-8"
      />
      {hasText && (
        <button onClick={onSubmit}>
          <FaArrowUp className="size-8 absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer hover:scale-105 bg-gray-900 p-2 rounded-2xl border border-blue-950" />
        </button>
      )}
    </div>
  );
};

export default MessageInput;
