import React from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { useDeleteConversation } from "../api/chatBot.api";
const OptionsModal = ({
  clear,
  showOptions,
  conversation,
  position,
  setEditingId,
  setEditingValue,
}) => {
  const { mutateAsync: deleteConversation } = useDeleteConversation(
    conversation.conversation_id,
  );
  return (
    <div
      className="absolute left-50 background
                    w-44 rounded-xl overflow-hidden
                     border border-white/10
                    shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      onMouseLeave={() => {
        showOptions(false);
        clear(null);
      }}
      style={{ top: position.top }}
    >
      <ul className="flex flex-col">
        <li>
          <button
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
          </button>
        </li>

        <li className="border-t border-white/5">
          <button
            className="w-full flex items-center gap-3 p-2
                             text-sm text-red-400
                             hover:bg-red-500/10
                             cursor-pointer text-left"
            onClick={async () => await deleteConversation()}
          >
            <RiDeleteBin5Fill />
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
};

export default OptionsModal;
