from dataclasses import dataclass

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SeverityResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes: True

class AlarmResponse(BaseModel):
    alarm_number:str
    status:str
    severity:str
    company:str
    project:str
    server_name:str
    alert_description:str
    alert_key:str
    node:str
    summary:str
    type:str
    alert_group:str
    first_occurence_datetime:datetime 
    last_occurence_datetime:datetime 
    clear_occurence_datetime:datetime | None=None
    deleted_datetime:datetime | None=None
    category_tier_1:str
    category_tier_2:str
    category_tier_3:str
    
    class Config:
        from_attributes: True
        

class AlarmPaginationResponse(BaseModel):
    total_alarms: int
    total_pages: int
    current_page: int
    alarms: list[AlarmResponse]

class RequestFilters(BaseModel):
    current_page: int = 1 
    page_size: int = 10 
    sort_by: str = "alarm_number"
    sort_order: str = "asc"
    status: str | None = None
    severity: str | None = None
    type: str | None = None
    alert_group: str | None = None
    server_name: str | None = None
    project: str | None = None
    date_column_to_filter: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    summary_like: str | None = None
    alert_description_like: str | None = None
    server_name_like: str | None = None
    
class AlarmCreate(BaseModel):
    alarm_number: str
    status: str
    severity_id: int
    company: str
    project: str
    server_name: str
    alert_description: str
    alert_key: str
    node: str
    summary: str
    type: str
    alert_group: str
    first_occurence_datetime: datetime | None = None
    last_occurence_datetime: datetime | None = None
    clear_occurence_datetime: datetime | None = None
    deleted_datetime: datetime | None = None
    category_tier_1: str
    category_tier_2: str
    category_tier_3: str
    
class AlarmUpdate(BaseModel):
    status: str | None = None
    severity_id: int | None = None
    company: str | None = None
    project: str | None = None
    server_name: str | None = None
    alert_description: str | None = None
    alert_key: str | None = None
    node: str | None = None
    summary: str | None = None
    type: str | None = None
    alert_group: str | None = None
    first_occurence_datetime: datetime | None = None
    last_occurence_datetime: datetime | None = None
    clear_occurence_datetime: datetime | None = None
    deleted_datetime: datetime | None = None
    category_tier_1: str | None = None
    category_tier_2: str | None = None
    category_tier_3: str | None = None