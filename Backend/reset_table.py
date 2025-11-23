from app import app, db
from sqlalchemy import text

with app.app_context():
    # This deletes the old resume table completely
    print("Dropping old resume table...")
    db.session.execute(text("DROP TABLE IF EXISTS resume CASCADE;"))
    db.session.commit()
    print("✅ Resume table dropped successfully!")