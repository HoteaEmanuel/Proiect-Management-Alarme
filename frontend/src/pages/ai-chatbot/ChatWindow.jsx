import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Suspense,
} from "react";

import { useParams } from "react-router-dom";
import ChatInput from "@features/ai/components/ChatInput.jsx";
import { FaArrowDown } from "react-icons/fa";

import Loading from "../../features/ai/components/Loading.jsx";
import FilePreview from "@features/ai/components/FilePreview.jsx";
import Button from "@components/Button.jsx";
import useChatStore from "@store/chatStore.js";
import ChatHeader from "@features/ai/components/ChatHeader.jsx";
import ConversationContent from "@features/ai/components/ConversationContent.jsx";

const ChatWindow = () => {
  const { id } = useParams();
  // const { data } = useGetConversation(id);

  const [previewFile, setPreviewFile] = useState(null);

  const isInitialLoad = useRef(true);
  const [showCopy, setShowCopy] = useState(null);
  const { isAwaitingResponse } = useChatStore();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const conversationRef = useCallback((el) => {
    if (!el) return;

    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll); // cleanup automat
  }, []);
  const chatEnd = useRef(null);

  const handleScrollDown = () => {
    chatEnd?.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    isInitialLoad.current = true;
  }, [id]); // Resetare ref la fiecare intrarea pe un chat

  // Functie care adauga adauga event de scroll astfel incat sa apara posibilitatea de scroll
  // to chat end daca se urca in istoricul conversatiei
  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return;
    console.log(el);
    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      console.log("DISTANCE", distanceFromBottom);
      setShowScrollBtn(distanceFromBottom > 500);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [conversationRef]);

  // const { mutateAsync: sendMessage, isPending: isPendingAIResponse } =
  //   useSendMessage({ id });

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden"
      ref={conversationRef}
    >
      <ChatHeader />
      <section className="w-full px-7 pb-30 flex justify-center mt-20">
        {/* <Suspense
          fallback={
            <div className="h-screen w-2/3">
              <MessageSkeleton />
            </div>
          }
        > */}
        {/* <ol className="flex flex-col gap-4 w-2/3 p-2">
            {messages?.length > 0 &&
              messages.map((message, index) => (
                <li
                  key={index}
                  className={` w-full flex  ${message.role === "assistant" ? "justify-start" : "justify-end"} p-2`}
                  onMouseLeave={() => setShowCopy(undefined)}
                >
                  <div
                    className={`${
                      message.role === "assistant"
                        ? "text-left p-2 rounded-2xl max-w-full w-fit wrap-break-word"
                        : "max-w-[75%] w-fit wrap-break-word"
                    }`}
                    onMouseEnter={() => setShowCopy(index)}
                  >
                    {message.role === "user" ? (
                      <UserMessage
                        message={message}
                        onFileClick={setPreviewFile}
                        previewFile={previewFile}
                        showOptions={showCopy === index}
                      />
                    ) : (
                      <ChatResponse
                        blocks={message?.blocks}
                        file={message?.file}
                        previewFile={previewFile}
                        onFileClick={setPreviewFile}
                        showOptions={showCopy === index}
                      />
                    )}
                  </div>
                </li>
              ))}
            <div ref={chatEnd} />
          </ol> */}
        <ConversationContent
          previewFile={previewFile}
          setPreviewFile={setPreviewFile}
          setShowCopy={setShowCopy}
          showCopy={showCopy}
          key={id}
          chatEnd={chatEnd}
        />
        {/* </Suspense> */}

        {previewFile && (
          <FilePreview
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </section>

      <div className="absolute flex flex-col bottom-0 right-5 w-4/5  z-10 items-center justify-center gap-4">
        {isAwaitingResponse && (
          <div className="w-full flex justify-center mb-5 h-full ">
            <Button
              className="w-14 z-100 rounded-2xl p-2 cursor-pointer culor-inherit  glassy-container glassy-container-darker"
              onClick={handleScrollDown}
            >
              <Loading />
            </Button>
          </div>
        )}
        {showScrollBtn && !isAwaitingResponse && (
          <Button
            onClick={handleScrollDown}
            className="scroll-btn glassy-container"
          >
            <FaArrowDown className="size-3" />{" "}
          </Button>
        )}
        <div className="w-2/3 flex justify-center bg-[#0b1220] pb-4">
          <ChatInput placeholder={"Ask anything"} chatEnd={chatEnd} />
        </div>
      </div>
      <div ref={chatEnd} />
    </div>
  );
};

export default ChatWindow;
