# Test Tracker
**Project**: Student Disciplinary Record & Counselling Log  
**Institution**: Sri Gowthami Educational Institutions  

This document tracks the manual and automated test execution results.

---

## 1. Summary of Test Run
* **Date of Run**: 2026-06-11
* **Environment**: Local Windows PC (Node v24.16.0, SQLite)
* **Automated Tests**: 3 Unit Test Cases (passed), 6 Integration Test Cases (passed)
* **Manual Verification**: Passed (Dashboard metrics, entry forms, pagination, CSV exports, printing layouts, Dark/Light modes)
* **Overall Pass Rate**: **100%**

---

## 2. Automated Test Case Details

| Test ID | Module | Description | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|---|
| AUTO-001 | Business Logic | Test `countEvents` splitting logic on newlines, semicolons, and sentences | Accurately counts distinct bullet points and items | Count matches expected count exactly | **PASS** |
| AUTO-002 | Business Logic | Test `calculateRiskMetrics` score and risk level calculation | Low/Medium/Critical metrics calculated correctly | Score and classification match expectations | **PASS** |
| AUTO-003 | Business Logic | Test `validateStatusTransition` workflow constraint logic | Rejects Critical status completion, requires action plans | Correctly identifies and rejects invalid states | **PASS** |
| AUTO-004 | API Integration | Test GET `/api/dashboard/summary` | Returns status codes and metric totals | Correct stats JSON output | **PASS** |
| AUTO-005 | API Integration | Test POST `/api/student_disciplinary_record_counsel` with complete/incomplete data | Accepts valid payloads, rejects incomplete with 400 Bad Request | Successfully saves valid and blocks invalid entries | **PASS** |
| AUTO-006 | API Integration | Test GET `/api/student_disciplinary_record_counsel/:id` | Returns the requested record matching the ID | Returns matching record | **PASS** |
| AUTO-007 | API Integration | Test PATCH `/api/.../:id/status` | Allows valid status changes | Record status updated successfully | **PASS** |
| AUTO-008 | API Integration | Test GET `/api/.../:id/detail` | Returns record metadata joined with its audit trail history | Audit logs correctly retrieved and formatted | **PASS** |

---

## 3. Manual Verification Checklist

| Test ID | Screen / Module | Verification Action | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|---|
| MAN-001 | Layout Container | Check Dark/Light theme toggle in Sidebar | Seamlessly switches between high-end dark and light variables | Colors transition smoothly without lag | **PASS** |
| MAN-002 | Entry Form | Submit form with missing fields | Shows clear red highlight validation errors next to inputs | Input boxes highlight red with error labels | **PASS** |
| MAN-003 | Entry Form | Submit a valid record | Saves record to DB and redirects to case detail report | Case details page loads with calculated metrics | **PASS** |
| MAN-004 | Dashboard Grid | Test search bar matching name, roll number, or class | Dynamically filters matching records in table | Filters table in real time | **PASS** |
| MAN-005 | Dashboard Grid | Test filter tabs (All, Active, Completed, Archived) | Filters table to only show records in selected state | Correct status subsets displayed | **PASS** |
| MAN-006 | Dashboard Grid | Change case status via inline dropdown selector | Changes record state and appends to audit trail | Dropdown color changes, details log is updated | **PASS** |
| MAN-007 | Detail Page | Add manual comment in audit timeline form | Appends custom note into the case history log | Comment appears immediately on timeline | **PASS** |
| MAN-008 | Detail Page | Click "Print Report" | Opens system print dialog hiding sidebars and buttons | Custom print layout displayed, navigation elements hidden | **PASS** |
| MAN-009 | Reports Screen | Render charts (Status splits, risk profiles, timeline) | Recharts components render correctly with mock data | Vibrant, hoverable charts render successfully | **PASS** |
| MAN-010 | Reports Screen | Click "Export CSV Spreadsheet" | Downloads CSV of all database records | Downloads formatted CSV file matching schema | **PASS** |
| MAN-011 | Responsiveness | Resize window to mobile viewport width (375px) | Layout switches to top bar / flex column, grids wrap | Responsive wrapping fits mobile screen cleanly | **PASS** |
