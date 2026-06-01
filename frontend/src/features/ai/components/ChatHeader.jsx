import React, { useEffect, useState } from "react";
import "@styles/features/chatbot/components/ChatHeader.css";
import useChatStore from "@store/chatStore";
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
import { toast } from "sonner";
import ConversationNotFound from "@pages/ai-chatbot/ConversationNotFound";
import NotFound from "@pages/NotFound";
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
  if (isPending) return <RiLoader2Fill className="chat-header-loader" />;

  console.log("SHOW OPTIONS");
  console.log(showOptionsModal);

  const handleRename = async (e) => {
    if (editValue === "" || editValue?.trim()?.length === 0) {
      toast.error("Invalid title");
      return;
    }
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
    console.log(editValue);
    const newTitle =
      editValue.trim().length !== 0
        ? editValue
        : conversation.conversation_title;
    if (newTitle.trim() === conversation.conversation_title.trim()) {
      console.log("STOP THE REQUEST");
      setEditingId(null);
      setEditValue("");
      return;
    }
    await renameConversation({
      conversationId: editingId,
      new_title: newTitle,
    });
    setEditingId(null);
  };

  if (!conversation) return <ConversationNotFound/>;

  return (
    <header
      className="chat-header"
      // onMouseEnter={() => setShowOptionsButton(true)}
      // onMouseLeave={() => setShowOptionsButton(false)}
    >
      <div className="chat-header-content">
        <div className="chat-header-options-wrapper">
          {editingId === conversation?.conversation_id ? (
            <Input
              autoFocus
              handleChange={(e) => setEditValue(e.target.value)}
              handleKeyDown={(e) => handleRename(e)}
              handleBlur={() => handleBlur()}
              maxSize={50}
              defaultValue={editValue}
              className="input chat-header-input"
            />
          ) : (
            <span className="chat-header-title">
              {conversation?.conversation_title || "Loading..."}
            </span>
          )}

          {!showOptionsModal ? (
            <Button
              className="chat-header-options-button"
              aria-label="Open conversation options"
            >
              <MdExpandMore
                className="chat-header-options-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsModal(true);
                }}
              />
            </Button>
          ) : (
            <Button
              className="chat-header-options-button"
              aria-label="Close conversation options"
            >
              <MdExpandLess
                className="chat-header-options-icon"
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
        </div>
      </div>

      {showFilesModal && <FilesModal close={() => setShowFilesModal(false)} />}
    </header>
  );
};

export default ChatHeader;
