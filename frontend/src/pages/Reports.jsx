import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { FileDown, Calendar, AlertCircle } from 'lucide-react';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:5000/api'
  : '/api';

const Reports = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Date range filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReportsData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let url = `${API_BASE}/reports/summary`;
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load reports summary.');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [startDate, endDate]);

  const handleExportCSV = async () => {
    try {
      // Fetch all records without page limit for full export
      const res = await fetch(`${API_BASE}/student_disciplinary_record_counsel?limit=5000`);
      if (!res.ok) throw new Error('Failed to retrieve data for export.');
      const result = await res.json();
      const records = result.records || [];

      if (records.length === 0) {
        alert('No records available to export.');
        return;
      }

      // Build CSV file string
      const headers = [
        'ID',
        'Student Name',
        'Roll Number',
        'Class/Grade',
        'Misconduct Incidents',
        'Counselling Sessions',
        'Parent Meetings',
        'Improvement Action Plans',
        'Status',
        'Risk Score',
        'Risk Level',
        'Trend',
        'Date Created',
        'Last Updated'
      ];

      const csvRows = [
        headers.join(','), // headers row
        ...records.map(r => {
          return [
            r.id,
            `"${(r.student_name || '').replace(/"/g, '""')}"`,
            `"${(r.roll_number || '').replace(/"/g, '""')}"`,
            `"${(r.student_class || '').replace(/"/g, '""')}"`,
            `"${(r.misconduct_incidents || '').replace(/"/g, '""')}"`,
            `"${(r.counselling_sessions || '').replace(/"/g, '""')}"`,
            `"${(r.parent_meetings || '').replace(/"/g, '""')}"`,
            `"${(r.improvement_action_plans || '').replace(/"/g, '""')}"`,
            r.status,
            r.risk_score,
            r.risk_level,
            r.trend,
            r.created_at,
            r.updated_at
          ].join(',');
        })
      ].join('\n');

      // Create blob download link
      const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `disciplinary_records_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (isLoading && !data) return <LoadingSpinner />;

  // Format Recharts data structures
  const statusChartData = data?.statusCounts?.map(item => ({
    name: item.status,
    Count: item.count
  })) || [];

  const riskChartData = ['Low', 'Medium', 'High', 'Critical'].map(level => {
    const found = data?.riskLevelCounts?.find(item => item.risk_level === level);
    return {
      name: level,
      Count: found ? found.count : 0
    };
  });

  const timelineChartData = data?.timeSeries?.map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    'Total Cases': item.total || 0,
    'Severe Risk': item.severe_incidents || 0,
    'Counsellings Logged': item.counselling_sessions_count || 0
  })) || [];

  return (
    <>
      {/* Reports Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Breadcrumbs items={[{ label: 'Cases', hash: 'dashboard' }, { label: 'Reports & Analytics' }]} />
          <h1 style={{ fontSize: '2rem', marginTop: '0.5rem' }} className="title-gradient">Reports & Analytics</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Interactive charts, behavioral trends, status splits, and full data export capabilities.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleExportCSV}>
          <FileDown size={16} /> Export CSV Spreadsheet
        </button>
      </div>

      {/* Analytics Control Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} style={{ color: 'hsl(var(--accent-primary))' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Filter Date Range:</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>From</span>
            <input
              type="date"
              className="form-input"
              style={{ width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>To</span>
            <input
              type="date"
              className="form-input"
              style={{ width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(startDate || endDate) && (
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="glass-panel" style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderLeft: '4px solid hsl(0 85% 50%)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)'
        }}>
          <AlertCircle size={20} style={{ color: 'hsl(0 85% 50%)', flexShrink: 0 }} />
          <span style={{ color: 'hsl(0 85% 75%)', fontSize: '0.9rem' }}>{errorMsg}</span>
        </div>
      )}

      {/* Grid containing Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Chart 1: Status Distribution */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Case Status Distribution
          </h3>
          <div style={{ flexGrow: 1, width: '100%', height: '250px' }}>
            {statusChartData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>No status data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="hsl(var(--text-secondary))" fontSize={11} />
                  <YAxis stroke="hsl(var(--text-secondary))" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--bg-secondary))', borderColor: 'hsl(var(--border-color))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--text-primary))', fontWeight: '600' }}
                  />
                  <Bar dataKey="Count" fill="hsl(var(--accent-primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Student Risk Profile */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Disciplinary Risk Profile Counts
          </h3>
          <div style={{ flexGrow: 1, width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="hsl(var(--text-secondary))" fontSize={11} />
                <YAxis stroke="hsl(var(--text-secondary))" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--bg-secondary))', borderColor: 'hsl(var(--border-color))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--text-primary))', fontWeight: '600' }}
                />
                <Bar 
                  dataKey="Count" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40} 
                  fill="hsl(var(--accent-secondary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Timeline Series (Full Width Span) */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '380px', display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Disciplinary Activity & Incidents Logged (30-day Time Series)
          </h3>
          <div style={{ flexGrow: 1, width: '100%', height: '280px' }}>
            {timelineChartData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>No time series data registered.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="hsl(var(--text-secondary))" fontSize={11} />
                  <YAxis stroke="hsl(var(--text-secondary))" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--bg-secondary))', borderColor: 'hsl(var(--border-color))', borderRadius: '8px' }}
                    labelStyle={{ color: 'hsl(var(--text-primary))', fontWeight: '600' }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
                  <Line type="monotone" dataKey="Total Cases" stroke="hsl(var(--accent-primary))" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Severe Risk" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Counsellings Logged" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Reports;
