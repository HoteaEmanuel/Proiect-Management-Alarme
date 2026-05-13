import "@styles/features/chatbot/components/Skeletons/ChatSkeleton.css";
const ChatSkeleton =()=> {
  return (
    <div className="chat-skeleton">
      <Bubble side="left" width="420px" lines={["100%", "82%", "56%"]} />

      <Bubble side="right" width="280px" lines={["100%", "64%"]} user />

      <Bubble side="left" width="520px" lines={["100%", "92%", "76%", "48%"]} />

      <Bubble side="right" width="340px" lines={["100%", "88%", "42%"]} user />

      <Bubble
        side="left"
        width="460px"
        lines={["100%", "90%", "83%", "70%", "38%"]}
      />
    </div>
  );
}

function Bubble({ side, width, lines, user = false }) {
  return (
    <div className={`bubble-row ${side}`}>
      <div
        className={`message-bubble ${user ? "user-bubble" : "assistant-bubble"}`}
        style={{ "--bubble-width": width }}
      >
        <div className={`message-lines ${user ? "align-end" : ""}`}>
          {lines.map((lineWidth, index) => (
            <div
              key={index}
              className="skeleton-line"
              style={{ width: lineWidth }}
            />
          ))}
        </div>

        <div className="shimmer" />
      </div>
    </div>
  );
}

export default ChatSkeleton;
