import useChatStore from "@store/chatStore";
import React from "react";
import { TextShimmerBasic } from "./TextShimmerBasic";

const RequestStatus = () => {
  const requests = useChatStore((state) => state.requests);
  const conversation = useChatStore((state) => state.conversation);
  const requestStatus = requests.get(conversation?.conversation_id)?.status;
  if (!requestStatus) return null;
  if (requestStatus === "stopping")
    return (
      <div className="flex gap-2 items-center">
        <img src="/images/Nyx.png" alt="Assistant image" className="h-8" />
        <p className="shimmer-text">Stopping...</p>
      </div>
    );

  if (requestStatus === "loading")
    return (
      <div className="flex gap-2 items-center">
        <img
          src="/images/Nyx-Ganditor.png"
          alt="Assistant image"
          className="h-10"
        />
        <p className="shimmer-text">Thinking...</p>
      </div>
    );
};

export default RequestStatus;
