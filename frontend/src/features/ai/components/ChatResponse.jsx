import ReactMarkdown from 'react-markdown'
const ChatResponse = ({ blocks }) => {
  return (
    <div className="min-w-0 w-full">
      <ul className="min-w-0">
        {blocks.map((block, index) => (
          <li key={index} className="min-w-0">
            <div className="prose prose-invert min-w-0">
              <ReactMarkdown>{block.content}</ReactMarkdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatResponse;