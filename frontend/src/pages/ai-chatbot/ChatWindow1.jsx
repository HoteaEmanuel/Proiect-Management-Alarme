import React, { useRef, useEffect, useState, useCallback } from "react";
import { useGetConversation } from "../../features/ai/api/chatBot.api.js";
import { useParams } from "react-router-dom";
import ChatInput from "@features/ai/components/ChatInput.jsx";
import { FaArrowDown } from "react-icons/fa";


import Loading from "../../features/ai/components/Loading.jsx";
import ChatResponse from "../../features/ai/components/ChatResponse.jsx";
import { RiLoader2Fill } from "react-icons/ri";
import UserMessage from "@features/ai/components/UserMessage.jsx";
import FilePreview from "@features/ai/components/FilePreview.jsx";
import Button from "@components/Button.jsx";
import useChatStore from "@store/chatStore.js";
import ChatInput1 from "@features/ai/components/ChatInput1.jsx";


const VITE_URL_APP = import.meta.env.VITE_API_URL;

const ChatWindow1 = () => {
  const { id } = useParams();
  const { data, isPending, isFetching } = useGetConversation(id);

  const [previewFile, setPreviewFile] = useState(null);

  const isInitialLoad = useRef(true);
  const [showCopy, setShowCopy] = useState(null);
  const { messages, setMessages, setConversationId, isAwaitingResponse } =
    useChatStore();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

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

  const handleScrollDown = () => {
    chatEnd?.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setConversationId(id);
  }, []);

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
    return () => el.removeEventListener("scroll", handleScroll);
  }, [conversationRef]);

  // const { mutateAsync: sendMessage, isPending: isPendingAIResponse } =
  //   useSendMessage({ id });
  if (isPending)
    return (
      <>
        <RiLoader2Fill className="size-6 mx-auto animate-spin" />
      </>
    );
  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden"
      ref={conversationRef}
    >
      <section className="w-full px-7 pb-30 flex justify-center">
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
                      ? "text-left p-2 rounded-2xl max-w-full w-fit wrap-break-word"
                      : "max-w-[75%] w-fit wrap-break-word"
                  }`}
                  onMouseEnter={() => setShowCopy(index)}
                >
                  {message.role === "user" ? (
                    <UserMessage
                      message={message}
                      onFileClick={setPreviewFile}
                      previewFile={previewFile}
                      showOptions={showCopy === index}
                    />
                  ) : (
                    <ChatResponse
                      blocks={message?.blocks}
                      showOptions={showCopy === index}
                    />
                  )}
                </div>
              </li>
            ))}
          <div ref={chatEnd} />
        </ol>

        {previewFile && (
          <FilePreview
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </section>

      <div className="absolute flex flex-col bottom-0 right-5 w-4/5  z-10 items-center justify-center gap-4">
        {isAwaitingResponse && (
          <div className="w-full flex justify-center mb-5 h-full ">
            <Button
              className="w-14 z-100 rounded-2xl p-2 cursor-pointer culor-inherit  glassy-container glassy-container-darker"
              onClick={handleScrollDown}
            >
              <Loading />
            </Button>
          </div>
        )}
        {showScrollBtn && !isAwaitingResponse && (
          <Button
            onClick={handleScrollDown}
            className="scroll-btn glassy-container"
          >
            <FaArrowDown className="size-3" />{" "}
          </Button>
        )}
        <div className="w-2/3 flex justify-center bg-[#0b1220] p-4 pt-0">
          <ChatInput1 placeholder={"Ask anything"} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow1;
