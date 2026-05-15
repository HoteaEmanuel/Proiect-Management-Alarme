import React, { useState } from "react";
import { useCreateConversation } from "@features/ai/api/chatBot.api.js";
import useAuthStore from "@store/authStore.js";
import ChatInputNewChat from "@features/ai/components/ChatInputNewChat";
import { greeting } from "@features/ai/lib/greetings";
import "@styles/pages/ai-chatbot/NewChat.css";

const NewChat = () => {
  const { user } = useAuthStore();

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const { mutateAsync: sendMessage, isPending } = useCreateConversation();

  const onSubmit = async () => {
    if (isPending) return;

    const filesToSend = files.map((item) => item.file);
    const filesPreserveStatus = files.map((item) => item.persist);

    const mesaj = {
      user_id: user.user_id,
      message: message,
      files: filesToSend,
      file_preserve_flags: filesPreserveStatus,
    };

    setFiles([]);
    setMessage("");

    await sendMessage(mesaj);
  };

  const chatBotGreeting = greeting();

  return (
    <div className="new-chat-page">
      <main className="new-chat-hero">
        <h1 className="new-chat-title">
          {chatBotGreeting.greeting + ", "}
          <span className="new-chat-username">{user.username}</span>
        </h1>

        <p className="new-chat-subtitle">
          {chatBotGreeting.subtitle}
        </p>
      </main>

      <div className="new-chat-input-wrapper">
        <ChatInputNewChat
          placeholder={"How can i help you?"}
          onSubmit={onSubmit}
          message={message}
          loading={isPending}
          setMessage={setMessage}
          files={files}
          setFiles={setFiles}
        />
      </div>
    </div>
  );
};

export default NewChat;
