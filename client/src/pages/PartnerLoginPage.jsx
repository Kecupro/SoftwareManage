import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function PartnerLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Hiệu ứng fade-in khi component mount
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      setLoading(true);
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'partner') {
          showSuccess('Đăng nhập thành công! Chào mừng đến Portal Đối Tác');
          navigate('truytruy/partner/portal');
        } else {
          showError('Tài khoản này không có quyền truy cập Portal Đối Tác');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        showError(result.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left: Logo, hotline, illustration, background image */}
      <div 
        className={`md:w-1/2 relative flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        style={{backgroundImage: 'url(/breadcrum-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-blue-900/60 transition-all duration-500" style={{zIndex: 1}}></div>
        <div className="relative z-10 flex flex-col items-center w-full animate-fade-in-up">
          <img 
            src="/viettelsol.png" 
            alt="Logo" 
            className="w-40 mb-4 drop-shadow-lg bg-white rounded-full p-2 animate-bounce-slow hover:scale-110 transition-transform duration-300" 
          />
          <div className="text-3xl font-bold text-white mb-2 animate-slide-in-left">Portal Đối Tác</div>
          <div className="text-indigo-100 text-lg mb-4 animate-slide-in-right">Kết nối & hợp tác phát triển dự án</div>
          <img 
            src="https://img.freepik.com/free-vector/customer-support-flat-illustration_23-2148887720.jpg?w=400" 
            alt="Hotline" 
            className="w-56 h-40 object-contain mb-4 rounded-lg shadow-lg border-4 border-white animate-fade-in-up hover:shadow-2xl transition-all duration-300" 
          />
          <div className="text-indigo-100 text-sm flex flex-col items-center mt-2 animate-fade-in">
            <span className="font-semibold">Hỗ trợ: 18008000 nhánh 2</span>
          </div>
        </div>
      </div>
      
      {/* Right: Login Form */}
      <div 
        className={`md:w-1/2 flex flex-col justify-center items-center p-8 bg-white transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        <div className="w-full max-w-md animate-fade-in-up">
          <h2 className="text-2xl font-bold text-indigo-700 text-center mb-2 uppercase animate-slide-in-down">Đăng nhập Đối tác</h2>
          <div className="text-center text-gray-700 mb-6 text-base font-semibold animate-slide-in-up">
            Đăng nhập để truy cập hệ thống quản lý dự án dành cho đối tác
          </div>
          <form className="space-y-4 animate-fade-in-up" onSubmit={handleSubmit}>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12A4 4 0 118 12a4 4 0 018 0zM12 14v2m0 4h.01" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-200 hover:border-gray-400"
                placeholder="Email"
              />
            </div>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600">
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all duration-200 hover:border-gray-400"
                placeholder="Mật khẩu"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="mr-2">🔒</span>
              )}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <div className="flex items-center justify-between mt-4 animate-fade-in">
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200 hover:underline">Quên mật khẩu?</Link>
              <Link to="/partner/register" className="text-sm text-indigo-600 hover:underline font-semibold transition-all duration-200 hover:scale-105">Đăng ký đối tác</Link>
            </div>
          </form>
          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200 animate-fade-in-up">
            <h3 className="text-sm font-medium text-indigo-900 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Tài khoản demo
            </h3>
            <div className="text-xs text-indigo-700 space-y-1">
              <p><strong>Email:</strong> partner1@example.com</p>
              <p><strong>Password:</strong> partner123</p>
            </div>
          </div>
          {/* Links */}
          <div className="mt-8 text-center text-sm text-gray-700 animate-fade-in">
            Bạn là nhân viên nội bộ?{' '}
            <Link
              to="/login"
              className="text-indigo-600 hover:underline font-semibold transition-all duration-200 hover:scale-105"
            >
              Đăng nhập tại đây
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 