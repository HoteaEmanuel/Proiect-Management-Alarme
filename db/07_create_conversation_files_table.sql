CREATE TABLE ConversationFiles(
    id INT PRIMARY KEY IDENTITY(1,1),
    conversation_id NVARCHAR(36) NOT NULL FOREIGN KEY REFERENCES Conversations(conversation_id) ON DELETE CASCADE,
    user_id NVARCHAR(36) NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_content NVARCHAR(MAX) NOT NULL,
    uploaded_at DATETIME DEFAULT GETDATE()
)