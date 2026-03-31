from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.alarm import Alarm
from schemas import AlarmResponse
router=APIRouter()

@router.get("/",response_model=list[AlarmResponse])
def getAlarms(db:Session = Depends(get_db)):
    alarms=db.query(Alarm).all()
    print("ALARMS LENGTH: ", alarms.__len__())
    return alarms


@router.get("/{number}",response_model=AlarmResponse)
def getAlarmByNumber(number:str,db:Session = Depends(get_db)):
    alarm = db.query(Alarm).filter(Alarm.alarm_number==number).first()
    if alarm == None:
        return HTTPException(status_code=404,detail="Alarm not found :/")
    return alarm
    # return "An alarm"