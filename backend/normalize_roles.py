import sqlite3
import os

def normalize_roles():
    db_path = 'safelearn.db'
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current roles
        cursor.execute("SELECT DISTINCT role FROM users")
        roles = cursor.fetchall()
        print(f"Current roles in database: {roles}")
        
        # Update roles to lowercase
        cursor.execute("UPDATE users SET role = LOWER(role)")
        conn.commit()
        
        # Check updated roles
        cursor.execute("SELECT DISTINCT role FROM users")
        new_roles = cursor.fetchall()
        print(f"Updated roles in database: {new_roles}")
        
        conn.close()
        print("Database normalization completed successfully.")
    except Exception as e:
        print(f"Error during normalization: {e}")

if __name__ == "__main__":
    normalize_roles()
