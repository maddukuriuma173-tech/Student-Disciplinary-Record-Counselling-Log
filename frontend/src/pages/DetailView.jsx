import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeft, 
  Printer, 
  MessageSquareCode, 
  Calendar,
  AlertTriangle,
  Send,
  ShieldCheck,
  History
} from 'lucide-react';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:5000/api'
  : '/api';

const DetailView = ({ recordId, onBack, onEdit }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Audit manual note state
  const [newRemark, setNewRemark] = useState('');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  const fetchDetail = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/student_disciplinary_record_counsel/${recordId}/detail`);
      if (!res.ok) throw new Error('Failed to load record details.');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) {
      fetchDetail();
    }
  }, [recordId]);

  const handleAddRemark = async (e) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    setIsSubmittingRemark(true);
    try {
      const res = await fetch(`${API_BASE}/audit_logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record_id: recordId,
          action: 'MANUAL_NOTE',
          new_values: newRemark.trim(),
          changed_by: 'Staff'
        })
      });

      if (!res.ok) throw new Error('Failed to post remark.');
      
      setNewRemark('');
      // Refresh details and log timeline
      await fetchDetail();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <LoadingSpinner />;
  if (errorMsg) return <div style={{ color: 'hsl(0 85% 65%)', textAlign: 'center', padding: '3rem' }}>{errorMsg}</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '3rem' }}>Record not found.</div>;

  const { record, audit_logs } = data;

  const renderRiskDisplay = (level, score) => {
    let color = 'hsl(142 80% 45%)';
    if (level === 'Medium') color = 'hsl(38 90% 50%)';
    else if (level === 'High') color = 'hsl(20 90% 55%)';
    else if (level === 'Critical') color = 'hsl(0 90% 60%)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', borderRadius: '12px', border: `2px solid ${color}`, background: `rgba(255,255,255,0.01)` }}>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Behavior Risk Level</span>
        <h2 style={{ fontSize: '2.5rem', color, fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{level}</h2>
        <span style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Numerical Score: <strong>{score}</strong></span>
      </div>
    );
  };

  return (
    <>
      {/* Detail Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <div>
          <Breadcrumbs items={[{ label: 'Cases', hash: 'dashboard' }, { label: 'Case Details' }]} />
          <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }} className="title-gradient">
            Disciplinary File: {record.student_name}
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Roll Number: <strong>{record.roll_number}</strong> | Class: <strong>{record.student_class}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
          <button className="btn btn-secondary" onClick={() => onEdit(record.id)}>
            Edit Record
          </button>
          <button className="btn btn-primary" onClick={onBack}>
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </div>

      {/* Print Only Header (Visible only when printing) */}
      <div style={{ display: 'none', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }} className="print-only">
        <h1 style={{ fontSize: '24pt', fontWeight: 'bold' }}>Sri Gowthami Educational Institutions</h1>
        <h2 style={{ fontSize: '18pt', marginTop: '0.5rem' }}>Student Disciplinary Record & Counselling Report</h2>
        <p style={{ marginTop: '0.5rem', fontSize: '11pt' }}>
          Date: {new Date().toLocaleDateString()} | Student Name: <strong>{record.student_name}</strong> | Roll Number: <strong>{record.roll_number}</strong> | Class: <strong>{record.student_class}</strong>
        </p>
      </div>

      {/* Two-Column Grid Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Descriptions and logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '0.5rem' }}>
              1. Student Misconduct Incidents
            </h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {record.misconduct_incidents}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '0.5rem' }}>
              2. Counselling Session Logs
            </h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {record.counselling_sessions}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '0.5rem' }}>
              3. Parent Consultation Notes
            </h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {record.parent_meetings}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '0.5rem' }}>
              4. Student Improvement Action Plan
            </h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {record.improvement_action_plans}
            </p>
          </div>

        </div>

        {/* Right Column: Calculations and Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'hsl(var(--accent-primary))' }} /> Risk Evaluation
            </h3>
            
            {renderRiskDisplay(record.risk_level, record.risk_score)}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border-color))' }}>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Behavioral Trend</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                {record.trend}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
              <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>Case Status</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: record.status === 'Active' 
                  ? 'rgba(59, 130, 246, 0.15)' 
                  : record.status === 'Completed' 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : 'rgba(107, 114, 128, 0.15)',
                color: record.status === 'Active' 
                  ? '#60a5fa' 
                  : record.status === 'Completed' 
                    ? '#34d399' 
                    : '#9ca3af'
              }}>
                {record.status}
              </span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid hsl(var(--accent-primary))', backgroundColor: 'rgba(139, 92, 246, 0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--accent-primary))' }}>
              <AlertTriangle size={18} /> Recommended Next Steps
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'hsl(var(--text-primary))', fontWeight: '500' }}>
              {record.next_recommended_action}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Metadata Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date Logged</span>
                <span>{new Date(record.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Last Updated</span>
                <span>{new Date(record.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Panel: Audit Trail Timeline */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '0.5rem' }}>
          <History size={20} style={{ color: 'hsl(var(--accent-secondary))' }} /> Case Audit Trail & Verification Logs
        </h3>

        {/* Timeline */}
        <div className="timeline">
          {audit_logs.length === 0 ? (
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>No logs registered for this record.</p>
          ) : (
            audit_logs.map(log => {
              // Parse audit log action and values
              let details = '';
              if (log.action === 'CREATE') {
                details = 'Disciplinary case file registered in system.';
              } else if (log.action === 'UPDATE') {
                details = 'Case information, counselling logs, or action plan details updated.';
              } else if (log.action === 'STATUS_CHANGE') {
                try {
                  const olds = JSON.parse(log.old_values);
                  const news = JSON.parse(log.new_values);
                  details = `Case status updated from "${olds.status}" to "${news.status}".`;
                } catch (e) {
                  details = 'Status updated.';
                }
              } else if (log.action === 'MANUAL_NOTE') {
                details = log.new_values;
              }

              return (
                <div className="timeline-item" key={log.id}>
                  <div className="timeline-dot">
                    <MessageSquareCode size={12} style={{ color: 'hsl(var(--accent-primary))' }} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-user">{log.changed_by}</span>
                      <span className="timeline-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
                      <strong style={{ color: 'hsl(var(--text-secondary))', marginRight: '0.5rem' }}>[{log.action}]</strong>
                      {details}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form to Append Manual Audit Note */}
        <form onSubmit={handleAddRemark} className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid hsl(var(--border-color))', paddingTop: '1.5rem' }}>
          <div style={{ flexGrow: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter manual audit note, parent meeting outcome, or disciplinary update..."
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              disabled={isSubmittingRemark}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }} disabled={isSubmittingRemark || !newRemark.trim()}>
            <Send size={16} /> Append Log
          </button>
        </form>
      </div>
    </>
  );
};

export default DetailView;
