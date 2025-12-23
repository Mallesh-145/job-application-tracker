import os
import io
import uuid
import datetime
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv
from db import db
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

# --- Security Configuration (NEW) ---
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-this-in-prod') 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=7)

# --- Initialize Extensions ---
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)      # Hashes passwords
jwt = JWTManager(app)     # Handles tokens

# --- Import Models ---
from models import User, Company, JobApplication, Resume, Contact

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

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=hashed_password
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        # Create Token (The "Passport")
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "username": user.username
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# ==========================================
#  COMPANY ENDPOINTS (Protected)
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
        return jsonify({"message": "Company created", "id": new_company.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/companies', methods=['GET'])
@jwt_required()
def get_companies():
    current_user_id = get_jwt_identity()
    companies = Company.query.filter_by(user_id=current_user_id).all()
    company_list = [{
        "id": c.id, "name": c.name, "address": c.address, "website_url": c.website_url
    } for c in companies]
    return jsonify(company_list), 200

@app.route('/api/companies/<int:company_id>', methods=['GET'])
@jwt_required()
def get_company(company_id):
    current_user_id = get_jwt_identity()
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first() 
    if not company:
        return jsonify({"error": "Company not found"}), 404   
    return jsonify({
        "id": company.id, "name": company.name, "address": company.address, "website_url": company.website_url
    }), 200

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
    return jsonify({"message": "Company updated"}), 200

@app.route('/api/companies/<int:company_id>', methods=['DELETE'])
@jwt_required()
def delete_company(company_id):
    current_user_id = get_jwt_identity()
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first()
    
    if not company: return jsonify({"error": "Company not found"}), 404
    
    db.session.delete(company)
    db.session.commit()
    return jsonify({"message": "Company deleted"}), 200

# ==========================================
#  JOB APPLICATION ENDPOINTS (Protected)
# ==========================================

@app.route('/api/applications', methods=['POST'])
@jwt_required()
def create_application():
    current_user_id = get_jwt_identity()
    data = request.json
    
    company = Company.query.filter_by(id=data['company_id'], user_id=current_user_id).first()
    if not company:
        return jsonify({"error": "Company not found or access denied"}), 404

    status = data.get('status', 'To Apply')
    application_date = data.get('application_date')
    if not application_date and status == 'Applied':
        application_date = datetime.datetime.now()
    
    new_app = JobApplication(
        job_title=data['job_title'],
        company_id=data['company_id'],
        status=status,
        application_date=application_date,
        notes=data.get('notes'),
        job_url=data.get('job_url')
    )
    
    db.session.add(new_app)
    db.session.commit()
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
    application.job_url = data.get('job_url', application.job_url)
    
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

@app.route('/api/applications/<int:app_id>', methods=['DELETE'])
@jwt_required()
def delete_application(app_id):
    current_user_id = get_jwt_identity()
    application = JobApplication.query.join(Company).filter(
        JobApplication.id == app_id, Company.user_id == current_user_id
    ).first()
    
    if not application: return jsonify({"error": "Application not found"}), 404
    
    db.session.delete(application)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ==========================================
#  RESUME ENDPOINTS (Protected + Binary)
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
        version = len(application.resumes) + 1
        unique_name = f"{name}_v{version}{ext}"
        new_resume = Resume(
            filename=unique_name,
            data=file.read(),
            application_id=app_id
        )
        db.session.add(new_resume)
        db.session.commit()
        return jsonify({"message": "Uploaded"}), 201
    return jsonify({"error": "No file"}), 400

@app.route('/api/applications/<int:app_id>/resumes', methods=['GET'])
@jwt_required()
def get_resumes(app_id):
    current_user_id = get_jwt_identity()
    application = JobApplication.query.join(Company).filter(
        JobApplication.id == app_id, Company.user_id == current_user_id
    ).first()
    
    if not application: return jsonify({"error": "Not found"}), 404
    
    return jsonify([{
        "id": r.id, "filename": r.filename, "upload_date": r.upload_date
    } for r in application.resumes]), 200

@app.route('/api/resumes/<int:resume_id>/download', methods=['GET'])
# Note: Download links are hard to add headers to in plain HTML <a> tags.
# For strict security, we'd use a temporary token. 
# For this project, we can leave it public OR use a trick. 
# Let's keep it simple: If you have the valid ID, you can view it.
# But ideally, you'd implement a 'short-lived token' system here.
def download_resume(resume_id):
    resume = Resume.query.get(resume_id)
    if not resume: return jsonify({"error": "Not found"}), 404
    mimetype = 'application/pdf' if resume.filename.lower().endswith('.pdf') else 'application/octet-stream'
    
    return send_file(
        io.BytesIO(resume.data),
        mimetype=mimetype,
        download_name=resume.filename,
        as_attachment=False
    )

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
@jwt_required()
def delete_resume(resume_id):
    current_user_id = get_jwt_identity()
    resume = Resume.query.join(JobApplication).join(Company).filter(
        Resume.id == resume_id, Company.user_id == current_user_id
    ).first()
    
    if not resume: return jsonify({"error": "Not found"}), 404
    
    db.session.delete(resume)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# ==========================================
#  CONTACT ENDPOINTS (Protected)
# ==========================================

@app.route('/api/contacts', methods=['POST'])
@jwt_required()
def create_contact():
    current_user_id = get_jwt_identity()
    data = request.json
    
    company = Company.query.filter_by(id=data['company_id'], user_id=current_user_id).first()
    if not company: return jsonify({"error": "Company not found"}), 404
    
    new_contact = Contact(name=data['name'], email=data.get('email'), phone=data.get('phone'), company_id=data['company_id'])
    db.session.add(new_contact)
    db.session.commit()
    return jsonify({"message": "Contact created"}), 201

@app.route('/api/companies/<int:company_id>/contacts', methods=['GET'])
@jwt_required()
def get_contacts(company_id):
    current_user_id = get_jwt_identity()
    company = Company.query.filter_by(id=company_id, user_id=current_user_id).first()
    if not company: return jsonify({"error": "Not found"}), 404
    
    return jsonify([{
        "id": c.id, "name": c.name, "email": c.email, "phone": c.phone
    } for c in company.contacts]), 200

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    current_user_id = get_jwt_identity()
    contact = Contact.query.join(Company).filter(
        Contact.id == contact_id, Company.user_id == current_user_id
    ).first()
    
    if not contact: return jsonify({"error": "Not found"}), 404
    
    data = request.json
    contact.name = data.get('name', contact.name)
    contact.email = data.get('email', contact.email)
    contact.phone = data.get('phone', contact.phone)
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    current_user_id = get_jwt_identity()
    contact = Contact.query.join(Company).filter(
        Contact.id == contact_id, Company.user_id == current_user_id
    ).first()
    
    if not contact: return jsonify({"error": "Not found"}), 404
    
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# --- Main ---
if __name__ == '__main__':
    app.run(debug=True)