import React, { useState, useEffect, useCallback, useRef } from 'react';
import Login from './components/auth/Login';
import Dashboard from './components/layout/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  // Auto-logout time in milliseconds (15 minutes)
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      handleLogout();
      alert('You have been logged out due to inactivity.');
    }, INACTIVITY_TIMEOUT);
  }, [handleLogout, INACTIVITY_TIMEOUT]);

  // Check if user is already logged in (only from sessionStorage, not localStorage)
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Set up inactivity tracking
  useEffect(() => {
    if (user) {
      // Events that indicate user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      // Reset timer on any user activity
      events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer);
      });

      // Start the initial timer
      resetInactivityTimer();

      // Cleanup
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetInactivityTimer);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    }
  }, [user, resetInactivityTimer]);

  // Logout when tab/window is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear session when tab is closed
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    // Store in sessionStorage instead of localStorage (session-only)
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default App;
