# PayrollPro — Payroll Management System

A full-stack payroll management application for managing employees, tracking attendance, calculating salaries, and generating PDF payslips.

# Features

- **Employee Management** — Add, edit, delete employees with salary structure
- **Attendance Tracking** — Record monthly attendance, paid/unpaid leave per employee
- **Payroll Generation** — Auto-calculates gross, tax, deductions, and net salary
- **PDF Payslips** — Download individual payslips as PDF
- **Payroll History** — View and filter past payroll records
- **Dashboard** — Charts for 6-month payroll trends and department breakdown
- **Authentication** — JWT-based login with admin/employee roles

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| PDF | PDFKit |
| Styling | Custom CSS (no framework) |

## 📋 needed

- Node.js v16+
- MongoDB running locally (or MongoDB Atlas URI)
- npm or yarn

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/fibrahim4/payroll-management-system.git
cd payroll-management-system
```

### 2. Install all dependencies
```bash
npm run install-all
```

### 3. Configure environment
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/payroll_db
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### 4. Start the development server
```bash
npm run dev
```

This starts both the React frontend (port 3000) and Express backend (port 5000) concurrently.

### 5. Create admin account
- Open [http://localhost:3000](http://localhost:3000)
- Click **"Setup Admin Account (First time)"**
- Login with: `admin@payroll.com` / `Admin@123`

# Project Structure

```
payroll-management-system/
├── client/                  # React frontend
│   └── src/
│       ├── pages/           # Dashboard, Employees, Attendance, Payroll, History
│       ├── components/      # Layout/Sidebar
│       ├── context/         # Auth context
│       └── services/        # Axios API instance
├── server/                  # Express backend
│   ├── controllers/         # Business logic
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   └── middleware/          # JWT auth middleware
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/attendance` | Get attendance |
| POST | `/api/attendance` | Save attendance |
| POST | `/api/payroll/generate/:id` | Generate payroll |
| GET | `/api/payroll` | List payrolls |
| PUT | `/api/payroll/:id/pay` | Mark as paid |
| GET | `/api/payroll/:id/download` | Download PDF |
| GET | `/api/dashboard/stats` | Dashboard data |

## 💡 Usage

1. **Add Employees** — Go to Employees → Add Employee with salary details
2. **Record Attendance** — Go to Attendance → select month → record each employee
3. **Generate Payroll** — Go to Generate Payroll → click Generate or Generate All
4. **Download Payslip** — Click the PDF button on any payroll row
5. **Mark as Paid** — Click "Mark Paid" once salary is disbursed

## Built With

This project demonstrates:
- REST API design with Express
- MongoDB schema design and aggregation
- JWT authentication with role-based access control
- React state management with Context API
- PDF generation server-side
- Salary calculation business logic

---

Built by Fuahd Ibrahim | Indiana University Indianapolis
