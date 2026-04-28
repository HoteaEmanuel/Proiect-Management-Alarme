import io
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font

from schemas import AlarmPaginationResponse, AlarmResponse, RequestFilters, AlarmCreate, AlarmUpdate
from crud import get_filtered_alarms, create_alarm, get_kpi_stats, update_alarm
from models import Alarm, AppError
from database import get_db
from auth_utils import get_current_user

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)


#router pentru testare doar
@router.get("/all-alarms",response_model=list[AlarmResponse])
def get_all_alarms(db:Session = Depends(get_db)):
    alarms=db.query(Alarm).options(joinedload(Alarm.severity_rel)).all()
    print("ALARMS LENGTH: ", alarms.__len__())
    return alarms


@router.get("/resources", response_model=AlarmPaginationResponse)
def get_filtered_and_paginated_alarms(filters: RequestFilters = Depends(), db: Session = Depends(get_db)):

    print("test")
    
    #verific daca nu ma gherleste frontendul
    if filters.current_page < 1:
        raise HTTPException(status_code=400, detail="Invalid page number")
    
    #preiau alarmele filtrate, sortate si paginate
    try:
        total_alarms, alarms_list = get_filtered_alarms(db, filters)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
        
    print("test2")

    #calculez numarul de pagini (pe baza numarului total de alarme)  
    total_pages = (total_alarms + filters.page_size - 1) // filters.page_size

    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": filters.current_page,
        "alarms": alarms_list
    }

@router.get("/kpi-stats", response_model=dict[str, dict[str, int | float]])
def read_kpi_stats(db: Session = Depends(get_db),
                    start_date: datetime = datetime(2026, 1, 1, 0, 0, 0), 
                    end_date: datetime = datetime(2026, 12, 31, 23, 59, 59)):

    try:
        stats = get_kpi_stats(db=db, start_date=start_date, end_date=end_date)
        return stats
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.post("/",response_model=AlarmResponse,status_code=201)
def add_alarm(alarm_data: AlarmCreate, db: Session = Depends(get_db)):
    try:
        new_alarm = create_alarm(db, alarm_data)
        return new_alarm
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

@router.put("/{number}",response_model=AlarmResponse)
def edit_alarm(number:str, alarm_data: AlarmUpdate, db: Session = Depends(get_db)):
    try:
        updated_alarm = update_alarm(db, number, alarm_data)
        return updated_alarm
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
@router.get("/export")
def export_alarms(filters: RequestFilters=Depends(), db: Session=Depends(get_db)):
    #ignor paginarea
    filters.current_page=1
    filters.page_size=999999
    
    #preiau alarmele (filtrate) fara paginare
    try:
        _, alarms_list=get_filtered_alarms(db, filters)
    except Exception as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    
    #creez workbook-ul si setez numele sheet-ului
    wb=Workbook()
    ws=wb.active
    ws.title="Alarms"
    
    #preiau numele coloanelor din schema AlarmResponse si le adaug ca header
    columns=list(AlarmResponse.model_fields.keys())
    ws.append(columns)
    
    #adaug fiecare alarma ca rand
    for alarm in alarms_list:
        ws.append([str(alarm.get(col, "")) for col in columns])
        
    #salvez workbook-ul intr-un buffer
    output=io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    #returnez fisiserul
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=alarms_export.xlsx"}
    )