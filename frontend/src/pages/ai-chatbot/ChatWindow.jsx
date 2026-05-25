import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaArrowDown } from "react-icons/fa";

import Button from "@components/Button.jsx";
import Loading from "@features/ai/components/Loading.jsx";
import FilePreview from "@features/ai/components/FilePreview.jsx";
import ChatInput from "@features/ai/components/ChatInput.jsx";
import ChatHeader from "@features/ai/components/ChatHeader.jsx";
import ConversationContent from "@features/ai/components/ConversationContent.jsx";

import useChatStore from "@store/chatStore.js";

import "@styles/pages/ai-chatbot/ChatWindow.css";
import { useFilePreview } from "@store/filePreviewStore";
import { usePageTitle } from "@hooks/usePageTitle";

const ChatWindow = () => {
  const { id } = useParams();
  const { conversation, requests } = useChatStore();
  usePageTitle("Conversation - " + id);

  const conversationRef = useRef(null);
  const chatEnd = useRef(null);
  const { file } = useFilePreview();
  const [showCopy, setShowCopy] = useState(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { isAwaitingResponse } = useChatStore();

  const handleScrollDown = () => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (!conversation) return;
    document.title = conversation.conversation_title;
  }, [conversation]);
  useEffect(() => {
    const el = conversationRef.current;

    if (!el) return;
    // Calculeaza distanta de la fundul conversatiei comparativ cu top ul si updateaza stateul afisarii butonul de scroll corespunzator
    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [id]);

  const isLoading = requests.has(conversation?.conversation_id);

  console.log("IS LOADING RESPONSE: ", isLoading);  
  console.log("REQUESTS: ", requests);
  return (
    <div className="chat-window" ref={conversationRef}>
      <ChatHeader />

      <section className="chat-window-content">
        <ConversationContent
          setShowCopy={setShowCopy}
          showCopy={showCopy}
          key={id}
          chatEnd={chatEnd}
        />

        {/* {previewFile && (
          <FilePreview
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )} */}

        {file && <FilePreview />}
      </section>

      <div className="chat-window-footer">
        {isLoading && (
          <div className="chat-window-loading-wrapper">
            <Button
              className="chat-window-loading-button"
              onClick={handleScrollDown}
            >
              <Loading />
            </Button>
          </div>
        )}

        {showScrollBtn && !isLoading && (
          <Button
            onClick={handleScrollDown}
            className="chat-window-scroll-button"
          >
            <FaArrowDown className="chat-window-scroll-icon" />
          </Button>
        )}

        <div className="chat-window-input-wrapper">
          <ChatInput placeholder="Ask anything" chatEnd={chatEnd} />
        </div>
      </div>

      <div ref={chatEnd} />
    </div>
  );
};

export default ChatWindow;
