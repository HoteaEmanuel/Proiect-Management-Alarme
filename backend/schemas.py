from pydantic import BaseModel
from datetime import datetime
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
        
    