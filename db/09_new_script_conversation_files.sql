CREATE TABLE ConversationFiles (
    file_id NVARCHAR(36) NOT NULL PRIMARY KEY,

    message_id INT NOT NULL,

    filename NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(1000) NOT NULL,
    public_id NVARCHAR(500) NULL,

    resource_type NVARCHAR(50) NULL,
    file_format NVARCHAR(50) NULL,
    file_size BIGINT NULL,

    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ConversationFiles_Messages
        FOREIGN KEY (message_id)
        REFERENCES Messages(id)
        ON DELETE CASCADE
);