from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError, OperationalError
from datetime import datetime
from fastapi.responses import StreamingResponse
from typing import Any
import pandas as pd
import io
import logging

from core import InvalidInputError
from schemas import ChartCategoryFilters

logger = logging.getLogger(__name__)

# Fetches KPI statistics from a stored procedure for a given date range and formats them into a nested dictionary
def get_kpi_stats(db: Session, start_date: datetime, end_date: datetime) -> dict:

    if start_date > end_date:
        raise InvalidInputError("Start date cannot be strictly greater than the end date.")

    query = text("""
        EXEC dbo.GetDashboardKPIs 
            @start_date = :start_date, 
            @end_date   = :end_date;
    """)

    params = {"start_date": start_date, "end_date": end_date}

    try:
        result = db.execute(query, params).mappings().all()

    except (ProgrammingError, OperationalError) as e:
        db.rollback()
        if "start date cannot be strictly greater" in str(e).lower():
            raise InvalidInputError("Start date cannot be strictly greater than the end date.")

        logger.error(f"Database error while fetching KPI stats: {str(e)}")
        raise

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

def get_raw_alarms_by_category(db: Session, filters: ChartCategoryFilters):
    query = text("""
        EXEC dbo.GetAlarmsByCategory
            @category = :category,
            @label    = :label,
            @start_date = :start_date,
            @end_date = :end_date
    """)
    try:
        result = db.execute(query, filters.model_dump())
        return [dict(row) for row in result.mappings().all()]
    
    except (ProgrammingError, OperationalError) as e:
        db.rollback()
        if "start date cannot be strictly greater" in str(e).lower():
            raise InvalidInputError("Start date cannot be strictly greater than the end date.")
        raise

#Export alarm data to excel file
def export_data_to_excel(
        raw_data: list[dict[str, Any]],
        filename: str = "export.xlsx",
        columns: list[str] | None = None
) -> StreamingResponse:
    
    if not raw_data:
        df = pd.DataFrame()
    else:
        df = pd.DataFrame(raw_data, columns=columns)
    
    stream = io.BytesIO()
    
    with pd.ExcelWriter(stream, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Data")
        
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=statistics_export.xlsx"}
    )
