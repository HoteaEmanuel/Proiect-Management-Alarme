import React, { useEffect, useState } from "react";
import "@styles/features/chatbot/components/ChatHeader.css";
import useChatStore from "@store/chatStore";
import { SlOptions } from "react-icons/sl";
import OptionsModal from "./OptionsModal";
import {
  useGetConversationBaseData,
  useRenameConversation,
} from "../api/chatBot.api";
import { useParams } from "react-router-dom";
import Button from "@components/Button";
import FilesModal from "./FilesModal";
import Input from "@components/Input";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { RiLoader2Fill } from "react-icons/ri";
const ChatHeader = () => {
  const { conversation, setConversation } = useChatStore();
  console.log("SHOW THIS");
  console.log(conversation);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const { mutateAsync: renameConversation } = useRenameConversation(
    conversation?.conversation_id,
  );

  // const [showOptionsButton, setShowOptionsButton] = useState(false);
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
  // if (id === undefined || id === null) return <></>;
  if (isPending) return <RiLoader2Fill className="size-5 animate-spin"/>;

  console.log("SHOW OPTIONS");
  const handleRename = async (e) => {
    if (e.key === "Enter") {
      await renameConversation({
        conversationId: editingId,
        new_title: editValue,
      });
      setEditingId(null);
    }
    if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleBlur = async () => {
    console.log("BLURING");
    console.log(editingId, editValue);
    await renameConversation({
      conversationId: editingId,
      new_title: editValue,
    });
    setEditingId(null);
  };
  // console.log(showOptionsButton);
  console.log("EDITING ID", editingId);
  return (
    <header
      className="chat-header glassy-container"
      // onMouseEnter={() => setShowOptionsButton(true)}
      // onMouseLeave={() => setShowOptionsButton(false)}
    >
      {editingId === conversation?.conversation_id ? (
        <Input
          autoFocus
          handleChange={(e) => setEditValue(e.target.value)}
          handleKeyDown={(e) => handleRename(e)}
          handleBlur={() => handleBlur()}
          maxSize={50}
          defaultValue={editValue}
          style={{ padding: 2, fontSize: 12 }}
          className="max-w-4xl"
        />
      ) : (
        <span className="max-w-1/3 text-center truncate">
          {conversation?.conversation_title || 'Loading...'}
        </span>
      )}
      {!showOptionsModal ? (
        <Button>
          <MdExpandMore
            className="size-5 cursor-pointer hover:bg-black/50 hover:scale-120 p-0.5 rounded-full opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsModal(true);
            }}
          />
        </Button>
      ) : (
        <Button>
          <MdExpandLess
            className="size-5 cursor-pointer hover:bg-black/50 hover:scale-120 p-0.5 rounded-full opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsModal(false);
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
          setEditingId={setEditingId}
          setEditingValue={setEditValue}
        />
      )}

      {showFilesModal && <FilesModal close={() => setShowFilesModal(false)} />}
    </header>
  );
};

export default ChatHeader;
