import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const { showSuccess, showError } = useNotifications();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        department: '',
        position: '',
        experience: 0,
        gitUsername: '',
        avatar: '' // Thêm trường avatar
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.profile?.phone || '',
                department: user.profile?.department || '',
                position: user.profile?.position || '',
                experience: user.profile?.experience || 0,
                gitUsername: user.profile?.gitUsername || '',
                avatar: user.profile?.avatar || ''
            });
            setAvatarPreview(user.profile?.avatar || '');
        }
    }, [user]);

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



    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Họ tên là bắt buộc';
        }
        
        if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        
        if (formData.experience < 0) {
            newErrors.experience = 'Số năm kinh nghiệm không thể âm';
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
        
        let avatarUrl = formData.avatar;
        try {
            // Nếu có chọn ảnh mới thì upload trước
            if (avatarFile) {
                const data = new FormData();
                data.append('avatar', avatarFile);
                const token = localStorage.getItem('token');
                const res = await fetch('/api/users/upload-avatar', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: data
                });
                const result = await res.json();
                if (result.success && result.avatar) {
                    avatarUrl = result.avatar;
                } else {
                    showError(result.message || 'Upload ảnh thất bại');
                    setLoading(false);
                    return;
                }
            }
            const result = await updateProfile({
                fullName: formData.fullName,
                profile: {
                    phone: formData.phone,
                    department: formData.department,
                    position: formData.position,
                    experience: formData.experience,
                    gitUsername: formData.gitUsername,
                    avatar: avatarUrl
                }
            });
            
            if (result.success) {
                showSuccess('Cập nhật thông tin thành công!');
                setIsEditing(false);
                setAvatarFile(null);
            } else {
                showError(result.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        const roleLabels = {
            'dev': 'Lập trình viên (Developer)',
            'qa': 'Kiểm thử (QA)',
            'ba': 'Phân tích nghiệp vụ (BA)',
            'po': 'Product Owner (PO)',
            'pm': 'Quản lý dự án (PM)',
            'devops': 'DevOps',
            'admin': 'Quản trị viên (Admin)',
            'partner': 'Đối tác (Partner)'
        };
        return roleLabels[role] || role;
    };

    // Helper to get full avatar URL cho local và production
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const getAvatarUrl = (avatar) => {
      if (!avatar) return '';
      if (avatar.startsWith('/uploads/')) {
        return backendUrl + avatar;
      }
      return avatar;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d80027] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg border border-white/50 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                            <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-[#d80027] text-white rounded-lg hover:bg-[#b3001b] transition-colors duration-200"
                        >
                            {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-14 h-14">
                                    {avatarPreview ? (
                                        <img
                                            src={getAvatarUrl(avatarPreview)}
                                            alt="Avatar"
                                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 bg-[#d80027] rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg font-bold">
                                                {user.fullName?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {/* Status dot overlay */}
                                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer border border-gray-200 hover:bg-gray-100 transition translate-x-1/2 translate-y-1/2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                            <svg className="w-4 h-4 text-[#d80027]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h6m2 7a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h10z" />
                                            </svg>
                                        </label>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h2 className="text-lg font-semibold text-gray-900 leading-tight">{user.fullName}</h2>
                                    <p className="text-gray-600 text-sm">{getRoleLabel(user.role)}</p>
                                </div>
                            </div>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    {/* Tham gia từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')} */}
                                </div>
                            </div>
                            <div className="mt-4 space-y-3 text-left">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{user.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Username:</span>
                                    <span className="font-medium">{user.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đăng nhập cuối:</span>
                                    <span className="font-medium">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : 'Chưa có'}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <Link
                                    to="/change-password"
                                    className="w-full flex items-center justify-center px-4 py-2 bg-[#d80027] text-white rounded-lg hover:bg-[#b3001b] transition-colors duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Đổi mật khẩu
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                {isEditing ? 'Chỉnh sửa thông tin' : 'Thông tin chi tiết'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-colors duration-200 ${
                                                isEditing ? 'bg-white' : 'bg-gray-50/80'
                                            } ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-colors duration-200 ${
                                                isEditing ? 'bg-white' : 'bg-gray-50'
                                            } ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phòng ban
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-colors duration-200 ${
                                                isEditing ? 'bg-white' : 'bg-gray-50'
                                            } border-gray-300`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chức vụ
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-colors duration-200 ${
                                                isEditing ? 'bg-white' : 'bg-gray-50'
                                            } border-gray-300`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số năm kinh nghiệm
                                        </label>
                                        <input
                                            type="number"
                                            name="experience"
                                            min="0"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-colors duration-200 ${
                                                isEditing ? 'bg-white' : 'bg-gray-50'
                                            } ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Git Username
                                        </label>
                                        <input
                                            type="text"
                                            name="gitUsername"
                                            value={formData.gitUsername}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80027] focus:border-[#d80027] transition-colors duration-200 ${
                                                isEditing ? 'bg-white' : 'bg-gray-50'
                                            } border-gray-300`}
                                        />
                                    </div>
                                </div>
                                {/* Slack ID field removed */}
                                {isEditing && (
                                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 bg-[#d80027] text-white rounded-lg hover:bg-[#b3001b] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 