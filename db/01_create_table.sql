-- =============================================================================
-- MIGRATION SCRIPT - Alarms Database
-- File: 01_create_table.sql
-- Description: Verifica existenta tabelului Alarms si il creeaza daca nu exista
-- Compatible with: Microsoft SQL Server
-- =============================================================================

IF OBJECT_ID('dbo.Alarms', 'U') IS NOT NULL
BEGIN
    TRUNCATE TABLE dbo.Alarms;
    PRINT 'Tabelul dbo.Alarms exista deja. Toate datele au fost sterse (TRUNCATE).';
END
ELSE
BEGIN
    CREATE TABLE dbo.Alarms (
        ALARM_NUMBER             NVARCHAR(20)   NOT NULL PRIMARY KEY,
        STATUS                   NVARCHAR(20)   NOT NULL CHECK (STATUS IN ('Active', 'Acknowledged', 'Cleared', 'Closed')),
        SEVERITY                 NVARCHAR(20)   NOT NULL CHECK (SEVERITY IN ('Info', 'Warning', 'Minor', 'Major', 'Critical')),
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
        CATEGORY_TIER_3          NVARCHAR(200)  NOT NULL
    );

    PRINT 'Tabelul dbo.Alarms a fost creat cu succes.';
END
GO
