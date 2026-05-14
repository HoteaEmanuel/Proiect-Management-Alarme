import React, { useEffect, useRef } from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { useDeleteConversation } from "../api/chatBot.api";
import { GiFiles } from "react-icons/gi";
import Button from "@components/Button";
import { toast } from "sonner";

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
  console.log("CONVERSATION TO BE");
  console.log(conversation);
  console.log("POSITION");
  console.log(position);

  const modalRef = useRef(null);

  // Adaug event de mouse down, cand se da click inafara containerului de optiuni
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

  return (
    <div
      ref={modalRef}
      className="absolute left-50 background
                    w-44 rounded-xl overflow-hidden
                     border border-white/10
                    shadow-[0_8px_32px_rgba(0,0,0,0.6)] "
      onMouseLeave={() => {
        showOptions(false);
        clear(null);
      }}
      onBlur={() => {
        console.log("BLURRRR");
        showOptions(false);
        clear(null);
      }}
      style={{ position: "fixed", top: position?.top || 10, right: 0 }}
    >
      <ul className="flex flex-col">
        <li key={crypto.randomUUID()}>
          <Button
            className="w-full flex items-center gap-3 p-2
                             text-sm hover:bg-white/10 cursor-pointer
                            "
            onClick={() => {
              setEditingId(conversation.conversation_id);
              setEditingValue(conversation.conversation_title);
              showOptions(false);
            }}
          >
            <MdEdit className="size-4" />
            Rename
          </Button>
        </li>

        <li className="border-t border-white/5" key={crypto.randomUUID()}>
          <Button
            className="w-full flex items-center gap-3 p-2
                             text-sm text-red-400
                             hover:bg-red-500/10
                             cursor-pointer text-left"
            onClick={handleDelete}
          >
            <RiDeleteBin5Fill />
            Delete
          </Button>
        </li>

        {fullOptions && (
          <li key={crypto.randomUUID()}>
            <Button
              className="w-full flex items-center gap-3 p-2
                             text-sm hover:bg-white/10 cursor-pointer"
              onClick={() => setShowFilesModal(true)}
            >
              <GiFiles className="size-5" />
              Files attached
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default OptionsModal;
