
USE master;

CREATE LOGIN ai_login WITH PASSWORD = 'AVL_Squad';

USE Alarme;

CREATE USER ai_agent FOR LOGIN ai_login;

GRANT SELECT ON dbo.Alarms TO ai_agent;
GRANT SELECT ON dbo.Severities TO ai_agent;

GRANT EXECUTE ON OBJECT::dbo.CautareFiltrata TO ai_agent;
GRANT EXECUTE ON OBJECT::dbo.GetDashboardKPIs TO ai_agent;
GRANT EXECUTE ON OBJECT::dbo.GetAlarmTrend TO ai_agent;
GRANT EXECUTE ON OBJECT::dbo.GetAlarmsByCategory TO ai_agent;

DENY DELETE, UPDATE, INSERT, ALTER TO ai_agent;