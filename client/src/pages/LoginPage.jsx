// client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    useEffect(() => {
        // Hiệu ứng fade-in khi component mount
        setIsVisible(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
            {/* Left: Logo, hotline, illustration, background image */}
            <div 
                className={`md:w-1/2 relative flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200 transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
                style={{backgroundImage: 'url(/banner.svg)', backgroundSize: 'cover', backgroundPosition: 'center'}}
            >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-[#d80027]/70 md:bg-[#d80027]/60 transition-all duration-500" style={{zIndex: 1}}></div>
                <div className="relative z-10 flex flex-col items-center w-full animate-fade-in-up">
                    <img 
                        src="/viettelsol.png" 
                        alt="Logo" 
                        className="w-40 mb-4 drop-shadow-lg bg-white rounded-full p-2 animate-bounce-slow hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="text-3xl font-bold text-white mb-2 animate-slide-in-left">Hệ thống phát triển phần mềm</div>
                    <div className="text-gray-100 text-lg mb-4 animate-slide-in-right">Cùng bạn đồng hành, cùng nhau phát triển.</div>
                    <img 
                        src="https://img.freepik.com/free-vector/customer-support-flat-illustration_23-2148887720.jpg?w=400" 
                        alt="Hotline" 
                        className="w-56 h-40 object-contain mb-4 rounded-lg shadow-lg border-4 border-white animate-fade-in-up hover:shadow-2xl transition-all duration-300" 
                    />
                    <div className="text-gray-100 text-sm flex flex-col items-center mt-2 animate-fade-in">
                        <span className="font-semibold">Tổng đài CSKH: 18008000 nhánh 1</span>
                    </div>
                </div>
            </div>
            
            {/* Right: Login Form */}
            <div 
                className={`md:w-1/2 flex flex-col justify-center items-center p-8 bg-white transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            >
                <div className="w-full max-w-md animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-[#d80027] text-center mb-2 uppercase animate-slide-in-down">Đăng nhập</h2>
                    <div className="text-center text-gray-700 mb-6 text-base font-semibold animate-slide-in-up">
                        Vui lòng đăng nhập để tiếp tục sử dụng hệ thống
                    </div>
                    <form className="space-y-4 animate-fade-in-up" onSubmit={handleSubmit}>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-[#d80027]">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12A4 4 0 118 12a4 4 0 018 0zM12 14v2m0 4h.01" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400"
                                placeholder="Tên đăng nhập"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-[#d80027]">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm animate-shake border border-red-200">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-[#d80027] to-[#b3001b] text-white font-semibold hover:from-[#b3001b] hover:to-[#8a0015] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="mr-2">🔐</span>
                            )}
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                        <div className="flex items-center justify-between mt-4 animate-fade-in">
                            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-[#d80027] transition-colors duration-200 hover:underline">Quên mật khẩu?</Link>
                            <Link to="/register" className="text-sm text-[#d80027] hover:underline font-semibold transition-all duration-200 hover:scale-105">Đăng ký tài khoản</Link>
                        </div>
                    </form>
                    {/* Demo Account Info */}
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 animate-fade-in-up">
                        <h3 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                            <span className="mr-2">💡</span>
                            Tài khoản demo
                        </h3>
                        <div className="text-xs text-red-700 space-y-1">
                            <p><strong>Email:</strong> admin@example.com</p>
                            <p><strong>Password:</strong> admin123</p>
                        </div>
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-700 animate-fade-in">
                        Bạn là đối tác?{' '}
                        <Link
                            to="/partner/login"
                            className="text-[#d80027] hover:underline font-semibold transition-all duration-200 hover:scale-105"
                        >
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}