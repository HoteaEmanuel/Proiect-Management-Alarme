import React, { useState } from "react";
import {
  useGetUserConversations,
} from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
import {  useParams } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import Input from "@components/Input";
import "@styles/features/ai/components/ConversationSideList.css";

import { ChatSideListItem } from "./ChatSideListItem";

const ChatsSideList = ({ onNavigate }) => {
  const { id } = useParams();

  const { data: conversations } = useGetUserConversations();
 

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [modalConversation, setModalConversation] = useState(null);
  const [modalPosition, setModalPosition] = useState(null);

  const openOptionsModal = (conversation, position) => {
    setModalConversation(conversation);
    setModalPosition(position);
  };

  const closeOptionsModal = () => {
    setModalConversation(null);
    setModalPosition(null);
  };

 
  return (
    <div className="conversation-side-list-wrapper">
      <div className="conversation-side-list">
        {conversations?.map((conv) => (
          <ChatSideListItem
            key={conv.conversation_id}
            conversation={conv}
            active={id === conv.conversation_id}
            editingId={editingId}
            editValue={editValue}
            setEditValue={setEditValue}
            setEditingId={setEditingId}
            onOpenOptions={openOptionsModal}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {modalConversation && (
        <OptionsModal
          clear={closeOptionsModal}
          showOptions={closeOptionsModal}
          conversation={modalConversation}
          position={modalPosition}
          setEditingId={setEditingId}
          setEditingValue={setEditValue}
        />
      )}
    </div>
  );
};

export default ChatsSideList;
