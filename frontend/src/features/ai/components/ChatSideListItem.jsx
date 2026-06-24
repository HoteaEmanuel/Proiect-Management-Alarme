import { useState } from "react";
import { SlOptions } from "react-icons/sl";
import Input from "@components/Input";
import { useRenameConversation } from "../api/chatBot.api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ChatSideListItem = ({
  conversation,
  active,
  editingId,
  editValue,
  setEditValue,
  setEditingId,
  onOpenOptions,
  onNavigate,
}) => {
  const [hovered, setHovered] = useState(false);

  const isEditing = editingId === conversation.conversation_id;

  const navigate = useNavigate();
  const handleNavigateToConversation = (conversation) => {
    navigate(`/chat/${conversation.conversation_id}`);
    onNavigate?.();
  };

  const { mutateAsync: renameConversation } = useRenameConversation();

  const handleRename = async (e) => {
    if (e.key === "Enter") {
      await renameConversation({
        conversationId: conversation.conversation_id,
        new_title: editValue,
      });

      setEditingId(null);
    }

    if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleBlur = async () => {
    try {
      await renameConversation({
        conversationId: conversation.conversation_id,
        new_title: editValue,
      });
    } catch (_error) {
      toast.error("Renaming failed");
    }

    setEditingId(null);
  };

  const handleOptionsClick = (e) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();

    onOpenOptions(conversation, {
      top: rect.top - 8,
      left: rect.right + 8,
    });
  };

  if (isEditing) {
    return (
      <div className={`side-nav-item mini-item ${active ? "active" : ""}`}>
        <Input
          autoFocus
          defaultValue={editValue}
          handleChange={(e) => setEditValue(e.target.value)}
          handleKeyDown={handleRename}
          maxSize={50}
          handleBlur={handleBlur}
          className="input conversation-side-input"
        />
      </div>
    );
  }

  return (
    <div
      className={`side-nav-item mini-item conversation-side-item ${
        active ? "active" : ""
      }`}
      onClick={() => handleNavigateToConversation(conversation)}
      onDoubleClick={() => {
        setEditingId(conversation.conversation_id);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="conversation-side-title">
        {conversation.conversation_title}
      </span>

      {hovered && (
        <div className="conversation-side-options-wrapper">
          <SlOptions
            className="conversation-side-options-icon"
            onClick={handleOptionsClick}
          />
        </div>
      )}
    </div>
  );
};
