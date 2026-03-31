from sqlalchemy import Column,String,  DateTime
from sqlalchemy.sql import func
from database import Base
from enums import Status,AlarmType,CategoryType,SubCategoryType,Details
     
class Alarm(Base):
   __tablename__="alarms" 
   alarm_number = Column(String(200),primary_key=True,index=True)
   status = Column(String(200),default=Status.ACTIVE.value, nullable=False)
   severity = Column(String(50),nullable=False)
   company = Column(String(200),nullable=False)
   project = Column(String(200),nullable=False)
   server_name = Column(String(200),nullable=False)
   alert_description = Column(String(200),nullable=False)
   alert_key = Column(String(200),nullable=False)
   node = Column(String(200),nullable=False)
   summary = Column(String(200),nullable=False)
   type = Column(String(50),default=AlarmType.SYSTEM.value, nullable=False)
   alert_group = Column(String(200),nullable=False)
   first_occurence_datetime = Column(DateTime,server_default=func.now())
   last_occurence_datetime = Column(DateTime,server_default=func.now(),nullable=False)
   clear_occurence_datetime = Column(DateTime,server_default=func.now(),nullable=True)
   deleted_datetime = Column(DateTime,server_default=func.now(),nullable=True)
   category_tier_1 =Column(String(50),default=CategoryType.SECURITY.value,nullable=False)
   category_tier_2=Column(String(100),default=SubCategoryType.API.value,nullable=False)
   category_tier_3=Column(String(100),default=Details.API_TIMEOUT.value,nullable=False)