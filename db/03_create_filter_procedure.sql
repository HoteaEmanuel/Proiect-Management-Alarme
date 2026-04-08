CREATE PROCEDURE dbo.CautareFiltrata
    -- parametrii de filtrare
    @status VARCHAR(50) = NULL,
    @severity VARCHAR(50) = NULL,
    @type VARCHAR(50) = NULL,
    @alert_group VARCHAR(100) = NULL,
    @server_name VARCHAR(100) = NULL,
    @project VARCHAR(100) = NULL,
    
    --parametrii de search
    @summary_like VARCHAR(255) = NULL,
    @alert_description_like VARCHAR(MAX) = NULL,
    @server_name_like VARCHAR(100) = NULL,
    
    --parametrii cu date calendaristice
    @date_column_to_filter SYSNAME = NULL,
    @start_date DATETIME = NULL,
    @end_date DATETIME = NULL,
    
    --parametrii pentru sortare si paginare
    @sort_by SYSNAME = 'alarm_number',
    @sort_order VARCHAR(4) = 'ASC',
    @current_page INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON; --asta ca sa nu imi spuna "There are X results", ca mai trebuie sa stau sa filtrez si aia dupa

    --verific sa nu ma gherleasca nici frontul nici backendul
    IF @start_date IS NOT NULL AND @end_date IS NOT NULL AND @start_date > @end_date
    BEGIN
        THROW 50000, 'data de start nu poate fi mai mare decat data de final!', 1;
    END

    --variabile pentru constructia query ului
    DECLARE @sql NVARCHAR(MAX) = '';
    DECLARE @from_clause NVARCHAR(MAX) = ' FROM dbo.Alarms a INNER JOIN dbo.Severities s ON a.severity_id = s.id '; --fac join cu tabela de severitati
    DECLARE @where_clause NVARCHAR(MAX) = ' WHERE 1=1 '; -- pun asta cu 1=1 ca sa pot continua cu AND

    --construiesc clauza WHERE folosind parametrizare (evit SQL Injection)
    IF @status IS NOT NULL 
        SET @where_clause += ' AND a.status = @status ';
    
    IF @type IS NOT NULL 
        SET @where_clause += ' AND a.type = @type ';
    
    IF @alert_group IS NOT NULL 
        SET @where_clause += ' AND a.alert_group = @alert_group ';
    
    IF @server_name IS NOT NULL 
        SET @where_clause += ' AND a.server_name = @server_name ';
    
    IF @project IS NOT NULL 
        SET @where_clause += ' AND a.project = @project ';

   --continui cu clauza WHERE dar acum cu cautarea text, deci nu trebuie match exact
    IF @summary_like IS NOT NULL 
        SET @where_clause += ' AND a.summary LIKE ''%'' + @summary_like + ''%'' ';
    
    IF @alert_description_like IS NOT NULL 
        SET @where_clause += ' AND a.alert_description LIKE ''%'' + @alert_description_like + ''%'' ';
    
    IF @server_name_like IS NOT NULL 
        SET @where_clause += ' AND a.server_name LIKE ''%'' + @server_name_like + ''%'' ';

    --daca am filtru pe coloana de severitati fac sortarea pe baza joinului facut cu tabela de severitati
    IF @severity IS NOT NULL
    BEGIN
        SET @where_clause += ' AND s.name = @severity ';
    END

    --filtrare dupa data calendaristica (QUOTENAME se foloseste pe numele coloanei ca sa nu ma gherleasca frontu si backendul)
    IF @date_column_to_filter IS NOT NULL AND @start_date IS NOT NULL AND @end_date IS NOT NULL
    BEGIN
        SET @where_clause += ' AND a.' + QUOTENAME(@date_column_to_filter) + ' >= @start_date ';
        SET @where_clause += ' AND a.' + QUOTENAME(@date_column_to_filter) + ' <= @end_date ';
    END

    --construiesc sortarea (in cazul in care sortez pe coloana severity atunci sortez dupa id-uri)
    IF @sort_by = 'severity' 
        SET @sort_by = 'severity_id';

    --declar ordinea de sortare
    DECLARE @order_clause NVARCHAR(MAX) = ' ORDER BY a.' + QUOTENAME(@sort_by) + 
                                          CASE WHEN UPPER(@sort_order) = 'DESC' THEN ' DESC ' ELSE ' ASC ' END;

    --fac paginarea
    DECLARE @offset INT = (@current_page - 1) * @page_size;
    DECLARE @pagination_clause NVARCHAR(MAX) = ' OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY; ';

    --aici construiesc querry-ul final
    --am pus s.name sa fie severity ca sa imi aduca direct numele severitatii in loc de id, 
    --iar COUNT(*) OVER() imi aduce numarul total de rezultate
    SET @sql = 'SELECT a.*, s.name AS severity, COUNT(*) OVER() AS TotalAlarms ' + @from_clause + @where_clause + @order_clause + @pagination_clause;

    --si acum execut query ul final, care imi aduce si rezultatele si numarul total de alarme care indeplinesc conditiile de filtrare (fara paginare)
    EXEC sp_executesql 
        @stmt = @sql,
        @params = N'@status VARCHAR(50), @severity VARCHAR(50), @type VARCHAR(50), @alert_group VARCHAR(100), @server_name VARCHAR(100), @project VARCHAR(100), @summary_like VARCHAR(255), @alert_description_like VARCHAR(MAX), @server_name_like VARCHAR(100), @start_date DATETIME, @end_date DATETIME, @offset INT, @page_size INT',
        @status = @status, @severity = @severity, @type = @type, @alert_group = @alert_group, @server_name = @server_name, @project = @project, @summary_like = @summary_like, @alert_description_like = @alert_description_like, @server_name_like = @server_name_like, @start_date = @start_date, @end_date = @end_date, @offset = @offset, @page_size = @page_size;

END