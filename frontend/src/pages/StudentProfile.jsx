import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  Clock,
  History,
  FileText
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:5000/api'
  : '/api';

const StudentProfile = ({ rollNumber, onBack, onViewCase }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${API_BASE}/students/${rollNumber}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Student profile not found.');
          }
          throw new Error('Failed to load student profile.');
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (rollNumber) {
      fetchProfile();
    }
  }, [rollNumber]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMsg || !data) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <Breadcrumbs paths={[{ label: 'Dashboard', onClick: onBack }, { label: 'Student Profile' }]} />
        <div className="alert-banner error" style={{ marginTop: '1rem' }}>
          {errorMsg || 'Failed to load profile data.'}
        </div>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { student, stats, records, audit_logs } = data;

  // Prepare chart data (chronological sequence of risk scores)
  const chartData = [...records]
    .reverse()
    .map(r => ({
      date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Risk Score': r.risk_score,
      'Status': r.status
    }));

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <Breadcrumbs paths={[{ label: 'Dashboard', onClick: onBack }, { label: `Profile: ${student.student_name}` }]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={32} style={{ color: 'hsl(var(--accent-primary))' }} /> {student.student_name}
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
            Roll Number: <strong>{student.roll_number}</strong> | Class: <strong>{student.student_class}</strong>
          </p>
        </div>
        <button onClick={onBack} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-label">Total Registered Cases</div>
          <div className="stat-value">{stats.totalCases}</div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-label">Active / Completed</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ color: 'hsl(var(--accent-primary))' }}>{stats.activeCases}</span>
            <span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))' }}>/</span>
            <span style={{ color: '#10b981' }}>{stats.completedCases}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-label">Action Items Progress</div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ color: '#10b981' }}>{stats.completedActionItemsCount}</span>
            <span style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))' }}>/</span>
            <span style={{ color: 'hsl(var(--text-muted))' }}>{stats.totalActionItemsCount}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-label">Current Risk Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className={`badge badge-risk-${student.current_risk_level.toLowerCase()}`}>
              {student.current_risk_level}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>
              (Score: {student.current_risk_score})
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard layout split */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }} className="grid-split">
        {/* Left Side: Risk progression and active cases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Chart Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'hsl(var(--accent-primary))' }} /> Risk Score Progression
            </h3>
            <div style={{ width: '100%', height: 260 }}>
              {chartData.length <= 1 ? (
                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'hsl(var(--text-muted))' }}>
                  Insufficient case history to plot progression trend.
                </div>
              ) : (
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="hsl(var(--text-muted))" fontSize={11} />
                    <YAxis stroke="hsl(var(--text-muted))" fontSize={11} domain={[0, 'dataMax + 4']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background-card))',
                        border: '1px solid hsl(var(--border-color))',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'hsl(var(--text-muted))', fontSize: 12 }}
                      itemStyle={{ color: 'hsl(var(--text-primary))', fontSize: 13 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Risk Score" 
                      stroke="hsl(var(--accent-primary))" 
                      strokeWidth={3}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cases history list */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'hsl(var(--accent-primary))' }} /> Case History ({records.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {records.map(record => (
                <div 
                  key={record.id} 
                  className="list-item" 
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => onViewCase(record.id)}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'hsl(var(--accent-primary))'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border-color))'}
                >
                  <div style={{ flex: 1, marginRight: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1rem' }}>Case #{record.id}</span>
                      <span className={`badge badge-status-${record.status.toLowerCase()}`}>{record.status}</span>
                      <span className={`badge badge-risk-${record.risk_level.toLowerCase()}`}>{record.risk_level}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {record.misconduct_incidents}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                    View details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Consolidated Audit logs/Remarks Timeline */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} style={{ color: 'hsl(var(--accent-primary))' }} /> Activity Remarks Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {audit_logs.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '2rem' }}>No activity logged yet.</p>
            ) : (
              audit_logs.map(log => {
                let displayInfo = log.action;
                let displayColor = 'hsl(var(--text-muted))';

                if (log.action === 'CREATE') {
                  displayInfo = 'Case initialized';
                  displayColor = 'hsl(var(--accent-primary))';
                } else if (log.action === 'UPDATE') {
                  displayInfo = 'Case details updated';
                  displayColor = '#eab308';
                } else if (log.action === 'STATUS_CHANGE') {
                  try {
                    const nextVal = JSON.parse(log.new_values);
                    displayInfo = `Status changed to: ${nextVal.status}`;
                    displayColor = '#10b981';
                  } catch (e) {
                    displayInfo = `Status changed`;
                  }
                } else if (log.action === 'MANUAL_NOTE') {
                  displayInfo = 'Remark added';
                  displayColor = '#a855f7';
                } else if (log.action === 'CHECKLIST_UPDATE') {
                  displayInfo = 'Action checklist updated';
                  displayColor = '#06b6d4';
                }

                return (
                  <div key={log.id} style={{ borderLeft: `2px solid ${displayColor}`, paddingLeft: '1rem', position: 'relative' }}>
                    <div 
                      style={{
                        position: 'absolute',
                        left: '-5px',
                        top: '4px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: displayColor
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: displayColor }}>
                        {displayInfo}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {log.action === 'MANUAL_NOTE' && (
                      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'hsl(var(--text-primary))', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.01)', padding: '0.5rem', borderRadius: '4px', border: '1px dashed hsl(var(--border-color))' }}>
                        "{log.new_values}"
                      </p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                      By: <strong>{log.changed_by}</strong> | Case #{log.record_id}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
