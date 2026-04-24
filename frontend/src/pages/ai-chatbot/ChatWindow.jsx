import React, { useRef, useEffect, useState } from "react";
import { useGetConversation } from "../../features/ai/api/chatBot.api.js";
import { useParams } from "react-router-dom";
import MessageInput from "../../features/ai/components/MessageInput.jsx";

import {
  FaArrowAltCircleDown,
  FaArrowCircleDown,
  FaCheck,
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import Loading from "../../features/ai/components/Loading.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { api } from "../../lib/axios.js";
import Loading1 from "../../features/ai/components/Loading1.jsx";

const VITE_URL_APP = import.meta.env.VITE_API_URL;

const ChatWindow = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  console.log(id);
  const { data, isPending } = useGetConversation(id);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const isInitialLoad = useRef(true);
  const [showCopy, setShowCopy] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  // const message = useRef();
  const [message, setMessage] = useState("");
  // const [hasContent, setHasContent] = useState(false);
  const conversationRef = useRef(null);
  const chatEnd = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  console.log("MESSAGES");
  console.log(messages);
  const handleScrollDown = () => {
    console.log("SCROLL DOWN");
    chatEnd?.current.scrollIntoView({ behavior: "smooth" });
  };

  //! Important fix ( mi a mancat zilele )
  useEffect(() => {
    isInitialLoad.current = true;
  }, [id]); // Resetare ref la fiecare intrarea pe un chat


  // La deschiderea chat ului va da automat scroll la finalul conversatiei
  useEffect(() => {
    if (!messages?.length) return;
    if (isInitialLoad.current && chatEnd.current && messages) {
      chatEnd.current.scrollIntoView({ behavior: "smooth" });
      isInitialLoad.current = false; // setez la false ca sa nu se mai da scroll dupa modificarea mesajelor
    }
  }, [messages]);

  useEffect(() => {
    setMessages(data?.conversation);
  }, [setMessages, data]);

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

  // const { mutateAsync: sendMessage, isPending: isPendingAIResponse } =
  //   useSendMessage({ id });

  if (isPending) return <p>Loading...</p>;

  const handleSubmit = async () => {
    if (isTyping) return;
    setIsTyping(true);
    try {
      setMessages((prev) => [
        ...prev,
        {
          conversation_id: id,
          user_id: user._id,
          role: "user",
          has_sql_query: false,
          content: message,
        },
      ]);
      const mesaj = {
        user_id: user.user_id,
        conversation_id: id,
        message: message,
      };
      console.log(mesaj);
      setMessage("");
      handleScrollDown();

      const response = await api.post(`${VITE_URL_APP}/api/chatbot`, mesaj);
      setMessages((prev) => [...prev, response.data.conversation.at(-1)]);
      console.log("RESP AICI");
      console.log(response);
    } finally {
      setIsTyping(false);
    }
  };
  return (
    <div className="w-full h-full overflow-y-auto" ref={conversationRef}>
      <section className="p-20 pb-30">
        <ol className="flex flex-col gap-4 w-full p-2">
          {messages?.length > 0 &&
            messages.map((message, index) => (
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
        </ol>

        <div ref={chatEnd} />
      </section>

      <div className="absolute flex flex-col bottom-0 right-5 w-4/5 z-10 items-center justify-center gap-4">
        {isTyping && (
          <div className="w-full flex justify-center mb-5 h-full ">
            <div
              className="w-14 z-100 rounded-2xl p-2 cursor-pointer bg-[#0b1220] border border-black"
              onClick={handleScrollDown}
            >
              <Loading />
            </div>
          </div>
        )}
        {showScrollBtn && !isTyping && (
          <button onClick={handleScrollDown}>
            <FaArrowCircleDown className="size-6 cursor-pointer container text-gray-700 rounded-full" />{" "}
          </button>
        )}
        <div className="w-full flex justify-center p-4 pt-0 bg-[#0b1220]">
          <MessageInput
            onSubmit={handleSubmit}
            message={message}
            loading={isTyping}
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
  );
};

export default ChatWindow;
