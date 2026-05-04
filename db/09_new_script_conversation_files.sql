CREATE TABLE ConversationFiles (
    file_id NVARCHAR(36) NOT NULL PRIMARY KEY,

    conversation_id NVARCHAR(36) NOT NULL,
    user_id NVARCHAR(36) NOT NULL,

    filename NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(1000) NOT NULL,
    public_id NVARCHAR(500) NULL,

    resource_type NVARCHAR(50) NULL,
    file_format NVARCHAR(50) NULL,
    file_size BIGINT NULL,

    created_at DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ConversationFiles_Conversations
        FOREIGN KEY (conversation_id)
        REFERENCES Conversations(conversation_id),

    CONSTRAINT FK_ConversationFiles_Users
        FOREIGN KEY (user_id)
        REFERENCES Users(id)
);