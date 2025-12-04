<p align="center">
  <img src="Frontend/Screenshots/banner.png" width="900" style="border-radius:12px;">
</p>

<h1 align="center" style="font-weight:700; font-size:32px; margin-top:20px;">
  Job Application Tracker
</h1>

<p align="center" style="font-size:15px; max-width:720px; margin:auto;">
  A clean, modern full-stack application to organize your job hunt — track companies, applications, resumes, contacts, and progress through a fast React UI and a secure Flask backend.
</p>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Flask-000000?style=for-the-badge">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-316192?style=for-the-badge">
  <img src="https://img.shields.io/badge/Auth-JWT-yellow?style=for-the-badge">
  <img src="https://img.shields.io/badge/Built%20With-Vite-orange?style=for-the-badge">
</p>

---

## ✨ Features

- 🔐 **JWT-secured authentication**
- 🏢 **Company management dashboard**
- 💼 **Job application tracking**
- 📎 **Resume upload with versioning**
- 👥 **Contact directory for each company**
- 📝 **Notes + status metadata**
- ⚡ **Fast, reactive UI (React + Vite)**
- 🗄 **Database migrations with Flask-Migrate**
- 💾 **PostgreSQL-backed persistence**

---

## 📸 Screenshots

### 🟣 **Hero Banner**
<p align="center">
  <img src="Frontend/Screenshots/banner.png" width="900" style="border-radius:12px;">
</p>

<br>

<table align="center">
  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/login.png" width="420">
      <br><sub><b>🔐 Sign In Screen</b></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/sign-up.png" width="420">
      <br><sub><b>🆕 Create Account</b></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/main-dashboard.png" width="420">
      <br><sub><b>📊 Main Dashboard</b></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/company-list.png" width="420">
      <br><sub><b>🏢 Companies Overview</b></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/add-company.png" width="420">
      <br><sub><b>➕ Add New Company</b></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/add-application.png" width="420">
      <br><sub><b>📝 Add Job Application</b></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/view-applications.png" width="420">
      <br><sub><b>📂 Applications List</b></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/resume-upload.png" width="420">
      <br><sub><b>📎 Resume Upload & Versions</b></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/add-contact.png" width="420">
      <br><sub><b>📇 Add Contact</b></sub>
    </td>
  </tr>
</table>

---

## 🧰 Tech Stack

### **Frontend**
- React 19  
- React Router  
- Vite  
- TailwindCSS (for styling utilities)  
- react-hot-toast  

### **Backend**
- Flask  
- Flask-JWT-Extended  
- Flask-SQLAlchemy  
- Flask-Migrate  
- Flask-Bcrypt  
- psycopg2 (PostgreSQL driver)  

### **Database**
- PostgreSQL  
- SQLAlchemy ORM  
- Alembic migrations  

---

## ⚙️ Installation & Setup

### **1. Frontend**
```bash
cd Frontend
npm install
npm run dev
```

Build:
```bash
npm run build
npm run preview
```

---

### **2. Backend**
```bash
cd Backend
python -m venv venv
source venv/bin/activate       # Mac/Linux
.\venv\Scripts\Activate.ps1    # Windows
pip install -r requirements.txt
```

Environment:
```
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/JobTrackerDB
JWT_SECRET_KEY=your_secret_key
FLASK_ENV=development
```

Migrations:
```bash
flask db init
flask db migrate -m "init"
flask db upgrade
```

Run server:
```bash
python app.py
```

---

## 🔌 API Summary

### **Auth**
- POST `/api/auth/register`
- POST `/api/auth/login`

### **Companies**
- POST `/api/companies`
- GET `/api/companies`
- PUT `/api/companies/:id`
- DELETE `/api/companies/:id`

### **Applications**
- POST `/api/applications`
- GET `/api/companies/:id/applications`
- PUT `/api/applications/:id`
- DELETE `/api/applications/:id`

### **Resumes**
- POST `/api/applications/:id/resumes`
- GET `/api/applications/:id/resumes`
- GET `/api/resumes/:id/download`
- DELETE `/api/resumes/:id`

### **Contacts**
- POST `/api/contacts`
- GET `/api/companies/:id/contacts`
- PUT `/api/contacts/:id`
- DELETE `/api/contacts/:id`

---

## 📝 Resume Summary (Copy for your CV)

Developed a full-stack Job Application Tracker using React (Vite) and Flask, enabling users to manage companies, job applications, contacts, and resume versions with secure JWT authentication. Implemented PostgreSQL persistence, ORM models using SQLAlchemy, and automated migrations with Flask-Migrate. Built a clean, responsive UI with real-time feedback and fully modular frontend components.

---

## 📁 Project Structure

```
Frontend/
  ├─ Screenshots/
  ├─ src/
  ├─ public/
  └─ package.json

Backend/
  ├─ app.py
  ├─ models.py
  ├─ db.py
  ├─ migrations/
  └─ requirements.txt
```

---

<p align="center">
  Made with ❤️ by Mallesh (Echo)
</p>
