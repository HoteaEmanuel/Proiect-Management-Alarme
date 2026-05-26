import useChatStore from "@store/chatStore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "./ChatInput";
import Button from "@components/Button";
import { FaArrowDown } from "react-icons/fa";
import Loading from "./Loading";
const ChatWindowFooter = ({ conversationRef, chatEnd }) => {
  const { id } = useParams();
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const requests = useChatStore((state) => state.requests);
  const conversation = useChatStore((state) => state.conversation);
  const isLoading =
    requests.get(conversation?.conversation_id)?.status === "loading";

  const handleScrollDown = () => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const el = conversationRef.current;

    if (!el) return;
    // Calculeaza distanta de la fundul conversatiei comparativ cu top ul si updateaza stateul afisarii butonul de scroll corespunzator
    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [id, conversationRef]);
  return (
    <div className="chat-window-footer">
      {showScrollBtn && isLoading && (
        <div className="chat-window-loading-wrapper">
          <Button
            className="chat-window-loading-button"
            onClick={handleScrollDown}
          >
            <Loading />
          </Button>
        </div>
      )}

      {showScrollBtn && !isLoading && (
        <Button
          onClick={handleScrollDown}
          className="chat-window-scroll-button"
        >
          <FaArrowDown className="chat-window-scroll-icon" />
        </Button>
      )}

      <div className="chat-window-input-wrapper">
        <ChatInput placeholder="Ask anything" chatEnd={chatEnd} />
      </div>
    </div>
  );
};

export default ChatWindowFooter;
