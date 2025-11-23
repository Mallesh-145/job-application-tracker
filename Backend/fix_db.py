from app import app, db
from sqlalchemy import text

with app.app_context():
    # This drops the hidden table that tracks migration versions
    print("Reseting migration history...")
    db.session.execute(text("DROP TABLE IF EXISTS alembic_version;"))
    db.session.commit()
    print("✅ Database memory wiped! You can now migrate.")