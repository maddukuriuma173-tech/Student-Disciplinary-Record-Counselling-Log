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
  History,
  Pencil
} from 'lucide-react';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:5000/api'
  : '/api';

const parseActionPlans = (planField) => {
  if (!planField || planField.trim() === '' || planField.toLowerCase() === 'n/a' || planField.toLowerCase() === 'none') {
    return [];
  }
  try {
    const parsed = JSON.parse(planField);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  // Plain text fallback
  return planField.split(/[;\n•]+/)
    .map(item => item.trim().replace(/^[-*•\d\.\s]+/, ''))
    .filter(item => item.length > 2)
    .map(text => ({ text, completed: false }));
};

const DetailView = ({ recordId, onBack, onEdit, onViewStudentProfile }) => {
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
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          record_id: recordId,
          action: 'MANUAL_NOTE',
          new_values: newRemark.trim()
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

  const handleToggleChecklist = async (index) => {
    const currentPlans = parseActionPlans(record.improvement_action_plans);
    const updatedPlans = currentPlans.map((item, idx) => 
      idx === index ? { ...item, completed: !item.completed } : item
    );

    try {
      const res = await fetch(`${API_BASE}/student_disciplinary_record_counsel/${record.id}/action-plans`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action_plans: updatedPlans })
      });

      if (!res.ok) throw new Error('Failed to update action checklist.');

      // Reload detail view
      await fetchDetail();
    } catch (err) {
      alert(err.message);
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
      {/* Printable Report Header */}
      <div className="print-header no-screen" style={{ display: 'none', marginBottom: '2rem', borderBottom: '2px solid #334155', paddingBottom: '1rem' }}>
        <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', textAlign: 'center' }}>SRI GOWTHAMI EDUCATIONAL INSTITUTIONS</h2>
        <h3 style={{ color: '#334155', fontSize: '1.1rem', fontWeight: '700', textAlign: 'center', marginTop: '0.25rem' }}>STUDENT DISCIPLINARY FILE & COUSELLING DOSSIER</h3>
      </div>

      {/* Detail Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <div>
          <Breadcrumbs items={[{ label: 'Cases', hash: 'dashboard' }, { label: 'Case Details' }]} />
          <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }} className="title-gradient">
            Disciplinary File: {record.student_name}
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Roll Number: <strong 
              style={{ cursor: 'pointer', color: 'hsl(var(--accent-primary))', textDecoration: 'underline' }}
              onClick={() => onViewStudentProfile(record.roll_number)}
            >{record.roll_number}</strong> | Class: <strong>{record.student_class}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => onEdit(record.id)}
            title="Edit Case Record"
          >
            <Pencil size={16} /> Edit Case
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      {/* Screen-only display details */}
      <div className="print-only" style={{ display: 'none', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', border: '1px solid #cbd5e1', width: '25%' }}>Student Name</td>
              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{record.student_name}</td>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', border: '1px solid #cbd5e1', width: '25%' }}>Roll Number</td>
              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{record.roll_number}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>Class / Grade</td>
              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{record.student_class}</td>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>Case Status</td>
              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{record.status}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>Risk Evaluation</td>
              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{record.risk_level} (Score: {record.risk_score})</td>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>Behavioral Trend</td>
              <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{record.trend}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Details Grid */}
      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
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
              4. Student Improvement Action Plan (Interactive)
            </h3>
            {(() => {
              const plans = parseActionPlans(record.improvement_action_plans);
              if (plans.length === 0) {
                return <p style={{ fontStyle: 'italic', color: 'hsl(var(--text-muted))' }}>No action items defined.</p>;
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {plans.map((item, idx) => (
                    <label 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem', 
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: item.completed ? 'hsl(var(--text-muted))' : 'hsl(var(--text-primary))',
                        textDecoration: item.completed ? 'line-through' : 'none'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={item.completed} 
                        onChange={() => handleToggleChecklist(idx)}
                        style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                      />
                      <span>{item.text}</span>
                    </label>
                  ))}
                </div>
              );
            })()}
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
      <div className="glass-panel font-dossier-timeline" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border-color))', paddingBottom: '0.5rem' }}>
          <History size={20} style={{ color: 'hsl(var(--accent-secondary))' }} /> Case Audit Trail & Verification Logs
        </h3>

        {/* Timeline */}
        <div className="timeline">
          {audit_logs.length === 0 ? (
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>No logs registered for this record.</p>
          ) : (
            audit_logs.map(log => {
              let displayInfo = log.action;
              let displayColor = 'hsl(var(--text-muted))';

              if (log.action === 'CREATE') {
                displayInfo = 'Case created in cloud registry';
                displayColor = 'hsl(var(--accent-primary))';
              } else if (log.action === 'UPDATE') {
                displayInfo = 'Case logs updated by staff';
                displayColor = '#eab308';
              } else if (log.action === 'STATUS_CHANGE') {
                try {
                  const nextVal = JSON.parse(log.new_values);
                  displayInfo = `Status transitioned to: ${nextVal.status}`;
                  displayColor = '#10b981';
                } catch (e) {
                  displayInfo = `Status transitioned`;
                }
              } else if (log.action === 'MANUAL_NOTE') {
                displayInfo = 'Staff annotation remark';
                displayColor = '#a855f7';
              } else if (log.action === 'CHECKLIST_UPDATE') {
                displayInfo = 'Action checklist updated';
                displayColor = '#06b6d4';
              }

              return (
                <div key={log.id} className="timeline-item" style={{ borderLeft: `2px solid ${displayColor}`, paddingLeft: '1rem', paddingBottom: '1rem', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-5px',
                    top: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: displayColor
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: displayColor }}>
                      {displayInfo}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.action === 'MANUAL_NOTE' && (
                    <p style={{ fontSize: '0.9rem', marginTop: '0.25rem', color: 'hsl(var(--text-primary))', fontStyle: 'italic' }}>
                      "{log.new_values}"
                    </p>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.2rem' }}>
                    Authorized Operator: <strong>{log.changed_by}</strong>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add manual remark form */}
        <form onSubmit={handleAddRemark} style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }} className="no-print">
          <div style={{ flex: 1 }} className="input-with-icon">
            <MessageSquareCode className="input-icon" size={18} />
            <input
              type="text"
              placeholder="Add official annotation / verification remark..."
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              disabled={isSubmittingRemark}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmittingRemark}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Send size={14} /> Send Note
          </button>
        </form>
      </div>
    </>
  );
};

export default DetailView;
