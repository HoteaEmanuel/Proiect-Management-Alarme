import io
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font
import pandas as pd

from schemas import AlarmPaginationResponse, AlarmResponse, RequestFilters, AlarmCreate, AlarmUpdate
from crud import get_filtered_alarms, create_alarm, get_kpi_stats, update_alarm, get_raw_alarms_by_category
from models import Alarm, AppError
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
def get_filtered_and_paginated_alarms(filters: RequestFilters = Depends(), db: Session = Depends(get_db)) -> dict:

    print("test")
    
    # Prevent invalid page numbers requested by the frontend
    if filters.current_page < 1:
        raise HTTPException(status_code=400, detail="Invalid page number")
    
    # Fetch filtered, sorted, and paginated alarms
    try:
        total_alarms, alarms_list = get_filtered_alarms(db, filters)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
        
    print("test2")

    # Calculate total pages based on the total number of alarms
    total_pages = (total_alarms + filters.page_size - 1) // filters.page_size

    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": filters.current_page,
        "alarms": alarms_list
    }

# Fetches aggregated KPI statistics for dashboard generation within a specific date range
@router.get("/kpi-stats", response_model=dict[str, dict[str, int | float]])
def read_kpi_stats(db: Session = Depends(get_db),
                    start_date: datetime = datetime(2026, 1, 1, 0, 0, 0), 
                    end_date: datetime = datetime(2026, 12, 31, 23, 59, 59)) -> dict[str, dict[str, int|float]]:

    try:
        stats = get_kpi_stats(db=db, start_date=start_date, end_date=end_date)
        return stats
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# Creates and registers a new alarm entity in the database
@router.post("/",response_model=AlarmResponse,status_code=201)
def add_alarm(alarm_data: AlarmCreate, db: Session = Depends(get_db)) -> Alarm:
    try:
        new_alarm = create_alarm(db, alarm_data)
        return new_alarm
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# Updates an existing alarm record identified by its alarm number
@router.put("/{number}",response_model=AlarmResponse)
def edit_alarm(number:str, alarm_data: AlarmUpdate, db: Session = Depends(get_db)) -> Alarm:
    try:
        updated_alarm = update_alarm(db, number, alarm_data)
        return updated_alarm
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

# Exports all alarms matching current filters into a downloadable Excel file
@router.get("/export")
def export_alarms(filters: RequestFilters=Depends(), db: Session=Depends(get_db)) -> StreamingResponse:
    # Ignore pagination limits for full export
    filters.current_page=1
    filters.page_size=999999
    
    # Retrieve all filtered alarms without pagination
    try:
        _, alarms_list=get_filtered_alarms(db, filters)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    # Initialize the workbook and set the active sheet name
    wb=Workbook()
    ws=wb.active
    ws.title="Alarms"
    
    # Retrieve column names from the AlarmResponse schema and add them as headers
    columns=list(AlarmResponse.model_fields.keys())
    ws.append(columns)
    
    # Append each alarm record as a new row
    for alarm in alarms_list:
        ws.append([str(alarm.get(col, "")) for col in columns])
        
    # Save the workbook to an in-memory buffer
    output=io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    # Return the generated file as a stream
    return StreamingResponse(
        content=output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=alarms_export.xlsx"}
    )

# Retrieves detailed data backing a specific chart category, either as raw JSON or an Excel export
@router.get("/chart-details", response_model=None)
def get_chart_details(category: str, label: str, export: bool=False, db: Session=Depends(get_db)) -> list[dict] | StreamingResponse:
    # Retrieve raw data from the database
    raw_data = get_raw_alarms_by_category(db, category=category, label=label)
    
    # If the frontend only needs data for the popup, return the raw dictionary list
    if not export:
        return raw_data
    
    # If the frontend requests an Excel file export
    df=pd.DataFrame(raw_data)
    stream=io.BytesIO()
    
    with pd.ExcelWriter(stream, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Alarms Data")
        
    stream.seek(0)
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=statistics_export.xlsx"}
    )
    