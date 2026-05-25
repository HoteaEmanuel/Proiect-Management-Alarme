import useChatStore from "@store/chatStore";
import React from "react";

const StopRequest = () => {
  const requests = useChatStore((state) => state.requests);
  const conversation = useChatStore((state) => state.conversation);
  const isStopping =
    requests.get(conversation?.conversation_id)?.status === "stopping";
  if (!isStopping) return null;
  return <p className="font-semibold">Stopping...</p>;
};

export default StopRequest;
