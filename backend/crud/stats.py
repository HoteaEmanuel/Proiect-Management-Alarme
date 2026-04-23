from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from models import AppError

#datetime e YYYY-MM-DD
def get_kpi_stats(db: Session, start_date: datetime, end_date: datetime):

    query = text("""
        EXEC dbo.GetDashboardKPIs 
            @start_date = :start_date, 
            @end_date   = :end_date;
    """)

    params = {"start_date": start_date, "end_date": end_date}

    try:
        result = db.execute(query, params).mappings().all()
    except Exception as e:
        raise AppError(status_code=400, detail=f"Database error: {str(e)}")

    if not result:
        return {}

    stats = {}
    for row in result:
        #aici fac o conversie sigura la tring, ca crapa daca nu 
        category = str(row["Category"]) if row["Category"] else "Unknown"
        label = str(row["Label"]) if row["Label"] else "Unknown"
        
        #si aici fac conversie la float ca in procedura sql am countr uri si avg uri care returneaza float uri si crapa pydantic
        raw_value = row["CountValue"]
        value = float(raw_value) if raw_value is not None else 0.0
        
        if category not in stats:
            stats[category] = {}
            
        stats[category][label] = value
        
    return stats