# Student Disciplinary Record & Counselling Log
### Sri Gowthami Educational Institutions Prototype

This repository contains the complete full-stack working prototype of the **Student Disciplinary Record & Counselling Log** web application, designed and developed as part of the internship program.

---

## 1. Project Structure
The project is divided into four main directories:
* `/frontend`: React dashboard app initialized with Vite, using custom Vanilla CSS and Recharts.
* `/backend`: Node.js Express server connected to a local SQLite database, hosting the business logic engine.
* `/docs`: Project documentations (Problem statement, wireframes, use cases, and API specifications).
* `/tests`: Manual test tracker (`test_tracker.md`) and automated API and unit tests.

---

## 2. Technology Stack
* **Frontend**: HTML5, Vanilla CSS, JavaScript, React.js (Vite), Recharts, Lucide Icons.
* **Backend**: Node.js, Express.js.
* **Database**: SQLite (local SQL file `disciplinary_log.db`).

---

## 3. Getting Started

### Prerequisites
* **Node.js**: Version 18.0.0 or higher (Current environment is v24.16.0)
* **npm**: Version 9.0.0 or higher

### Installation & Setup
To install all root, backend, and frontend dependencies, run the setup script from the root directory:
```bash
npm run setup
```

### Running the Development Server
To run both the backend server and frontend development server concurrently, run:
```bash
npm run dev
```
* **Frontend Dashboard**: Runs at [http://localhost:5173/](http://localhost:5173/)
* **Backend REST API**: Runs at [http://localhost:5000/](http://localhost:5000/)

### Running Automated Tests
To run the automated API and business rules unit tests:
```bash
npm test
```

---

## 4. Business Logic Rules Enforced
1. **Risk Score**: Calculated dynamically based on entry data inputs:
   - Each Misconduct Incident: `+2 points`
   - Each Counselling Session: `+3 points`
   - Each Parent Meeting: `+5 points`
   - Missing Improvement Action Plan: `+2 points`
2. **Behavioral Risk Classification**:
   - `0 - 3 points`: **Low Risk**
   - `4 - 7 points`: **Medium Risk**
   - `8 - 12 points`: **High Risk**
   - `> 12 points`: **Critical Risk**
3. **Escalation recommendations**: Automated instructions computed from the Risk Level.
4. **Behavioral Trends**: Evaluated as `Improving`, `Stable`, or `Worsening` based on history.
5. **Status Workflow Constraints**: 
   - A record cannot be marked `Completed` if its risk level is `Critical` or if it lacks an `Improvement Action Plan`.
   - Records track full changes in `audit_logs` for legal compliance.
