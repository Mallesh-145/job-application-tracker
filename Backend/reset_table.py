from app import app, db
from sqlalchemy import text

with app.app_context():
    print("Dropping ALL tables...")
    # CASCADE ensures that if we delete Company, Contacts are deleted too
    db.session.execute(text("DROP TABLE IF EXISTS resume CASCADE;"))
    db.session.execute(text("DROP TABLE IF EXISTS contact CASCADE;"))
    db.session.execute(text("DROP TABLE IF EXISTS job_application CASCADE;"))
    db.session.execute(text("DROP TABLE IF EXISTS company CASCADE;"))
    db.session.execute(text("DROP TABLE IF EXISTS \"user\" CASCADE;")) # "user" is a reserved word in SQL, so we quote it
    db.session.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE;"))
    db.session.commit()
    print("✅ Database completely wiped!")