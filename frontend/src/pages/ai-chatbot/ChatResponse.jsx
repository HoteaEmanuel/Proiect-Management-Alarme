import React from "react";

const ChatResponse = ({ blocks }) => {
  console.log("BLOCKS");
  console.log(blocks);
  return (
    <div>
      <ul>
        {blocks.map((block, index) => (
          <li key={index}>
            {block.type === "text" && (
              <p className="whitespace-pre-wrap">{block.content}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatResponse;
