import React, { useRef, useEffect, useState } from "react";
import { useGetConversation } from "../../features/ai/api/chatBot.api.js";
import { useParams } from "react-router-dom";
import MessageInput from "../../features/ai/components/MessageInput.jsx";
import { useSendMessage } from "../../features/ai/api/chatBot.api.js";
import {
  FaArrowAltCircleDown,
  FaArrowCircleDown,
  FaCheck,
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import Loading from "../../features/ai/components/Loading.jsx";
const ChatWindow = () => {
  const { id } = useParams();
  console.log(id);
  const { data, isPending } = useGetConversation(id);
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(null);
  // const message = useRef();
  const [message, setMessage] = useState("");
  // const [hasContent, setHasContent] = useState(false);
  const conversationRef = useRef(null);
  const chatEnd = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const handleScrollDown = () => {
    console.log("SCROLL DOWN");
    chatEnd?.current.scrollIntoView({ behavior: "smooth" });
  };

  //   useEffect(() => {
  //   setHasContent(message.trim().length > 0);
  // }, [message]);

  // La deschiderea chat ului va da automat scroll la finalul conversatiei
  useEffect(() => {
    if (chatEnd.current && data) {
      chatEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  // Functie care adauga adauga event de scroll astfel incat sa apara posibilitatea de scroll
  // to chat end daca se merge in istoricul conversatiei
  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return;
    console.log(el);
    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      console.log("DISTANCE", distanceFromBottom);
      setShowScrollBtn(distanceFromBottom > 100);
    };

    el.addEventListener("scroll", handleScroll);
    console.log("EVENT ADDED");
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Functie care copiaza contentul unui mesaj in clipboard
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Feedback copiere
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const { mutateAsync: sendMessage, isPending: isPendingAIResponse } =
    useSendMessage({ id });

  if (isPending) return <p>Loading...</p>;

  const handleSubmit = async () => {
    sendMessage({ message: message.trim() });
    setMessage("");
  };
  return (
    <div className="w-full h-full overflow-y-auto" ref={conversationRef}>
      <section className="p-20 pb-30">
        <ul className="flex flex-col gap-4 w-full p-2">
          {data.conversation.map((message, index) => (
            <li
              key={index}
              className={` w-full flex  ${message.role === "assistant" ? "justify-start" : "justify-end"} p-2`}
              onMouseLeave={() => setShowCopy(undefined)}
            >
              <div
                className={`${
                  message.role === "assistant"
                    ? "text-left p-2 rounded-2xl"
                    : "bg-gray-800 p-2 rounded-2xl max-w-[75%] self-end"
                }`}
                onMouseEnter={() => setShowCopy(index)}
              >
                {message.content}
              </div>
              <div className="relative bg-red-500">
                <div className="absolute bottom-0 left-1">
                  {showCopy === index && !copied && (
                    <button
                      className="cursor-pointer hover:scale-125"
                      onClick={() => handleCopy(message.content)}
                    >
                      <MdContentCopy className="size-3 text-gray-500" />
                    </button>
                  )}

                  {showCopy === index && copied && (
                    <FaCheck className="size-3" />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div ref={chatEnd} className="bg-red-500" />
      </section>

      <div className="absolute flex flex-col bottom-0 left-20  right-4 mx-auto">
        {isPendingAIResponse && (
          <div className="w-full flex justify-center mb-5 h-full ">
            <div className="w-14 container rounded-2xl p-2">
              <Loading />
            </div>
          </div>
        )}
        <div className="container">
          {showScrollBtn && (
            <div className=" flex justify-center h-full mt-1">
              <button onClick={handleScrollDown}>
                <FaArrowCircleDown className="size-6 cursor-pointer container text-gray-700" />{" "}
              </button>
            </div>
          )}
          <div className="w-full  z-1 p-4 ">
            <MessageInput
              onSubmit={handleSubmit}
              message={message}
              placeholder={
                data?.conversation.length > 0
                  ? "Ask anything"
                  : "How can i help you today?"
              }
              setMessage={setMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
