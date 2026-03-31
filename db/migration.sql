-- =============================================================================
-- MIGRATION SCRIPT - Alarms Database
-- Description: Creates the Alarms table and seeds it with 100 sample records
-- Compatible with: Microsoft SQL Server
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREATE TABLE
-- -----------------------------------------------------------------------------

IF OBJECT_ID('dbo.Alarms', 'U') IS NOT NULL
    DROP TABLE dbo.Alarms;
GO

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
GO

-- -----------------------------------------------------------------------------
-- 2. INSERT DATA (100 records)
-- -----------------------------------------------------------------------------

INSERT INTO dbo.Alarms (
    ALARM_NUMBER, STATUS, SEVERITY, COMPANY, PROJECT, SERVER_NAME,
    ALERT_DESCRIPTION, ALERT_KEY, NODE, SUMMARY, TYPE, ALERT_GROUP,
    FIRST_OCCURENCE_DATETIME, LAST_OCCURENCE_DATETIME,
    CLEAR_OCCURENCE_DATETIME, DELETED_DATETIME,
    CATEGORY_TIER_1, CATEGORY_TIER_2, CATEGORY_TIER_3
)
VALUES

-- ---- Records from template examples (ALM0001 - ALM0010) ----

('ALM0001', 'Active',       'Critical', 'Bosch',     'ERP',       'srv-db-01',    'CPU usage peste 95%',                  'CPU_HIGH',        'db01',    'High CPU',        'System',      'CPU Alerts',         '2026-03-27 08:00:00', '2026-03-27 08:05:00', NULL,                  NULL, 'Infrastructure', 'CPU',            'High CPU Usage'),
('ALM0002', 'Cleared',      'Major',    'Continental','CRM',       'srv-app-02',   'API timeout la login',                 'API_TIMEOUT',     'app02',   'API Timeout',     'Application', 'API Alerts',         '2026-03-27 07:30:00', '2026-03-27 07:45:00', '2026-03-27 07:50:00', NULL, 'Application',   'API',            'API Timeout'),
('ALM0003', 'Active',       'Minor',    'Nokia',      'Billing',   'srv-db-02',    'Spatiu disk sub 10%',                  'DISK_LOW',        'db02',    'Low Disk',        'System',      'Disk Alerts',        '2026-03-27 06:00:00', '2026-03-27 08:00:00', NULL,                  NULL, 'Infrastructure', 'Disk',           'Disk Full'),
('ALM0004', 'Acknowledged', 'Major',    'IBM',        'HR',        'srv-app-03',   'Serviciu oprit',                       'SERVICE_DOWN',    'app03',   'Service Down',    'Application', 'Service Alerts',     '2026-03-27 09:00:00', '2026-03-27 09:10:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0005', 'Closed',       'Warning',  'Amazon',     'Logistics', 'srv-net-01',   'Packet loss ridicat',                  'PACKET_LOSS',     'net01',   'Network Issue',   'Network',     'Network Alerts',     '2026-03-27 05:00:00', '2026-03-27 05:20:00', '2026-03-27 05:30:00', NULL, 'Network',       'Connection',     'Packet Loss'),
('ALM0006', 'Active',       'Critical', 'Google',     'Search',    'srv-sec-01',   'Tentativa acces neautorizat',          'UNAUTH_ACCESS',   'sec01',   'Security Alert',  'Security',    'Security Alerts',    '2026-03-27 10:00:00', '2026-03-27 10:05:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0007', 'Cleared',      'Minor',    'Meta',       'Ads',       'srv-app-04',   'Memory usage ridicat',                 'MEM_HIGH',        'app04',   'High Memory',     'System',      'Memory Alerts',      '2026-03-27 03:00:00', '2026-03-27 03:30:00', '2026-03-27 04:00:00', NULL, 'Infrastructure', 'Memory',         'Memory Leak'),
('ALM0008', 'Active',       'Major',    'Oracle',     'DB',        'srv-db-03',    'Conexiuni DB refuzate',                'DB_CONN_FAIL',    'db03',    'DB Connection',   'Application', 'DB Alerts',          '2026-03-27 11:00:00', '2026-03-27 11:10:00', NULL,                  NULL, 'Database',      'Connection',     'Connection Refused'),
('ALM0009', 'Closed',       'Info',     'SAP',        'Finance',   'srv-app-05',   'Restart programat',                   'SCHEDULED_RESTART','app05',  'Restart',         'System',      'Maintenance',        '2026-03-27 01:00:00', '2026-03-27 01:10:00', '2026-03-27 01:15:00', NULL, 'Infrastructure', 'Service',        'Scheduled Restart'),
('ALM0010', 'Active',       'Major',    'Microsoft',  'Azure',     'srv-cloud-01', 'Latency ridicat',                      'HIGH_LATENCY',    'cloud01', 'High Latency',    'Network',     'Performance Alerts', '2026-03-27 12:00:00', '2026-03-27 12:05:00', NULL,                  NULL, 'Cloud',         'Latency',        'High Latency'),

-- ---- Generated records (ALM0011 - ALM0100) ----

-- Infrastructure / CPU
('ALM0011', 'Active',       'Critical', 'Siemens',    'SCADA',     'srv-app-06',   'CPU usage 98% pe nodul de procesare',  'CPU_HIGH',        'app06',   'High CPU',        'System',      'CPU Alerts',         '2026-03-26 14:00:00', '2026-03-27 14:00:00', NULL,                  NULL, 'Infrastructure', 'CPU',            'High CPU Usage'),
('ALM0012', 'Acknowledged', 'Major',    'Renault',    'Fleet',     'srv-app-07',   'CPU throttling detectat pe cluster',   'CPU_THROTTLE',    'app07',   'CPU Throttle',    'System',      'CPU Alerts',         '2026-03-26 10:00:00', '2026-03-27 10:00:00', NULL,                  NULL, 'Infrastructure', 'CPU',            'CPU Throttling'),
('ALM0013', 'Cleared',      'Minor',    'Philips',    'MedDevice', 'srv-proc-01',  'CPU load average depasit 4.0',        'CPU_LOAD_AVG',    'proc01',  'CPU Load Avg',    'System',      'CPU Alerts',         '2026-03-25 22:00:00', '2026-03-26 02:00:00', '2026-03-26 02:30:00', NULL, 'Infrastructure', 'CPU',            'High CPU Usage'),
('ALM0014', 'Active',       'Warning',  'Toyota',     'MES',       'srv-mes-01',   'CPU core 3 la 100% utilzare',         'CPU_CORE_MAX',    'mes01',   'CPU Core Full',   'System',      'CPU Alerts',         '2026-03-27 06:30:00', '2026-03-27 12:30:00', NULL,                  NULL, 'Infrastructure', 'CPU',            'High CPU Usage'),
('ALM0015', 'Closed',       'Info',     'Ericsson',   'Telecom',   'srv-tel-01',   'CPU usage normalizat dupa restart',   'CPU_NORMALIZED',  'tel01',   'CPU Normal',      'System',      'CPU Alerts',         '2026-03-24 08:00:00', '2026-03-24 08:30:00', '2026-03-24 09:00:00', '2026-03-25 08:00:00', 'Infrastructure', 'CPU', 'High CPU Usage'),

-- Infrastructure / Memory
('ALM0016', 'Active',       'Critical', 'Vodafone',   'BSS',       'srv-bss-01',   'Memorie disponibila sub 512MB',       'MEM_LOW',         'bss01',   'Low Memory',      'System',      'Memory Alerts',      '2026-03-27 13:00:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Infrastructure', 'Memory',         'Memory Leak'),
('ALM0017', 'Acknowledged', 'Major',    'Orange',     'CRM',       'srv-crm-01',   'JVM heap space epuizat',              'JVM_HEAP_FULL',   'crm01',   'JVM Heap Full',   'Application', 'Memory Alerts',      '2026-03-27 11:45:00', '2026-03-27 12:00:00', NULL,                  NULL, 'Infrastructure', 'Memory',         'Memory Leak'),
('ALM0018', 'Cleared',      'Minor',    'Deutsche Telekom','OSS',  'srv-oss-01',   'Memory usage a scazut la 72%',        'MEM_DECREASE',    'oss01',   'Memory OK',       'System',      'Memory Alerts',      '2026-03-26 16:00:00', '2026-03-26 17:00:00', '2026-03-26 17:30:00', NULL, 'Infrastructure', 'Memory',         'Memory Leak'),
('ALM0019', 'Active',       'Warning',  'Infineon',   'Embedded',  'srv-emb-01',   'Swap usage depasit 80%',              'SWAP_HIGH',       'emb01',   'High Swap',       'System',      'Memory Alerts',      '2026-03-27 09:30:00', '2026-03-27 13:30:00', NULL,                  NULL, 'Infrastructure', 'Memory',         'High Swap Usage'),
('ALM0020', 'Closed',       'Info',     'Continental','ERP',       'srv-erp-01',   'Memoria a revenit la valori normale', 'MEM_STABLE',      'erp01',   'Memory Stable',   'System',      'Memory Alerts',      '2026-03-23 12:00:00', '2026-03-23 12:30:00', '2026-03-23 13:00:00', '2026-03-24 12:00:00', 'Infrastructure', 'Memory', 'Memory Leak'),

-- Infrastructure / Disk
('ALM0021', 'Active',       'Critical', 'SAP',        'S4HANA',    'srv-hana-01',  'Disk /data la 99% capacitate',        'DISK_CRITICAL',   'hana01',  'Disk Full',       'System',      'Disk Alerts',        '2026-03-27 07:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Infrastructure', 'Disk',           'Disk Full'),
('ALM0022', 'Acknowledged', 'Major',    'Nokia',      'Core',      'srv-core-01',  'Log partition la 92%',                'LOG_PART_FULL',   'core01',  'Log Disk Full',   'System',      'Disk Alerts',        '2026-03-27 05:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Infrastructure', 'Disk',           'Disk Full'),
('ALM0023', 'Cleared',      'Minor',    'Bosch',      'IoT',       'srv-iot-01',   'Fisiere temporare curatate automat',  'TEMP_CLEAN',      'iot01',   'Temp Cleaned',    'System',      'Disk Alerts',        '2026-03-26 20:00:00', '2026-03-26 20:05:00', '2026-03-26 20:10:00', NULL, 'Infrastructure', 'Disk',           'Disk Cleanup'),
('ALM0024', 'Active',       'Warning',  'Siemens',    'PLM',       'srv-plm-01',   'Disk I/O wait time depasit 200ms',    'DISK_IO_WAIT',    'plm01',   'High I/O Wait',   'System',      'Disk Alerts',        '2026-03-27 10:15:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Infrastructure', 'Disk',           'High Disk I/O'),
('ALM0025', 'Closed',       'Info',     'Microsoft',  'OneDrive',  'srv-od-01',    'Backup disk verificat si OK',         'DISK_BACKUP_OK',  'od01',    'Backup OK',       'System',      'Disk Alerts',        '2026-03-22 03:00:00', '2026-03-22 03:10:00', '2026-03-22 03:15:00', '2026-03-23 03:00:00', 'Infrastructure', 'Disk', 'Disk Full'),

-- Database
('ALM0026', 'Active',       'Critical', 'Oracle',     'HRMS',      'srv-db-04',    'Tablespace USERS la 100%',            'TS_USERS_FULL',   'db04',    'Tablespace Full', 'Application', 'DB Alerts',          '2026-03-27 08:45:00', '2026-03-27 13:45:00', NULL,                  NULL, 'Database',      'Disk',           'Disk Full'),
('ALM0027', 'Acknowledged', 'Major',    'IBM',        'Cognos',    'srv-db-05',    'Query blocat de peste 10 minute',     'QUERY_BLOCKED',   'db05',    'Query Blocked',   'Application', 'DB Alerts',          '2026-03-27 12:15:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Database',      'Connection',     'Connection Refused'),
('ALM0028', 'Cleared',      'Major',    'Microsoft',  'SQL',       'srv-db-06',    'Deadlock detectat intre 2 sesiuni',   'DB_DEADLOCK',     'db06',    'DB Deadlock',     'Application', 'DB Alerts',          '2026-03-26 22:30:00', '2026-03-26 22:35:00', '2026-03-26 22:40:00', NULL, 'Database',      'Connection',     'Deadlock Detected'),
('ALM0029', 'Active',       'Warning',  'SAP',        'BW',        'srv-db-07',    'Conexiuni DB au atins pragul 80%',    'DB_CONN_LIMIT',   'db07',    'DB Conn Limit',   'Application', 'DB Alerts',          '2026-03-27 11:30:00', '2026-03-27 13:30:00', NULL,                  NULL, 'Database',      'Connection',     'Connection Limit Reached'),
('ALM0030', 'Active',       'Critical', 'Continental','DMS',       'srv-db-08',    'Replicare DB intrerupta',             'DB_REPL_FAIL',    'db08',    'Replication Fail','Application', 'DB Alerts',          '2026-03-27 07:15:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Database',      'Connection',     'Replication Failure'),
('ALM0031', 'Acknowledged', 'Minor',    'Google',     'BigQuery',  'srv-bq-01',    'Slot utilization depasit 90%',        'BQ_SLOT_HIGH',    'bq01',    'BQ Slot High',    'Application', 'DB Alerts',          '2026-03-27 09:45:00', '2026-03-27 12:45:00', NULL,                  NULL, 'Cloud',         'Latency',        'High Latency'),
('ALM0032', 'Cleared',      'Info',     'Amazon',     'RDS',       'srv-rds-01',   'Backup automat RDS finalizat',        'RDS_BACKUP_OK',   'rds01',   'RDS Backup OK',   'Application', 'DB Alerts',          '2026-03-26 04:00:00', '2026-03-26 04:25:00', '2026-03-26 04:30:00', NULL, 'Database',      'Service',        'Scheduled Restart'),

-- Network
('ALM0033', 'Active',       'Critical', 'Vodafone',   'Core',      'srv-net-02',   'Link agregat cazut intre DC1-DC2',    'LINK_DOWN',       'net02',   'Link Down',       'Network',     'Network Alerts',     '2026-03-27 13:20:00', '2026-03-27 13:20:00', NULL,                  NULL, 'Network',       'Connection',     'Network Link Down'),
('ALM0034', 'Active',       'Major',    'Orange',     'MPLS',      'srv-net-03',   'BGP session cazuta cu peer extern',   'BGP_DOWN',        'net03',   'BGP Down',        'Network',     'Network Alerts',     '2026-03-27 12:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Network',       'Connection',     'BGP Session Down'),
('ALM0035', 'Cleared',      'Warning',  'Ericsson',   'RAN',       'srv-net-04',   'Jitter depasit 50ms pe legatura WAN', 'NET_JITTER',      'net04',   'High Jitter',     'Network',     'Network Alerts',     '2026-03-26 18:00:00', '2026-03-26 18:30:00', '2026-03-26 19:00:00', NULL, 'Network',       'Latency',        'High Latency'),
('ALM0036', 'Acknowledged', 'Major',    'Nokia',      'Optical',   'srv-net-05',   'Fibra optica - erori CRC ridicate',   'FIBER_CRC_ERR',   'net05',   'CRC Errors',      'Network',     'Network Alerts',     '2026-03-27 08:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Network',       'Connection',     'Packet Loss'),
('ALM0037', 'Active',       'Minor',    'Siemens',    'OT-Net',    'srv-net-06',   'SNMP trap - port switch in eroare',   'SWITCH_PORT_ERR', 'net06',   'Switch Port Err', 'Network',     'Network Alerts',     '2026-03-27 11:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Network',       'Connection',     'Packet Loss'),
('ALM0038', 'Closed',       'Info',     'Toyota',     'Plant',     'srv-net-07',   'VLAN reconfigurata cu succes',        'VLAN_RECONFIG',   'net07',   'VLAN OK',         'Network',     'Network Alerts',     '2026-03-20 14:00:00', '2026-03-20 14:10:00', '2026-03-20 14:20:00', '2026-03-21 14:00:00', 'Network', 'Connection', 'Network Link Down'),
('ALM0039', 'Active',       'Critical', 'Deutsche Telekom','IP',   'srv-net-08',   'DDoS attack detectat - flood SYN',   'DDOS_SYN',        'net08',   'DDoS SYN Flood',  'Network',     'Security Alerts',    '2026-03-27 13:00:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0040', 'Acknowledged', 'Warning',  'Amazon',     'CloudFront','srv-cf-01',    'Bandwidth utilizare la 85%',          'BW_HIGH',         'cf01',    'High Bandwidth',  'Network',     'Performance Alerts', '2026-03-27 10:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Cloud',         'Latency',        'High Latency'),

-- Security
('ALM0041', 'Active',       'Critical', 'Microsoft',  'AD',        'srv-ad-01',    'Atac brute force detectat pe AD',     'BRUTE_FORCE',     'ad01',    'Brute Force',     'Security',    'Security Alerts',    '2026-03-27 12:30:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0042', 'Active',       'Critical', 'Bosch',      'Security',  'srv-sec-02',   'Ransomware potential detectat',       'RANSOMWARE',      'sec02',   'Ransomware Alert','Security',    'Security Alerts',    '2026-03-27 11:55:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0043', 'Acknowledged', 'Major',    'SAP',        'IAM',       'srv-iam-01',   'Cont privilegiat logat din tara straina','PRIV_LOGIN_EXT','iam01',  'Priv Login Ext',  'Security',    'Security Alerts',    '2026-03-27 09:00:00', '2026-03-27 12:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0044', 'Cleared',      'Major',    'Google',     'GCP',       'srv-gcp-01',   'Service account cheie compromisa',    'SA_KEY_BREACH',   'gcp01',   'SA Key Breach',   'Security',    'Security Alerts',    '2026-03-26 15:00:00', '2026-03-26 16:00:00', '2026-03-26 16:30:00', NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0045', 'Active',       'Warning',  'Philips',    'PACS',      'srv-pacs-01',  'Certificate SSL expira in 7 zile',    'SSL_CERT_EXP',    'pacs01',  'SSL Cert Expiry', 'Security',    'Security Alerts',    '2026-03-27 08:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Certificate Expiry'),
('ALM0046', 'Closed',       'Info',     'IBM',        'QRadar',    'srv-siem-01',  'Politica firewall actualizata',       'FW_POLICY_UPD',   'siem01',  'FW Policy Upd',   'Security',    'Security Alerts',    '2026-03-18 10:00:00', '2026-03-18 10:05:00', '2026-03-18 10:10:00', '2026-03-19 10:00:00', 'Security', 'Authentication', 'Unauthorized Access'),
('ALM0047', 'Active',       'Major',    'Vodafone',   'SOC',       'srv-soc-01',   'IDS a detectat scan de porturi',      'PORT_SCAN',       'soc01',   'Port Scan',       'Security',    'Security Alerts',    '2026-03-27 12:45:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0048', 'Acknowledged', 'Minor',    'Meta',       'Infosec',   'srv-sec-03',   'Login esuat de 5 ori consecutiv',     'LOGIN_FAIL_5X',   'sec03',   'Login Fail 5x',   'Security',    'Security Alerts',    '2026-03-27 11:10:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),

-- Application / API
('ALM0049', 'Active',       'Critical', 'Amazon',     'Marketplace','srv-api-01',  'API gateway down - 0 request/s',     'API_GW_DOWN',     'api01',   'API GW Down',     'Application', 'API Alerts',         '2026-03-27 13:05:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Application',   'API',            'API Timeout'),
('ALM0050', 'Active',       'Major',    'Continental','Portal',    'srv-api-02',   'API rata de eroare 40xx la 35%',      'API_ERROR_RATE',  'api02',   'API Error Rate',  'Application', 'API Alerts',         '2026-03-27 10:30:00', '2026-03-27 13:30:00', NULL,                  NULL, 'Application',   'API',            'API Error Rate High'),
('ALM0051', 'Cleared',      'Warning',  'Google',     'Maps API',  'srv-api-03',   'Rate limit API atins - 429 Too Many Requests','API_RATE_LIMIT','api03','API Rate Limit','Application','API Alerts',       '2026-03-26 23:00:00', '2026-03-26 23:30:00', '2026-03-27 00:00:00', NULL, 'Application',   'API',            'API Rate Limit'),
('ALM0052', 'Acknowledged', 'Minor',    'Microsoft',  'Graph API', 'srv-api-04',   'Latenta API Graph > 3000ms',          'API_LATENCY',     'api04',   'API Latency',     'Application', 'API Alerts',         '2026-03-27 09:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Application',   'API',            'API Timeout'),
('ALM0053', 'Active',       'Major',    'Oracle',     'Fusion',    'srv-api-05',   'Webhook-uri esueaza - conexiune refuzata','WEBHOOK_FAIL', 'api05',   'Webhook Fail',    'Application', 'API Alerts',         '2026-03-27 11:20:00', '2026-03-27 13:20:00', NULL,                  NULL, 'Application',   'API',            'API Timeout'),

-- Application / Service
('ALM0054', 'Active',       'Critical', 'Renault',    'Dealer',    'srv-svc-01',   'Microserviciu payment oprit',         'SVC_PAYMENT_DOWN','svc01',   'Payment Down',    'Application', 'Service Alerts',     '2026-03-27 13:10:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0055', 'Active',       'Major',    'Siemens',    'Energy',    'srv-svc-02',   'Serviciu MQTT broker inaccesibil',    'MQTT_DOWN',       'svc02',   'MQTT Down',       'Application', 'Service Alerts',     '2026-03-27 12:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0056', 'Cleared',      'Minor',    'Nokia',      'Mediation', 'srv-svc-03',   'Serviciu de mediere restartat automat','SVC_AUTO_RESTART','svc03',  'Auto Restart',    'Application', 'Service Alerts',     '2026-03-26 21:00:00', '2026-03-26 21:02:00', '2026-03-26 21:05:00', NULL, 'Application',   'Service',        'Scheduled Restart'),
('ALM0057', 'Acknowledged', 'Major',    'IBM',        'MQ',        'srv-mq-01',    'Coada MQ la 90% capacitate',          'MQ_QUEUE_FULL',   'mq01',    'MQ Queue Full',   'Application', 'Service Alerts',     '2026-03-27 10:45:00', '2026-03-27 13:45:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0058', 'Active',       'Warning',  'SAP',        'PI/PO',     'srv-pi-01',    'Canal de integrare blocai in PI/PO',  'PI_CHAN_BLOCKED', 'pi01',    'PI Channel Block','Application', 'Service Alerts',     '2026-03-27 11:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0059', 'Active',       'Critical', 'Philips',    'HealthSuite','srv-hs-01',   'Serviciu DICOM vizualizare oprit',    'DICOM_DOWN',      'hs01',    'DICOM Down',      'Application', 'Service Alerts',     '2026-03-27 12:50:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0060', 'Closed',       'Info',     'Amazon',     'Lambda',    'srv-lmb-01',   'Functie Lambda actualizata cu succes','LAMBDA_UPDATED',  'lmb01',   'Lambda Updated',  'Application', 'Maintenance',        '2026-03-15 09:00:00', '2026-03-15 09:05:00', '2026-03-15 09:10:00', '2026-03-16 09:00:00', 'Cloud', 'Service', 'Scheduled Restart'),

-- Cloud
('ALM0061', 'Active',       'Critical', 'Microsoft',  'AKS',       'srv-k8s-01',   'Nod Kubernetes NotReady',             'K8S_NODE_NOT_RDY','k8s01',  'K8s Node Down',   'Application', 'Service Alerts',     '2026-03-27 12:40:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Cloud',         'Service',        'Service Down'),
('ALM0062', 'Active',       'Major',    'Google',     'GKE',       'srv-gke-01',   'Pod OOMKilled - memorie insuficienta','POD_OOM_KILLED',  'gke01',   'Pod OOMKilled',   'Application', 'Memory Alerts',      '2026-03-27 11:15:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Cloud',         'Memory',         'Memory Leak'),
('ALM0063', 'Cleared',      'Warning',  'Amazon',     'EKS',       'srv-eks-01',   'HPA a scalat deployment-ul la maxim', 'HPA_MAX_SCALE',   'eks01',   'HPA Max Scale',   'Application', 'Performance Alerts', '2026-03-26 19:00:00', '2026-03-26 21:00:00', '2026-03-26 21:30:00', NULL, 'Cloud',         'CPU',            'High CPU Usage'),
('ALM0064', 'Acknowledged', 'Major',    'IBM',        'IKS',       'srv-iks-01',   'etcd cluster degradat - 1 din 3 noduri','ETCD_DEGRADED', 'iks01',   'etcd Degraded',   'Application', 'DB Alerts',          '2026-03-27 08:30:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Cloud',         'Connection',     'Connection Refused'),
('ALM0065', 'Active',       'Minor',    'Deutsche Telekom','OTC',  'srv-otc-01',   'Persistent Volume Claim pending',     'PVC_PENDING',     'otc01',   'PVC Pending',     'Application', 'Disk Alerts',        '2026-03-27 07:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Cloud',         'Disk',           'Disk Full'),
('ALM0066', 'Active',       'Critical', 'Amazon',     'EC2',       'srv-ec2-01',   'Instanta EC2 inaccessibila - status check 2 failed','EC2_STATUS_FAIL','ec2-01','EC2 Fail','System',  'Service Alerts',     '2026-03-27 12:55:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Cloud',         'Service',        'Service Down'),
('ALM0067', 'Cleared',      'Major',    'Microsoft',  'Azure',     'srv-afd-01',   'Azure Front Door - origine unhealthy','AFD_ORIGIN_FAIL', 'afd01',   'AFD Origin Fail', 'Network',     'Network Alerts',     '2026-03-26 20:00:00', '2026-03-26 20:30:00', '2026-03-26 21:00:00', NULL, 'Cloud',         'Service',        'Service Down'),
('ALM0068', 'Acknowledged', 'Warning',  'Google',     'Cloud Run', 'srv-cr-01',    'Instante Cloud Run la limita concurenta','CR_CONCUR_LIMIT','cr01',   'Concur Limit',    'Application', 'Performance Alerts', '2026-03-27 10:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Cloud',         'Latency',        'High Latency'),

-- Performance & Latency
('ALM0069', 'Active',       'Critical', 'Vodafone',   'VoLTE',     'srv-volte-01', 'Latenta apeluri VoLTE > 400ms',       'VOLTE_LATENCY',   'volte01', 'VoLTE Latency',   'Network',     'Performance Alerts', '2026-03-27 13:00:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Network',       'Latency',        'High Latency'),
('ALM0070', 'Active',       'Major',    'Orange',     'IMS',       'srv-ims-01',   'Timp raspuns IMS core > 2s',          'IMS_RESP_HIGH',   'ims01',   'IMS High Resp',   'Network',     'Performance Alerts', '2026-03-27 11:30:00', '2026-03-27 13:30:00', NULL,                  NULL, 'Network',       'Latency',        'High Latency'),
('ALM0071', 'Cleared',      'Warning',  'Amazon',     'CloudWatch','srv-cw-01',    'P99 latency endpoint /checkout > 5s', 'P99_LATENCY',     'cw01',    'P99 Latency',     'Application', 'Performance Alerts', '2026-03-26 22:00:00', '2026-03-26 23:00:00', '2026-03-26 23:30:00', NULL, 'Application',   'Latency',        'High Latency'),
('ALM0072', 'Acknowledged', 'Minor',    'Renault',    'Telematics','srv-tel-02',   'Throughput MQTT scazut cu 30%',       'MQTT_THROUGHPUT', 'tel02',   'MQTT Throughput', 'Application', 'Performance Alerts', '2026-03-27 09:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Application',   'Latency',        'High Latency'),

-- Additional mixed scenarios
('ALM0073', 'Active',       'Critical', 'Infineon',   'MES',       'srv-mes-02',   'Linie productie oprita - PLC offline','PLC_OFFLINE',     'mes02',   'PLC Offline',     'System',      'Service Alerts',     '2026-03-27 13:10:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Infrastructure', 'Service',       'Service Down'),
('ALM0074', 'Active',       'Major',    'Ericsson',   'EMS',       'srv-ems-01',   'Alarma sincronizare NTP esuat',       'NTP_SYNC_FAIL',   'ems01',   'NTP Sync Fail',   'System',      'Network Alerts',     '2026-03-27 10:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Infrastructure', 'Connection',    'Network Link Down'),
('ALM0075', 'Cleared',      'Minor',    'IBM',        'Websphere', 'srv-was-01',   'Thread pool la 80% - risc de blocare','WAS_THREAD_POOL', 'was01',   'Thread Pool',     'Application', 'Performance Alerts', '2026-03-26 17:00:00', '2026-03-26 18:00:00', '2026-03-26 18:30:00', NULL, 'Application',   'CPU',            'High CPU Usage'),
('ALM0076', 'Active',       'Major',    'SAP',        'HANA',      'srv-hana-02',  'HANA delta merge blocat > 30 min',    'HANA_DELTA_BLOCK','hana02',  'HANA Delta Block','Application', 'DB Alerts',          '2026-03-27 11:45:00', '2026-03-27 13:45:00', NULL,                  NULL, 'Database',      'Connection',     'Connection Refused'),
('ALM0077', 'Acknowledged', 'Warning',  'Toyota',     'TMS',       'srv-tms-01',   'Certificat client expirat in 14 zile','CLIENT_CERT_EXP', 'tms01',   'Cert Expiry',     'Security',    'Security Alerts',    '2026-03-27 08:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Certificate Expiry'),
('ALM0078', 'Closed',       'Info',     'Philips',    'Update',    'srv-upd-01',   'Patch de securitate aplicat cu succes','SEC_PATCH_OK',   'upd01',   'Patch Applied',   'System',      'Maintenance',        '2026-03-10 02:00:00', '2026-03-10 02:30:00', '2026-03-10 02:45:00', '2026-03-11 02:00:00', 'Infrastructure', 'Service', 'Scheduled Restart'),
('ALM0079', 'Active',       'Critical', 'Deutsche Telekom','DNS', 'srv-dns-01',    'Resolver DNS primar nu raspunde',     'DNS_PRIMARY_DOWN','dns01',   'DNS Primary Down','Network',     'Network Alerts',     '2026-03-27 12:58:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Network',       'Service',        'Service Down'),
('ALM0080', 'Active',       'Major',    'Vodafone',   'EPC',       'srv-pgw-01',   'PGW-C restart neasteptat',            'PGW_RESTART',     'pgw01',   'PGW Restart',     'System',      'Service Alerts',     '2026-03-27 12:45:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Network',       'Service',        'Service Down'),
('ALM0081', 'Cleared',      'Warning',  'Continental','Gateway',   'srv-gw-01',    'TLS handshake failures > 100/min',    'TLS_HANDSHAKE_ERR','gw01',   'TLS Err',         'Security',    'Security Alerts',    '2026-03-26 20:30:00', '2026-03-26 21:00:00', '2026-03-26 21:30:00', NULL, 'Security',      'Authentication', 'Certificate Expiry'),
('ALM0082', 'Active',       'Minor',    'Siemens',    'SCADA',     'srv-scada-01', 'Sensor temperatura offline > 5 min',  'SENSOR_OFFLINE',  'scada01', 'Sensor Offline',  'System',      'Service Alerts',     '2026-03-27 09:30:00', '2026-03-27 13:30:00', NULL,                  NULL, 'Infrastructure', 'Service',       'Service Down'),
('ALM0083', 'Acknowledged', 'Critical', 'Amazon',     'S3',        'srv-s3-01',    'Bucket S3 expus public accidental',   'S3_PUBLIC_EXPOSED','s3-01',  'S3 Exposed',      'Security',    'Security Alerts',    '2026-03-27 11:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0084', 'Active',       'Major',    'Oracle',     'EBS',       'srv-ebs-01',   'Concurrent Manager oprit neasteptat', 'CONC_MGR_DOWN',   'ebs01',   'Conc Mgr Down',   'Application', 'Service Alerts',     '2026-03-27 12:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0085', 'Cleared',      'Minor',    'Nokia',      'NetAct',    'srv-na-01',    'Raport de performanta generat cu intarziere','PERF_REP_DELAY','na01', 'Perf Rep Delay', 'Application', 'Performance Alerts', '2026-03-26 14:00:00', '2026-03-26 14:20:00', '2026-03-26 14:30:00', NULL, 'Application',   'Latency',        'High Latency'),
('ALM0086', 'Active',       'Critical', 'Microsoft',  'Exchange',  'srv-exch-01',  'Coada mail stuck - 50000 mesaje',     'MAIL_QUEUE_STUCK','exch01',  'Mail Queue Stuck','Application', 'Service Alerts',     '2026-03-27 10:30:00', '2026-03-27 13:30:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0087', 'Acknowledged', 'Warning',  'IBM',        'Backup',    'srv-bkp-01',   'Backup nocturn nu s-a finalizat',     'BACKUP_FAILED',   'bkp01',   'Backup Failed',   'System',      'Disk Alerts',        '2026-03-27 05:00:00', '2026-03-27 06:00:00', NULL,                  NULL, 'Infrastructure', 'Disk',           'Disk Full'),
('ALM0088', 'Active',       'Major',    'Google',     'Workspace', 'srv-ws-01',    'SMTP relay refuza conexiunile',       'SMTP_RELAY_FAIL', 'ws01',    'SMTP Fail',       'Application', 'Network Alerts',     '2026-03-27 11:40:00', '2026-03-27 13:40:00', NULL,                  NULL, 'Network',       'Connection',     'Connection Refused'),
('ALM0089', 'Cleared',      'Major',    'SAP',        'GRC',       'srv-grc-01',   'Rol critic alocat fara aprobare',     'ROLE_UNAPPROVED', 'grc01',   'Role Unapproved', 'Security',    'Security Alerts',    '2026-03-26 13:00:00', '2026-03-26 13:10:00', '2026-03-26 14:00:00', NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0090', 'Active',       'Warning',  'Renault',    'CI/CD',     'srv-cicd-01',  'Pipeline CI/CD esueaza la teste',     'CICD_TEST_FAIL',  'cicd01',  'CI/CD Fail',      'Application', 'Service Alerts',     '2026-03-27 12:10:00', '2026-03-27 13:10:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0091', 'Acknowledged', 'Minor',    'Philips',    'Monitoring','srv-mon-01',   'Agent de monitorizare offline 10 min','AGENT_OFFLINE',   'mon01',   'Agent Offline',   'System',      'Service Alerts',     '2026-03-27 08:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Infrastructure', 'Service',       'Service Down'),
('ALM0092', 'Active',       'Critical', 'Ericsson',   '5G-Core',   'srv-amf-01',   'AMF 5G-Core - autentificare UE esuata','AMF_AUTH_FAIL',  'amf01',   'AMF Auth Fail',   'Security',    'Security Alerts',    '2026-03-27 13:05:00', '2026-03-27 13:15:00', NULL,                  NULL, 'Network',       'Authentication', 'Unauthorized Access'),
('ALM0093', 'Cleared',      'Warning',  'Meta',       'CDN',       'srv-cdn-01',   'Cache hit ratio scazut sub 60%',      'CDN_CACHE_LOW',   'cdn01',   'CDN Cache Low',   'Network',     'Performance Alerts', '2026-03-26 22:00:00', '2026-03-26 23:00:00', '2026-03-27 00:00:00', NULL, 'Network',       'Latency',        'High Latency'),
('ALM0094', 'Active',       'Major',    'Infineon',   'Safety',    'srv-safe-01',  'Watchdog timer expirat pe unitate safety','WATCHDOG_EXP',  'safe01',  'Watchdog Exp',    'System',      'Service Alerts',     '2026-03-27 12:30:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Infrastructure', 'Service',       'Service Down'),
('ALM0095', 'Active',       'Major',    'Deutsche Telekom','AAA',  'srv-aaa-01',   'Server RADIUS nu autorizeaza sesiunile','RADIUS_FAIL',    'aaa01',   'RADIUS Fail',     'Security',    'Security Alerts',    '2026-03-27 10:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0096', 'Acknowledged', 'Warning',  'Amazon',     'Route53',   'srv-r53-01',   'Health check endpoint /health esueaza','R53_HC_FAIL',    'r53-01',  'R53 HC Fail',     'Network',     'Network Alerts',     '2026-03-27 09:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Cloud',         'Service',        'Service Down'),
('ALM0097', 'Cleared',      'Minor',    'Toyota',     'WMS',       'srv-wms-01',   'Imprimanta etichete offline in depozit','PRINTER_OFFLINE','wms01',   'Printer Offline', 'Application', 'Service Alerts',     '2026-03-26 11:00:00', '2026-03-26 11:20:00', '2026-03-26 11:30:00', NULL, 'Application',   'Service',        'Service Down'),
('ALM0098', 'Active',       'Critical', 'Vodafone',   'Billing',   'srv-bill-01',  'Procesare facturi blocata - 0 rec/s', 'BILLING_BLOCKED', 'bill01',  'Billing Blocked', 'Application', 'Service Alerts',     '2026-03-27 12:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Application',   'Service',        'Service Down'),
('ALM0099', 'Active',       'Major',    'Oracle',     'Webcenter', 'srv-wc-01',    'Sesiune WebCenter expirata - LDAP down','LDAP_DOWN',      'wc01',    'LDAP Down',       'Security',    'Security Alerts',    '2026-03-27 11:50:00', '2026-03-27 13:50:00', NULL,                  NULL, 'Security',      'Authentication', 'Unauthorized Access'),
('ALM0100', 'Acknowledged', 'Warning',  'Siemens',    'EnergyMgr', 'srv-em-01',    'Consum energie depasit SLA cu 15%',   'ENERGY_SLA_BREACH','em01',  'Energy SLA',      'System',      'Performance Alerts', '2026-03-27 07:00:00', '2026-03-27 13:00:00', NULL,                  NULL, 'Infrastructure', 'CPU',            'High CPU Usage');

GO

-- =============================================================================
-- Verification query - run after migration to confirm all records were inserted
-- =============================================================================
-- SELECT COUNT(*) AS TotalAlarms FROM dbo.Alarms;
-- SELECT STATUS, COUNT(*) AS Count FROM dbo.Alarms GROUP BY STATUS;
-- SELECT SEVERITY, COUNT(*) AS Count FROM dbo.Alarms GROUP BY SEVERITY ORDER BY Count DESC;
-- SELECT CATEGORY_TIER_1, COUNT(*) AS Count FROM dbo.Alarms GROUP BY CATEGORY_TIER_1 ORDER BY Count DESC;
