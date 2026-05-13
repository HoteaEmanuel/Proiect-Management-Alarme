import React from "react";
import "@styles/features/chatbot/components/Skeletons/ConversationListSkeleton.css";
const ConversationListSkeleton = () => {
  return (
    <div className="conversation-skeleton">
      <div className="skel lg w-30" />
      <div className="skel md w-80" />
      <div className="skel md w-70" />
      <div className="skel md w-60" />
      <div className="skel sm w-40" />

      <div className="skel lg w-25" />
      <div className="skel md w-65" />
      <div className="skel md w-55" />
      <div className="skel md w-75" />
      <div className="skel sm w-35" />
      <div className="skel lg w-85" />
      <div className="skel md w-90" />
      <div className="skel md w-70" />
      <div className="skel md w-60" />
      <div className="skel sm w-45" />

      <div className="skel lg w-40" />
      <div className="skel md w-50" />

      <div className="skel md w-60" />
      <div className="skel sm w-30" />
    </div>
  );
};

export default ConversationListSkeleton;
