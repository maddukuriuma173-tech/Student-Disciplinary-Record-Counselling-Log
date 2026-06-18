import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ShieldAlert,
  FolderLock,
  UserCheck,
  Briefcase
} from 'lucide-react';

const API_BASE = window.location.origin.includes('localhost:5173')
  ? 'http://localhost:5000/api'
  : '/api';

const Dashboard = ({ onAddNew, onEdit, onViewDetails }) => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeCount: 0,
    completedCount: 0,
    archivedCount: 0,
    criticalRiskCount: 0,
    highRiskCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Active, Completed, Archived
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  
  const limit = 10; // Number of items per page

  // Fetch metrics & records
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch dashboard metrics
      const statsRes = await fetch(`${API_BASE}/dashboard/summary`);
      if (!statsRes.ok) throw new Error('Failed to load summary stats.');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch paginated records
      const queryStatus = activeTab === 'All' ? '' : activeTab;
      const res = await fetch(
        `${API_BASE}/student_disciplinary_record_counsel?page=${currentPage}&limit=${limit}&status=${queryStatus}&search=${search}`
      );
      if (!res.ok) throw new Error('Failed to load disciplinary records.');
      const recordsData = await res.json();
      
      setRecords(recordsData.records || []);
      setTotalPages(recordsData.pagination.totalPages || 1);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, search]);

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/student_disciplinary_record_counsel/${recordId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Status transition invalid.');
        return;
      }
      
      // Reload page and stats
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const renderRiskBadge = (level, score) => {
    let className = 'badge-risk-low';
    if (level === 'Medium') className = 'badge-risk-medium';
    else if (level === 'High') className = 'badge-risk-high';
    else if (level === 'Critical') className = 'badge-risk-critical';

    return (
      <span className={`badge ${className}`} style={{ gap: '0.25rem' }}>
        {level} ({score})
      </span>
    );
  };

  const renderTrendIcon = (trend) => {
    if (trend === 'Improving') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: '600' }}>
          <TrendingUp size={16} /> Improving
        </span>
      );
    }
    if (trend === 'Worsening') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontWeight: '600' }}>
          <TrendingDown size={16} /> Worsening
        </span>
      );
    }
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontWeight: '600' }}>
        <Minus size={16} /> Stable
      </span>
    );
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset page on new search
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page on tab change
  };

  return (
    <>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem' }} className="title-gradient">Disciplinary Dashboard</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sri Gowthami Educational Institutions — Student Disciplinary Record & Counselling Logs.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddNew}>
          <Plus size={16} /> Add Disciplinary Case
        </button>
      </div>

      {/* Widget Cards Grid */}
      <div className="widget-grid">
        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'hsl(var(--accent-primary))' }}>
            <Briefcase size={20} />
          </div>
          <div className="widget-info">
            <span className="widget-value">{stats.totalRecords}</span>
            <span className="widget-label">Total Cases</span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <UserCheck size={20} />
          </div>
          <div className="widget-info">
            <span className="widget-value">{stats.activeCount}</span>
            <span className="widget-label">Active Cases</span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <ShieldAlert size={20} />
          </div>
          <div className="widget-info">
            <span className="widget-value">{stats.criticalRiskCount + stats.highRiskCount}</span>
            <span className="widget-label">High/Critical Risk</span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <FolderLock size={20} />
          </div>
          <div className="widget-info">
            <span className="widget-value">{stats.completedCount}</span>
            <span className="widget-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Control Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Tabs Filters */}
          <div className="tabs-container" style={{ borderBottom: 'none' }}>
            {['All', 'Active', 'Completed', 'Archived'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab} Cases
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'hsl(var(--text-muted))'
            }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem', height: '40px' }}
              placeholder="Search Student, Roll, or Class..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

        </div>

        {/* Data Grid Canvas */}
        {isLoading ? (
          <LoadingSpinner />
        ) : errorMsg ? (
          <div style={{ color: 'hsl(0 85% 65%)', textAlign: 'center', padding: '2rem' }}>
            Error fetching data: {errorMsg}
          </div>
        ) : records.length === 0 ? (
          <EmptyState 
            title={search ? 'No search results found' : 'No records listed'}
            description={search ? `We couldn't find any disciplinary cases matching "${search}".` : `There are currently no cases categorized under ${activeTab}.`}
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Risk Level</th>
                  <th>Behavior Trend</th>
                  <th>Status</th>
                  <th>Next Action Recommendation</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{record.student_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginTop: '0.15rem' }}>
                          <span style={{ fontWeight: '600' }}>ID:</span> {record.roll_number} | <span style={{ fontWeight: '600' }}>Class:</span> {record.student_class}
                        </div>
                      </div>
                    </td>
                    <td>{renderRiskBadge(record.risk_level, record.risk_score)}</td>
                    <td>{renderTrendIcon(record.trend)}</td>
                    <td>
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(record.id, e.target.value)}
                        className="form-select"
                        style={{
                          padding: '0.25rem 0.5rem',
                          width: '125px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          backgroundColor: record.status === 'Active' 
                            ? 'rgba(59, 130, 246, 0.1)' 
                            : record.status === 'Completed' 
                              ? 'rgba(16, 185, 129, 0.1)' 
                              : 'rgba(107, 114, 128, 0.1)',
                          borderColor: record.status === 'Active' 
                            ? '#3b82f6' 
                            : record.status === 'Completed' 
                              ? '#10b981' 
                              : '#6b7280',
                          color: record.status === 'Active' 
                            ? '#60a5fa' 
                            : record.status === 'Completed' 
                              ? '#34d399' 
                              : '#9ca3af'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', maxWidth: '300px' }}>
                      {record.next_recommended_action}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: '6px' }}
                          title="View Detail Case Report"
                          onClick={() => onViewDetails(record.id)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem', borderRadius: '6px' }}
                          title="Edit Case Record"
                          onClick={() => onEdit(record.id)}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
