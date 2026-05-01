import React, { useRef } from "react";
import Input from "../../../components/Input";
import { IoSend } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import LoadingCircle from "../../../components/LoadingCircle";
import { toast } from "sonner";

const MESSAGE_LIMIT = 5000;

const MessageInput = ({
  onSubmit,
  message,
  disabled,
  loading,
  placeholder,
  setMessage,
}) => {
  const MAX_HEIGHT = 300;
  const input = useRef();
  const handleInput = (e) => {
    const inputSize = e.target.value.length;
    if (inputSize >= MESSAGE_LIMIT) {
      toast.error(`Maximum ${MESSAGE_LIMIT} characters allowed`);
    }
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";

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
      if (disabled) return;
      onSubmit();
      input.current.value = "";
      input.current.style.height = "auto"; // Resetez inaltimea

      return;
    }
  };
  console.log("ACTIVE STATE");
  console.log(loading);
  return (
    <div className="w-full relative flex items-center mx-auto">
      <textarea
        placeholder={placeholder}
        value={message}
        ref={input}
        onChange={(e) => setMessage(e.target.value)}
        rows={1}
        type={"text-area"}
        maxLength={MESSAGE_LIMIT}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="w-full resize-none overflow-hidden rounded-md border border-input border-gray-800
                 bg-background p-4 min-h-9 max-h-50 pr-8"
      />
      {message.trim().length > 0 && !loading && (
        <button onClick={onSubmit}>
          <FaArrowUp className="size-8 absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer hover:scale-105 bg-gray-900 p-2 rounded-2xl border border-blue-950" />
        </button>
      )}
      {loading && (
        <div className="absolute right-2">
          {" "}
          <LoadingCircle />{" "}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
