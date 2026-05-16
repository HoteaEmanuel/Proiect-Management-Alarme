import "@styles/features/chatbot/components/Skeletons/ChatSkeleton.css";

const ChatSkeleton =()=> {
  return (
    <div className="chat-skeleton">
      <Bubble side="left" bubbleWidth="message-bubble-width-420" lines={["skeleton-line-w-100", "skeleton-line-w-82", "skeleton-line-w-56"]} />

      <Bubble side="right" bubbleWidth="message-bubble-width-280" lines={["skeleton-line-w-100", "skeleton-line-w-64"]} user />

      <Bubble side="left" bubbleWidth="message-bubble-width-520" lines={["skeleton-line-w-100", "skeleton-line-w-92", "skeleton-line-w-76", "skeleton-line-w-48"]} />

      <Bubble side="right" bubbleWidth="message-bubble-width-340" lines={["skeleton-line-w-100", "skeleton-line-w-88", "skeleton-line-w-42"]} user />

      <Bubble
        side="left"
        bubbleWidth="message-bubble-width-460"
        lines={["skeleton-line-w-100", "skeleton-line-w-90", "skeleton-line-w-83", "skeleton-line-w-70", "skeleton-line-w-38"]}
      />
    </div>
  );
}

function Bubble({ side, bubbleWidth, lines, user = false }) {
  return (
    <div className={`bubble-row ${side}`}>
      <div
        className={`message-bubble ${bubbleWidth} ${user ? "user-bubble" : "assistant-bubble"}`}
      >
        <div className={`message-lines ${user ? "align-end" : ""}`}>
          {lines.map((lineWidth, index) => (
            <div
              key={index}
              className={`skeleton-line ${lineWidth}`}
            />
          ))}
        </div>

        <div className="shimmer" />
      </div>
    </div>
  );
}

export default ChatSkeleton;