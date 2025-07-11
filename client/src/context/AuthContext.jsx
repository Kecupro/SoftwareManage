import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Thiết lập axios interceptor để tự động thêm token vào header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // TẠM THỜI: Tự động login fake user để test
  useEffect(() => {
    const autoLogin = async () => {
      try {
        console.log('🔓 Auto login fake user...');
        const response = await axios.post('/api/auth/fake-login');
        const { user: userData, token: newToken } = response.data.data;
        
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('✅ Auto login thành công:', userData.username);
      } catch (error) {
        console.error('❌ Auto login failed:', error);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ auto login nếu chưa có user
    if (!user && !token) {
      autoLogin();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { user: userData, token: newToken } = response.data.data;
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Cập nhật thất bại'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đổi mật khẩu thất bại'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasPermission: (permission) => {
      if (!user) return false;
      return user.hasPermission ? user.hasPermission(permission) : false;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 