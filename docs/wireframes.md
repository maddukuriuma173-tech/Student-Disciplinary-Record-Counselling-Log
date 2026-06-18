# UI Screen Layouts & Wireframes
**Project**: Student Disciplinary Record & Counselling Log  
**Institution**: Sri Gowthami Educational Institutions  

---

## 1. UI Components & Layout Overview
The UI follows a modern **glassmorphic design system** with CSS variables supporting Light and Dark modes. The main screen uses a responsive header, sidebar navigation, breadcrumbs, and a primary viewing canvas.

---

## 2. Screens Breakdown

### Screen 1: Home / Dashboard Grid (`/dashboard`)
* **Widget Panel**: 
  - 4 Cards displaying: Total Cases, Active Cases, High/Critical Risk, Completed Cases.
* **Control Bar**:
  - Filter Tabs: `All`, `Active`, `Completed`, `Archived`.
  - Search Input: Real-time query matching Name, Roll Number, or Class.
  - Action Button: `+ Add Record` (redirects to Entry Form).
* **Data Table**:
  - Columns: Student Details (Name, Roll No, Class), Risk Score & Level, Status, Trend, Next Action, Actions.
  - Status Toggle: Dropdown in row to instantly change status with confirmation prompt.
  - Actions: `View Details` (eye icon), `Edit` (pencil icon).
* **Pagination Bar**:
  - Simple controls: `Prev`, `Next`, showing current page and total records.

### Screen 2: Case Entry Form (`/new`)
* **Header**: Breadcrumbs: `Dashboard > Add Case`
* **Form Sections**:
  1. **Student General Details**:
     - `student_name` (Text input, Required)
     - `roll_number` (Text input, Required)
     - `student_class` (Text input, Required)
  2. **Incident Details**:
     - `misconduct_incidents` (Textarea, Required)
  3. **Counselling Logs**:
     - `counselling_sessions` (Textarea, Required)
  4. **Engagement & Follow-ups**:
     - `parent_meetings` (Textarea)
     - `improvement_action_plans` (Textarea)
* **Form Action Buttons**:
  - `Cancel` (returns to dashboard)
  - `Submit Record` (sends POST request, validates input client-side and server-side)

### Screen 3: Detail & History View (`/record/:id`)
* **Header**: Breadcrumbs: `Dashboard > Case Details > [Student Name]`
* **Two-Column Layout**:
  - **Left Column: Case Information**:
    - Cards showing General Details, Misconduct Incidents, Counselling Sessions, Parent Meetings, and Improvement Action Plan.
    - Export Buttons: `Print Case Report` (opens system print dialog with print-specific layout).
  - **Right Column: Risk Assessment Engine Output**:
    - **Calculated Risk Level**: Large colored badge (Low = Green, Medium = Yellow, High = Orange, Critical = Red) with the numerical score.
    - **Next Action Recommendation**: High-contrast block containing instructions.
    - **Trend Indicator**: Trend arrow and text showing behavioral movement.
  - **Bottom Panel: Audit Trail History**:
    - A chronological list of logs showing when the record was created, updated, status transitions, and manual notes.
    - Manual Audit Input: Textarea to append new remarks directly to the audit trail.

### Screen 4: Reports & Analytics (`/reports`)
* **Header**: Breadcrumbs: `Dashboard > Reports`
* **Filters**:
  - Date Range inputs: `Start Date` and `End Date` to filter metrics.
  - Action: `Export CSV` to download filtered records.
* **Charts Panel (Grid Layout)**:
  - **Chart 1 (Bar Chart)**: Status Distribution (Active vs Completed vs Archived).
  - **Chart 2 (Pie/Bar Chart)**: Risk Profile Count (Low, Medium, High, Critical).
  - **Chart 3 (Line Chart)**: Incident Trend Time Series (Logs/Incidents mapped over the past 30 days).
* **Summary Table**:
  - Top 5 recurring misconduct keywords or classes with highest disciplinary counts.
