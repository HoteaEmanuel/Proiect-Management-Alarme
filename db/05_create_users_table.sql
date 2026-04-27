CREATE TABLE Users (
    id NVARCHAR(36) PRIMARY KEY,
    email NVARCHAR(100) UNIQUE,
    username NVARCHAR(50) UNIQUE NOT NULL,
    first_name NVARCHAR(50),
    last_name NVARCHAR(50),
    hashed_password NVARCHAR(255) NOT NULL
);