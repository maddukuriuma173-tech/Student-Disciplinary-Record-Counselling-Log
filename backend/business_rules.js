import supabase from './database.js';

/**
 * Counts the number of distinct events/items in a descriptive text field
 * (splits by newlines, list markers, or sentences).
 */
export function countEvents(text) {
  if (!text) return 0;
  
  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();
  
  if (lower === '' || lower === 'n/a' || lower === 'none' || lower === 'nil' || lower === 'no incidents') {
    return 0;
  }
  
  // Split by common separators: newlines, semicolons, bullet points
  const items = cleanText.split(/[\n;•\r]+/)
    .map(item => item.trim().replace(/^[-*•\d\.\s]+/, '')) // clean bullet/number prefix
    .filter(item => item.length > 4); // filter out empty or very short items
    
  if (items.length <= 1) {
    // Try splitting by sentences (periods followed by space)
    const sentences = cleanText.split(/\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 4);
    return Math.max(1, sentences.length);
  }
  
  return items.length;
}

/**
 * Main business logic rules engine. Calculates risk_score, risk_level, next_recommended_action.
 * Returns the calculated values.
 */
export function calculateRiskMetrics(data) {
  const {
    misconduct_incidents,
    counselling_sessions,
    parent_meetings,
    improvement_action_plans
  } = data;

  const incidentCount = countEvents(misconduct_incidents);
  const counsellingCount = countEvents(counselling_sessions);
  const parentMeetingCount = countEvents(parent_meetings);
  const actionPlanCount = countEvents(improvement_action_plans);

  // Business Rules for Score Calculation:
  // 1. Each misconduct incident adds 2 points.
  // 2. Each counselling session adds 3 points.
  // 3. Each parent meeting adds 5 points.
  // 4. Missing action plan adds 2 points penalty.
  const incidentScore = incidentCount * 2;
  const counsellingScore = counsellingCount * 3;
  const parentMeetingScore = parentMeetingCount * 5;
  const actionPlanScore = actionPlanCount === 0 ? 2 : 0;

  const riskScore = incidentScore + counsellingScore + parentMeetingScore + actionPlanScore;

  // Classification Rules:
  // - 0 to 3: Low
  // - 4 to 7: Medium
  // - 8 to 12: High
  // - > 12: Critical
  let riskLevel = 'Low';
  if (riskScore >= 4 && riskScore <= 7) {
    riskLevel = 'Medium';
  } else if (riskScore >= 8 && riskScore <= 12) {
    riskLevel = 'High';
  } else if (riskScore > 12) {
    riskLevel = 'Critical';
  }

  // Next Recommended Action Rules:
  let nextAction = '';
  switch (riskLevel) {
    case 'Low':
      nextAction = 'Monitor student progress weekly in class.';
      break;
    case 'Medium':
      nextAction = 'Schedule a follow-up individual counselling session within 7 days.';
      break;
    case 'High':
      nextAction = 'Schedule a parent-teacher-counsellor meeting immediately and draft a formal behavior contract.';
      break;
    case 'Critical':
      nextAction = 'Escalate case immediately to the School Principal and Disciplinary Board for formal hearing.';
      break;
    default:
      nextAction = 'Monitor and log future incidents.';
  }

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    next_recommended_action: nextAction
  };
}

/**
 * Calculates behavioral trend based on historical records of the same student
 */
export async function determineTrend(rollNumber, currentScore) {
  try {
    // Find previous records for the same roll number (excluding the current active status if needed)
    const { data: history, error } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('risk_score')
      .eq('roll_number', rollNumber)
      .order('id', { ascending: false });

    if (error) throw error;

    if (!history || history.length === 0) {
      return 'Stable'; // default for first entry
    }

    const scores = history.map(h => h.risk_score);
    const avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;

    if (currentScore < avgScore - 1) {
      return 'Improving';
    } else if (currentScore > avgScore + 1) {
      return 'Worsening';
    } else {
      return 'Stable';
    }
  } catch (error) {
    console.error('Error calculating trend:', error);
    return 'Stable';
  }
}

/**
 * Validates status transitions to ensure business workflow policies are respected
 */
export function validateStatusTransition(currentRecord, newStatus) {
  if (newStatus === 'Completed') {
    // Constraint: Can't mark as completed if risk is Critical
    if (currentRecord.risk_level === 'Critical') {
      return {
        valid: false,
        message: 'Critical cases cannot be marked Completed without resolving the formal Disciplinary Board review.'
      };
    }
    // Constraint: Can't mark as completed without an action plan
    const actionPlans = countEvents(currentRecord.improvement_action_plans);
    if (actionPlans === 0) {
      return {
        valid: false,
        message: 'Cases must have a documented Improvement Action Plan before they can be marked Completed.'
      };
    }
  }

  if (newStatus === 'Archived') {
    // Constraint: Can't archive unless status is currently Completed
    if (currentRecord.status !== 'Completed') {
      return {
        valid: false,
        message: 'A case must be marked Completed before it can be archived.'
      };
    }
  }

  return { valid: true };
}
