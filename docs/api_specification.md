# REST API Specification
**Project**: Student Disciplinary Record & Counselling Log  
**Institution**: Sri Gowthami Educational Institutions  

---

## 1. Global Endpoints

All endpoints are prefixed with `/api`.

---

## 2. Records Management (`/api/student_disciplinary_record_counsel`)

### 2.1 Create a Disciplinary Record
* **Route**: `POST /api/student_disciplinary_record_counsel`
* **Content-Type**: `application/json`
* **Request Payload**:
  ```json
  {
    "student_name": "John Doe",
    "roll_number": "SG-2026-0042",
    "student_class": "Grade 10-A",
    "misconduct_incidents": "Caught using mobile phone in classroom during quiz.",
    "counselling_sessions": "Counselled on academic integrity and mobile policy.",
    "parent_meetings": "N/A",
    "improvement_action_plans": "Submit a written reflection, phone kept in locker."
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": 1,
    "student_name": "John Doe",
    "roll_number": "SG-2026-0042",
    "student_class": "Grade 10-A",
    "misconduct_incidents": "Caught using mobile phone in classroom during quiz.",
    "counselling_sessions": "Counselled on academic integrity and mobile policy.",
    "parent_meetings": "N/A",
    "improvement_action_plans": "Submit a written reflection, phone kept in locker.",
    "status": "Active",
    "risk_score": 7,
    "risk_level": "Medium",
    "next_recommended_action": "Schedule a follow-up counselling session within 7 days.",
    "trend": "Stable",
    "created_at": "2026-06-11T09:15:00.000Z",
    "updated_at": "2026-06-11T09:15:00.000Z"
  }
  ```

### 2.2 Get Records (Paginated & Filtered)
* **Route**: `GET /api/student_disciplinary_record_counsel`
* **Query Parameters**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
  - `status` (optional: `Active`, `Completed`, `Archived`)
  - `search` (optional: search by name, roll number, class)
* **Success Response (200 OK)**:
  ```json
  {
    "records": [...],
    "pagination": {
      "totalRecords": 1,
      "totalPages": 1,
      "currentPage": 1,
      "limit": 20
    }
  }
  ```

### 2.3 Get Record Details
* **Route**: `GET /api/student_disciplinary_record_counsel/:id`
* **Success Response (200 OK)**:
  Returns the single record JSON object.

### 2.4 Get Detailed Record with Audit History
* **Route**: `GET /api/student_disciplinary_record_counsel/:id/detail`
* **Success Response (200 OK)**:
  ```json
  {
    "record": { ... },
    "audit_logs": [
      {
        "id": 1,
        "record_id": 1,
        "action": "CREATE",
        "old_values": null,
        "new_values": "{...}",
        "changed_by": "Staff",
        "timestamp": "2026-06-11T09:15:00.000Z"
      }
    ]
  }
  ```

### 2.5 Update a Record
* **Route**: `PUT /api/student_disciplinary_record_counsel/:id`
* **Request Payload**:
  (Same fields as POST. Validates and recalculates risk scoring metrics)
* **Success Response (200 OK)**:
  Returns the updated record.

### 2.6 Update Status-Only
* **Route**: `PATCH /api/student_disciplinary_record_counsel/:id/status`
* **Request Payload**:
  ```json
  {
    "status": "Completed"
  }
  ```
* **Success Response (200 OK)**:
  Returns the updated record.

---

## 3. System Analytics (`/api/reports`, `/api/dashboard`)

### 3.1 Dashboard Widgets Summary
* **Route**: `GET /api/dashboard/summary`
* **Success Response (200 OK)**:
  ```json
  {
    "totalRecords": 24,
    "activeCount": 15,
    "completedCount": 6,
    "archivedCount": 3,
    "criticalRiskCount": 2,
    "highRiskCount": 4
  }
  ```

### 3.2 Analytics & Charts Summary
* **Route**: `GET /api/reports/summary`
* **Query Parameters**:
  - `startDate` (optional, YYYY-MM-DD)
  - `endDate` (optional, YYYY-MM-DD)
* **Success Response (200 OK)**:
  ```json
  {
    "statusCounts": [
      { "status": "Active", "count": 15 },
      { "status": "Completed", "count": 6 },
      { "status": "Archived", "count": 3 }
    ],
    "riskLevelCounts": [
      { "risk_level": "Low", "count": 10 },
      { "risk_level": "Medium", "count": 8 },
      { "risk_level": "High", "count": 4 },
      { "risk_level": "Critical", "count": 2 }
    ],
    "timeSeries": [
      { "date": "2026-06-01", "incidents": 2, "counsellings": 1 },
      { "date": "2026-06-02", "incidents": 1, "counsellings": 2 }
    ]
  }
  ```

---

## 4. Audit Log (`/api/audit_logs`)

### 4.1 Get All Audit Logs
* **Route**: `GET /api/audit_logs`
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "record_id": 1,
      "action": "CREATE",
      "old_values": null,
      "new_values": "...",
      "changed_by": "Staff",
      "timestamp": "2026-06-11T09:15:00.000Z"
    }
  ]
  ```

### 4.2 Post Manual Audit Note
* **Route**: `POST /api/audit_logs`
* **Request Payload**:
  ```json
  {
    "record_id": 1,
    "action": "MANUAL_NOTE",
    "new_values": "Admin followed up with student. Student showed cooperative attitude.",
    "changed_by": "Admin"
  }
  ```
* **Success Response (201 Created)**:
  Returns the created audit log entry.
