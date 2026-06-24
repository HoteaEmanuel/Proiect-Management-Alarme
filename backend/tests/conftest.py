import sys
from pathlib import Path

# Allow `import auth_utils`, `import database`, etc. as the app does internally,
# since backend modules use absolute imports relative to backend/ rather than a package.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from database import SessionLocal


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def darius_user_id(db_session):
    from models import Users

    user = db_session.query(Users).filter(Users.username == "darius").first()
    return user.id
