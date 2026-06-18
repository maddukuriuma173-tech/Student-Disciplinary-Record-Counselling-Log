import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:5000/api'
  : '/api';

const EntryForm = ({ editId, onSaveSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    roll_number: '',
    student_class: '',
    misconduct_incidents: '',
    counselling_sessions: '',
    parent_meetings: 'N/A',
    improvement_action_plans: 'N/A'
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // If editId is provided, fetch existing record for editing
  useEffect(() => {
    if (editId) {
      const fetchRecord = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/student_disciplinary_record_counsel/${editId}`);
          if (!res.ok) throw new Error('Failed to fetch record for editing.');
          const data = await res.json();
          setFormData({
            student_name: data.student_name || '',
            roll_number: data.roll_number || '',
            student_class: data.student_class || '',
            misconduct_incidents: data.misconduct_incidents || '',
            counselling_sessions: data.counselling_sessions || '',
            parent_meetings: data.parent_meetings || 'N/A',
            improvement_action_plans: data.improvement_action_plans || 'N/A'
          });
        } catch (err) {
          setApiError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecord();
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.student_name.trim()) tempErrors.student_name = 'Student name is required.';
    if (!formData.roll_number.trim()) tempErrors.roll_number = 'Roll number is required.';
    if (!formData.student_class.trim()) tempErrors.student_class = 'Class/Grade is required.';
    
    if (!formData.misconduct_incidents.trim() || formData.misconduct_incidents.trim() === 'N/A') {
      tempErrors.misconduct_incidents = 'Please describe the student misconduct incident(s).';
    }
    
    if (!formData.counselling_sessions.trim() || formData.counselling_sessions.trim() === 'N/A') {
      tempErrors.counselling_sessions = 'Please input logs of the counselling sessions.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    const url = editId 
      ? `${API_BASE}/student_disciplinary_record_counsel/${editId}`
      : `${API_BASE}/student_disciplinary_record_counsel`;
    
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error occurred while saving record.');
      }

      onSaveSuccess(data.id || editId);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && editId) {
    return <LoadingSpinner />;
  }

  const breadcrumbItems = editId 
    ? [{ label: 'Cases', hash: 'dashboard' }, { label: 'Edit Disciplinary Case' }]
    : [{ label: 'Cases', hash: 'dashboard' }, { label: 'New Disciplinary Case' }];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Breadcrumbs items={breadcrumbItems} />
          <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }} className="title-gradient">
            {editId ? 'Edit Disciplinary Case' : 'Register Disciplinary Case'}
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Enter student misconduct details, counselling sessions, parent discussions, and improvement plans.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onCancel}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {apiError && (
        <div className="glass-panel" style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderLeft: '4px solid hsl(0 85% 50%)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)'
        }}>
          <AlertCircle size={20} style={{ color: 'hsl(0 85% 50%)', flexShrink: 0 }} />
          <span style={{ color: 'hsl(0 85% 75%)', fontSize: '0.9rem' }}>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="student_name">Student Name *</label>
            <input
              type="text"
              id="student_name"
              name="student_name"
              value={formData.student_name}
              onChange={handleChange}
              className={`form-input ${errors.student_name ? 'input-error' : ''}`}
              placeholder="e.g. John Doe"
              disabled={isLoading}
            />
            {errors.student_name && <span className="form-error-msg">{errors.student_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="roll_number">Roll Number *</label>
            <input
              type="text"
              id="roll_number"
              name="roll_number"
              value={formData.roll_number}
              onChange={handleChange}
              className={`form-input ${errors.roll_number ? 'input-error' : ''}`}
              placeholder="e.g. SG-2026-0042"
              disabled={isLoading}
            />
            {errors.roll_number && <span className="form-error-msg">{errors.roll_number}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student_class">Class / Grade *</label>
            <input
              type="text"
              id="student_class"
              name="student_class"
              value={formData.student_class}
              onChange={handleChange}
              className={`form-input ${errors.student_class ? 'input-error' : ''}`}
              placeholder="e.g. Grade 10-A"
              disabled={isLoading}
            />
            {errors.student_class && <span className="form-error-msg">{errors.student_class}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="misconduct_incidents">Student Misconduct Incidents *</label>
            <textarea
              id="misconduct_incidents"
              name="misconduct_incidents"
              value={formData.misconduct_incidents}
              onChange={handleChange}
              className={`form-textarea ${errors.misconduct_incidents ? 'input-error' : ''}`}
              placeholder="Provide a detailed list or description of the misconduct incidents. Enter N/A if none. Use bullet points or sentences."
              rows={5}
              disabled={isLoading}
            ></textarea>
            {errors.misconduct_incidents && <span className="form-error-msg">{errors.misconduct_incidents}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="counselling_sessions">Counselling Sessions *</label>
            <textarea
              id="counselling_sessions"
              name="counselling_sessions"
              value={formData.counselling_sessions}
              onChange={handleChange}
              className={`form-textarea ${errors.counselling_sessions ? 'input-error' : ''}`}
              placeholder="Detail the counselling session topics, logs, dates, and counselor notes."
              rows={5}
              disabled={isLoading}
            ></textarea>
            {errors.counselling_sessions && <span className="form-error-msg">{errors.counselling_sessions}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="parent_meetings">Parent Meetings (Optional)</label>
            <textarea
              id="parent_meetings"
              name="parent_meetings"
              value={formData.parent_meetings}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Log parent interactions, meeting minutes, and dates. Enter N/A if none."
              rows={4}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="improvement_action_plans">Improvement Action Plans (Optional)</label>
            <textarea
              id="improvement_action_plans"
              name="improvement_action_plans"
              value={formData.improvement_action_plans}
              onChange={handleChange}
              className="form-textarea"
              placeholder="State the improvement goals, deadlines, and action plans. Enter N/A if none."
              rows={4}
              disabled={isLoading}
            ></textarea>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            <Save size={16} /> {editId ? 'Save Updates' : 'Register Case'}
          </button>
        </div>
      </form>
    </>
  );
};

export default EntryForm;
