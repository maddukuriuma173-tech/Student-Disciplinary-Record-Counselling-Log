import express from 'express';
import { supabase } from './database.js';
import { calculateRiskMetrics, determineTrend, validateStatusTransition } from './business_rules.js';

const router = express.Router();

// Helper to sanitize incoming string fields
const cleanString = (str) => (str ? str.trim() : '');

// 1. GET Dashboard summary metrics (widgets)
router.get('/dashboard/summary', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('status, risk_level');

    if (error) throw error;

    const totalRecords = data.length;
    const activeCount = data.filter(r => r.status === 'Active').length;
    const completedCount = data.filter(r => r.status === 'Completed').length;
    const archivedCount = data.filter(r => r.status === 'Archived').length;
    const criticalRiskCount = data.filter(r => r.risk_level === 'Critical').length;
    const highRiskCount = data.filter(r => r.risk_level === 'High').length;

    res.json({
      totalRecords,
      activeCount,
      completedCount,
      archivedCount,
      criticalRiskCount,
      highRiskCount
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET Reports analytics summary (charts data)
router.get('/reports/summary', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('*');

    if (error) throw error;

    const statusMap = {};
    const riskMap = {};
    const timeSeriesMap = {};

    data.forEach(r => {
      // Status Counts
      statusMap[r.status] = (statusMap[r.status] || 0) + 1;
      
      // Risk Counts
      riskMap[r.risk_level] = (riskMap[r.risk_level] || 0) + 1;
      
      // Time Series (group by YYYY-MM-DD date)
      const dateStr = r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
      if (!timeSeriesMap[dateStr]) {
        timeSeriesMap[dateStr] = { 
          date: dateStr, 
          total: 0, 
          severe_incidents: 0, 
          counselling_sessions_count: 0 
        };
      }
      timeSeriesMap[dateStr].total++;
      if (r.risk_level === 'High' || r.risk_level === 'Critical') {
        timeSeriesMap[dateStr].severe_incidents++;
      }
      if (r.counselling_sessions && r.counselling_sessions !== 'N/A' && r.counselling_sessions !== '') {
        timeSeriesMap[dateStr].counselling_sessions_count++;
      }
    });

    const statusCounts = Object.keys(statusMap).map(k => ({ status: k, count: statusMap[k] }));
    const riskLevelCounts = Object.keys(riskMap).map(k => ({ risk_level: k, count: riskMap[k] }));
    const timeSeries = Object.values(timeSeriesMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      statusCounts,
      riskLevelCounts,
      timeSeries
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET all records with search, status filter, and pagination
router.get('/student_disciplinary_record_counsel', async (req, res, next) => {
  try {
    let { page = 1, limit = 20, status = '', search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('student_disciplinary_record_counsel')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`student_name.ilike.%${search}%,roll_number.ilike.%${search}%,student_class.ilike.%${search}%`);
    }

    const { data: records, count, error } = await query
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      records,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// 4. GET a specific record
router.get('/student_disciplinary_record_counsel/:id', async (req, res, next) => {
  try {
    const { data: record, error } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!record) {
      return res.status(404).json({ success: false, message: 'Disciplinary record not found.' });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
});

// 5. GET detailed record with audit logs joined
router.get('/student_disciplinary_record_counsel/:id/detail', async (req, res, next) => {
  try {
    const { data: record, error: recordError } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (recordError) throw recordError;
    if (!record) {
      return res.status(404).json({ success: false, message: 'Disciplinary record not found.' });
    }

    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('record_id', req.params.id)
      .order('timestamp', { ascending: false });

    if (logsError) throw logsError;

    res.json({
      record,
      audit_logs: logs
    });
  } catch (error) {
    next(error);
  }
});

// 6. POST Create a new disciplinary record
router.post('/student_disciplinary_record_counsel', async (req, res, next) => {
  try {
    const {
      student_name,
      roll_number,
      student_class,
      misconduct_incidents,
      counselling_sessions,
      parent_meetings,
      improvement_action_plans
    } = req.body;

    if (!student_name || !roll_number || !student_class || !misconduct_incidents || !counselling_sessions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Name, Roll Number, Class, Misconduct details, and Counselling notes are mandatory.'
      });
    }

    const cleanData = {
      student_name: cleanString(student_name),
      roll_number: cleanString(roll_number),
      student_class: cleanString(student_class),
      misconduct_incidents: cleanString(misconduct_incidents),
      counselling_sessions: cleanString(counselling_sessions),
      parent_meetings: cleanString(parent_meetings) || 'N/A',
      improvement_action_plans: cleanString(improvement_action_plans) || 'N/A'
    };

    // Trigger Business Rules calculations
    const metrics = calculateRiskMetrics(cleanData);
    const trend = await determineTrend(cleanData.roll_number, metrics.risk_score);

    // Save to DB
    const { data: createdRecord, error } = await supabase
      .from('student_disciplinary_record_counsel')
      .insert([{
        student_name: cleanData.student_name,
        roll_number: cleanData.roll_number,
        student_class: cleanData.student_class,
        misconduct_incidents: cleanData.misconduct_incidents,
        counselling_sessions: cleanData.counselling_sessions,
        parent_meetings: cleanData.parent_meetings,
        improvement_action_plans: cleanData.improvement_action_plans,
        status: 'Active',
        risk_score: metrics.risk_score,
        risk_level: metrics.risk_level,
        next_recommended_action: metrics.next_recommended_action,
        trend: trend
      }])
      .select()
      .single();

    if (error) throw error;

    // Write audit log
    await supabase
      .from('audit_logs')
      .insert([{
        record_id: createdRecord.id,
        action: 'CREATE',
        new_values: JSON.stringify(createdRecord),
        changed_by: 'Staff'
      }]);

    res.status(201).json(createdRecord);
  } catch (error) {
    next(error);
  }
});

// 7. PUT Update an existing disciplinary record
router.put('/student_disciplinary_record_counsel/:id', async (req, res, next) => {
  try {
    const recordId = req.params.id;

    // Fetch current state
    const { data: currentRecord, error: fetchError } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!currentRecord) {
      return res.status(404).json({ success: false, message: 'Disciplinary record not found.' });
    }

    const {
      student_name,
      roll_number,
      student_class,
      misconduct_incidents,
      counselling_sessions,
      parent_meetings,
      improvement_action_plans
    } = req.body;

    if (!student_name || !roll_number || !student_class || !misconduct_incidents || !counselling_sessions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Name, Roll Number, Class, Misconduct, and Counselling sessions are mandatory.'
      });
    }

    const cleanData = {
      student_name: cleanString(student_name),
      roll_number: cleanString(roll_number),
      student_class: cleanString(student_class),
      misconduct_incidents: cleanString(misconduct_incidents),
      counselling_sessions: cleanString(counselling_sessions),
      parent_meetings: cleanString(parent_meetings) || 'N/A',
      improvement_action_plans: cleanString(improvement_action_plans) || 'N/A'
    };

    // Re-trigger business rules
    const metrics = calculateRiskMetrics(cleanData);
    const trend = await determineTrend(cleanData.roll_number, metrics.risk_score);

    const { data: updatedRecord, error: updateError } = await supabase
      .from('student_disciplinary_record_counsel')
      .update({
        student_name: cleanData.student_name,
        roll_number: cleanData.roll_number,
        student_class: cleanData.student_class,
        misconduct_incidents: cleanData.misconduct_incidents,
        counselling_sessions: cleanData.counselling_sessions,
        parent_meetings: cleanData.parent_meetings,
        improvement_action_plans: cleanData.improvement_action_plans,
        risk_score: metrics.risk_score,
        risk_level: metrics.risk_level,
        next_recommended_action: metrics.next_recommended_action,
        trend: trend,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Save update to audit trail
    await supabase
      .from('audit_logs')
      .insert([{
        record_id: recordId,
        action: 'UPDATE',
        old_values: JSON.stringify(currentRecord),
        new_values: JSON.stringify(updatedRecord),
        changed_by: 'Staff'
      }]);

    res.json(updatedRecord);
  } catch (error) {
    next(error);
  }
});

// 8. PATCH Update status only
router.patch('/student_disciplinary_record_counsel/:id/status', async (req, res, next) => {
  try {
    const recordId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status field is required.' });
    }

    const { data: currentRecord, error: fetchError } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('*')
      .eq('id', recordId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!currentRecord) {
      return res.status(404).json({ success: false, message: 'Disciplinary record not found.' });
    }

    // Validate workflow rules
    const transition = validateStatusTransition(currentRecord, status);
    if (!transition.valid) {
      return res.status(400).json({ success: false, message: transition.message });
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from('student_disciplinary_record_counsel')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', recordId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Write audit trail status update
    await supabase
      .from('audit_logs')
      .insert([{
        record_id: recordId,
        action: 'STATUS_CHANGE',
        old_values: JSON.stringify({ status: currentRecord.status }),
        new_values: JSON.stringify({ status: updatedRecord.status }),
        changed_by: 'Staff'
      }]);

    res.json(updatedRecord);
  } catch (error) {
    next(error);
  }
});

// 9. GET list of recent audit logs
router.get('/audit_logs', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, student_disciplinary_record_counsel(student_name, roll_number)')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Flatten output for client compatibility
    const formatted = data.map(log => ({
      ...log,
      student_name: log.student_disciplinary_record_counsel?.student_name || null,
      roll_number: log.student_disciplinary_record_counsel?.roll_number || null
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// 10. POST Write a manual remark into the audit log of a case
router.post('/audit_logs', async (req, res, next) => {
  try {
    const { record_id, action = 'MANUAL_NOTE', new_values, changed_by = 'Staff' } = req.body;

    if (!record_id || !new_values) {
      return res.status(400).json({
        success: false,
        message: 'Record ID and comment text (new_values) are required.'
      });
    }

    const { data: record, error: recordError } = await supabase
      .from('student_disciplinary_record_counsel')
      .select('id')
      .eq('id', record_id)
      .maybeSingle();

    if (recordError) throw recordError;
    if (!record) {
      return res.status(404).json({ success: false, message: 'Associated record not found.' });
    }

    const { data: createdLog, error: insertError } = await supabase
      .from('audit_logs')
      .insert([{
        record_id,
        action,
        new_values,
        changed_by
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(createdLog);
  } catch (error) {
    next(error);
  }
});

export default router;
