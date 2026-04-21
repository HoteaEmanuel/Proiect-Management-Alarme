import React, { useRef } from "react";
import { useGetConversation } from "../../features/ai/api/chatBot.api.js";
import { useParams } from "react-router-dom";
import MessageInput from "../../features/ai/components/MessageInput.jsx";
import { useSendMessage } from "../../features/ai/api/chatBot.api.js";
const ChatWindow = () => {
  const { id } = useParams();
  console.log(id);
  const { data, isPending } = useGetConversation(id);
  const message = useRef();
  console.log(data);
  const { mutateAsync: sendMessage, isPending: isPendingAIResponse } =
    useSendMessage({ id });

  if (isPending) return <p>Loading...</p>;

  const handleSubmit = async () => {
    sendMessage({ message: message.current.value.trim() });
    message.current.value = "";
  };
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-20 pb-30">
        <ul className="flex flex-col gap-4 w-full p-2">
          {data.data.conversation.map((message, index) => (
            <li
              key={index}
              className={` w-full flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`${
                  message.role === "assistant"
                    ? "text-left p-2 rounded-2xl"
                    : "bg-gray-800 p-2 rounded-2xl max-w-[75%] self-end"
                }`}
              >
                {message.content}
              </div>
            </li>
          ))}
        </ul>
        {isPendingAIResponse && (<p>Thinking...</p>)}
      </div>

      <div className="absolute flex bottom-0 left-10  right-4 mx-auto justify-end">
        <div className="w-[85%] left-0 z-1 p-4 container">
          <MessageInput onSubmit={handleSubmit} message={message} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
