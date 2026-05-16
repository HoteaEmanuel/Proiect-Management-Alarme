CREATE OR ALTER PROCEDURE dbo.CautareFiltrata
    -- filter parameters
    @status VARCHAR(50) = NULL,
    @severity VARCHAR(50) = NULL,
    @type VARCHAR(50) = NULL,
    @alert_group VARCHAR(100) = NULL,
    @project VARCHAR(100) = NULL,
    
    -- search parameters (partial match)
    @summary_like VARCHAR(255) = NULL,
    @alert_description_like VARCHAR(MAX) = NULL,
    @server_name_like VARCHAR(100) = NULL,
    
    -- date range parameters
    @date_column_to_filter SYSNAME = NULL,
    @start_date DATETIME = NULL,
    @end_date DATETIME = NULL,
    
    -- sorting and pagination
    @sort_by SYSNAME = 'alarm_number',
    @sort_order VARCHAR(4) = 'ASC',
    @current_page INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- validate date range
    IF @start_date IS NOT NULL AND @end_date IS NOT NULL AND @start_date > @end_date
    BEGIN
        THROW 50000, 'start date cannot be strictly greater than the end date', 1;
    END

    -- query building blocks
    DECLARE @sql NVARCHAR(MAX) = '';
    DECLARE @from_clause NVARCHAR(MAX) = ' FROM dbo.Alarms a INNER JOIN dbo.Severities s ON a.severity_id = s.id ';
    DECLARE @where_clause NVARCHAR(MAX) = ' WHERE 1=1 ';

    -- exact match filters
    IF @status IS NOT NULL 
        SET @where_clause += ' AND a.status = @status ';
    
    IF @type IS NOT NULL 
        SET @where_clause += ' AND a.type = @type ';
    
    IF @alert_group IS NOT NULL 
        SET @where_clause += ' AND a.alert_group = @alert_group ';
    
    IF @project IS NOT NULL 
        SET @where_clause += ' AND a.project = @project ';

    -- partial text search filters
    IF @summary_like IS NOT NULL 
        SET @where_clause += ' AND a.summary LIKE ''%'' + @summary_like + ''%'' ';
    
    IF @alert_description_like IS NOT NULL 
        SET @where_clause += ' AND a.alert_description LIKE ''%'' + @alert_description_like + ''%'' ';
    
    IF @server_name_like IS NOT NULL 
        SET @where_clause += ' AND a.server_name LIKE ''%'' + @server_name_like + ''%'' ';

    IF @severity IS NOT NULL
    BEGIN
        SET @where_clause += ' AND s.name = @severity ';
    END

    -- date range filter (QUOTENAME prevents SQL injection on the column name)
    IF @date_column_to_filter IS NOT NULL AND @start_date IS NOT NULL AND @end_date IS NOT NULL
    BEGIN
        SET @where_clause += ' AND a.' + QUOTENAME(@date_column_to_filter) + ' >= @start_date ';
        SET @where_clause += ' AND a.' + QUOTENAME(@date_column_to_filter) + ' <= @end_date ';
    END

    -- sorting (severity sorts by id, not name)
    IF @sort_by = 'severity' 
        SET @sort_by = 'severity_id';

    DECLARE @order_clause NVARCHAR(MAX) = ' ORDER BY a.' + QUOTENAME(@sort_by) + 
                                          CASE WHEN UPPER(@sort_order) = 'DESC' THEN ' DESC ' ELSE ' ASC ' END;

    -- pagination
    DECLARE @offset INT = (@current_page - 1) * @page_size;
    DECLARE @pagination_clause NVARCHAR(MAX) = ' OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY; ';

    -- s.name AS severity returns the severity name instead of the id
    -- COUNT(*) OVER() returns the total number of matching rows (ignoring pagination)
    SET @sql = 'SELECT a.*, s.name AS severity, COUNT(*) OVER() AS TotalAlarms ' + @from_clause + @where_clause + @order_clause + @pagination_clause;

    EXEC sp_executesql
    @stmt = @sql,
    @params = N'@status VARCHAR(50), @severity VARCHAR(50), @type VARCHAR(50), 
                @alert_group VARCHAR(100), @project VARCHAR(100), 
                @summary_like VARCHAR(255), @alert_description_like VARCHAR(MAX), 
                @server_name_like VARCHAR(100), @start_date DATETIME, 
                @end_date DATETIME, @offset INT, @page_size INT',
    @status = @status, @severity = @severity, @type = @type,
    @alert_group = @alert_group, @project = @project,
    @summary_like = @summary_like, @alert_description_like = @alert_description_like,
    @server_name_like = @server_name_like,
    @start_date = @start_date, @end_date = @end_date,
    @offset = @offset, @page_size = @page_size;
END