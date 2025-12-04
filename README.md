
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

## ✨ Highlights

- 🔐 Secure JWT authentication and bcrypt password hashing  
- 🏢 Company management and contact directory  
- 💼 Job application CRUD with status tracking and notes  
- 📎 Resume upload with versioning (binary storage)  
- ⚡ Fast, responsive UI built with React + Vite  
- 🗄 Database migrations & schema management with Flask-Migrate  

---

## 📸 Screenshots

<p align="center">
  <img src="Frontend/Screenshots/banner.png" width="900" style="border-radius:12px;">
</p>

<table align="center">
  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/login.png" width="420">
      <br><sub><b>🔐 Sign In</b><br><small>Secure login with validation</small></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/sign-up.png" width="420">
      <br><sub><b>🆕 Create Account</b><br><small>Register new user</small></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/main-dashboard.png" width="420">
      <br><sub><b>📊 Main Dashboard</b><br><small>Overview: apps, stats, quick actions</small></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/company-list.png" width="420">
      <br><sub><b>🏢 Companies Overview</b><br><small>List & manage companies</small></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/add-company.png" width="420">
      <br><sub><b>➕ Add Company</b><br><small>Create company profile</small></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/add-application.png" width="420">
      <br><sub><b>📝 Add Application</b><br><small>Attach job details & status</small></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/view-applications.png" width="420">
      <br><sub><b>📂 Applications List</b><br><small>Filter, sort, and review apps</small></sub>
    </td>
    <td align="center">
      <img src="Frontend/Screenshots/resume-upload.png" width="420">
      <br><sub><b>📎 Resume Upload</b><br><small>Upload and version resumes</small></sub>
    </td>
  </tr>

  <tr>
    <td align="center">
      <img src="Frontend/Screenshots/add-contact.png" width="420">
      <br><sub><b>📇 Add Contact</b><br><small>Store recruiter / contact details</small></sub>
    </td>
  </tr>
</table>

---

## 🧰 Tech Stack

**Frontend**
- React 19 (Vite)  
- React Router  
- TailwindCSS  
- react-hot-toast  

**Backend**
- Python 3.x, Flask  
- Flask-JWT-Extended  
- Flask-Bcrypt  
- Flask-SQLAlchemy  
- Flask-Migrate / Alembic  
- psycopg2-binary  

**Database**
- PostgreSQL  
- SQLAlchemy ORM  

---

## ⚙️ Quick Start

### Frontend
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

### Backend
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
.env\Scripts\Activate.ps1  # Windows

pip install -r requirements.txt
```

Create `files.env`:
```
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/JobTrackerDB
JWT_SECRET_KEY=your_jwt_secret
FLASK_ENV=development
UPLOAD_FOLDER=uploads
```

Migrations:
```bash
export FLASK_APP=app.py
flask db init
flask db migrate -m "init"
flask db upgrade
```

Run:
```bash
python app.py
```

---

## 🔌 API Summary

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`

### Companies
- POST `/api/companies`
- GET `/api/companies`
- GET `/api/companies/:id`
- PUT `/api/companies/:id`
- DELETE `/api/companies/:id`

### Applications
- POST `/api/applications`
- GET `/api/companies/:id/applications`
- PUT `/api/applications/:id`
- DELETE `/api/applications/:id`

### Resumes
- POST `/api/applications/:id/resumes`
- GET `/api/applications/:id/resumes`
- GET `/api/resumes/:id/download`
- DELETE `/api/resumes/:id`

### Contacts
- POST `/api/contacts`
- GET `/api/companies/:id/contacts`
- PUT `/api/contacts/:id`
- DELETE `/api/contacts/:id`

---

## 📁 Project Structure

```
job-application-tracker/
├─ Frontend/
│  ├─ Screenshots/
│  ├─ public/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  ├─ package.json
│  ├─ vite.config.js
│  └─ tailwind.config.js
│
├─ Backend/
│  ├─ app.py
│  ├─ db.py
│  ├─ models.py
│  ├─ migrations/
│  ├─ uploads/
│  ├─ requirements.txt
│  ├─ files.env
│  ├─ reset_table.py
│  └─ test.http
│
├─ .gitignore
└─ README.md
```

---

## Professional Summary

Full-stack Job Application Tracker developed using React (Vite) for the frontend and Flask for backend APIs. Implemented secure JWT authentication, CRUD operations for companies, applications, resumes, and contacts, alongside resume versioning and file management. Built modular React components, structured REST endpoints, and ensured consistent database migrations using SQLAlchemy and Flask-Migrate. Designed for clarity, maintainability, and real-world job-tracking workflows—demonstrating full-stack capability, API design, and scalable backend development.

---

## Connect

<p align="center">

  <!-- LinkedIn Profile -->
  <a href="https://www.linkedin.com/in/mallesh-annareddy" target="_blank" rel="noopener">
    <img src="https://img.shields.io/badge/LinkedIn-Mallesh%20Annareddy-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white">
  </a>

  <!-- LinkedIn Message Badge -->
  <a href="https://www.linkedin.com/in/mallesh-annareddy" target="_blank" rel="noopener" style="margin-left:8px;">
    <img src="https://img.shields.io/badge/Message%20Me%20on%20LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white">
  </a>

</p>

<p align="center">

  <!-- Gmail Compose Link -->
  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mallesannareddy508@gmail.com" target="_blank" rel="noopener">
    <img src="https://img.shields.io/badge/Email-mallesannareddy508%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white">
  </a>

  <!-- GitHub -->
  <a href="https://github.com/mallesh-145" target="_blank" rel="noopener" style="margin-left:8px;">
    <img src="https://img.shields.io/badge/GitHub-mallesh--145-181717?style=for-the-badge&logo=github&logoColor=white">
  </a>

</p>

<br>

<p align="center" style="font-size:12px; color:#888;">
  If this project helped you, a ⭐ is appreciated.
</p>


