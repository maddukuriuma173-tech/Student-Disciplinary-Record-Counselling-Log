import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import EntryForm from './pages/EntryForm';
import DetailView from './pages/DetailView';
import Reports from './pages/Reports';
import StudentProfile from './pages/StudentProfile';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  // Navigation states: 'dashboard', 'new', 'reports', 'detail', 'edit', 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRollNumber, setSelectedRollNumber] = useState(null);
  
  // Theme state
  const [theme, setTheme] = useState('dark');

  // Authentication states
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  // Initialize theme, mock users, and check session
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    // 1. Initialize Mock Users if they don't exist yet
    const existingUsers = localStorage.getItem('horizon_users');
    if (!existingUsers) {
      const demoUsers = [
        { username: 'admin', email: 'admin@horizon.com', password: 'password123', totalLogins: 0 },
        { username: 'john_doe', email: 'john@horizon.com', password: 'securePass99', totalLogins: 0 }
      ];
      localStorage.setItem('horizon_users', JSON.stringify(demoUsers));
    }

    // 2. Check Session
    const persistentSession = localStorage.getItem('horizon_session');
    const temporarySession = sessionStorage.getItem('horizon_session');
    
    if (persistentSession) {
      setUser(JSON.parse(persistentSession));
    } else if (temporarySession) {
      setUser(JSON.parse(temporarySession));
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
    setSelectedRollNumber(null);
  };

  const handleEdit = (id) => {
    setSelectedRecordId(id);
    setSelectedRollNumber(null);
    setActiveTab('edit');
  };

  const handleViewDetails = (id) => {
    setSelectedRecordId(id);
    setSelectedRollNumber(null);
    setActiveTab('detail');
  };

  const handleViewStudentProfile = (rollNumber) => {
    setSelectedRollNumber(rollNumber);
    setSelectedRecordId(null);
    setActiveTab('profile');
  };

  const handleSaveSuccess = (id) => {
    setSelectedRecordId(id);
    setSelectedRollNumber(null);
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
            onViewStudentProfile={handleViewStudentProfile}
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
            onViewStudentProfile={handleViewStudentProfile}
          />
        );
      case 'profile':
        return (
          <StudentProfile
            rollNumber={selectedRollNumber}
            onBack={handleBackToDashboard}
            onViewCase={handleViewDetails}
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
            onViewStudentProfile={handleViewStudentProfile}
          />
        );
    }
  };

  // Auth gateway check
  if (!user) {
    return authView === 'login' ? (
      <Login 
        onLoginSuccess={(session) => setUser(session)} 
        onToggleRegister={() => setAuthView('register')} 
      />
    ) : (
      <Register 
        onToggleLogin={() => setAuthView('login')} 
      />
    );
  }

  return (
    <div className="app-container no-print">
      <Navigation
        user={user}
        onLogout={() => {
          localStorage.removeItem('horizon_session');
          sessionStorage.removeItem('horizon_session');
          setUser(null);
          setAuthView('login');
          setActiveTab('dashboard');
        }}
        activeTab={activeTab === 'edit' || activeTab === 'detail' || activeTab === 'profile' ? 'dashboard' : activeTab}
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
