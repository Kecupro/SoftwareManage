import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function PartnerRegisterPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        taxCode: '',
        website: '',
        businessType: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    const { registerPartner } = useAuth();
    const { showError, showSuccess } = useNotifications();
    const navigate = useNavigate();

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
        
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Tên công ty là bắt buộc';
        }
        
        if (!formData.contactPerson.trim()) {
            newErrors.contactPerson = 'Người đại diện là bắt buộc';
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
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        }
        
        if (!formData.address.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc';
        }
        
        if (!formData.taxCode.trim()) {
            newErrors.taxCode = 'Mã số thuế là bắt buộc';
        }
        
        if (!formData.businessType.trim()) {
            newErrors.businessType = 'Loại hình kinh doanh là bắt buộc';
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
            const result = await registerPartner(formData);
            if (result.success) {
                showSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/partner/login');
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

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Left: Logo, hotline, illustration, background image */}
            <div className="md:w-1/2 relative flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-200" style={{backgroundImage: 'url(/breadcrum-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-blue-900/60" style={{zIndex: 1}}></div>
                <div className="relative z-10 flex flex-col items-center w-full">
                    <img src="/viettelsol.png" alt="Logo" className="w-40 mb-4 drop-shadow-lg bg-white rounded-full p-2" />
                    <div className="text-3xl font-bold text-white mb-2">Đăng ký Đối tác</div>
                    <div className="text-indigo-100 text-lg mb-4">Tham gia hệ thống quản lý dự án</div>
                    <img src="https://img.freepik.com/free-vector/customer-support-flat-illustration_23-2148887720.jpg?w=400" alt="Support" className="w-56 h-40 object-contain mb-4 rounded-lg shadow-lg border-4 border-white" />
                    <div className="text-indigo-100 text-sm flex flex-col items-center mt-2">
                        <span className="font-semibold">Hỗ trợ: 18008000 nhánh 2</span>
                    </div>
                </div>
            </div>
            
            {/* Right: Register Form */}
            <div className="md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-indigo-700 text-center mb-2 uppercase">Đăng ký tài khoản đối tác</h2>
                    <div className="text-center text-gray-700 mb-6 text-base font-semibold">
                        Vui lòng điền đầy đủ thông tin công ty để tạo tài khoản đối tác
                    </div>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="companyName"
                                type="text"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Tên công ty"
                                value={formData.companyName}
                                onChange={handleInputChange}
                            />
                            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="contactPerson"
                                type="text"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Người đại diện"
                                value={formData.contactPerson}
                                onChange={handleInputChange}
                            />
                            {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="phone"
                                type="tel"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="address"
                                type="text"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Địa chỉ"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="taxCode"
                                type="text"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.taxCode ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Mã số thuế"
                                value={formData.taxCode}
                                onChange={handleInputChange}
                            />
                            {errors.taxCode && <p className="text-red-500 text-sm mt-1">{errors.taxCode}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="website"
                                type="url"
                                className="block w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                                placeholder="Website (tùy chọn)"
                                value={formData.website}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div>
                            <input
                                name="businessType"
                                type="text"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Loại hình kinh doanh"
                                value={formData.businessType}
                                onChange={handleInputChange}
                            />
                            {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                        </div>
                        
                        <div>
                            <textarea
                                name="description"
                                rows="3"
                                className="block w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                                placeholder="Mô tả công ty (tùy chọn)"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div>
                            <input
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        
                        <div>
                            <input
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`block w-full px-4 py-2 border rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2 px-4 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow"
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="mr-2">🏢</span>
                            )}
                            {loading ? 'Đang đăng ký...' : 'Đăng ký đối tác'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-gray-700">
                        Đã có tài khoản đối tác?{' '}
                        <Link
                            to="/partner/login"
                            className="text-indigo-600 hover:underline font-semibold"
                        >
                            Đăng nhập tại đây
                        </Link>
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-700">
                        Bạn là nhân viên nội bộ?{' '}
                        <Link
                            to="/register"
                            className="text-indigo-600 hover:underline font-semibold"
                        >
                            Đăng ký tài khoản nhân viên
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 