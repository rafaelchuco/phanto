import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTokens = localStorage.getItem('authTokens');
    
    if (storedUser && storedTokens) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      
      // Soportar ambas estructuras de respuesta del backend
      const accessToken = response.access || response.tokens?.access;
      const refreshToken = response.refresh || response.tokens?.refresh;
      
      if (!accessToken || !refreshToken) {
        throw new Error('No se recibieron tokens válidos del servidor');
      }
      
      const tokens = {
        access: accessToken,
        refresh: refreshToken,
      };

      const userData = {
        username: username,
        id: response.user?.id,
        email: response.user?.email,
      };

      localStorage.setItem('authTokens', JSON.stringify(tokens));
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password, password2, firstName, lastName) => {
    try {
      await authAPI.register({        username,
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
      });

      // Auto-login después del registro exitoso
      const loginResult = await login(username, password);
      return loginResult;
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Extraer mensajes de error más claros
      let errorMessage = error.message;
      
      if (error.message.includes('|')) {
        // Si hay múltiples errores de campo
        errorMessage = error.message.split(' | ').join('\n');
      }
      
      // Mensajes más amigables en español
      if (errorMessage.includes('email:') && errorMessage.includes('already exists')) {
        errorMessage = 'Este email ya está registrado. Intenta con otro.';
      } else if (errorMessage.includes('username:') && errorMessage.includes('already exists')) {
        errorMessage = 'Este nombre de usuario ya existe. Intenta con otro.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authTokens');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};