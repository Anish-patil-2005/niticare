/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, check if we have a user saved in the browser
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  // This function is called after a successful API login
  const handleLogin = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, handleLogin, handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook so we can easily use auth in any component
export const useAuth = () => useContext(AuthContext);