import React, { useEffect, useState } from "react";
import "@styles/features/chatbot/components/ChatHeader.css";
import useChatStore from "@store/chatStore";
import { SlOptions } from "react-icons/sl";
import OptionsModal from "./OptionsModal";
import { useGetConversationBaseData } from "../api/chatBot.api";
import { useParams } from "react-router-dom";
import Button from "@components/Button";
import FilesModal from "./FilesModal";
const ChatHeader = () => {
  const { conversation, setConversation } = useChatStore();
  console.log("SHOW THIS");
  console.log(conversation);

  const [showOptionsButton, setShowOptionsButton] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const { id } = useParams();
  const { data: conversationData, isPending } = useGetConversationBaseData(id, {
    enabled: !!id,
  });
  useEffect(() => {
    if (conversationData) setConversation(conversationData);
  }, [conversationData, setConversation]);

  useEffect(() => {
    if (!id) setConversation(null);
  }, [id]);

  useEffect(() => {
    setShowFilesModal(false);
  }, [id]);
  if (id === undefined || id === null) return <></>;
  if (isPending) return <p>Loading...</p>;

  console.log("SHOW OPTIONS");
  console.log(showOptionsButton);
  return (
    <header
      className="chat-header glassy-container"
      onMouseEnter={() => setShowOptionsButton(true)}
      onMouseLeave={() => setShowOptionsButton(false)}
    >
      <span className="max-w-1/3 truncate">
        {conversation?.conversation_title}
      </span>

      {showOptionsButton && (
        <Button>
          <SlOptions
            className="size-4 cursor-pointer hover:bg-black/50 hover:scale-120 p-0.5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsModal(true);
            }}
          />
        </Button>
      )}

      {showOptionsModal && (
        <OptionsModal
          conversation={conversation}
          showOptions={() => setShowOptionsModal(false)}
          fullOptions={true}
          clear={() => {}}
          setShowFilesModal={() => setShowFilesModal(true)}
        />
      )}

      {showFilesModal && <FilesModal close={() => setShowFilesModal(false)} />}
    </header>
  );
};

export default ChatHeader;
