import React from "react";
import Input from "../../../components/Input";
import { IoSend } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import { useParams } from "react-router-dom";
import LoadingCircle from "../../../components/LoadingCircle";
const MessageInput = ({
  onSubmit,
  message,
  disabled,
  loading,
  placeholder,
  setMessage,
}) => {
  const { id } = useParams();
  console.log(id);
  const MAX_HEIGHT = 300;

  const handleInput = (e) => {
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
      console.log("TO SUBMIT" + new Date());
      if (disabled) return;
      onSubmit();
      return;
    }
  };
  console.log("ACTIVE STATE");
  console.log(loading);
  return (
    <div className="w-1/2 relative flex items-center mx-auto">
      <textarea
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={1}
        type={"text-area"}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        className="w-full resize-none overflow-hidden rounded-md border border-input border-gray-800
                 bg-background px-4 py-4 min-h-9 max-h-50 pr-8"
      />
      {message.trim().length > 0 && !loading && (
        <button onClick={onSubmit}>
          <FaArrowUp className="size-8 absolute top-1/2 -translate-y-1/2 right-2 cursor-pointer hover:scale-105 bg-gray-900 p-2 rounded-2xl border border-blue-950" />
        </button>
      )}
      {loading && (
        <div className="absolute right-1">
          {" "}
          <LoadingCircle />{" "}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
