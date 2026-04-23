ALLOWED_START_WORDS = {"SELECT", "EXEC", "WITH"}
ALLOWED_PROCEDURES = {"dbo.CautareFiltrata", "dbo.GetDashboardKPIs"}

BLACKLISTED_WORDS = {"DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE"}


def is_query_safe(query: str):

    if not query:
        return False

    parts = query.strip().split()
    parts_upper = [p.upper() for p in parts]
    
    if parts_upper[0] not in ALLOWED_START_WORDS:
        return False
    
    if parts_upper[0] == "EXEC":
        procedure_name = parts[1]

        if procedure_name not in ALLOWED_PROCEDURES:
            return False
    
    for word in BLACKLISTED_WORDS:
        if word in parts:
            return False
    
    return True
    
