from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError, OperationalError, IntegrityError
import logging

from models import Alarm, Severity
from schemas import RequestFilters, AlarmCreate, AlarmUpdate
from core import DatabaseOperationError, InvalidInputError, DuplicateResourceError, EntityNotFoundError
    
logger = logging.getLogger(__name__)

# Calls the stored procedure that handles filtering, sorting, and pagination
def get_filtered_alarms(db: Session, filters: RequestFilters) -> tuple[int, list[dict]]:
# Executes a stored procedure to filtered, sorted, and paginated alarms
    query = text("""
        EXEC dbo.CautareFiltrata 
            @status = :status,
            @severity = :severity,
            @type = :type,
            @alert_group = :alert_group,
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

    # Extracts values from filters into a dictionary to pass to the query
    params = filters.model_dump()

    try:
        # Executes the query; mappings provides the results as dictionaries
        result = db.execute(query, params).mappings().all()

    except (ProgrammingError, OperationalError) as e:
        db.rollback()
        if "start date cannot be strictly greater than the end date" in str(e).lower():
            raise InvalidInputError("Start date cannot be strictly greater than the end date.")
        
        raise

    if not result:
        return 0, []

    # Retrieves the total number of alarms from the first row
    total_alarms = result[0]["TotalAlarms"]

    total_pages = (total_alarms + filters.page_size - 1) // filters.page_size

    # Converts the result to dictionaries and removes TotalAlarms to comply with the Pydantic schema
    alarms_list = []
    for row in result:
        row_dict = {key.lower(): value for key, value in row.items()}
        row_dict.pop("totalalarms", None) 
        alarms_list.append(row_dict)

    return total_pages, total_alarms, alarms_list

# Creates a new alarm in the database
def create_alarm(db: Session, alarm_data: AlarmCreate) -> Alarm:
    # Checks if the alarm already exists
    existing_alarm = db.query(Alarm).filter(Alarm.alarm_number == alarm_data.alarm_number).first()
    if existing_alarm:
        raise DuplicateResourceError("An alarm with this number already exists.")
    
    # Checks if the specified severity exists
    severity = db.query(Severity).filter(Severity.id == alarm_data.severity_id).first()
    if not severity:
        raise InvalidInputError("Invalid alarm severity")
    
    # Creates the new alarm
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
    
    try:
        db.add(new_alarm)
        db.commit()
        db.refresh(new_alarm)
        return new_alarm
    
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error creating alarm {alarm_data.alarm_number}: {str(e)}")
        raise DatabaseOperationError("Could not create alarm due to a database conflict.")

# Updates specific fields of an existing alarm
def update_alarm(db: Session, alarm_number: str, alarm_data: AlarmUpdate) -> Alarm:
    # Checks if the target alarm exists
    alarm=db.query(Alarm).filter(Alarm.alarm_number==alarm_number).first()
    if not alarm:
        raise EntityNotFoundError("Alarm", alarm_number)
    
    # Retrieves only the fields that were set in the request (excluding None)
    update_data = alarm_data.model_dump(exclude_unset=True)
    
    # Checks if the specified severity is valid (if provided)
    if "severity_id" in update_data:
        severity = db.query(Severity).filter(Severity.id == update_data["severity_id"]).first()
        if not severity:
            raise InvalidInputError("Invalid alarm severity")
    
    # Updates the alarm fields with the new values
    for field, value in update_data.items():
        setattr(alarm, field, value)

    try:
        db.commit()
        db.refresh(alarm)
        return alarm
    
    except IntegrityError as e:
        db.rollback() # Curățăm sesiunea
        logger.error(f"Integrity error updating alarm {alarm_number}: {str(e)}")
        raise DatabaseOperationError("Could not update the alarm due to a data conflict.")