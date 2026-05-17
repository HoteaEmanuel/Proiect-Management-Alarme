CREATE   PROCEDURE dbo.GetAlarmsByCategory
    @category   NVARCHAR(50),
    @label      NVARCHAR(200),
    @start_date DATETIME,
    @end_date   DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Validate input parameters
    IF @start_date > @end_date
    BEGIN
        ;THROW 50000, 'Start date cannot be strictly greater than the end date.', 1;
    END

    -- 2. Pre-filter the alarms by the date interval into a Temporary Table
    SELECT *
    INTO #FilteredAlarms
    FROM dbo.Alarms
    WHERE (
        FIRST_OCCURENCE_DATETIME BETWEEN @start_date AND @end_date
        OR LAST_OCCURENCE_DATETIME  BETWEEN @start_date AND @end_date
        OR CLEAR_OCCURENCE_DATETIME BETWEEN @start_date AND @end_date
    );

    -- 3. Now apply the category and label filters on the temporary table
    IF @category = 'Severity'
        SELECT a.* FROM #FilteredAlarms a
        INNER JOIN dbo.Severities s ON a.severity_id = s.id
        WHERE s.name = @label

    ELSE IF @category = 'Status'
        SELECT * FROM #FilteredAlarms WHERE status = @label

    ELSE IF @category = 'Company'
        SELECT * FROM #FilteredAlarms WHERE company = @label

    ELSE IF @category = 'Project'
        SELECT * FROM #FilteredAlarms WHERE project = @label

    ELSE IF @category = 'ServerName'
        SELECT * FROM #FilteredAlarms WHERE server_name = @label

    ELSE IF @category = 'AlertKey'
        SELECT * FROM #FilteredAlarms WHERE alert_key = @label

    ELSE IF @category = 'AlertGroup'
        SELECT * FROM #FilteredAlarms WHERE alert_group = @label

    ELSE IF @category = 'Type'
        SELECT * FROM #FilteredAlarms WHERE type = @label

    ELSE IF @category = 'Node'
        SELECT * FROM #FilteredAlarms WHERE node = @label

    ELSE IF @category = 'CategoryTier1'
        SELECT * FROM #FilteredAlarms WHERE category_tier_1 = @label

    ELSE IF @category = 'CategoryTier2'
        SELECT * FROM #FilteredAlarms WHERE category_tier_2 = @label

    ELSE IF @category = 'CategoryTier3'
        SELECT * FROM #FilteredAlarms WHERE category_tier_3 = @label

    ELSE
        SELECT * FROM #FilteredAlarms WHERE 1 = 0;

    -- 4. Clean up the temporary table (Best practice, though SQL Server deletes it automatically at the end)
    DROP TABLE #FilteredAlarms;

END