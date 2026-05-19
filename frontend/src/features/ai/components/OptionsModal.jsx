import React, { useEffect, useLayoutEffect, useRef } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill, RiLoader2Fill } from "react-icons/ri";
import {
  useDeleteConversation,
  useGetConversationFiles,
} from "../api/chatBot.api";
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
}) => {
  const { mutateAsync: deleteConversation } = useDeleteConversation(
    conversation.conversation_id,
  );
  const { data, isPending } = useGetConversationFiles(
    conversation.conversation_id,
  );

  console.log("CONVERSATION TO BE");
  console.log(conversation);

  const modalRef = useRef(null);

  useLayoutEffect(() => {
    if (!position || !modalRef.current) return;

    modalRef.current.style.setProperty(
      "--options-modal-top",
      `${position.top}px`,
    );
    modalRef.current.style.setProperty(
      "--options-modal-left",
      `${position.left}px`,
    );
  }, [position]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        showOptions(false);
        clear(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clear, showOptions]);

  const handleDelete = async () => {
    try {
      await deleteConversation();

      toast.info("Conversation deleted");
    } catch (error) {
      toast.error(error?.message || "Deletion failed");
    }
  };
  if (isPending) return <RiLoader2Fill className="size-5 animate-spin" />;
  return (
    <div
      ref={modalRef}
      className={`options-modal ${position ? "options-modal-floating" : ""}`}
      onMouseLeave={() => {
        showOptions(false);
        clear(null);
      }}
      onBlur={() => {
        console.log("BLURRRR");
        showOptions(false);
        const timeOut = setTimeout(() => {
          clear(null);
        }, 1000);
        return () => clearTimeout(timeOut);
      }}
    >
      <ul className="options-modal-list">
        <li>
          <Button
            className="options-modal-button"
            onClick={() => {
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

        {fullOptions &&
          (data?.user_files?.length > 0 ||
            data?.assistant_files?.length > 0) && (
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
