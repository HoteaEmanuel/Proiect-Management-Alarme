import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import FilePreview from "@features/ai/components/FilePreview.jsx";
import ChatHeader from "@features/ai/components/ChatHeader.jsx";
import ConversationContent from "@features/ai/components/ConversationContent.jsx";

import useChatStore from "@store/chatStore.js";

import "@styles/pages/ai-chatbot/ChatWindow.css";
import { usePageTitle } from "@hooks/usePageTitle";
import ChatWindowFooter from "@features/ai/components/ChatWindowFooter";

const ChatWindow = () => {
  const { id } = useParams();
  const conversation = useChatStore((state) => state.conversation);
  usePageTitle("Conversation - " + id);

  const conversationRef = useRef(null);
  const chatEnd = useRef(null);

  useEffect(() => {
    if (!conversation) return;
    document.title = conversation.conversation_title;
  }, [conversation]);

  return (
    <div className="chat-window" ref={conversationRef}>
      <ChatHeader />

      <section className="chat-window-content">
        <ConversationContent key={id} chatEnd={chatEnd} />
        <FilePreview />
      </section>

      <ChatWindowFooter chatEnd={chatEnd} conversationRef={conversationRef} />

      <div ref={chatEnd} />
    </div>
  );
};

export default ChatWindow;
