import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EditAssistant from './components/EditAssistant';
import ReportView from './components/ReportView';
import { UserSession } from './types';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YmEyNDIyMC0wMjk2LTQ4MGItYjMxYS05OTA1YjUzMGM4OGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ3NjU2NDgyfQ.OZ2qUFBOeXXyBGKA4WiyJseeK-OCezdkr7t3Kh05zE';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'admin' | 'edit' | 'report'>('login');
  const [user, setUser] = useState<UserSession | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session from localStorage on app load
    const session = localStorage.getItem('adminSession');
    if (session) {
      const parsedSession = JSON.parse(session);
      if (parsedSession.expires > Date.now()) {
        setUser(parsedSession.user);
        setCurrentView('admin');
      } else {
        // Clear expired session
        localStorage.removeItem('adminSession');
      }
    }
  }, []);

  const handleLogin = (userData: UserSession) => {
    const sessionData = {
      user: userData,
      expires: Date.now() + 86400000 // 24 hours
    };
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
    setUser(userData);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setUser(null);
    setCurrentView('login');
  };

  const handleEditAssistant = (id: string) => {
    setEditId(id);
    setCurrentView('edit');
  };

  const handleViewReport = (id: string) => {
    setReportId(id);
    setCurrentView('report');
  };

  const handleBackToAdmin = () => {
    setCurrentView('admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} apiToken={API_TOKEN} />
      )}
      
      {currentView === 'admin' && user && (
        <AdminDashboard 
          user={user} 
          onLogout={handleLogout} 
          onEdit={handleEditAssistant}
          onViewReport={handleViewReport}
          apiToken={API_TOKEN}
        />
      )}
      
      {currentView === 'edit' && editId && (
        <EditAssistant 
          assistantId={editId} 
          onBack={handleBackToAdmin}
          apiToken={API_TOKEN}
        />
      )}
      
      {currentView === 'report' && reportId && (
        <ReportView 
          assistantId={reportId} 
          onBack={handleBackToAdmin}
          apiToken={API_TOKEN}
        />
      )}
    </div>
  );
}

export default App;