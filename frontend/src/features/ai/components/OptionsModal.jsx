import React from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin5Fill } from "react-icons/ri";
import {
  useDeleteConversation,
  useRenameConversation,
} from "../api/chatBot.api";
const OptionsModal = ({ clear, showOptions, conversationId }) => {
  console.log(showOptions);
  console.log(conversationId);
  const { mutate: rename } = useRenameConversation(conversationId);
  const { mutateAsync: deleteConversation } =
    useDeleteConversation(conversationId);
  return (
    <div
      className="absolute z-50 top-1/2 left-50 background
                    w-44 rounded-xl overflow-hidden
                     border border-white/10
                    shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      onMouseLeave={() => {
        showOptions(false);
        clear(null);
      }}
    >
      <ul className="flex flex-col">
        <li>
          <button
            className="w-full flex items-center gap-3 p-2
                             text-sm hover:bg-white/10 cursor-pointer
                            "

            // onClick={()=>rename()}
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
