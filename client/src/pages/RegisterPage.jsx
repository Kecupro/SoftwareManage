import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        role: 'dev', // default
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    
    const { register } = useAuth();
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
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên là bắt buộc';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        }
        
        if (!formData.department.trim()) {
            newErrors.department = 'Phòng ban là bắt buộc';
        }
        
        if (!formData.role.trim()) {
            newErrors.role = 'Vai trò là bắt buộc';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await register(formData);
            if (result.success) {
                showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            } else {
                showError(result.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: 'dev', label: 'Lập trình viên (Developer)' },
        { value: 'qa', label: 'Kiểm thử (QA)' },
        { value: 'ba', label: 'Phân tích nghiệp vụ (BA)' },
        { value: 'po', label: 'Product Owner (PO)' },
        { value: 'pm', label: 'Quản lý dự án (PM)' },
        { value: 'devops', label: 'DevOps' },
    ];
    const departmentOptions = [
        'Phát triển phần mềm',
        'Kiểm thử',
        'Phân tích nghiệp vụ',
        'Quản lý dự án',
        'Vận hành',
        'Khác',
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden relative">
            {/* Background Image for entire page */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/banner.svg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95"></div>
            </div>
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
                    <div className="text-3xl font-bold text-white mb-2 animate-slide-in-left">Đăng ký tài khoản</div>
                    <div className="text-gray-100 text-lg mb-4 animate-slide-in-right">Tham gia hệ thống quản lý phát triển phần mềm</div>
                    <img 
                        src="https://img.freepik.com/free-vector/customer-support-flat-illustration_23-2148887720.jpg?w=400" 
                        alt="Support" 
                        className="w-56 h-40 object-contain mb-4 rounded-lg shadow-lg border-4 border-white animate-fade-in-up hover:shadow-2xl transition-all duration-300" 
                    />
                    <div className="text-gray-100 text-sm flex flex-col items-center mt-2 animate-fade-in">
                        <span className="font-semibold">Hỗ trợ: 18008000 nhánh 1</span>
                    </div>
                </div>
            </div>
            
            {/* Right: Register Form */}
            <div 
                className={`md:w-1/2 flex flex-col justify-center items-center p-8 bg-white/80 backdrop-blur-sm transition-all duration-1000 ease-in-out transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            >
                <div className="w-full max-w-md animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-[#d80027] text-center mb-2 uppercase animate-slide-in-down">Đăng ký tài khoản</h2>
                    <div className="text-center text-gray-700 mb-6 text-base font-semibold animate-slide-in-up">
                        Vui lòng điền đầy đủ thông tin để tạo tài khoản mới
                    </div>
                    
                    <form className="space-y-4 animate-fade-in-up" onSubmit={handleSubmit}>
                        <div className="relative group">
                            <input
                                name="fullName"
                                type="text"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Họ và tên"
                                value={formData.fullName}
                                onChange={handleInputChange}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.fullName}</p>}
                        </div>
                        
                        <div className="relative group">
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.email}</p>}
                        </div>
                        
                        <div className="relative group">
                            <input
                                name="phone"
                                type="tel"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.phone}</p>}
                        </div>
                        
                        <div className="relative group">
                            <select
                                name="role"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.role}
                                onChange={handleInputChange}
                            >
                                {roleOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.role && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.role}</p>}
                        </div>
                        
                        <div className="relative group">
                            <select
                                name="department"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.department}
                                onChange={handleInputChange}
                            >
                                <option value="">Chọn phòng ban</option>
                                {departmentOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.department && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.department}</p>}
                        </div>
                        
                        <div className="relative group">
                            <input
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.password}</p>}
                        </div>
                        
                        <div className="relative group">
                            <input
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`block w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-all duration-200 hover:border-gray-400 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 animate-shake">{errors.confirmPassword}</p>}
                        </div>
                        
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
                                <span className="mr-2">📝</span>
                            )}
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-gray-700 animate-fade-in">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            className="text-[#d80027] hover:underline font-semibold transition-all duration-200 hover:scale-105"
                        >
                            Đăng nhập tại đây
                        </Link>
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-700 animate-fade-in">
                        Bạn là đối tác?{' '}
                        <Link
                            to="/partner/register"
                            className="text-[#d80027] hover:underline font-semibold transition-all duration-200 hover:scale-105"
                        >
                            Đăng ký tài khoản đối tác
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 