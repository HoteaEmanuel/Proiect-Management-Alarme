CREATE OR ALTER PROCEDURE dbo.GetAlarmTrend
    @granularity VARCHAR(10),
    @group_by    VARCHAR(20) = 'severity',
    @live_limit  INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @granularity NOT IN ('monthly', 'weekly', 'daily', 'hourly', 'live')
    BEGIN
        ;THROW 50001, 'Invalid granularity. Accepted values: monthly, weekly, daily, hourly, live.', 1;
    END

    IF @group_by NOT IN ('severity', 'status', 'company')
    BEGIN
        ;THROW 50002, 'Invalid group_by. Accepted values: severity, status, company.', 1;
    END

    DECLARE @window_start DATETIME = CASE @granularity
        WHEN 'monthly' THEN DATEADD(DAY,    -30, GETDATE())
        WHEN 'weekly'  THEN DATEADD(DAY,     -7, GETDATE())
        WHEN 'daily'   THEN DATEADD(HOUR,   -24, GETDATE())
        WHEN 'hourly'  THEN DATEADD(MINUTE, -60, GETDATE())
        WHEN 'live'    THEN DATEADD(DAY,     -1, GETDATE())
    END;

    SELECT
        a.*,
        CASE @group_by
            WHEN 'severity' THEN s.name
            WHEN 'status'   THEN a.status
            WHEN 'company'  THEN a.company
        END AS group_label
    INTO #TrendAlarms
    FROM dbo.Alarms a
    INNER JOIN dbo.Severities s ON s.id = a.severity_id
    WHERE
        a.first_occurence_datetime >= @window_start
        AND a.deleted_datetime IS NULL;

    IF @granularity IN ('monthly', 'weekly')
    BEGIN
        SELECT
            CONVERT(VARCHAR(10), first_occurence_datetime, 120) AS time_bucket,
            group_label,
            COUNT(*)                                             AS alarm_count
        FROM #TrendAlarms
        GROUP BY
            CONVERT(VARCHAR(10), first_occurence_datetime, 120),
            group_label
        ORDER BY time_bucket ASC;
        DROP TABLE #TrendAlarms; RETURN;
    END

    IF @granularity = 'daily'
    BEGIN
        SELECT
            CONVERT(VARCHAR(16),
                DATEADD(HOUR, DATEDIFF(HOUR, 0, first_occurence_datetime), 0), 120) AS time_bucket,
            group_label,
            COUNT(*)    AS alarm_count
        FROM #TrendAlarms
        GROUP BY
            DATEADD(HOUR, DATEDIFF(HOUR, 0, first_occurence_datetime), 0),
            group_label
        ORDER BY time_bucket ASC;
        DROP TABLE #TrendAlarms; RETURN;
    END

    IF @granularity = 'hourly'
    BEGIN
        SELECT
            CONVERT(VARCHAR(16),
                DATEADD(MINUTE, (DATEDIFF(MINUTE, 0, first_occurence_datetime) / 5) * 5, 0), 120) AS time_bucket,
            group_label,
            COUNT(*)    AS alarm_count
        FROM #TrendAlarms
        GROUP BY
            DATEADD(MINUTE, (DATEDIFF(MINUTE, 0, first_occurence_datetime) / 5) * 5, 0),
            group_label
        ORDER BY time_bucket ASC;
        DROP TABLE #TrendAlarms; RETURN;
    END

    IF @granularity = 'live'
    BEGIN
        SELECT TOP (@live_limit)
            alarm_number,
            status,
            group_label,
            summary,
            server_name,
            first_occurence_datetime
        FROM #TrendAlarms
        ORDER BY first_occurence_datetime DESC;
        DROP TABLE #TrendAlarms; RETURN;
    END

    DROP TABLE #TrendAlarms;
END;
GO