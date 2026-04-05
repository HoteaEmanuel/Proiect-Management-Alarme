from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models.alarm import Alarm
from schemas import AlarmPaginationResponse, AlarmResponse
router=APIRouter()

@router.get("/",response_model=list[AlarmResponse])
def getAlarms(db:Session = Depends(get_db)):
    alarms=db.query(Alarm).options(joinedload(Alarm.severity_rel)).all()
    print("ALARMS LENGTH: ", alarms.__len__())
    return alarms


@router.get("/resources", response_model=AlarmPaginationResponse)
def get_resources(current_page: int = 1, page_size: int = 10, sort_by: str = "alarm_number", sort_order: str = "asc", db: Session = Depends(get_db)):
    
    #calculez numarul de pagini (pe baza numarului total de alarme)    
    total_alarms = db.query(Alarm).count()
    total_pages = (total_alarms + page_size - 1) // page_size
    
    #verific daca nu ma gherleste frontendul
    if current_page < 1 or (current_page > total_pages and total_pages > 0):
        raise HTTPException(status_code=400, detail="Invalid page number")
    
    if sort_by == "severity":
        sorting_coloumn = Alarm.severity_id
    elif hasattr(Alarm, sort_by):
        sorting_coloumn = getattr(Alarm, sort_by)
    else:
        raise HTTPException(status_code=400, detail="Invalid sort column")

    #fac querry-ul mai scurt folosind getattr pentru a obtine coloana dupa care se sorteaza
    if sort_order.upper() == "ASC":
        order = sorting_coloumn.asc()
    else:
        order = sorting_coloumn.desc()
    
    alarms_list = db.query(Alarm).order_by(order).offset((current_page - 1) * page_size).limit(page_size).all()

    return {
        "total_alarms": total_alarms,
        "total_pages": total_pages,
        "current_page": current_page,
        "alarms": alarms_list
    }

@router.get("/{number}",response_model=AlarmResponse)
def getAlarmByNumber(number:str,db:Session = Depends(get_db)):
    alarm = db.query(Alarm).filter(Alarm.alarm_number==number).first()
    if alarm == None:
        raise HTTPException(status_code=404,detail="Alarm not found :/")
    return alarm
    # return "An alarm"

