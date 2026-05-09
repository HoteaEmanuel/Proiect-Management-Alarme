import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import Input from "@components/Input";
import MessageInput from "@features/ai/components/MessageInput.jsx";
import { useCreateConversation } from "@features/ai/api/chatBot.api.js";

const NewChat = () => {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  console.log(user);
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

    const formData = new FormData();
    formData.append("message", mesaj.message);
    formData.append("new_chat", String(mesaj.new_chat ?? false));

    mesaj.files.forEach((file) => {
      formData.append("files", file);
    });
    

    mesaj.file_preserve_flags.forEach((persist) => {
      formData.append("file_preserve_flags", String(persist === true));
    });

    setFiles([]);
    setMessage("");
    await sendMessage(mesaj);
  };
  return (
    <div className="w-screen h-full  flex flex-col gap-10 justify-center items-center ">
      <main className="flex flex-col gap-1">
        <h1 className="font-bold text-4xl">
          Hello, <span className="text-blue-500 italic">{user.username} </span>
        </h1>
        <p className="opacity-50 text-sm text-center">What's new?</p>
      </main>

      {/* <Input
        placeholder={"How can i help you? :)"}
        className="w-1/2 border border-gray-700 p-4 rounded-xl"
      /> */}
      <div className="w-1/2">
        <MessageInput
          placeholder={"How can i help you?"}
          className="w-full border border-gray-700 p-4 rounded-xl"
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
