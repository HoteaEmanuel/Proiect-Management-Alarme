CREATE PROCEDURE dbo.GetDashboardKPIs
AS
BEGIN
    SET NOCOUNT ON;

    -- Numar total de alarme
    SELECT 'General' AS Category, 'Total' AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms

    UNION ALL

    -- Numar de alarme per severitate (cu LEFT JOIN pt a avea si valorile 0)
    SELECT 'Severity' AS Category, s.name AS Label, COUNT(a.alarm_number) AS CountValue
    FROM dbo.Severities s
    LEFT JOIN dbo.Alarms a ON s.id = a.severity_id
    GROUP BY s.name

    UNION ALL

    -- Numar de alarme per status
    SELECT 'Status' AS Category, a.status AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.status
    
    UNION ALL
    
    -- Numar de alarme per companie
    SELECT 'Company' AS Category, a.company AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.company
    
    UNION ALL
    
    -- Numar de alarme per proiect
    SELECT 'Project' AS Category, a.project AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.project

    UNION ALL
    
    -- Numar de alarme per server
    SELECT 'ServerName' AS Category, a.server_name AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.server_name

    UNION ALL
    
    --Numar de alarme per alert_key
    SELECT 'AlertKey' AS Category, a.alert_key AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.alert_key

    UNION ALL

    -- Numar de alarme per CategoryTier1
    SELECT 'CategoryTier1' AS Category, a.category_tier_1 AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.category_tier_1
    
    UNION ALL
    
    -- Numar de alarme per CategoryTier2
    SELECT 'CategoryTier2' AS Category, a.category_tier_2 AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.category_tier_2
    
    UNION ALL
    
    -- Numar de alarme per CategoryTier3
    SELECT 'CategoryTier3' AS Category, a.category_tier_3 AS Label, COUNT(*) AS CountValue
    FROM dbo.Alarms a
    GROUP BY a.category_tier_3
    
    UNION ALL

   --timpul mediu de rezolvare alarma (verific doar pe cele cu statulul 'cleared')
    SELECT 
        'TimeKPI' AS Category, 
        'Avg_Resolution_Time_Minutes' AS Label, 
        AVG(DATEDIFF(MINUTE, FIRST_OCCURENCE_DATETIME, CLEAR_OCCURENCE_DATETIME)) AS CountValue
    FROM dbo.Alarms
    WHERE CLEAR_OCCURENCE_DATETIME IS NOT NULL

    UNION ALL

   --timpul mediu de reaparitie, verific doar pentru alea care au reaparut logic :)
    SELECT 
        'TimeKPI' AS Category, 
        'Avg_Time_Between_Occurrences_Minutes' AS Label, 
        AVG(DATEDIFF(MINUTE, FIRST_OCCURENCE_DATETIME, LAST_OCCURENCE_DATETIME)) AS CountValue
    FROM dbo.Alarms
    WHERE LAST_OCCURENCE_DATETIME > FIRST_OCCURENCE_DATETIME;

END