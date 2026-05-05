CREATE TABLE ConversationFiles (
    file_id NVARCHAR(36) NOT NULL PRIMARY KEY,

    conversation_id NVARCHAR(36) NOT NULL,
    user_id NVARCHAR(36) NOT NULL,
    message_id INT NULL,

    filename NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(1000) NOT NULL,
    public_id NVARCHAR(500) NULL,

    resource_type NVARCHAR(50) NULL,
    file_format NVARCHAR(50) NULL,
    file_size BIGINT NULL,

    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ConversationFiles_Conversations
        FOREIGN KEY (conversation_id)
        REFERENCES Conversations(conversation_id),

    CONSTRAINT FK_ConversationFiles_Users
        FOREIGN KEY (user_id)
        REFERENCES Users(id),

    CONSTRAINT FK_ConversationFiles_Messages
        FOREIGN KEY (message_id)
        REFERENCES Messages(id)
);