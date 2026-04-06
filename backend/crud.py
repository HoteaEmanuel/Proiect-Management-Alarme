from sqlalchemy.orm import Session
from models.alarm import Alarm
from models.severity import Severity
from schemas import RequestFilters, AlarmCreate, AlarmUpdate
from fastapi import HTTPException

def get_filtered_alarms(db: Session, filters: RequestFilters):
    query = db.query(Alarm)
    #filtrez dupa fiecare camp, daca nu e gol
    if filters.status:
        query = query.filter(Alarm.status == filters.status)
    if filters.severity:
        query = query.join(Severity).filter(Severity.name == filters.severity)
    if filters.type:
        query = query.filter(Alarm.type == filters.type)
    if filters.alert_group:
        query = query.filter(Alarm.alert_group == filters.alert_group)
    if filters.server_name:
        query = query.filter(Alarm.server_name == filters.server_name)
    if filters.project:
        query = query.filter(Alarm.project == filters.project)
    if filters.summary_like:
        query = query.filter(Alarm.summary.ilike(f"%{filters.summary_like}%"))
    if filters.alert_description_like:
        query = query.filter(Alarm.alert_description.ilike(f"%{filters.alert_description_like}%"))
    if filters.server_name_like:
        query = query.filter(Alarm.server_name.ilike(f"%{filters.server_name_like}%"))
    
    #filtrez si dupa data, daca am primit toate datele necesare
    if filters.date_column_to_filter and filters.start_date and filters.end_date:
        print("FILTRARE DATA")
        if filters.start_date > filters.end_date:
            raise ValueError("Start date cannot be greater than end date.")
        date_column = getattr(Alarm, filters.date_column_to_filter, None)
        print("DATE COLUMN")
        print(date_column)
        if date_column is not None:
            if filters.start_date:
                query = query.filter(date_column >= filters.start_date)
            if filters.end_date:
                query = query.filter(date_column <= filters.end_date)

    #asigur sortarea in cazul in care sort_by e severity (deoarece e o relatie, nu un camp direct al alarmei)
    if filters.sort_by == "severity":
        sorting_column = Alarm.severity_id
    elif hasattr(Alarm, filters.sort_by):
        sorting_column = getattr(Alarm, filters.sort_by)
    else:
        raise ValueError("Invalid sort column")

    if filters.sort_order.upper() == "ASC":
        query = query.order_by(sorting_column.asc())
    else:
        query = query.order_by(sorting_column.desc())

    #paginez rezultatele
    offset = (filters.current_page - 1) * filters.page_size
    query = query.offset(offset).limit(filters.page_size)

    return query.all()

def create_alarm(db: Session, alarm_data: AlarmCreate):
    #verific daca exista deja alarma
    existing_alarm = db.query(Alarm).filter(Alarm.alarm_number == alarm_data.alarm_number).first()
    if existing_alarm:
        raise HTTPException(status_code=400, detail="Alarm with this number already exists")
    
    #verific daca exista severitatea specificata
    severity = db.query(Severity).filter(Severity.id == alarm_data.severity_id).first()
    if not severity:
        raise HTTPException(status_code=400, detail="Invalid severity ID")
    
    new_alarm = Alarm(
        alarm_number=alarm_data.alarm_number,
        status=alarm_data.status,
        severity_id=alarm_data.severity_id,
        company=alarm_data.company,
        project=alarm_data.project,
        server_name=alarm_data.server_name,
        alert_description=alarm_data.alert_description,
        alert_key=alarm_data.alert_key,
        node=alarm_data.node,
        summary=alarm_data.summary,
        type=alarm_data.type,
        alert_group=alarm_data.alert_group,
        first_occurence_datetime=alarm_data.first_occurence_datetime,
        last_occurence_datetime=alarm_data.last_occurence_datetime,
        clear_occurence_datetime=alarm_data.clear_occurence_datetime,
        deleted_datetime=alarm_data.deleted_datetime,
        category_tier_1=alarm_data.category_tier_1,
        category_tier_2=alarm_data.category_tier_2,
        category_tier_3=alarm_data.category_tier_3,
    )
    
    db.add(new_alarm)
    db.commit()
    db.refresh(new_alarm)
    return new_alarm

def update_alarm(db: Session, alarm_number: str, alarm_data: AlarmUpdate):
    #verific daca exista alarma pe care doresc sa o modific
    alarm=db.query(Alarm).filter(Alarm.alarm_number==alarm_number).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    update_data = alarm_data.model_dump(exclude_unset=True)
    
    if "severity_id" in update_data:
        severity = db.query(Severity).filter(Severity.id == update_data["severity_id"]).first()
        if not severity:
            raise HTTPException(status_code=400, detail="Invalid severity ID")
        
    for field, value in update_data.items():
        setattr(alarm, field, value)
    
    db.commit()
    db.refresh(alarm)
    return alarm