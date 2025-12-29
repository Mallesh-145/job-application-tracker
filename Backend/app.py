import os
import io
import uuid
import csv
import datetime
from flask import Flask, request, jsonify, send_file
from functools import wraps
from dotenv import load_dotenv
from db import db
from flask import Response
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# Load environment variables
load_dotenv('files.env')

app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
DB_URL = os.getenv("DATABASE_URL", 'postgresql+psycopg2://postgres:mallesh@localhost:5432/Project')
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- File Upload Config ---
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Security Configuration ---
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-this-in-prod') 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=7)

# --- Initialize Extensions ---
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Import Models ---
from models import User, Company, JobApplication, Resume, Contact, AuditLog

# ==========================================
#  UTILITIES & DECORATORS
# ==========================================

def log_activity(user_id, action, details=None):
    """🛡️ Helper to record every important action in the database"""
    try:
        new_log = AuditLog(user_id=user_id, action=action, details=details)
        db.session.add(new_log)
        db.session.commit()
    except Exception as e:
        print(f"Logging Error: {e}")

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or not user.is_admin:
                return jsonify({"error": "Admin access required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

@app.route('/api/admin/export-logs', methods=['GET'])
@admin_required()
def export_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Timestamp', 'Username', 'Action', 'Details'])
    for log in logs:
        writer.writerow([
            log.timestamp, 
            log.user.username if log.user else "System", 
            log.action, 
            log.details
        ])
    output.seek(0)
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=system_audit_log.csv"}
    )

# ==========================================
#  AUTHENTICATION ENDPOINTS
# ==========================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({"error": "Missing username, email, or password"}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password,
        is_admin=False,
        status='active'
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        log_activity(new_user.id, "USER_REGISTERED", f"New user signed up: {new_user.username}")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        if user.status == 'disabled':
            return jsonify({"error": "This account has been deactivated. Contact Admin."}), 403
        
        log_activity(user.id, "USER_LOGIN", f"User {user.username} logged in successfully")
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "username": user.username,
            "isAdmin": user.is_admin
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout_log():
    current_user_id = get_jwt_identity()
    log_activity(current_user_id, "USER_LOGOUT", "User logged out")
    return jsonify({"message": "Logout logged"}), 200

# ==========================================
#  COMPANY ENDPOINTS
# ==========================================

@app.route('/api/companies', methods=['POST'])
@jwt_required()
def create_company():
    current_user_id = get_jwt_identity()
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Company name is required"}), 400
    
    new_company = Company(
        name=data['name'],
        address=data.get('address'),
        website_url=data.get('website_url'),
        user_id=current_user_id 
    )
    try:
        db.session.add(new_company)
        db.session.commit()
        log_activity(current_user_id, "CREATE_COMPANY", f"Added company: {new_company.name}")
        return jsonify({"message": "Company created", "id": new_company.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/companies', methods=['GET'])
@jwt_required()
def get_companies():
    current_user_id = get_jwt_identity()
    companies = Company.query.filter_by(user_id=current_user_id).all()
    return jsonify([{"id": c.id, "name": c.name, "address": c.address, "website_url": c.website_url} for c in companies]), 200

@app.route('/api/companies/<int:company_id>', methods=['PUT'])
@jwt_required()
def update_company(company_id):
    current_user_id = get_jwt_identity()
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first()
    if not company: return jsonify({"error": "Company not found"}), 404
    
    data = request.json
    company.name = data.get('name', company.name)
    company.address = data.get('address', company.address)
    company.website_url = data.get('website_url', company.website_url)
    
    db.session.commit()
    log_activity(current_user_id, "UPDATE_COMPANY", f"Updated details for: {company.name}")
    return jsonify({"message": "Company updated"}), 200

@app.route('/api/companies/<int:company_id>', methods=['DELETE'])
@jwt_required()
def delete_company(company_id):
    current_user_id = get_jwt_identity()
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first()
    if not company: return jsonify({"error": "Company not found"}), 404
    
    comp_name = company.name # Store name before deleting
    db.session.delete(company)
    db.session.commit()
    log_activity(current_user_id, "DELETE_COMPANY", f"Deleted company: {comp_name}")
    return jsonify({"message": "Company deleted"}), 200

# ==========================================
#  JOB APPLICATION ENDPOINTS
# ==========================================

@app.route('/api/applications', methods=['POST'])
@jwt_required()
def create_application():
    current_user_id = get_jwt_identity()
    data = request.json
    company = Company.query.filter_by(id=data['company_id'], user_id=current_user_id).first()
    if not company: return jsonify({"error": "Company not found"}), 404

    new_app = JobApplication(
        job_title=data['job_title'],
        company_id=data['company_id'],
        status=data.get('status', 'To Apply'),
        application_date=data.get('application_date'),
        notes=data.get('notes'),
        job_url=data.get('job_url')
    )
    db.session.add(new_app)
    db.session.commit()
    log_activity(current_user_id, "CREATE_APP", f"Applied for {new_app.job_title} at {company.name}")
    return jsonify({"message": "Application created", "id": new_app.id}), 201

@app.route('/api/companies/<int:company_id>/applications', methods=['GET'])
@jwt_required()
def get_applications(company_id):
    current_user_id = get_jwt_identity()
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first()
    if not company: return jsonify({"error": "Company not found"}), 404
    apps_list = [{
        "id": a.id, "job_title": a.job_title, "status": a.status,
        "application_date": a.application_date, "notes": a.notes, "job_url": a.job_url
    } for a in company.applications]
    return jsonify(apps_list), 200

@app.route('/api/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_application(app_id):
    current_user_id = get_jwt_identity()
    application = JobApplication.query.join(Company).filter(
        JobApplication.id == app_id, Company.user_id == current_user_id
    ).first()
    if not application: return jsonify({"error": "Application not found"}), 404
    
    data = request.json
    application.job_title = data.get('job_title', application.job_title)
    application.status = data.get('status', application.status)
    application.application_date = data.get('application_date', application.application_date)
    application.notes = data.get('notes', application.notes)
    
    db.session.commit()
    log_activity(current_user_id, "UPDATE_APP", f"Updated status of {application.job_title} to {application.status}")
    return jsonify({"message": "Updated"}), 200

@app.route('/api/applications/<int:app_id>', methods=['DELETE'])
@jwt_required()
def delete_application(app_id):
    current_user_id = get_jwt_identity()
    application = JobApplication.query.join(Company).filter(
        JobApplication.id == app_id, Company.user_id == current_user_id
    ).first()
    if not application: return jsonify({"error": "Application not found"}), 404
    
    app_title = application.job_title
    db.session.delete(application)
    db.session.commit()
    log_activity(current_user_id, "DELETE_APP", f"Removed application for {app_title}")
    return jsonify({"message": "Deleted"}), 200

# ==========================================
#  RESUME ENDPOINTS
# ==========================================

@app.route('/api/applications/<int:app_id>/resumes', methods=['POST'])
@jwt_required()
def upload_resume(app_id):
    current_user_id = get_jwt_identity()
    application = JobApplication.query.join(Company).filter(
        JobApplication.id == app_id, Company.user_id == current_user_id
    ).first()
    if not application: return jsonify({"error": "Application not found"}), 404
    
    file = request.files.get('file')
    if file and file.filename != '':
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        version = len(application.resumes)+1
        unique_name = f"{name}_v{version}{ext}"
        new_resume = Resume(filename=unique_name, data=file.read(), application_id=app_id)
        db.session.add(new_resume)
        db.session.commit()
        log_activity(current_user_id, "UPLOAD_RESUME", f"Uploaded resume: {filename} for {application.job_title}")
        return jsonify({"message": "Uploaded"}), 201
    return jsonify({"error": "No file"}), 400

@app.route('/api/applications/<int:app_id>/resumes', methods=['GET'])
@jwt_required()
def get_resumes(app_id):
    current_user_id = get_jwt_identity()
    application = JobApplication.query.join(Company).filter( JobApplication.id == app_id, Company.user_id == current_user_id).first()
    if not application: return jsonify({"error": "Not found"}), 404
    return jsonify([{
        "id": r.id, "filename": r.filename, "upload_date": r.upload_date
    } for r in application.resumes]), 200

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    current_user_id = get_jwt_identity()
    resume = Resume.query.join(JobApplication).join(Company).filter(
        Resume.id == resume_id, Company.user_id == current_user_id
    ).first()
    if not resume: return jsonify({"error": "Not found"}), 404
    
    res_name = resume.filename
    db.session.delete(resume)
    db.session.commit()
    log_activity(current_user_id, "DELETE_RESUME", f"Deleted resume: {res_name}")
    return jsonify({"message": "Deleted"}), 200

@app.route('/api/resumes/<int:resume_id>/download', methods=['GET'])
def download_resume(resume_id):
    resume = Resume.query.get(resume_id)
    if not resume: return jsonify({"error": "Not found"}), 404
    mimetype = 'application/pdf' if resume.filename.lower().endswith('.pdf') else 'application/octet-stream'
    return send_file(io.BytesIO(resume.data), mimetype=mimetype, download_name=resume.filename, as_attachment=False)

# ==========================================
#  CONTACT ENDPOINTS (Protected)
# ==========================================

@app.route('/api/contacts', methods=['POST'])
@jwt_required()
def create_contact():
    current_user_id = get_jwt_identity()
    data = request.json    
    company = Company.query.filter_by(id=data['company_id'], user_id=current_user_id).first()
    if not company: 
        return jsonify({"error": "Company not found or access denied"}), 404
    new_contact = Contact(
        name=data['name'], 
        email=data.get('email'), 
        phone=data.get('phone'), 
        company_id=data['company_id']
    )
    try:
        db.session.add(new_contact)
        db.session.commit()        
        log_activity(
            current_user_id, 
            "CREATE_CONTACT", 
            f"Added contact {new_contact.name} for company {company.name}"
        )
        return jsonify({"message": "Contact created"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/companies/<int:company_id>/contacts', methods=['GET'])
@jwt_required()
def get_contacts(company_id):
    current_user_id = get_jwt_identity()    
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first()
    if not company: 
        return jsonify({"error": "Not found"}), 404 
    return jsonify([{
        "id": c.id, 
        "name": c.name, 
        "email": c.email, 
        "phone": c.phone
    } for c in company.contacts]), 200

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    current_user_id = get_jwt_identity()    
    contact = Contact.query.join(Company).filter(
        Contact.id == contact_id, 
        Company.user_id == current_user_id
    ).first()
    if not contact: 
        return jsonify({"error": "Contact not found"}), 404
    data = request.json
    contact.name = data.get('name', contact.name)
    contact.email = data.get('email', contact.email)
    contact.phone = data.get('phone', contact.phone)
    db.session.commit()    
    log_activity(current_user_id, "UPDATE_CONTACT", f"Updated contact info for {contact.name}")
    return jsonify({"message": "Updated"}), 200

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    current_user_id = get_jwt_identity()
    contact = Contact.query.join(Company).filter(
        Contact.id == contact_id, 
        Company.user_id == current_user_id
    ).first()
    if not contact: 
        return jsonify({"error": "Contact not found"}), 404
    contact_name = contact.name # Save name for log
    db.session.delete(contact)
    db.session.commit()
    log_activity(current_user_id, "DELETE_CONTACT", f"Removed contact: {contact_name}")
    return jsonify({"message": "Deleted"}), 200

# ==========================================
#  ADMIN ENDPOINTS
# ==========================================

@app.route('/api/admin/users', methods=['GET'])
@admin_required()
def get_all_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id, "username": u.username, "email": u.email, "status": u.status, "is_admin": u.is_admin
    } for u in users]), 200

@app.route('/api/admin/logs', methods=['GET'])
@admin_required()
def get_all_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200

@app.route('/api/admin/users/<int:user_id>/status', methods=['POST'])
@admin_required()
def toggle_user_status(user_id):
    data = request.json
    user = User.query.get(user_id)
    if not user: return jsonify({"error": "User not found"}), 404
    if user.is_admin: return jsonify({"error": "Cannot disable an admin"}), 400
    
    user.status = data.get('status', user.status)
    db.session.commit()
    current_admin_id = get_jwt_identity()
    log_activity(current_admin_id, "ADMIN_ACTION", f"Changed status of {user.username} to {user.status}")
    return jsonify({"message": f"User status updated to {user.status}"}), 200

if __name__ == '__main__':
    app.run(debug=True)