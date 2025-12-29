from db import db
from sqlalchemy.sql import func
import datetime

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False) 
    status = db.Column(db.String(20), default='active')
    reset_token = db.Column(db.String(100), unique=True, nullable=True) 
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    companies = db.relationship('Company', backref='user', lazy=True, cascade="all, delete-orphan")
    audit_logs = db.relationship('AuditLog', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'

class AuditLog(db.Model):
    """ The 'God View' Log Table for Admin Monitoring"""
    __tablename__ = "audit_log"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, server_default=func.now())

    def to_dict(self):
        """Helper to convert log to JSON for the Admin Dashboard"""
        return {
            "id": self.id,
            "username": self.user.username,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }

class Company(db.Model):
    __tablename__ = "company"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(250), nullable=True)
    website_url = db.Column(db.String(500), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    applications = db.relationship('JobApplication', backref='company', lazy=True, cascade="all, delete-orphan")
    contacts = db.relationship('Contact', backref='company', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Company {self.name}>'

class JobApplication(db.Model):
    __tablename__ = "job_application"
    id = db.Column(db.Integer, primary_key=True)
    job_title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='To Apply') 
    application_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    job_url = db.Column(db.String(500), nullable=True)   
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    resumes = db.relationship('Resume', backref='job_application', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<JobApplication {self.job_title}>'

class Resume(db.Model):
    __tablename__ = "resume"
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False) 
    data = db.Column(db.LargeBinary, nullable=False) 
    upload_date = db.Column(db.TIMESTAMP, server_default=func.now())
    application_id = db.Column(db.Integer, db.ForeignKey('job_application.id', ondelete='CASCADE'), nullable=False)

    def __repr__(self):
        return f'<Resume {self.filename}>'

class Contact(db.Model):
    __tablename__ = "contact"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    
    def __repr__(self):
        return f'<Contact {self.name}>'