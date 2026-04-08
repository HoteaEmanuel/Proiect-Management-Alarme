from datetime import datetime
from sqlalchemy import text
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from crud import get_filtered_alarms, create_alarm, get_kpi_stats, update_alarm
from database import get_db
from models.alarm import Alarm
from schemas import AlarmPaginationResponse, AlarmResponse, RequestFilters, AlarmCreate, AlarmUpdate
router=APIRouter()

@router.get("/",response_model=list[AlarmResponse])
def getAlarms(db:Session = Depends(get_db)):
    alarms=db.query(Alarm).options(joinedload(Alarm.severity_rel)).all()
    print("ALARMS LENGTH: ", alarms.__len__())
    return alarms


@router.get("/resources", response_model=AlarmPaginationResponse)
def get_resources(filters: RequestFilters = Depends(), db: Session = Depends(get_db)):
    
    #verific daca nu ma gherleste frontendul
    if filters.current_page < 1:
        raise HTTPException(status_code=400, detail="Invalid page number")
    
    #preiau alarmele filtrate, sortate si paginate
    try:
        total_alarms, alarms_list = get_filtered_alarms(db, filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    #calculez numarul de pagini (pe baza numarului total de alarme)  
    total_pages = (total_alarms + filters.page_size - 1) // filters.page_size

    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": filters.current_page,
        "alarms": alarms_list
    }

@router.get("/kpi-stats", response_model=dict[str, dict[str, int | float]])
def read_kpi_stats(db: Session = Depends(get_db)):

    try:
        stats = get_kpi_stats(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return stats


@router.get("/{number}",response_model=AlarmResponse)
def getAlarmByNumber(number:str,db:Session = Depends(get_db)):
    alarm = db.query(Alarm).filter(Alarm.alarm_number==number).first()
    if alarm == None:
        raise HTTPException(status_code=404,detail="Alarm not found :/")
    return alarm
    # return "An alarm"

@router.post("/",response_model=AlarmResponse,status_code=201)
def add_alarm(alarm_data: AlarmCreate, db: Session = Depends(get_db)):
    try:
        new_alarm = create_alarm(db, alarm_data)
        return new_alarm
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.put("/{number}",response_model=AlarmResponse)
def edit_alarm(number:str, alarm_data: AlarmUpdate, db: Session = Depends(get_db)):
    try:
        updated_alarm = update_alarm(db, number, alarm_data)
        return updated_alarm
    except ValueError as e:
        if str(e) == "Alarm not found":
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))