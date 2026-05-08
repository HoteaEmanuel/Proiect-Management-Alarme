CREATE OR ALTER PROCEDURE dbo.GetAlarmsByCategory
    @category   NVARCHAR(50),
    @label      NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    IF @category = 'Severity'
        SELECT a.* FROM dbo.Alarms a
        INNER JOIN dbo.Severities s ON a.severity_id = s.id
        WHERE s.name = @label

    ELSE IF @category = 'Status'
        SELECT * FROM dbo.Alarms WHERE status = @label

    ELSE IF @category = 'Company'
        SELECT * FROM dbo.Alarms WHERE company = @label

    ELSE IF @category = 'Project'
        SELECT * FROM dbo.Alarms WHERE project = @label

    ELSE IF @category = 'ServerName'
        SELECT * FROM dbo.Alarms WHERE server_name = @label

    ELSE IF @category = 'AlertKey'
        SELECT * FROM dbo.Alarms WHERE alert_key = @label

    ELSE IF @category = 'AlertGroup'
        SELECT * FROM dbo.Alarms WHERE alert_group = @label

    ELSE IF @category = 'Type'
        SELECT * FROM dbo.Alarms WHERE type = @label

    ELSE IF @category = 'Node'
        SELECT * FROM dbo.Alarms WHERE node = @label

    ELSE IF @category = 'CategoryTier1'
        SELECT * FROM dbo.Alarms WHERE category_tier_1 = @label

    ELSE IF @category = 'CategoryTier2'
        SELECT * FROM dbo.Alarms WHERE category_tier_2 = @label

    ELSE IF @category = 'CategoryTier3'
        SELECT * FROM dbo.Alarms WHERE category_tier_3 = @label

    ELSE
        SELECT * FROM dbo.Alarms WHERE 1 = 0;

END
GO