import React, { useRef, useState } from "react";
import {
  useGetUserConversations,
} from "../api/chatBot.api";
import OptionsModal from "./OptionsModal";
import {  useParams } from "react-router-dom";
import { SlOptions } from "react-icons/sl";
import Input from "@components/Input";
import { useVirtualizer } from "@tanstack/react-virtual";
import "@styles/features/ai/components/ConversationSideList.css";

import { ChatSideListItem } from "./ChatSideListItem";

const ROW_HEIGHT = 44;

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

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: conversations?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <div className="conversation-side-list-wrapper">
      <div className="conversation-side-list" ref={parentRef}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: virtualizer.getTotalSize(),
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const conv = conversations[virtualRow.index];

            return (
              <div
                key={conv.conversation_id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: "0.5rem",
                }}
              >
                <ChatSideListItem
                  conversation={conv}
                  active={id === conv.conversation_id}
                  editingId={editingId}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  setEditingId={setEditingId}
                  onOpenOptions={openOptionsModal}
                  onNavigate={onNavigate}
                />
              </div>
            );
          })}
        </div>
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
