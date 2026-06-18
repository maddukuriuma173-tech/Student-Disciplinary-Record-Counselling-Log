import assert from 'node:assert';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import routes from '../backend/routes.js';
// Setup temporary Express app on port 5001 to avoid conflicting with dev server
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

let server;

async function startServer() {
  return new Promise((resolve) => {
    server = app.listen(5005, () => {
      console.log('Test Server started on port 5005');
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Test Server stopped.');
      resolve();
    });
  });
}

// Simple request helper using standard fetch
async function request(path, options = {}) {
  const url = `http://localhost:5005${path}`;
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }
  options.headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(url, options);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  return {
    status: res.status,
    body: isJson ? await res.json() : await res.text(),
    ok: res.ok
  };
}

async function runTests() {
  console.log('Starting API integration tests...');
  await startServer();

  try {
    // 1. Test GET /health
    const health = await request('/api/dashboard/summary');
    if (health.status !== 200) {
      console.error('FAILING GET /api/dashboard/summary:', health);
    }
    assert.strictEqual(health.status, 200, 'Dashboard summary should load');
    console.log('✓ GET /api/dashboard/summary works');

    // 2. Test POST /student_disciplinary_record_counsel (Validation Error)
    const badPost = await request('/api/student_disciplinary_record_counsel', {
      method: 'POST',
      body: { student_name: 'Test Student' } // missing roll_number, class, etc.
    });
    assert.strictEqual(badPost.status, 400, 'Should reject incomplete records');
    assert.strictEqual(badPost.body.success, false);
    console.log('✓ POST /api/... validates required fields');

    // 3. Test POST /student_disciplinary_record_counsel (Success creation)
    const newRecord = {
      student_name: 'Integration Test Student',
      roll_number: 'SG-TEST-999',
      student_class: 'Grade 9-Z',
      misconduct_incidents: '• Walked out of classroom.\n• Failed to complete homework twice.', // 2 incidents * 2 = 4
      counselling_sessions: 'Counselled regarding discipline.', // 1 session * 3 = 3
      parent_meetings: 'N/A',
      improvement_action_plans: 'Homework schedule to be signed by parents.' // penalty = 0
    };
    // Expected risk score: 4 + 3 + 0 + 0 = 7 (Medium)
    
    const postRes = await request('/api/student_disciplinary_record_counsel', {
      method: 'POST',
      body: newRecord
    });
    
    assert.strictEqual(postRes.status, 201, 'Should create record successfully');
    const createdId = postRes.body.id;
    assert.ok(createdId, 'Should return created record ID');
    assert.strictEqual(postRes.body.risk_score, 7);
    assert.strictEqual(postRes.body.risk_level, 'Medium');
    assert.strictEqual(postRes.body.status, 'Active');
    console.log(`✓ POST /api/... created case ID ${createdId} with correct risk metrics`);

    // 4. Test GET /student_disciplinary_record_counsel/:id
    const getRes = await request(`/api/student_disciplinary_record_counsel/${createdId}`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.student_name, 'Integration Test Student');
    console.log('✓ GET /api/student_disciplinary_record_counsel/:id works');

    // 5. Test PATCH /student_disciplinary_record_counsel/:id/status (Workflow validation error)
    // Try marking Completed but status change is blocked if we try to violate something (e.g. Critical case cannot be marked completed)
    // Wait, our record has Medium risk, but let's test a valid transition: Active -> Completed
    const patchRes = await request(`/api/student_disciplinary_record_counsel/${createdId}/status`, {
      method: 'PATCH',
      body: { status: 'Completed' }
    });
    assert.strictEqual(patchRes.status, 200, 'Medium case with action plan should transition to Completed');
    assert.strictEqual(patchRes.body.status, 'Completed');
    console.log('✓ PATCH /api/.../:id/status workflow transition works');

    // 6. Test GET /student_disciplinary_record_counsel/:id/detail
    const detailRes = await request(`/api/student_disciplinary_record_counsel/${createdId}/detail`);
    assert.strictEqual(detailRes.status, 200);
    assert.ok(detailRes.body.audit_logs.length >= 2, 'Should have CREATE and STATUS_CHANGE audit logs');
    console.log('✓ GET /api/.../:id/detail returns record and audit logs history');

    console.log('\nAll API integration tests passed successfully!');
  } catch (error) {
    console.error('Test Suite Failed:', error);
    process.exit(1);
  } finally {
    await stopServer();
  }
}

runTests();
