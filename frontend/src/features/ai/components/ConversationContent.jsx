import React, { useEffect} from "react";
import { useParams } from "react-router-dom";
import { useGetConversation } from "../api/chatBot.api";
import useChatStore from "@store/chatStore";
import UserMessage from "./UserMessage";
import ChatResponse from "./ChatResponse";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatSkeleton from "./Skeletons/ChatSkeleton";
const Skeleton = () => {
  return (
    <div className="w-[90%] lg:w-2/3 h-full overflow-y-auto overflow-x-hidden">
      {/* <ChatHeader /> */}
      <ChatSkeleton />
    </div>
  );
};
const ConversationContent = ({
  setShowCopy,
  setPreviewFile,
  previewFile,
  showCopy,
  chatEnd,
}) => {
  const { id } = useParams();
  const { data, isPending } = useGetConversation(id);
  const { messages, setMessages } = useChatStore();
  useEffect(() => {
    setMessages(data?.messages);
  }, [setMessages, data]);

  // La deschiderea chat ului va da automat scroll la finalul conversatiei
  useEffect(() => {
    if (!data) return;
    setTimeout(() => {
      chatEnd.current?.scrollIntoView({ behavior: "instant" });
    }, 0);
  }, [data,chatEnd]);
  if (isPending) return <Skeleton />;

  return (
    <ol className="flex flex-col gap-4  w-[95%] lg:w-2/3 p-2">
      {messages?.length > 0 &&
        messages.map((message, index) => (
          <li
            key={index}
            className={` w-full flex  ${message.role === "assistant" ? "justify-start" : "justify-end"} p-2`}
            onMouseLeave={() => setShowCopy(undefined)}
            onMouseEnter={()=>setShowCopy(index)}
          >
            <div
              className={`${
                message.role === "assistant"
                  ? "text-left px-5 rounded-2xl max-w-full w-fit wrap-break-word"
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
                  file={message?.file}
                  previewFile={previewFile}
                  onFileClick={setPreviewFile}
                  showOptions={showCopy === index}
                />
              )}
            </div>
          </li>
        ))}
      
    </ol>
  );
};

export default ConversationContent;
