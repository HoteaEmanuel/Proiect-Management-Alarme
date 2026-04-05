from sqlalchemy.orm import Session
from models import Severity
from models.alarm import Alarm
from schemas import RequestFilters
from sqlalchemy import or_

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
        if filters.start_date > filters.end_date:
            raise ValueError("Start date cannot be greater than end date.")
        date_column = getattr(Alarm, filters.date_column_to_filter, None)
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