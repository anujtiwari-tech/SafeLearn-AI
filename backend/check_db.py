import sys
import os

sys.path.append(os.getcwd())

from sqlalchemy import text
from app.database import engine, Base
from app import models

def fix_db():
    print("Creating all tables from models...")
    Base.metadata.create_all(bind=engine)
    print("Done. Checking if blocked_sites exists...")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='blocked_sites'"))
        if result.fetchone():
            print("blocked_sites table exists!")
        else:
            print("ERROR: blocked_sites table still missing!")

if __name__ == "__main__":
    fix_db()
