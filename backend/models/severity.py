from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class Severity(Base):
    __tablename__ = "severities"
    id = Column(Integer, primary_key=True)
    name = Column(String(20), nullable=False)
    
    #daca vreau sa vad alarmele care au o severitate anume (bun pentru filtre)
    alarms = relationship("Alarm", back_populates="severity_rel")