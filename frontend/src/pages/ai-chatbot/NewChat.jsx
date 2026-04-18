import React from "react";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/Input";
import MessageInput from "../../features/ai/components/MessageInput";

const NewChat = () => {
  const { user } = useAuthStore();
  console.log(user);
  return (
    <div className="w-screen h-full  flex flex-col gap-10 justify-center items-center ">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-4xl">
          Hello, <span className="text-blue-500 italic">{user.username} </span>
        </h1>
        <p className="opacity-50 text-sm text-center">What's new?</p>
      </div>

      {/* <Input
        placeholder={"How can i help you? :)"}
        className="w-1/2 border border-gray-700 p-4 rounded-xl"
      /> */}

      <MessageInput placeholder={"How can i help you?"} className="w-full border border-gray-700 p-4 rounded-xl"/>
    </div>
  );
};

export default NewChat;
