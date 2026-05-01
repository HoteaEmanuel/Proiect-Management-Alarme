import React, { useRef, useEffect, useState, useCallback } from "react";
import { useGetConversation } from "../../features/ai/api/chatBot.api.js";
import { useParams } from "react-router-dom";
import MessageInput from "../../features/ai/components/MessageInput.jsx";
import {
  FaArrowAltCircleDown,
  FaArrowCircleDown,
  FaArrowDown,
  FaCheck,
} from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import Loading from "../../features/ai/components/Loading.jsx";
import { useAuthStore } from "../../store/authStore.js";
import { api } from "../../lib/axios.js";
import Loading1 from "../../features/ai/components/Loading1.jsx";
import ResponseType from "./ChatResponse.jsx";
import ChatResponse from "./ChatResponse.jsx";

const VITE_URL_APP = import.meta.env.VITE_API_URL;

const ChatWindow = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  console.log(id);
  const { data, isPending, isFetching } = useGetConversation(id);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const isInitialLoad = useRef(true);
  const [showCopy, setShowCopy] = useState(null);

  const [isTyping, setIsTyping] = useState(false);
  // const message = useRef();
  const [message, setMessage] = useState("");
  // const [hasContent, setHasContent] = useState(false);
  // const conversationRef = useRef(null);

  const conversationRef = useCallback((el) => {
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll); // cleanup automat
  }, []);
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
    if (isFetching) return;
    if (!messages?.length) return;
    if (isFetching) return;
    if (!isInitialLoad.current) return;

    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
    isInitialLoad.current = false;
  }, [messages, isFetching]);

  console.log("DATA FROM CONV");
  console.log(data);
  useEffect(() => {
    setMessages(data?.messages);
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
      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);
    console.log("EVENT ADDED");
    return () => el.removeEventListener("scroll", handleScroll);
  }, [conversationRef]);

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
      console.log("AI RESPONSE");
      console.log(response);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", blocks: response.data.response },
      ]);
      console.log("RESP AICI");
      console.log(response);
    } finally {
      setIsTyping(false);
    }
  };

  console.log(messages);
  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden"
      ref={conversationRef}
    >
      <section className="w-full px-3 pb-30 flex justify-center">
        <ol className="flex flex-col gap-4 w-2/3 p-2">
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
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap"> {message.content}</p>
                  ) : (
                    <ChatResponse blocks={message?.blocks} />
                  )}
                </div>
                <div className="relative">
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
          <div ref={chatEnd} />
        </ol>
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
            <FaArrowDown className="size-6 cursor-pointer  bg-gray-800 border border-black p-1 text-gray-400 rounded-full" />{" "}
          </button>
        )}
        <div className="w-2/3 flex justify-center p-4 pt-0 bg-[#0b1220]">
          <MessageInput
            onSubmit={handleSubmit}
            message={message}
            loading={isTyping}
            placeholder={"Ask anything"}
            setMessage={setMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
