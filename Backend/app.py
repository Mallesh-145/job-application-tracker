import io
import os
from flask import Flask , request , jsonify , send_file
import datetime 
from dotenv import load_dotenv
from db import db  
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename


load_dotenv('files.env') 

app = Flask(__name__)
CORS(app)  


# --- Database Configuration ---
DB_URL = os.getenv("DATABASE_URL", 'postgresql+psycopg2://postgres:mallesh@localhost:5432/Project')

app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

# --- File Upload Configuration ---
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db.init_app(app) 
migrate = Migrate(app, db)

from models import Company, JobApplication, Resume, Contact

# --- Your Routes ---
@app.route('/')
def hello_World():
    return 'Hello World 123'
 
# --- API ENDPOINTS ---

###  Company Endpoints  ###

@app.route('/api/companies', methods=['POST'])
def create_company():
    print(">>> Handler: create_company, method:", request.method)
    data = request.json
    if not data or 'name' not in data:
        return jsonify({'error': 'Company name is required'}), 400
    new_company = Company(name=data['name'], address=data.get('address'), website_url=data.get('website_url'))
    try:
        db.session.add(new_company)
        db.session.commit()
        db.session.refresh(new_company)
        return jsonify({
            "message": "Company created successfully",
            "company_id": new_company.id,
            "name": new_company.name
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
   
@app.route('/api/companies', methods=['GET'])
def get_companies():
    print(">>> Handler: get_companies, method:", request.method)
    try:
        companies = Company.query.all()
        company_list = []
        for company in companies:
            company_data = {
               "id" : company.id,
               "name" : company.name,
               "address" : company.address,
               "website_url": company.website_url
            }
            company_list.append(company_data)
        return jsonify(company_list)
    except Exception as e :
        print(f"🔥 SERVER ERROR: {str(e)}", flush=True)
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/companies/<int:company_id>', methods=['GET'])
def get_company(company_id):
    company = Company.query.get(company_id)
    
    if not company:
        return jsonify({"error": "Company not found"}), 404
        
    return jsonify({
        "id": company.id,
        "name": company.name,
        "address": company.address,
        "website_url": company.website_url
    }), 200
    
@app.route('/api/companies/<int:company_id>', methods=['PUT'])
def update_company(company_id):
    try:
        company = Company.query.get(company_id)
        if not company :
            return jsonify({"ERROR ": "Company not found"}), 404
        data = request.json
        company.name = data.get('name',company.name)
        company.address = data.get('address',company.address)
        company.website_url = data.get('website_url', company.website_url)
        db.session.commit()
        return jsonify({"message":"Company updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":f"Database error: {str(e)}"}), 500

@app.route('/api/companies/<int:company_id>', methods=['DELETE'])
def delete_company(company_id):
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({"error": "Company not found "}), 404
        db.session.delete(company)
        db.session.commit()
        return jsonify({"message":"Company delete successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"Error":f"Database error {str(e)}"}), 500
    
###  Job Application Endpoints  ###

@app.route('/api/applications', methods=['POST'])
def create_Application():
        
        data = request.json
        required_fields = ['job_title','company_id']
        if not data or not all(field in data for field in required_fields):
            return jsonify({"message":" Missing the required fields job_title,company_id"}), 400   
        job_title = data['job_title']
        company_id = data['company_id']
        comopany = Company.query.get(company_id)
        if not comopany :
            return jsonify({"error": f"Company with id {company_id} not found"}), 404     
        status = data.get("status", "To Apply")
        if data.get('application_date'):
            application_date = data['application_date']
        elif status == 'Applied':
            application_date = datetime.datetime.now()
        else:
            application_date = None
        new_application = JobApplication(
            job_title = job_title,
            company_id = company_id,
            status=status,
            application_date=application_date,
            notes=data.get('notes'),
            job_url=data.get('job_url')
        )
        try:
            db.session.add(new_application)
            db.session.commit()
            db.session.refresh(new_application)
            return jsonify({
                "message":"Job application created successfully",
                "application_id": new_application.id
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database error : {str(e)}"}), 500
    
@app.route('/api/companies/<int:company_id>/applications', methods=['GET'])
def get_applications_for_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": f"Company with id {company_id} not found"}), 404
    applications = company.applications 
    application_list = []
    for app in applications:
        app_data = {
            "id": app.id,
            "job_title": app.job_title,
            "status": app.status,
            "application_date": app.application_date,
            "notes": app.notes,
            "job_url": app.job_url,
            "company_id": app.company_id
        }
        application_list.append(app_data)
    return jsonify(application_list), 200

@app.route('/api/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    application = JobApplication.query.get(application_id)
    if not application:
        return jsonify({"error": f"Application with id {application_id} not found"}), 404
    app_data = {
        "id": application.id,
        "job_title": application.job_title,
        "status": application.status,
        "application_date": application.application_date,
        "notes": application.notes,
        "job_url": application.job_url,
        "company_id": application.company_id
    }
    return jsonify(app_data), 200

@app.route('/api/applications/<int:application_id>', methods=['PUT'])
def update_application(application_id):
    application = JobApplication.query.get(application_id)
    if not application:
        return jsonify({"error": f"Application with id {application_id} not found"}), 404
    data = request.json
    application.job_title = data.get('job_title', application.job_title)
    application.status = data.get('status', application.status)
    application.application_date = data.get('application_date', application.application_date)
    application.notes = data.get('notes', application.notes)
    application.job_url = data.get('job_url', application.job_url)
    try:
        db.session.commit()
        return jsonify({"message": "Application updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/applications/<int:application_id>', methods=['DELETE'])
def delete_application(application_id):
    application = JobApplication.query.get(application_id)
    if not application:
        return jsonify({"error": f"Application with id {application_id} not found"}), 404
    try:
        db.session.delete(application)
        db.session.commit()
        return jsonify({"message": "Application deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# --- Resume Endpoints --- #

@app.route('/api/applications/<int:application_id>/resumes', methods=['POST'])
def upload_resume(application_id):
    application = JobApplication.query.get(application_id)
    if not application:
        return jsonify({"error": f"Application with id {application_id} not found"}), 404
        
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        file_data = file.read() 
        
        new_resume = Resume(
            filename=filename,
            data=file_data,  # Store the bytes directly
            application_id=application_id
        )
        
        try:
            db.session.add(new_resume)
            db.session.commit()
            
            return jsonify({
                "message": "File uploaded successfully",
                "resume_id": new_resume.id,
                "filename": new_resume.filename
            }), 201
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/resumes/<int:resume_id>/download', methods=['GET'])
def download_resume(resume_id):
    try:
        resume = Resume.query.get(resume_id)
        if not resume:
            return jsonify({"error": "Resume not found"}), 404
        return send_file(
            io.BytesIO(resume.data),
            download_name=resume.filename,
            as_attachment=False 
        )
        
    except Exception as e:
        return jsonify({"error": f"Error sending file: {str(e)}"}), 500
    
@app.route('/api/applications/<int:application_id>/resumes', methods=['GET'])
def get_resumes(application_id):
    application = JobApplication.query.get(application_id)
    if not application:
        return jsonify({"error":f"Application with id {application_id} does not exist"}), 404
    resumes = application.resumes
    resume_list = []
    for resume in resumes:
        resume_data = {
            "id" : resume.id,
            "path": resume.filename,
            "upload_date": resume.upload_date,
            "application_id": resume.application_id
        }
        resume_list.append(resume_data)
    return jsonify(resume_list), 200

@app.route('/api/resumes/<int:resume_id>', methods=['DELETE'])
def delete_resume(resume_id):
    resume = Resume.query.get(resume_id)
    if not resume:
        return jsonify({"error":f"The resume with id {resume_id} does not exist"}), 404
    file_path = resume.path
    try:
        db.session.delete(resume)
        if os.path.exists(file_path):
            os.remove(file_path)
        db.session.commit()
        return jsonify({"message": "Resume deleted Succesfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":f"Database error: {str(e)}"}), 500
    
# --- Contact Endpoints ---

@app.route('/api/contacts', methods=['POST'])
def create_contact():
    data = request.json
    required_fields = ['name','company_id']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error":"Missing required fields name and company_id"}), 400
    company_id = data['company_id']
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error":f"company with id {company_id} is not found "}), 404
    new_contact = Contact(
        name = data['name'],
        company_id = data['company_id'],
        email = data.get('email'),
        phone = data.get('phone')
    )
    try:
        db.session.add(new_contact)
        db.session.flush()
        db.session.commit()
        return jsonify({
            "message":"Contact saved successfully",
            "contact_id":new_contact.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":f"Database error: {str(e)}"}), 500
    
@app.route('/api/companies/<int:company_id>/contacts', methods=['GET'])
def get_contacts_for_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error":f"Company with the id {company_id} does not exist "}), 404
    contacts = company.contacts
    contact_list = []
    for contact in contacts:
        contact_data = {
            'id':contact.id,
            "name": contact.name,
            "email": contact.email,
            "phone": contact.phone,
            "company_id": contact.company_id
        }
        contact_list.append(contact_data)
    return jsonify(contact_list), 200

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    contact = Contact.query.get(contact_id)
    if not contact:
        return jsonify({"error": f"Contact with id {contact_id} not found"}), 404
    data = request.json 
    contact.name = data.get('name', contact.name)
    contact.email = data.get('email', contact.email)
    contact.phone = data.get('phone', contact.phone)
    try:
        db.session.commit()
        return jsonify({"message": "Contact updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    contact = Contact.query.get(contact_id)
    if not contact:
        return jsonify({"error": f"Contact with id {contact_id} not found"}), 404
    try:
        db.session.delete(contact)
        db.session.commit()
        return jsonify({"message": "Contact deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    

# --- Run the App ---
if __name__ == '__main__':
    app.run()