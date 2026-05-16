import React, { useEffect, useRef } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { useDeleteConversation } from "../api/chatBot.api";
import { GiFiles } from "react-icons/gi";
import Button from "@components/Button";
import { toast } from "sonner";

import "@styles/features/ai/components/OptionsModal.css";

const VITE_URL_APP = import.meta.env.VITE_API_URL;

const OptionsModal = ({
  clear,
  showOptions,
  conversation,
  position,
  setEditingId,
  setEditingValue,
  fullOptions = false,
  setShowFilesModal,
}) =>
{
  const { mutateAsync: deleteConversation } = useDeleteConversation(
    conversation.conversation_id,
  );

  console.log("CONVERSATION TO BE");
  console.log(conversation);
  console.log("POSITION");
  console.log(position);

  const modalRef = useRef(null);

  // Adaug event de mouse down, cand se da click inafara containerului de optiuni
  useEffect(() =>
  {
    const handleClickOutside = (e) =>
    {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        showOptions(false);
        clear(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clear, showOptions]);

  const handleDelete = async () =>
  {
    try {
      await deleteConversation();

      toast.info("Conversation deleted");
    } catch (error) {
      toast.error(error?.message || "Deletion failed");
    }
  };

  return (
    <div
      ref={modalRef}
      className="options-modal"
      onMouseLeave={() =>
      {
        showOptions(false);
        clear(null);
      }}
      onBlur={() =>
      {
        console.log("BLURRRR");
        showOptions(false);
        clear(null);
      }}
    >
      <ul className="options-modal-list">
        <li>
          <Button
            className="options-modal-button"
            onClick={() =>
            {
              setEditingId(conversation.conversation_id);
              setEditingValue(conversation.conversation_title);
              showOptions(false);
            }}
          >
            <MdEdit className="options-modal-icon" />
            Rename
          </Button>
        </li>

        <li className="options-modal-divider">
          <Button
            className="options-modal-button options-modal-button-danger"
            onClick={handleDelete}
          >
            <RiDeleteBin5Fill className="options-modal-icon" />
            Delete
          </Button>
        </li>

        {fullOptions && (
          <li>
            <Button
              className="options-modal-button"
              onClick={() => setShowFilesModal(true)}
            >
              <GiFiles className="options-modal-icon options-modal-icon-large" />
              Files attached
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default OptionsModal;