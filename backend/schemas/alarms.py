from dataclasses import dataclass

from pydantic import BaseModel, model_validator
from datetime import datetime
from core import InvalidInputError
from enum import Enum

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

class ChartCategoryFilters(BaseModel):
    category: str
    label: str
    start_date: datetime = datetime(2026, 1, 1, 0, 0, 0)
    end_date: datetime = datetime(2026, 12, 31, 23, 59, 59)

    @model_validator(mode='after')
    def check_dates(self):
        if self.start_date > self.end_date:
            raise InvalidInputError("Start date cannot be strictly greater than the end date.")
        return self
    
class RecentAlarmsFilters(BaseModel):
    limit: int = 10
    
    
class TrendGranularity(str, Enum):
    monthly = "monthly"
    weekly = "weekly"
    daily = "daily"
    hourly = "hourly"
    live = "live"

class TrendGroupBy(str, Enum):
    severity = "severity"
    status = "status"
    company = "company"
    
class TrendFilters(BaseModel):
    granularity: TrendGranularity = TrendGranularity.weekly
    group_by: TrendGroupBy = TrendGroupBy.severity
    live_limit: int = 50
    
class TrendBucketItem(BaseModel):
    time_bucket: str
    group_label: str
    alarm_count: int
    
class LiveAlarmItem(BaseModel):
    alarm_number: str
    status: str
    group_label: str
    summary: str
    server_name: str
    first_occurence_datetime: datetime
    
class TrendResponse(BaseModel):
    granularity: str
    buckets: list[TrendBucketItem] = []
    live_alarms: list[LiveAlarmItem] = []
    
class HeatmapFilters(BaseModel):
    severity: str | None = None
    start_date: datetime = datetime(2026, 1, 1, 0, 0 ,0)
    end_date: datetime = datetime(2026, 12, 31, 23, 59, 59)
    
class HeatmapBucket(BaseModel):
    day_of_week: int
    hour_of_day: int
    alarm_count: int
    
class HeatmapResponse(BaseModel):
    data: list[HeatmapBucket]