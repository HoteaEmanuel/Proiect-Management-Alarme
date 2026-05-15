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

const ChatWindow = () =>
{
  const { id } = useParams();

  const conversationRef = useRef(null);
  const chatEnd = useRef(null);

  const [previewFile, setPreviewFile] = useState(null);
  const [showCopy, setShowCopy] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const { isAwaitingResponse } = useChatStore();

  const handleScrollDown = () =>
  {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() =>
  {
    const el = conversationRef.current;

    if (!el) return;

    const handleScroll = () =>
    {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);

    return () =>
    {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [id]);

  return (
    <div className="chat-window" ref={conversationRef}>
      <ChatHeader />

      <section className="chat-window-content">
        <ConversationContent
          previewFile={previewFile}
          setPreviewFile={setPreviewFile}
          setShowCopy={setShowCopy}
          showCopy={showCopy}
          key={id}
          chatEnd={chatEnd}
        />

        {previewFile && (
          <FilePreview
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </section>

      <div className="chat-window-footer">
        {isAwaitingResponse && (
          <div className="chat-window-loading-wrapper">
            <Button
              className="chat-window-loading-button glassy-container glassy-container-darker"
              onClick={handleScrollDown}
            >
              <Loading />
            </Button>
          </div>
        )}

        {showScrollBtn && !isAwaitingResponse && (
          <Button
            onClick={handleScrollDown}
            className="chat-window-scroll-button glassy-container"
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