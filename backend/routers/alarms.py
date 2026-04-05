from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from crud import get_filtered_alarms
from database import get_db
from models.alarm import Alarm
from schemas import AlarmPaginationResponse, AlarmResponse, RequestFilters
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
    alarms_list = get_filtered_alarms(db, filters)

    #calculez numarul de pagini (pe baza numarului total de alarme)  
    total_alarms = alarms_list.__len__()
    total_pages = (total_alarms + filters.page_size - 1) // filters.page_size

    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": filters.current_page,
        "alarms": alarms_list
    }

@router.get("/{number}",response_model=AlarmResponse)
def getAlarmByNumber(number:str,db:Session = Depends(get_db)):
    alarm = db.query(Alarm).filter(Alarm.alarm_number==number).first()
    if alarm == None:
        raise HTTPException(status_code=404,detail="Alarm not found :/")
    return alarm
    # return "An alarm"

