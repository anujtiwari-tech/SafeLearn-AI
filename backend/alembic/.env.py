# At the top, add:
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.database import Base
from app import models  # Import models to register them

# In run_migrations_offline() and run_migrations_online():
# Replace the url assignment with:
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
target_metadata = Base.metadata