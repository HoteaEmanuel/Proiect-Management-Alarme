import React, { useState } from "react";
import {
  useGetUserConversations,
  useRenameConversation,
} from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
import { useNavigate, useParams } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import Input from "@components/Input";
import "@styles/features/ai/components/ConversationSideList.css";
import { toast } from "sonner";
import useChatStore from "@store/chatStore";

const ChatsSideList = ({ onNavigate }) => {
  const { id } = useParams();
  console.log("NAVIGATE");
  console.log(onNavigate);
  const { conversation } = useChatStore();
  const { data: conversations } = useGetUserConversations();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { mutateAsync: renameConversation } = useRenameConversation();
  const [showOptions, setShowOptions] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  const handleRename = async (e) => {
    console.log("RENAMING HERE");
    console.log(editValue);
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
    console.log(editingId, editValue);
    await renameConversation({
      conversationId: editingId,
      new_title: newTitle,
    });
    setEditingId(null);
  };

  const handleNavigateToConversation = (conversation) => {
    console.log("NAVIGATIN");
    console.log(conversation);
    onNavigate();

    return navigate(`/chat/${conversation.conversation_id}`);
  };

  const handleOpenOptions = (e, conversation) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    setSelectedConversation(conversation);
    setPosition({
      top: rect.top - 8,
      left: rect.right + 8,
    });
    setShowOptions(true);
  };

  return (
    <div className="conversation-side-list-wrapper">
      {conversations?.length === 0 && (
        <h1 className="conversation-side-empty">No chats yet!</h1>
      )}

      {conversations?.length > 0 && (
        <ul className="conversation-side-list">
          {conversations.map((conv) =>
            editingId === conv.conversation_id ? (
              <li
                key={conv.conversation_id}
                className={`side-nav-item mini-item ${id === conv.conversation_id && "active"}`}
              >
                <Input
                  autoFocus
                  handleChange={(e) => setEditValue(e.target.value)}
                  handleKeyDown={(e) => handleRename(e)}
                  handleBlur={() => handleBlur()}
                  maxSize={50}
                  defaultValue={editValue}
                  className="input conversation-side-input"
                />
              </li>
            ) : (
              <li
                key={conv.conversation_id}
                onClick={() => handleNavigateToConversation(conv)}
                onMouseEnter={() => setSelectedConversation(conv)}
                className={`side-nav-item mini-item conversation-side-item ${id === conv.conversation_id && "active"}`}
              >
                <span className="conversation-side-title">
                  {conv.conversation_title}
                </span>

                {selectedConversation?.conversation_id ===
                  conv.conversation_id && (
                  <div className="conversation-side-options-wrapper">
                    <SlOptions
                      className="conversation-side-options-icon"
                      onClick={(e) => handleOpenOptions(e, conv)}
                    />
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      {showOptions && selectedConversation && (
        <OptionsModal
          clear={setSelectedConversation}
          showOptions={setShowOptions}
          setEditingId={setEditingId}
          setEditingValue={setEditValue}
          conversation={selectedConversation}
          position={position}
        />
      )}
    </div>
  );
};

export default ChatsSideList;
