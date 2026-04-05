-- =============================================================================
-- MIGRATION SCRIPT - Alarms & Severities Database
-- Description: Creare tabele Severities si Alarms cu Foreign Key
-- =============================================================================

-- 1. GESTIONARE TABELA SEVERITIES (Tabela de referinta)
IF OBJECT_ID('dbo.Severities', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.Alarms; 
    DROP TABLE dbo.Severities;
    PRINT 'Tabelele vechi au fost sterse pentru recreare.';
END

-- Creare tabela Severities
CREATE TABLE dbo.Severities (
    ID          INT             NOT NULL PRIMARY KEY, -- 1, 2, 3, 4, 5
    NAME        NVARCHAR(20)    NOT NULL UNIQUE      -- 'Info', 'Warning', etc.
);

-- Inserare severitati
INSERT INTO dbo.Severities (ID, NAME) VALUES 
(1, 'Critical'),
(2, 'Major'),
(3, 'Minor'),
(4, 'Warning'),
(5, 'Info');

PRINT 'Tabela dbo.Severities a fost creata si populata.';

-- 2. GESTIONARE TABELA ALARMS
CREATE TABLE dbo.Alarms (
    ALARM_NUMBER             NVARCHAR(20)   NOT NULL PRIMARY KEY,
    STATUS                   NVARCHAR(20)   NOT NULL CHECK (STATUS IN ('Active', 'Acknowledged', 'Cleared', 'Closed')),
    SEVERITY_ID              INT            NOT NULL, 
    COMPANY                  NVARCHAR(100)  NOT NULL,
    PROJECT                  NVARCHAR(100)  NOT NULL,
    SERVER_NAME              NVARCHAR(100)  NOT NULL,
    ALERT_DESCRIPTION        NVARCHAR(500)  NOT NULL,
    ALERT_KEY                NVARCHAR(100)  NOT NULL,
    NODE                     NVARCHAR(100)  NOT NULL,
    SUMMARY                  NVARCHAR(200)  NOT NULL,
    TYPE                     NVARCHAR(50)   NOT NULL CHECK (TYPE IN ('System', 'Application', 'Network', 'Security')),
    ALERT_GROUP              NVARCHAR(100)  NOT NULL,
    FIRST_OCCURENCE_DATETIME DATETIME       NOT NULL,
    LAST_OCCURENCE_DATETIME  DATETIME       NOT NULL,
    CLEAR_OCCURENCE_DATETIME DATETIME       NULL,
    DELETED_DATETIME         DATETIME       NULL,
    CATEGORY_TIER_1          NVARCHAR(100)  NOT NULL CHECK (CATEGORY_TIER_1 IN ('Infrastructure', 'Application', 'Network', 'Security', 'Database', 'Cloud')),
    CATEGORY_TIER_2          NVARCHAR(100)  NOT NULL,
    CATEGORY_TIER_3          NVARCHAR(200)  NOT NULL,

    -- ADAUGARE FOREIGN KEY: Legatura intre cele doua tabele
    CONSTRAINT FK_Alarms_Severities FOREIGN KEY (SEVERITY_ID) 
        REFERENCES dbo.Severities (ID)
);

PRINT 'Tabela dbo.Alarms a fost creata cu succes cu Foreign Key catre Severities.';
GO