CREATE TABLE Conversations (
    conversation_id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_title VARCHAR(50),
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL,
    user_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    response_id INT NULL,
    content TEXT NOT NULL,
    has_sql_query BIT NOT NULL DEFAULT 0,
    sql_query TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Messages_Response FOREIGN KEY (response_id)
    	REFERENCES Messages(id),

    CONSTRAINT FK_Messages_Conversations FOREIGN KEY (conversation_id) 
        REFERENCES Conversations(conversation_id),

    CONSTRAINT CHK_Message_Role 
        CHECK (role IN ('user', 'assistant', 'system'))
);