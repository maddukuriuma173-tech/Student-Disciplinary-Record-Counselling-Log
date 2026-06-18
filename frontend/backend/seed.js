import { supabase } from './database.js';

const mockRecords = [
  {
    student_name: 'Aditya Rao',
    roll_number: 'SG-2026-1001',
    student_class: 'Grade 10-A',
    misconduct_incidents: '• Caught sleeping in English class twice.\n• Incomplete mathematics assignment.',
    counselling_sessions: 'Counselled on sleeping schedule and workload. Agreed to complete math task.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Complete outstanding homework by end of week.',
    status: 'Active',
    risk_score: 7,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Stable'
  },
  {
    student_name: 'Bhavyasree K.',
    roll_number: 'SG-2026-1002',
    student_class: 'Grade 9-B',
    misconduct_incidents: '• Used inappropriate language on school playground during recess.',
    counselling_sessions: 'Session on playground rules, empathy, and constructive communication.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Apologize to peer, perform 2 hours of library assistance.',
    status: 'Completed',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Improving'
  },
  {
    student_name: 'Chaitanya Reddy',
    roll_number: 'SG-2026-1003',
    student_class: 'B.Ed First Year',
    misconduct_incidents: '• Repeatedly arriving late to morning assembly (5 times).\n• Distributing unauthorized flyers on campus.',
    counselling_sessions: '• Session on campus policies and guidelines.\n• Counselor warned regarding late attendance.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Strict adherence to 8:30 AM entry. No flyers without approval.',
    status: 'Active',
    risk_score: 10,
    risk_level: 'High',
    next_recommended_action: 'Schedule a parent-teacher-counsellor meeting immediately and draft a formal behavior contract.',
    trend: 'Stable'
  },
  {
    student_name: 'Deepika Sen',
    roll_number: 'SG-2026-1004',
    student_class: 'Grade 11-C',
    misconduct_incidents: '• Skipping afternoon lectures without prior permission (3 times).',
    counselling_sessions: 'Counselled on attendance policy and academic impacts. Student cited personal family stress.',
    parent_meetings: '• Telephonic meeting with mother; mother acknowledged issues and promised support.',
    improvement_action_plans: 'Provide doctor certificates for future absences, daily attendance card check-in.',
    status: 'Active',
    risk_score: 10,
    risk_level: 'High',
    next_recommended_action: 'Schedule a parent-teacher-counsellor meeting immediately and draft a formal behavior contract.',
    trend: 'Stable'
  },
  {
    student_name: 'Eshwar Prasad',
    roll_number: 'SG-2026-1005',
    student_class: 'Grade 8-A',
    misconduct_incidents: '• Fighting with classmate during lunch break.\n• Damaged classroom wooden bench during altercation.',
    counselling_sessions: '• Emergency anger management counselling.\n• Follow-up counselling session on conflict resolution.',
    parent_meetings: '• Formal in-person meeting with father. Agreed to pay bench replacement cost.',
    improvement_action_plans: '• Anger log journal check-in every Friday.\n• Bench repair payment settled.',
    status: 'Completed',
    risk_score: 15,
    risk_level: 'Critical',
    next_recommended_action: 'Escalate case immediately to the School Principal and Disciplinary Board for formal hearing.',
    trend: 'Improving'
  },
  {
    student_name: 'Farhan Khan',
    roll_number: 'SG-2026-1006',
    student_class: 'ITI Electrical',
    misconduct_incidents: '• Caught smoking near the campus gate.\n• Possession of prohibited lighter inside laboratory.',
    counselling_sessions: 'Session on health safety, fire hazard rules, and campus code of conduct.',
    parent_meetings: '• In-person meeting with parents, written warning issued.',
    improvement_action_plans: 'Tobacco cessation program materials provided. Suspended from labs for 1 week.',
    status: 'Active',
    risk_score: 12,
    risk_level: 'High',
    next_recommended_action: 'Schedule a parent-teacher-counsellor meeting immediately and draft a formal behavior contract.',
    trend: 'Stable'
  },
  {
    student_name: 'Goutham Krishna',
    roll_number: 'SG-2026-1007',
    student_class: 'Grade 12-A',
    misconduct_incidents: '• Copying from peer\'s exam sheet during mid-term exam.',
    counselling_sessions: 'Counselling on academic integrity, self-trust, and exam pressures.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Mid-term score voided, retake scheduled under supervision. Written apology.',
    status: 'Completed',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Stable'
  },
  {
    student_name: 'Hari Prasad',
    roll_number: 'SG-2026-1008',
    student_class: 'B.Ed Second Year',
    misconduct_incidents: '• Damaged library book pages intentionally.\n• Arriving late to internship teaching session.',
    counselling_sessions: 'Counselling regarding responsibility and professional ethics as future teachers.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Replace the damaged book, no late attendance tolerated on field trips.',
    status: 'Active',
    risk_score: 7,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Stable'
  },
  {
    student_name: 'Ishaan Verma',
    roll_number: 'SG-2026-1009',
    student_class: 'Grade 10-B',
    misconduct_incidents: '• Bullying a junior student on WhatsApp school group.\n• Threatening remarks sent via text.',
    counselling_sessions: '• Counselor warning session regarding cyberbullying and school policies.\n• Discussion on cyber laws.',
    parent_meetings: '• Joint meeting with parents and IT coordinator.',
    improvement_action_plans: '• Removed from WhatsApp group, social media awareness webinar certificate submission required.',
    status: 'Active',
    risk_score: 15,
    risk_level: 'Critical',
    next_recommended_action: 'Escalate case immediately to the School Principal and Disciplinary Board for formal hearing.',
    trend: 'Worsening'
  },
  {
    student_name: 'Jaya Lakshmi',
    roll_number: 'SG-2026-1010',
    student_class: 'Grade 9-A',
    misconduct_incidents: '• Incomplete home tasks repeatedly (8 times).',
    counselling_sessions: 'Counselled on learning gaps, time management, and support available in school library.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Attend homework club daily for 30 minutes after class.',
    status: 'Active',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Stable'
  },
  {
    student_name: 'Karthik Raja',
    roll_number: 'SG-2026-1011',
    student_class: 'ITI Mechanical',
    misconduct_incidents: '• Leaving workshop machine running unattended.',
    counselling_sessions: 'Counselled on workshop safety hazards and machine handling procedures.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Read safety handbook, clean workshop area for 3 days.',
    status: 'Completed',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Improving'
  },
  {
    student_name: 'Leela Prasad',
    roll_number: 'SG-2026-1012',
    student_class: 'Grade 11-A',
    misconduct_incidents: '• Arriving late to first period chemistry class (4 times).',
    counselling_sessions: 'Discussion on travel constraints. Commute is far, counselor suggested shift to bus schedule.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Registered for school bus route to avoid traffic delays.',
    status: 'Archived',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Stable'
  },
  {
    student_name: 'Manish Kumar',
    roll_number: 'SG-2026-1013',
    student_class: 'Grade 12-B',
    misconduct_incidents: '• Using mobile phone in science lab during class demonstration.',
    counselling_sessions: 'Counselled on policy restriction, distraction risk, and safety in laboratories.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Keep phone with class teacher during lab hours.',
    status: 'Completed',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Stable'
  },
  {
    student_name: 'Nikhitha Sen',
    roll_number: 'SG-2026-1014',
    student_class: 'Grade 8-B',
    misconduct_incidents: '• Throwing water bottles from school balcony.',
    counselling_sessions: 'Counselled on severe public hazard and physical risks to others on ground floor.',
    parent_meetings: '• Parent telephonic warning, parent supported warning.',
    improvement_action_plans: 'Written safety pledge submitted, monitoring recess periods.',
    status: 'Completed',
    risk_score: 10,
    risk_level: 'High',
    next_recommended_action: 'Schedule a parent-teacher-counsellor meeting immediately and draft a formal behavior contract.',
    trend: 'Improving'
  },
  {
    student_name: 'Om Prakash',
    roll_number: 'SG-2026-1015',
    student_class: 'B.Ed First Year',
    misconduct_incidents: '• Caught copying internship lesson plan from senior database.',
    counselling_sessions: 'Counselled on ethics, plagiarism rules, and developing original teaching methods.',
    parent_meetings: 'N/A',
    improvement_action_plans: 'Redraft lesson plan from scratch, present to senior faculty.',
    status: 'Completed',
    risk_score: 5,
    risk_level: 'Medium',
    next_recommended_action: 'Schedule a follow-up individual counselling session within 7 days.',
    trend: 'Improving'
  }
];

async function seedDatabase() {
  try {
    console.log('Clearing existing data from Supabase...');
    const { error: deleteRecError } = await supabase
      .from('student_disciplinary_record_counsel')
      .delete()
      .neq('id', 0);

    if (deleteRecError) throw deleteRecError;

    const { error: deleteLogError } = await supabase
      .from('audit_logs')
      .delete()
      .neq('id', 0);

    if (deleteLogError) throw deleteLogError;

    console.log('Inserting mock records...');
    for (const r of mockRecords) {
      const { data: created, error: insertError } = await supabase
        .from('student_disciplinary_record_counsel')
        .insert([{
          student_name: r.student_name,
          roll_number: r.roll_number,
          student_class: r.student_class,
          misconduct_incidents: r.misconduct_incidents,
          counselling_sessions: r.counselling_sessions,
          parent_meetings: r.parent_meetings,
          improvement_action_plans: r.improvement_action_plans,
          status: r.status,
          risk_score: r.risk_score,
          risk_level: r.risk_level,
          next_recommended_action: r.next_recommended_action,
          trend: r.trend
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const recordId = created.id;

      // Add CREATE audit log
      const { error: createLogError } = await supabase
        .from('audit_logs')
        .insert([{
          record_id: recordId,
          action: 'CREATE',
          new_values: JSON.stringify(r),
          changed_by: 'Staff'
        }]);

      if (createLogError) throw createLogError;

      // Add STATUS_CHANGE audit log if completed or archived
      if (r.status !== 'Active') {
        const { error: statusLogError } = await supabase
          .from('audit_logs')
          .insert([{
            record_id: recordId,
            action: 'STATUS_CHANGE',
            old_values: JSON.stringify({ status: 'Active' }),
            new_values: JSON.stringify({ status: r.status }),
            changed_by: 'Staff'
          }]);

        if (statusLogError) throw statusLogError;
      }
    }

    console.log('Successfully seeded 15 student disciplinary logs & audit records on Supabase!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
