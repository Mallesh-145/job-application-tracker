from db import db
from sqlalchemy.sql import func
import datetime


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    companies = db.relationship('Company', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'

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