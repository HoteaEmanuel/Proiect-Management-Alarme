import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetConversation } from "../api/chatBot.api";
import useChatStore from "@store/chatStore";
import UserMessage from "./UserMessage";
import ChatResponse from "./ChatResponse";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatSkeleton from "./Skeletons/ChatSkeleton";

import "@styles/features/ai/components/ConversationContent.css";
import StopRequest from "./StopRequest";

const Skeleton = () => {
  return (
    <div className="conversation-content-skeleton">
      {/* <ChatHeader /> */}
      <ChatSkeleton />
    </div>
  );
};

const ConversationContent = ({ setShowCopy, showCopy, chatEnd }) => {
  const { id } = useParams();
  const { data, isPending } = useGetConversation(id);
  // const { messages, setMessages } = useChatStore();

  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);

  useEffect(() => {
    setMessages(data?.messages);
  }, [setMessages, data]);

  // La deschiderea chat ului va da automat scroll la finalul conversatiei
  useEffect(() => {
    if (!data) return;
    const timeOutId = setTimeout(() => {
      chatEnd.current?.scrollIntoView({ behavior: "instant" });
    }, 0);
    return () => clearTimeout(timeOutId);
  }, [data, chatEnd]);

  if (isPending) return <Skeleton />;
  console.log("MESSAGES");
  console.log(messages);
  return (
    <ol className="conversation-content-list">
      {messages?.length > 0 &&
        messages.map((message, index) => (
          <li
            key={index}
            className={`conversation-content-item ${
              message.role === "assistant"
                ? "conversation-content-item-assistant"
                : "conversation-content-item-user"
            }`}
            onMouseLeave={() => setShowCopy(undefined)}
            onMouseEnter={() => setShowCopy(index)}
          >
            <div
              className={`conversation-content-message ${
                message.role === "assistant"
                  ? "conversation-content-message-assistant"
                  : "conversation-content-message-user"
              }`}
              onMouseEnter={() => setShowCopy(index)}
            >
              {message.role === "user" ? (
                <UserMessage
                  message={message}
                  showOptions={showCopy === index}
                />
              ) : (
                <ChatResponse
                  blocks={message?.blocks}
                  files={message?.files}
                  smart_replies={message?.smart_replies}
                  showOptions={showCopy === index}
                  is_stopped={message?.is_stopped}
                  index={index}
                  last_message={index === messages.length - 1}
                />
              )}
            </div>
          </li>
        ))}

      <StopRequest />
    </ol>
  );
};

export default ConversationContent;
