from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from models import AppError

# Fetches KPI statistics from a stored procedure for a given date range and formats them into a nested dictionary
def get_kpi_stats(db: Session, start_date: datetime, end_date: datetime) -> dict:

    query = text("""
        EXEC dbo.GetDashboardKPIs 
            @start_date = :start_date, 
            @end_date   = :end_date;
    """)

    params = {"start_date": start_date, "end_date": end_date}

    try:
        result = db.execute(query, params).mappings().all()
    except Exception as e:
        raise AppError(status_code=400, detail=f"Database error: {str(e)}")

    if not result:
        return {}

    stats = {}
    for row in result:
        # Performs a safe string conversion to prevent crashes
        category = str(row["Category"]) if row["Category"] else "Unknown"
        label = str(row["Label"]) if row["Label"] else "Unknown"
        
        # Converts to float since the SQL procedure returns counts and averages as floats, which could crash Pydantic
        raw_value = row["CountValue"]
        value = float(raw_value) if raw_value is not None else 0.0
        
        if category not in stats:
            stats[category] = {}
            
        stats[category][label] = value
        
    return stats

# Retrieves a raw list of alarms matching a specific category and label using a stored procedure
def get_raw_alarms_by_category(db: Session, category: str, label: str) -> list[dict]:
    # Calls the stored procedure
    query = text("""
        EXEC dbo.GetAlarmsByCategory
            @category = :category,
            @label    = :label
    """)
    # Executes and maps the results
    result = db.execute(query, {"category": category, "label": label})
    
    # Returns a list of dictionaries (easily convertible to JSON or Excel)
    return [dict(row) for row in result.mappings().all()]