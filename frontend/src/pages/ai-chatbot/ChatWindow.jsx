import React, { useRef, useEffect, useState } from "react";
import { useGetConversation } from "../../features/ai/api/chatBot.api.js";
import { useParams } from "react-router-dom";
import MessageInput from "../../features/ai/components/MessageInput.jsx";
import { useSendMessage } from "../../features/ai/api/chatBot.api.js";
import { FaArrowCircleDown } from "react-icons/fa";
const ChatWindow = () => {
  const { id } = useParams();
  console.log(id);
  const { data, isPending } = useGetConversation(id);

  const message = useRef();
  const conversationRef = useRef(null);
  const chatEnd = useRef(null);
  console.log(data);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  console.log(showScrollBtn);
  const handleScrollDown = () => {
    console.log("SCROLL DOWN");
    chatEnd?.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatEnd.current && data) {
      console.log("IS OKAY?");
      chatEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return;
    console.log(el);
    console.log("NOT NULL");
    const handleScroll = () => {
      console.log("SCROLL DOWN");
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      console.log("DISTANCE", distanceFromBottom);
      setShowScrollBtn(distanceFromBottom > 100);
    };

    el.addEventListener("scroll", handleScroll);
    console.log("EVENT ADDED");
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const { mutateAsync: sendMessage, isPending: isPendingAIResponse } =
    useSendMessage({ id });

  if (isPending) return <p>Loading...</p>;

  const handleSubmit = async () => {
    sendMessage({ message: message.current.value.trim() });
    message.current.value = "";
  };
  return (
    <div className="w-full h-full overflow-y-auto" ref={conversationRef}>
      <div className="p-20 pb-30">
        <ul className="flex flex-col gap-4 w-full p-2">
          {data.conversation.map((message, index) => (
            <li
              key={index}
              className={` w-full flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`${
                  message.role === "assistant"
                    ? "text-left p-2 rounded-2xl"
                    : "bg-gray-800 p-2 rounded-2xl max-w-[75%] self-end"
                }`}
              >
                {message.content}
              </div>
            </li>
          ))}
        </ul>
        {isPendingAIResponse && <p>Thinking...</p>}
        <div ref={chatEnd} className="bg-red-500"/>
      </div>

      <div className="absolute flex bottom-0 left-10  right-4 mx-auto justify-end">
        {showScrollBtn && <p>Buna</p>}
        <div className="w-[85%] left-0 z-1 p-4 container">
          <MessageInput
            onSubmit={handleSubmit}
            message={message}
            placeholder={
              data?.conversation.length > 0
                ? "Ask"
                : "How can i help you today?"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
