from sqlalchemy.orm import Session
from sqlalchemy import text
from models.alarm import Alarm
from models.severity import Severity
from schemas import RequestFilters, AlarmCreate, AlarmUpdate
from fastapi import HTTPException

def get_filtered_alarms(db: Session, filters: RequestFilters):
    #apelez procedura aia nenorocita din baza de date care face toata treaba de filtrare, sortare si paginare
    query = text("""
        EXEC dbo.CautareFiltrata 
            @status = :status,
            @severity = :severity,
            @type = :type,
            @alert_group = :alert_group,
            @server_name = :server_name,
            @project = :project,
            @summary_like = :summary_like,
            @alert_description_like = :alert_description_like,
            @server_name_like = :server_name_like,
            @date_column_to_filter = :date_column_to_filter,
            @start_date = :start_date,
            @end_date = :end_date,
            @sort_by = :sort_by,
            @sort_order = :sort_order,
            @current_page = :current_page,
            @page_size = :page_size
    """)

    #extrag valorile din filters intr un dictionar ca sa le pot pasa la query
    params = filters.model_dump()

    try:
        #execut interogarea, mappings da rezultatele sub forma de dictionare
        result = db.execute(query, params).mappings().all()
    except Exception as e:
        #daca am gherlit baza de date primesc eroarea si o dau mai departe
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    #daca nu sunt rezultate, back to front :)
    if not result:
        return 0, []

    #preiau numarul total de alarme din prima linie 
    total_alarms = result[0]["TotalAlarms"]

    # convertesc rezultatul la dictionare si scot TotalAlarms ca sa 
    # nu imi pice schema de Pydantic care se asteapta doar la campurile de alarme
    alarms_list = []
    for row in result:
        row_dict = {key.lower(): value for key, value in dict(row).items()}
        row_dict.pop("totalalarms", None) 
        alarms_list.append(row_dict)

    return total_alarms, alarms_list

def create_alarm(db: Session, alarm_data: AlarmCreate):
    #verific daca exista deja alarma
    existing_alarm = db.query(Alarm).filter(Alarm.alarm_number == alarm_data.alarm_number).first()
    if existing_alarm:
        raise HTTPException(status_code=400, detail="Alarm with this number already exists")
    
    #verific daca exista severitatea specificata
    severity = db.query(Severity).filter(Severity.id == alarm_data.severity_id).first()
    if not severity:
        raise HTTPException(status_code=400, detail="Invalid severity ID")
    
    #creez alarma
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
    #adaug alarma in baza de date
    db.add(new_alarm)
    db.commit()
    db.refresh(new_alarm)
    return new_alarm

def update_alarm(db: Session, alarm_number: str, alarm_data: AlarmUpdate):
    #verific daca exista alarma pe care doresc sa o modific
    alarm=db.query(Alarm).filter(Alarm.alarm_number==alarm_number).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    
    #preiau doar campurile care au fost setate in request (cele care nu sunt None)
    update_data = alarm_data.model_dump(exclude_unset=True)
    
    #verific daca severitatea specificata e valida (daca a fost specificata)
    if "severity_id" in update_data:
        severity = db.query(Severity).filter(Severity.id == update_data["severity_id"]).first()
        if not severity:
            #daca severitatea nu exista, arunc HTTPException
            raise HTTPException(status_code=400, detail="Invalid severity ID")
    
    #actualizez campurile alarmei cu noile valori
    for field, value in update_data.items():
        setattr(alarm, field, value)
    
    db.commit()
    db.refresh(alarm)
    return alarm