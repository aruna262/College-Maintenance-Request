# 🏫 Campus Maintenance Request System (MERN Stack)

A complete full-stack web application designed for engineering colleges and university campuses to streamline the reporting, tracking, allocation, and resolution of campus maintenance issues (electrical, plumbing, classroom projectors, fans, lights, benches, etc.).

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), Modern UI with CSS3 Variables, Responsive Flexbox & Grid
- **Backend**: Node.js & Express.js (REST API Architecture)
- **Database**: MongoDB (Local instance at `mongodb://127.0.0.1:27017/CampusMaintenance`) with Mongoose ODM
- **CORS**: Cross-Origin Resource Sharing enabled for frontend-backend communication

---

## 👥 User Roles & Workflow

```text
       [ Student ]                               [ Admin ]                             [ Maintenance Staff ]
            │                                        │                                           │
  1. Register & Login                                │                                           │
  2. Submit Complaint ────────► [ Pending ] ────────►│                                           │
            │                                        │                                           │
            │                                3. Review Request                                   │
            │                                4. Assign Staff ──────► [ In Progress ] ───────────►│
            │                                        │                                           │
            │                                        │                                   5. Repair & Fix
  6. Track Status ◄─────────────────────────── [ Completed ] ◄───────────────────────── 6. Update Status
```

### 1. 🎓 Student
- **Register**: Create student account with Name, Email, Password, Department, and Phone.
- **Login**: Secure login to Student Portal.
- **Submit Complaint**: Report broken fans, lights, projectors, plumbing, or classroom issues with location and priority.
- **My Requests**: Real-time status tracking (`Pending` ➔ `In Progress` ➔ `Completed`) and view assigned technician name.

### 2. 🛠️ Maintenance Staff
- **Staff Login**: Secure login with Staff credentials.
- **Assigned Tasks**: View only complaints assigned to them by Admin.
- **Update Status**: Change status (`Pending` ➔ `In Progress` ➔ `Completed`).
- **Resolution Notes**: Add repair notes (e.g., *"Replaced tube light and tested circuit"*).

### 3. 💼 Campus Administrator
- **Admin Login**: Central administrative management.
- **Global Dashboard**: Metrics on Total Complaints, Pending Allocation, In Progress, and Resolved.
- **Staff Dispatch**: Assign technician / staff member to pending complaints.
- **Staff Directory**: Add new technician accounts and manage existing staff.
- **Student Directory**: View all registered students.

---

## 🔑 Default Login Credentials (Pre-seeded)

The backend automatically creates these initial accounts on first startup:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `admin123` | Campus Maintenance In-charge |
| **Staff** | `staff@college.edu` | `staff123` | Kumar (Electrical Staff) |
| **Staff** | `suresh@college.edu` | `staff123` | Suresh (Plumbing Staff) |
| **Student** | *(Register your own)* | *(Your password)* | Or use student register form |

---

## 🗄️ MongoDB Database Structure

- **Database Name**: `CampusMaintenance`
- **Connection URI**: `mongodb://127.0.0.1:27017/CampusMaintenance`

### Collection 1: `users`
```json
{
  "userid": 1001,
  "name": "College Administrator",
  "email": "admin@college.edu",
  "password": "admin123",
  "role": "Admin",
  "department": "Maintenance Management",
  "phone": "9876543200",
  "createdAt": "2026-09-26T12:00:00.000Z"
}
```

### Collection 2: `complaints`
```json
{
  "complaintid": 101,
  "type": "Fan",
  "location": "Block A - Room 204",
  "description": "Ceiling fan making loud noise and not rotating at normal speed.",
  "priority": "Medium",
  "status": "Pending",
  "studentid": 3001,
  "studentname": "Maha Sri",
  "studentemail": "student@college.edu",
  "staffid": 2001,
  "staffname": "Kumar (Electrical Staff)",
  "staffnotes": "Inspected motor capacitor",
  "createdAt": "2026-09-26T12:00:00.000Z"
}
```

---

## 📡 REST API Documentation

Base URL: `http://localhost:8000`

### Authentication & Users
| Method | Endpoint | Description | Sample Body |
|---|---|---|---|
| `POST` | `/register` | Student Registration | `{ "name": "...", "email": "...", "password": "...", "department": "CSE" }` |
| `POST` | `/login` | Student / General Login | `{ "email": "...", "password": "..." }` |
| `POST` | `/staff/login` | Staff Login | `{ "email": "staff@college.edu", "password": "..." }` |
| `POST` | `/admin/login` | Admin Login | `{ "email": "admin@college.edu", "password": "..." }` |
| `GET` | `/users/students` | Get all registered students | *None* |
| `GET` | `/users/staff` | Get all maintenance staff | *None* |
| `POST` | `/users/staff` | Add new staff member | `{ "name": "...", "email": "...", "password": "...", "department": "..." }` |

### Complaints
| Method | Endpoint | Description | Sample Body |
|---|---|---|---|
| `POST` | `/complaint` | Submit new complaint | `{ "type": "Light", "location": "Lab 2", "description": "...", "priority": "High", "studentid": 101 }` |
| `GET` | `/complaints` | Get all complaints (Admin) | Optional query: `?status=Pending` |
| `GET` | `/complaints/stats` | Complaint summary counts | *None* |
| `GET` | `/complaints/student/:id` | Get complaints by student | *None* |
| `GET` | `/complaints/staff/:id` | Get complaints for staff | *None* |
| `GET` | `/complaint/:id` | Get single complaint details | *None* |
| `PUT` | `/complaint/:id` | Update status & resolution notes | `{ "status": "Completed", "staffnotes": "..." }` |
| `PUT` | `/complaint/assign/:id` | Admin assign technician | `{ "staffid": 2001, "staffname": "Kumar" }` |
| `DELETE` | `/complaint/:id` | Delete a complaint | *None* |

---

## 🏃 How to Run the Project

### Prerequisites
1. **Node.js** (v18 or newer installed)
2. **MongoDB Community Server** (Running locally on port 27017)

---

### Step 1: Start Backend Server
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
npm start
```
You will see:
```text
=========================================
  MongoDB Connected: mongodb://127.0.0.1:27017/CampusMaintenance
=========================================
  🚀 Campus Maintenance Backend Running!
  📍 Server Address: http://localhost:8000
=========================================
```

### Step 2: Run Backend Automated Test Suite
In the backend folder:
```bash
node test-api.js
```
This tests all 12 API endpoints and confirms full database read/write functionality!

---

### Step 3: Start Frontend Application
Open another terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 🗣️ Quick Viva / Presentation Summary (Tamil / English)

> "நமது Project: **Campus Maintenance Request System** (MERN Stack).
> 
> இதில் **3 Roles** உள்ளன:
> 1. **Student**: Register/Login செய்து வகுப்பறை அல்லது கல்லூரி வளாகத்தில் உள்ள ஃபேன், லைட், புரொஜக்டர் பழுதுகளை லொகேஷனுடன் Complaint-ஆக submit செய்யலாம். Status-ஐ (`Pending`, `In Progress`, `Completed`) உடனுக்குடன் பார்க்கலாம்.
> 2. **Admin**: அனைத்து புகார்களையும் பார்வையிட்டு, சம்பந்தப்பட்ட Maintenance Staff-க்கு assign செய்வார்.
> 3. **Staff**: தனக்கு ஒதுக்கப்பட்ட வேலைகளைப் பார்த்துவிட்டு, பழுது நீக்கியதும் Status-ஐ `Completed` ஆக மாற்றி குறிப்புகளை பதிவு செய்வார்.
> 
> **Database**: MongoDB-யில் `users` மற்றும் `complaints` என 2 முக்கிய Collections பயன்படுத்தியுள்ளோம்."
