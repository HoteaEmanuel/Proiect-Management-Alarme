import React, { useRef, useState } from "react";
import Input from "../../../components/Input";
import { IoSend } from "react-icons/io5";
const MessageInput = () => {
  const [hasText, setHasText] = useState(false);
  const message = useRef(null);

  const MAX_HEIGHT = 300;

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    setHasText(el.value.trim().length > 0 ? true : false);

    // Daca elementul are heightul mai mare decat MAX_HEIGHT atunci ii adaugam scroll
    if (el.scrollHeight > MAX_HEIGHT) {
      el.style.height = MAX_HEIGHT + "px";
      el.classList.add("overflow-y-auto");
      el.classList.remove("overflow-hidden");
    } else {
      el.classList.add("overflow-hidden");
      el.classList.remove("overflow-y-auto");
    }
  };

  return (
    <div className="w-1/2 relative flex items-center">
      <textarea
        placeholder={"How can i help you today?"}
        ref={message}
        rows={1}
        type={"text-area"}
        onInput={handleInput}
        className="w-full resize-none overflow-hidden rounded-md border border-input border-gray-800
                 bg-background px-4 py-4 min-h-9 max-h-50 pr-8"
      />
      {hasText && (
        <IoSend className="size-5 absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer hover:scale-105" />
      )}
    </div>
  );
};

export default MessageInput;
