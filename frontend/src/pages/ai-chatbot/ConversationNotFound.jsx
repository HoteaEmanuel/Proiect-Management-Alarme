import React from "react";
import { TbError404 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
const ConversationNotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <TbError404 size={200} />
      <h1 className="text-4xl -translate-y-10">Conversation Not found</h1>

      <button onClick={() => navigate("/chat/new    ")} className="button">
        Go back to safety
      </button>
    </div>
  );
};

export default ConversationNotFound;
