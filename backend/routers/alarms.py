import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from schemas import AlarmPaginationResponse, AlarmResponse, RequestFilters, AlarmCreate, AlarmUpdate, ChartCategoryFilters, RecentAlarmsFilters, TrendFilters, TrendResponse, HeatmapFilters, HeatmapResponse
from crud import get_filtered_alarms, create_alarm, get_kpi_stats, update_alarm, get_raw_alarms_by_category, export_data_to_excel, get_recent_alarms_paginated, get_alarms_for_export, get_alarm_trend, get_alarm_heatmap
from models import Alarm
from database import get_db
from auth_utils import get_current_user

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)


# Test route used strictly for fetching all database alarms
@router.get("/all-alarms",response_model=list[AlarmResponse])
def get_all_alarms(db:Session = Depends(get_db)) -> list[Alarm]:
    alarms=db.query(Alarm).options(joinedload(Alarm.severity_rel)).all()
    print("ALARMS LENGTH: ", alarms.__len__())
    return alarms

# Retrieves a filtered and paginated list of alarms based on user-provided criteria
@router.get("/resources", response_model=AlarmPaginationResponse)
def get_filtered_and_paginated_alarms(filters: RequestFilters = Depends(), db: Session = Depends(get_db)):
    
    total_pages, total_alarms, alarms_list = get_filtered_alarms(db, filters)

    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": filters.current_page,
        "alarms": alarms_list
    }

# Fetches aggregated KPI statistics for dashboard generation within a specific date range
@router.get("/kpi-stats", response_model=dict[str, dict[str, int | float]])
def read_kpi_stats(
    db: Session = Depends(get_db),                
    start_date: datetime = datetime(2026, 1, 1, 0, 0, 0), 
    end_date: datetime = datetime(2026, 12, 31, 23, 59, 59)
):
    return get_kpi_stats(db=db, start_date=start_date, end_date=end_date)

# Creates and registers a new alarm entity in the database
@router.post("/",response_model=AlarmResponse,status_code=201)
def add_alarm(alarm_data: AlarmCreate, db: Session = Depends(get_db)) -> Alarm:
    return create_alarm(db, alarm_data)

# Updates an existing alarm record identified by its alarm number
@router.put("/{number}",response_model=AlarmResponse)
def edit_alarm(number:str, alarm_data: AlarmUpdate, db: Session = Depends(get_db)) -> Alarm:
    return update_alarm(db, number, alarm_data)

# Exports all alarms matching current filters into a downloadable Excel file
@router.get("/export")
def export_alarms(filters: RequestFilters = Depends(), db: Session = Depends(get_db)) -> StreamingResponse:
    alarms_list = get_alarms_for_export(db, filters)
    
    # Retrieve column names from the AlarmResponse schema and add them as headers
    columns=list(AlarmResponse.model_fields.keys())

    return export_data_to_excel(
        raw_data=alarms_list,
        filename="alarms_export.xlsx",
        columns=columns
    )

# Retrieves alarms grouped by a specific chart category and label, with optional date filtering and Excel export
@router.get("/chart-details", response_model=None)
def get_chart_details(filters: ChartCategoryFilters=Depends(), export: bool=False, db: Session=Depends(get_db)) -> list[dict] | StreamingResponse:
    raw_data = get_raw_alarms_by_category(db, filters)
    
    # If the frontend only needs data for the popup, return the raw dictionary list
    if not export:
        return raw_data
    
    return export_data_to_excel(raw_data)

# Retrieves the most recent X alarms based on the provided limit
@router.get("/recent", response_model=AlarmPaginationResponse)
def get_recent_alarms(filters: RecentAlarmsFilters = Depends(), db: Session = Depends(get_db)) -> AlarmPaginationResponse:
    total_pages, total_alarms, alarms_list = get_recent_alarms_paginated(db, filters)
    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": 1,
        "alarms": alarms_list
    }
    
# Retrieves alarm trend data grouped by a specified dimension (severity, status, company)
@router.get("/stats/alarm-trend", response_model=TrendResponse)
def read_alarm_trend(filters: TrendFilters=Depends(), db: Session=Depends(get_db)) -> TrendResponse:
    return get_alarm_trend(db, filters)

# Retrieves alarm counts grouped by day of week and hour of day for heatmap visualization with optional filtering by severity and date range
@router.get("/stats/heatmap", response_model=HeatmapResponse)
def read_alarm_heatmap(filters: HeatmapFilters=Depends(), db:Session=Depends(get_db)) -> HeatmapResponse:
    return get_alarm_heatmap(db, filters)