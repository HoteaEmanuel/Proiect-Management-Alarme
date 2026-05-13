import React, { useState } from "react";
import {
  useGetUserConversations,
  useRenameConversation,
} from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
import { useNavigate, useParams } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import Input from "@components/Input";
const ConversationSideList = () => {
  const { id } = useParams();
  const { data: conversations } = useGetUserConversations();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { mutateAsync: renameConversation } = useRenameConversation();
  const [showOptions, setShowOptions] = useState(false);
  const [position, setPosition] = useState({ top: 0 }); // folosit pentru positionarea modalului de optiuni
  const navigate = useNavigate();
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
    await renameConversation(editingId, editValue);
    setEditingId(null);
  };

  const handleNavigateToConversation = (conversation) => {
    console.log("NAVIGATIN");
    console.log(conversation);

    return navigate(`/chat/${conversation.conversation_id}`);
  };
  return (
    <div>
      {conversations?.length === 0 && <h1>No chats yet!</h1>}
      {conversations?.length > 0 && (
        <ul className="overflow-y-auto flex-1 flex flex-col gap-2 text-xs">
          {conversations.map((conv) =>
            editingId === conv.conversation_id ? (
              <li
                key={conv.conversation_id}
                className={`side-nav-item  mini-item ${id === conv.conversation_id && "active"}`}
              >
                <Input
                  autoFocus
                  handleChange={(e) => setEditValue(e.target.value)}
                  handleKeyDown={(e) => handleRename(e)}
                  handleBlur={() => handleBlur()}
                  maxSize={50}
                  defaultValue={editValue}
                  style={{ padding: 2, fontSize: 12 }}
                />
              </li>
            ) : (
              <li
                key={conv.conversation_id}
                onClick={() => handleNavigateToConversation(conv)}
                onMouseEnter={() => setSelectedConversation(conv)}
                // onMouseLeave={() => setSelectedChat(null)}
                className={`side-nav-item mini-item ${id === conv.conversation_id && "active"}`}
              >
                <span className="truncate text-sm">
                  {conv.conversation_title}
                </span>
                {selectedConversation?.conversation_id ===
                  conv.conversation_id && (
                  <SlOptions
                    className="size-3 hover:bg-black/50 hover:scale-120 p-0.5 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(true);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setPosition({ top: rect.top });
                    }}
                  />
                )}
              </li>
            ),
          )}
        </ul>
      )}
      {showOptions && (
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

export default ConversationSideList;
