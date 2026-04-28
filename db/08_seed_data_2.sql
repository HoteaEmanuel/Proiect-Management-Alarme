-- =============================================================================
-- SEED SCRIPT - Alarme mai multe si variate
-- =============================================================================

;WITH Numbers AS (
    SELECT TOP (100)
        ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) + 100 AS N
    FROM sys.all_objects
),
BaseData AS (
    SELECT
        N,

        CONCAT('ALM', RIGHT('0000' + CAST(N AS VARCHAR(4)), 4)) AS ALARM_NUMBER,

        CASE N % 4
            WHEN 0 THEN 'Active'
            WHEN 1 THEN 'Acknowledged'
            WHEN 2 THEN 'Cleared'
            ELSE 'Closed'
        END AS STATUS,

        CASE N % 5
            WHEN 0 THEN 1
            WHEN 1 THEN 2
            WHEN 2 THEN 3
            WHEN 3 THEN 4
            ELSE 5
        END AS SEVERITY_ID,

        CASE N % 12
            WHEN 0 THEN 'Bosch'
            WHEN 1 THEN 'Continental'
            WHEN 2 THEN 'Nokia'
            WHEN 3 THEN 'IBM'
            WHEN 4 THEN 'Amazon'
            WHEN 5 THEN 'Google'
            WHEN 6 THEN 'Microsoft'
            WHEN 7 THEN 'SAP'
            WHEN 8 THEN 'Oracle'
            WHEN 9 THEN 'Siemens'
            WHEN 10 THEN 'Vodafone'
            ELSE 'Renault'
        END AS COMPANY,

        CASE N % 14
            WHEN 0 THEN 'ERP'
            WHEN 1 THEN 'CRM'
            WHEN 2 THEN 'Billing'
            WHEN 3 THEN 'HR'
            WHEN 4 THEN 'Logistics'
            WHEN 5 THEN 'Cloud'
            WHEN 6 THEN 'Security'
            WHEN 7 THEN 'Monitoring'
            WHEN 8 THEN 'SCADA'
            WHEN 9 THEN 'Telecom'
            WHEN 10 THEN 'Payments'
            WHEN 11 THEN 'Warehouse'
            WHEN 12 THEN 'Identity'
            ELSE 'Analytics'
        END AS PROJECT,

        CASE N % 20
            WHEN 0 THEN 'srv-db-04'
            WHEN 1 THEN 'srv-app-08'
            WHEN 2 THEN 'srv-net-04'
            WHEN 3 THEN 'srv-sec-04'
            WHEN 4 THEN 'srv-cloud-04'
            WHEN 5 THEN 'srv-api-01'
            WHEN 6 THEN 'srv-cache-01'
            WHEN 7 THEN 'srv-k8s-02'
            WHEN 8 THEN 'srv-mq-02'
            WHEN 9 THEN 'srv-web-01'
            WHEN 10 THEN 'srv-auth-01'
            WHEN 11 THEN 'srv-bkp-02'
            WHEN 12 THEN 'srv-dns-02'
            WHEN 13 THEN 'srv-fw-04'
            WHEN 14 THEN 'srv-mail-01'
            WHEN 15 THEN 'srv-proxy-01'
            WHEN 16 THEN 'srv-storage-01'
            WHEN 17 THEN 'srv-report-01'
            WHEN 18 THEN 'srv-worker-01'
            ELSE 'srv-edge-01'
        END AS SERVER_NAME,

        CASE N % 20
            WHEN 0 THEN 'CPU usage crescut pe server'
            WHEN 1 THEN 'Memorie disponibila sub pragul minim'
            WHEN 2 THEN 'Spatiu disk aproape epuizat'
            WHEN 3 THEN 'Serviciu critic nu raspunde'
            WHEN 4 THEN 'Latenta ridicata intre noduri'
            WHEN 5 THEN 'Conexiune DB instabila'
            WHEN 6 THEN 'Autentificari esuate repetate'
            WHEN 7 THEN 'Certificat aproape de expirare'
            WHEN 8 THEN 'Job de backup intarziat'
            WHEN 9 THEN 'Packet loss detectat'
            WHEN 10 THEN 'Coada de mesaje aglomerata'
            WHEN 11 THEN 'API returneaza erori 5xx'
            WHEN 12 THEN 'Pod Kubernetes restartat repetat'
            WHEN 13 THEN 'Cache hit ratio scazut'
            WHEN 14 THEN 'Replica database in urma'
            WHEN 15 THEN 'Volum trafic peste normal'
            WHEN 16 THEN 'Cont privilegiat folosit neobisnuit'
            WHEN 17 THEN 'Sincronizare NTP esuata'
            WHEN 18 THEN 'Pipeline procesare blocat'
            ELSE 'Health check endpoint esuat'
        END AS ALERT_DESCRIPTION,

        CASE N % 20
            WHEN 0 THEN 'CPU_HIGH_VAR'
            WHEN 1 THEN 'MEM_LOW_VAR'
            WHEN 2 THEN 'DISK_LOW_VAR'
            WHEN 3 THEN 'SERVICE_DOWN_VAR'
            WHEN 4 THEN 'LATENCY_HIGH_VAR'
            WHEN 5 THEN 'DB_CONN_UNSTABLE'
            WHEN 6 THEN 'AUTH_FAIL_REPEAT'
            WHEN 7 THEN 'CERT_EXP_SOON'
            WHEN 8 THEN 'BACKUP_DELAY'
            WHEN 9 THEN 'PACKET_LOSS_VAR'
            WHEN 10 THEN 'QUEUE_HIGH'
            WHEN 11 THEN 'API_5XX_HIGH'
            WHEN 12 THEN 'K8S_RESTART_LOOP'
            WHEN 13 THEN 'CACHE_LOW'
            WHEN 14 THEN 'DB_REPLICA_LAG'
            WHEN 15 THEN 'TRAFFIC_SPIKE'
            WHEN 16 THEN 'PRIV_USAGE_ODD'
            WHEN 17 THEN 'NTP_SYNC_FAIL_VAR'
            WHEN 18 THEN 'PIPELINE_BLOCKED'
            ELSE 'HEALTH_CHECK_FAIL'
        END AS ALERT_KEY,

        CONCAT('node', RIGHT('000' + CAST(N AS VARCHAR(3)), 3)) AS NODE,

        CASE N % 20
            WHEN 0 THEN 'High CPU'
            WHEN 1 THEN 'Low Memory'
            WHEN 2 THEN 'Low Disk'
            WHEN 3 THEN 'Service Down'
            WHEN 4 THEN 'High Latency'
            WHEN 5 THEN 'DB Connection'
            WHEN 6 THEN 'Auth Failures'
            WHEN 7 THEN 'Certificate Expiry'
            WHEN 8 THEN 'Backup Delay'
            WHEN 9 THEN 'Network Loss'
            WHEN 10 THEN 'Queue High'
            WHEN 11 THEN 'API Errors'
            WHEN 12 THEN 'Restart Loop'
            WHEN 13 THEN 'Cache Low'
            WHEN 14 THEN 'Replica Lag'
            WHEN 15 THEN 'Traffic Spike'
            WHEN 16 THEN 'Privileged Usage'
            WHEN 17 THEN 'NTP Failure'
            WHEN 18 THEN 'Pipeline Blocked'
            ELSE 'Health Check Failed'
        END AS SUMMARY,

        CASE N % 4
            WHEN 0 THEN 'System'
            WHEN 1 THEN 'Application'
            WHEN 2 THEN 'Network'
            ELSE 'Security'
        END AS TYPE,

        CASE N % 8
            WHEN 0 THEN 'CPU Alerts'
            WHEN 1 THEN 'Memory Alerts'
            WHEN 2 THEN 'Disk Alerts'
            WHEN 3 THEN 'Service Alerts'
            WHEN 4 THEN 'Network Alerts'
            WHEN 5 THEN 'Security Alerts'
            WHEN 6 THEN 'DB Alerts'
            ELSE 'Performance Alerts'
        END AS ALERT_GROUP,

        DATEADD(
            HOUR,
            (N * 7) % 24,
            DATEADD(DAY, -((N * 13) % 520), CAST('2026-04-20 00:00:00' AS DATETIME))
        ) AS FIRST_OCCURENCE_DATETIME,

        CASE N % 6
            WHEN 0 THEN 'Infrastructure'
            WHEN 1 THEN 'Application'
            WHEN 2 THEN 'Network'
            WHEN 3 THEN 'Security'
            WHEN 4 THEN 'Database'
            ELSE 'Cloud'
        END AS CATEGORY_TIER_1,

        CASE N % 8
            WHEN 0 THEN 'CPU'
            WHEN 1 THEN 'Memory'
            WHEN 2 THEN 'Disk'
            WHEN 3 THEN 'Service'
            WHEN 4 THEN 'Connection'
            WHEN 5 THEN 'Authentication'
            WHEN 6 THEN 'Latency'
            ELSE 'Backup'
        END AS CATEGORY_TIER_2,

        CASE N % 12
            WHEN 0 THEN 'High CPU Usage'
            WHEN 1 THEN 'Memory Pressure'
            WHEN 2 THEN 'Disk Capacity'
            WHEN 3 THEN 'Service Down'
            WHEN 4 THEN 'Packet Loss'
            WHEN 5 THEN 'Unauthorized Access'
            WHEN 6 THEN 'High Latency'
            WHEN 7 THEN 'Backup Delay'
            WHEN 8 THEN 'Database Lag'
            WHEN 9 THEN 'Certificate Expiry'
            WHEN 10 THEN 'API Error Rate'
            ELSE 'Health Check Failure'
        END AS CATEGORY_TIER_3
    FROM Numbers
),
FinalData AS (
    SELECT
        ALARM_NUMBER,
        STATUS,
        SEVERITY_ID,
        COMPANY,
        PROJECT,
        SERVER_NAME,
        ALERT_DESCRIPTION,
        ALERT_KEY,
        NODE,
        SUMMARY,
        TYPE,
        ALERT_GROUP,
        FIRST_OCCURENCE_DATETIME,

        DATEADD(
            MINUTE,
            5 + ((N * 17) % 1440),
            FIRST_OCCURENCE_DATETIME
        ) AS LAST_OCCURENCE_DATETIME,

        CASE
            WHEN STATUS IN ('Cleared', 'Closed') THEN DATEADD(
                MINUTE,
                20 + ((N * 19) % 2880),
                FIRST_OCCURENCE_DATETIME
            )
            ELSE NULL
        END AS CLEAR_OCCURENCE_DATETIME,

        CASE
            WHEN STATUS = 'Closed' AND N % 3 = 0 THEN DATEADD(
                DAY,
                1 + (N % 10),
                FIRST_OCCURENCE_DATETIME
            )
            ELSE NULL
        END AS DELETED_DATETIME,

        CATEGORY_TIER_1,
        CATEGORY_TIER_2,
        CATEGORY_TIER_3
    FROM BaseData
)
INSERT INTO dbo.Alarms (
    ALARM_NUMBER,
    STATUS,
    SEVERITY_ID,
    COMPANY,
    PROJECT,
    SERVER_NAME,
    ALERT_DESCRIPTION,
    ALERT_KEY,
    NODE,
    SUMMARY,
    TYPE,
    ALERT_GROUP,
    FIRST_OCCURENCE_DATETIME,
    LAST_OCCURENCE_DATETIME,
    CLEAR_OCCURENCE_DATETIME,
    DELETED_DATETIME,
    CATEGORY_TIER_1,
    CATEGORY_TIER_2,
    CATEGORY_TIER_3
)
SELECT
    fd.ALARM_NUMBER,
    fd.STATUS,
    fd.SEVERITY_ID,
    fd.COMPANY,
    fd.PROJECT,
    fd.SERVER_NAME,
    fd.ALERT_DESCRIPTION,
    fd.ALERT_KEY,
    fd.NODE,
    fd.SUMMARY,
    fd.TYPE,
    fd.ALERT_GROUP,
    fd.FIRST_OCCURENCE_DATETIME,
    fd.LAST_OCCURENCE_DATETIME,
    fd.CLEAR_OCCURENCE_DATETIME,
    fd.DELETED_DATETIME,
    fd.CATEGORY_TIER_1,
    fd.CATEGORY_TIER_2,
    fd.CATEGORY_TIER_3
FROM FinalData fd
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Alarms a
    WHERE a.ALARM_NUMBER = fd.ALARM_NUMBER
);

PRINT CAST(@@ROWCOUNT AS NVARCHAR) + ' alarme noi si variate au fost inserate in dbo.Alarms.';
GO
