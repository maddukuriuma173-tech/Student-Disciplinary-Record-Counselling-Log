import assert from 'node:assert';
import test from 'node:test';
import { countEvents, calculateRiskMetrics, validateStatusTransition } from '../backend/business_rules.js';

test('Business Rules: countEvents', () => {
  // Typical bullet lists
  assert.strictEqual(countEvents('• Incident 1\n• Incident 2\n• Incident 3'), 3);
  assert.strictEqual(countEvents('- Incident A\n- Incident B'), 2);
  
  // Semicolon separators
  assert.strictEqual(countEvents('First incident; second incident; third incident'), 3);
  
  // Sentence split fallback
  assert.strictEqual(countEvents('The student was caught using a phone. Later, they skipped class. Finally, they were sent to the office.'), 3);
  
  // Empty or N/A cases
  assert.strictEqual(countEvents(''), 0);
  assert.strictEqual(countEvents('N/A'), 0);
  assert.strictEqual(countEvents('None'), 0);
});

test('Business Rules: calculateRiskMetrics', () => {
  // Low Risk Case
  const dataLow = {
    misconduct_incidents: 'Caught talking in class.', // 1 event * 2 = 2
    counselling_sessions: 'Counselled once.', // 1 event * 3 = 3
    parent_meetings: 'N/A', // 0
    improvement_action_plans: 'Pay attention.' // 1 event -> penalty = 0
  };
  const metricsLow = calculateRiskMetrics(dataLow);
  assert.strictEqual(metricsLow.risk_score, 5); // 2 + 3 + 0 + 0 = 5
  assert.strictEqual(metricsLow.risk_level, 'Medium');

  // Critical Risk Case (Multiple incidents, counselling, parent meeting, missing action plan penalty)
  const dataCritical = {
    misconduct_incidents: '• Caught cheating.\n• Slept during quiz.\n• Disrespected teacher.', // 3 events * 2 = 6
    counselling_sessions: '• Session 1\n• Session 2', // 2 events * 3 = 6
    parent_meetings: '• Parent met on Monday.', // 1 event * 5 = 5
    improvement_action_plans: 'N/A' // 0 events -> penalty = 2
  };
  const metricsCritical = calculateRiskMetrics(dataCritical);
  assert.strictEqual(metricsCritical.risk_score, 19); // 6 + 6 + 5 + 2 = 19
  assert.strictEqual(metricsCritical.risk_level, 'Critical');
});

test('Business Rules: validateStatusTransition', () => {
  // Completed status validation constraints
  const recordCritical = {
    risk_level: 'Critical',
    improvement_action_plans: 'Some plan'
  };
  const transitionCritical = validateStatusTransition(recordCritical, 'Completed');
  assert.strictEqual(transitionCritical.valid, false);
  assert.match(transitionCritical.message, /Critical cases cannot be marked Completed/);

  const recordNoPlan = {
    risk_level: 'High',
    improvement_action_plans: 'N/A' // countEvents = 0
  };
  const transitionNoPlan = validateStatusTransition(recordNoPlan, 'Completed');
  assert.strictEqual(transitionNoPlan.valid, false);
  assert.match(transitionNoPlan.message, /Cases must have a documented Improvement Action Plan/);

  const recordValid = {
    risk_level: 'High',
    improvement_action_plans: 'Follow a strict 30-day goals sheet'
  };
  const transitionValid = validateStatusTransition(recordValid, 'Completed');
  assert.strictEqual(transitionValid.valid, true);
});
