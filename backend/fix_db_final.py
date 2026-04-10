import sys
import os
from sqlalchemy import text, inspect

# Ensure we can import from the app
sys.path.append(os.getcwd())

from app.database import engine

def fix_db():
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('users')]
    
    with engine.connect() as conn:
        print(f"Current columns in users: {columns}")
        if 'classroom_id' not in columns:
            print("Adding classroom_id to users...")
            conn.execute(text('ALTER TABLE users ADD COLUMN classroom_id INTEGER REFERENCES classrooms(id)'))
            conn.commit()
            print("Column added successfully.")
        else:
            print("classroom_id already exists.")
            
    print("Database check completed.")

if __name__ == "__main__":
    fix_db()
