CREATE OR ALTER PROCEDURE dbo.GetDashboardKPIs
    @start_date DATETIME,
    @end_date   DATETIME
AS
BEGIN
    SET NOCOUNT ON;

    WITH FilteredAlarms AS (
        SELECT *
        FROM dbo.Alarms
        WHERE (
            FIRST_OCCURENCE_DATETIME BETWEEN @start_date AND @end_date
            OR LAST_OCCURENCE_DATETIME  BETWEEN @start_date AND @end_date
            OR CLEAR_OCCURENCE_DATETIME BETWEEN @start_date AND @end_date
        )
    )

    -- Numar total de alarme
    SELECT 'General' AS Category, 'Total' AS Label, COUNT(*) AS CountValue
    FROM FilteredAlarms

    UNION ALL

    -- Numar de alarme per severitate (cu LEFT JOIN pt a avea si valorile 0)
    SELECT 'Severity' AS Category, s.name AS Label, COUNT(a.alarm_number) AS CountValue
    FROM dbo.Severities s
    LEFT JOIN FilteredAlarms a ON s.id = a.severity_id
    GROUP BY s.name

    UNION ALL

    SELECT 'Status'        AS Category, status        AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY status        UNION ALL
    SELECT 'Company'       AS Category, company       AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY company       UNION ALL
    SELECT 'Project'       AS Category, project       AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY project       UNION ALL
    SELECT 'ServerName'    AS Category, server_name   AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY server_name   UNION ALL
    SELECT 'AlertKey'      AS Category, alert_key     AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY alert_key     UNION ALL
    SELECT 'CategoryTier1' AS Category, category_tier_1 AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY category_tier_1 UNION ALL
    SELECT 'CategoryTier2' AS Category, category_tier_2 AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY category_tier_2 UNION ALL
    SELECT 'CategoryTier3' AS Category, category_tier_3 AS Label, COUNT(*) AS CountValue FROM FilteredAlarms GROUP BY category_tier_3

    UNION ALL

    -- Timpul mediu de rezolvare (doar cele clearate in interval)
    SELECT 
        'TimeKPI' AS Category, 
        'Avg_Resolution_Time_Minutes' AS Label, 
        AVG(DATEDIFF(MINUTE, FIRST_OCCURENCE_DATETIME, CLEAR_OCCURENCE_DATETIME)) AS CountValue
    FROM FilteredAlarms
    WHERE CLEAR_OCCURENCE_DATETIME IS NOT NULL

    UNION ALL

    -- Timpul mediu de reaparitie
    SELECT 
        'TimeKPI' AS Category, 
        'Avg_Time_Between_Occurrences_Minutes' AS Label, 
        AVG(DATEDIFF(MINUTE, FIRST_OCCURENCE_DATETIME, LAST_OCCURENCE_DATETIME)) AS CountValue
    FROM FilteredAlarms
    WHERE LAST_OCCURENCE_DATETIME > FIRST_OCCURENCE_DATETIME;

END
GO