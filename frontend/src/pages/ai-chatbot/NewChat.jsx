import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "@store/authStore.js";
import ChatInputNewChat from "@features/ai/components/ChatInputNewChat";
import { greeting } from "@features/ai/lib/greetings";
import "@styles/pages/ai-chatbot/NewChat.css";
import { useFilePreview } from "@store/filePreviewStore";
import FilePreview from "@features/ai/components/FilePreview";
import { usePageTitle } from "@hooks/usePageTitle";
import Nyx from "@features/ai/components/Nyx";

const NewChat = () => {
  usePageTitle("New chat");
  const { user } = useAuthStore();

  const { file } = useFilePreview();
  const [chatBotGreeting, setChatBotGreeting] = useState(greeting());
  console.log("GREETING")
  console.log(chatBotGreeting)
  return (
    <div className="new-chat-page">
      <main className="new-chat-hero">
        <div className="flex gap-5 items-center">
          <Nyx styte={"h-10"} />
          <h1 className="new-chat-title">
            {chatBotGreeting.greeting + ", "}
            <span className="new-chat-username">{user.username}</span>
          </h1>
        </div>

        <p className="new-chat-subtitle">{chatBotGreeting?.subtitle}</p>
      </main>

      <div className="new-chat-input-wrapper">
        <ChatInputNewChat placeholder={"How can i help you?"} />
      </div>

      {file && <FilePreview />}
    </div>
  );
};

export default NewChat;
