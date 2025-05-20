import React, { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EditAssistant from './components/EditAssistant';
import { UserSession } from './types';

const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YmEyNDIyMC0wMjk2LTQ4MGItYjMxYS05OTA1YjUzMGM4OGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ3NjU2NDgyfQ.OZ2qUFBOeXXyBGKA4WiyJseeK-OCezdkr7t3Kh05zE';

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'edit'>('login');
  const [user, setUser] = useState<UserSession | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize session from localStorage on app load
    const session = localStorage.getItem('adminSession');
    if (session) {
      const parsedSession = JSON.parse(session);
      if (parsedSession.expires > Date.now()) {
        setUser(parsedSession.user);
        setCurrentView('dashboard');
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
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setUser(null);
    setCurrentView('login');
  };

  const handleEditAssistant = (id: string) => {
    setAssistantId(id);
    setCurrentView('edit');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} apiToken={API_TOKEN} />
      )}
      
      {currentView === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onEditAssistant={handleEditAssistant}
          apiToken={API_TOKEN}
        />
      )}
      
      {currentView === 'edit' && assistantId && (
        <EditAssistant 
          assistantId={assistantId} 
          onBack={handleBackToDashboard}
          apiToken={API_TOKEN}
        />
      )}
    </div>
  );
}

export default App;