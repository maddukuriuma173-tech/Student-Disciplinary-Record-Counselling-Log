import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/EntryForm';
import DetailView from './pages/DetailView';
import Reports from './pages/Reports';

const App = () => {
  // Navigation states: 'dashboard', 'new', 'reports', 'record/:id', 'edit/:id'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Initialize theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleNavigate = (path) => {
    setActiveTab(path);
    setSelectedRecordId(null);
  };

  const handleEdit = (id) => {
    setSelectedRecordId(id);
    setActiveTab('edit');
  };

  const handleViewDetails = (id) => {
    setSelectedRecordId(id);
    setActiveTab('detail');
  };

  const handleSaveSuccess = (id) => {
    setSelectedRecordId(id);
    setActiveTab('detail'); // Show the detail page of the saved record
  };

  const handleBackToDashboard = () => {
    handleNavigate('dashboard');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onAddNew={() => handleNavigate('new')}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
          />
        );
      case 'new':
        return (
          <EntryForm
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleBackToDashboard}
          />
        );
      case 'edit':
        return (
          <EntryForm
            editId={selectedRecordId}
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleBackToDashboard}
          />
        );
      case 'detail':
        return (
          <DetailView
            recordId={selectedRecordId}
            onBack={handleBackToDashboard}
            onEdit={handleEdit}
          />
        );
      case 'reports':
        return <Reports />;
      default:
        return (
          <Dashboard
            onAddNew={() => handleNavigate('new')}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
          />
        );
    }
  };

  return (
    <div className="app-container no-print">
      <Navigation
        activeTab={activeTab === 'edit' || activeTab === 'detail' ? 'dashboard' : activeTab}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      <main className="main-content">
        {renderActivePage()}
      </main>
    </div>
  );
};

export default App;
