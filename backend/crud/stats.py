from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError, OperationalError
from datetime import datetime
from fastapi.responses import StreamingResponse
from typing import Any
from collections import defaultdict
import pandas as pd
import io
import logging

from core import InvalidInputError
from schemas import ChartCategoryFilters, TrendFilters, TrendGranularity, HeatmapFilters, HeatmapResponse, HeatmapBucket

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

# Export alarm data to excel file
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
    
# Fetches alarm trend data and formats it based on granularity
def get_alarm_trend(db: Session, filters: TrendFilters) -> dict:
    query = text("""
        EXEC dbo.GetAlarmTrend
            @granularity = :granularity,
            @group_by = :group_by,
            @live_limit = :live_limit;
    """)
    params = {
        "granularity" : filters.granularity.value,
        "group_by" : filters.group_by.value,
        "live_limit" : filters.live_limit,
    }
    
    try:
        result = db.execute(query, params).mappings().all()
    except (ProgrammingError, OperationalError) as e:
        db.rollback()
        if "invalid granularity" in str(e).lower():
            raise InvalidInputError("Invalid granularity. Accepted values: monthly, weekly, daily, hourly, live.")
        if "invalid group_by" in str(e).lower():
            raise InvalidInputError("Invalid group_by. Accepted values: severity, status, company.")
        logger.error(f"Database error while fetching alarm trend: {str(e)}")
        raise
    
    if not result:
        return {"granularity": filters.granularity.value, "buckets" : [], "live_alarms": []}
    if filters.granularity == TrendGranularity.live:
        return{
            "granularity" : filters.granularity.value,
            "buckets": [],
            "live_alarms": [
                {
                    "alarm_number": str(row["alarm_number"]),
                    "status": str(row["status"]),
                    "group_label": str(row["group_label"]),
                    "summary": str(row["summary"]),
                    "server_name": str(row["server_name"]),
                    "first_occurence_datetime": row["first_occurence_datetime"],
                }
                for row in result
            ],
        }
    return{
        "granularity": filters.granularity.value,
        "buckets": [
            {
                "time_bucket": str(row["time_bucket"]),
                "group_label": str(row["group_label"]),
                "alarm_count": int(row["alarm_count"]),
            }
            for row in result
        ],
        "live_alarms": []
    }

# Fetches alarm heatmap data grouped by day of week and hour of day
def get_alarm_heatmap(db: Session, filters: HeatmapFilters) -> HeatmapResponse:
    SEVERITIES = ["Critical", "Major", "Minor", "Warning", "Info"]
    labels = [filters.severity] if filters.severity else SEVERITIES
    counts = defaultdict(int)
    for label in labels:
        query = text("""
            EXEC dbo.dbo.GetAlarmsByCategory
                @category = :category,
                @label = :label,
                @start_date = :start_date,
                @end_date= :end_date;
        """)
        params = {
            "category": "Severity",
            "label": label,
            "start_date": filters.start_date,
            "end_date": filters.end_date,
        }
        try:
            result=db.execute(query, params)
        except (ProgrammingError, OperationalError) as e:
            db.rollback()
            logger.error(f"Database error while fetching heatmap: {str(e)}")
            raise
        
        for row in result:
            dt = row["first_occurence_datetime"]
            if dt:
                key = (dt.isoweekday(), dt.hour)
                counts[key] += 1
                
        return HeatmapResponse(
            data=[
                HeatmapBucket(
                    day_of_week=day,
                    hour_of_day=hour,
                    alarm_count=count
                )
                for (day, hour), count in counts.items()
            ]
        )
