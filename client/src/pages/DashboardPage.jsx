// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalBugs: 0,
        resolvedBugs: 0,
        currentSprint: null,
        recentProjects: [],
        myTasks: [],
        recentBugs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Tạm thời bỏ auth để test
                const response = await axios.get('/api/dashboard/overview');
                const data = response.data.data;
                setStats({
                    totalProjects: data.overview.projects.total,
                    activeProjects: data.overview.projects.active,
                    completedProjects: data.overview.projects.completed,
                    totalTasks: data.overview.tasks.total,
                    completedTasks: data.overview.tasks.completed,
                    totalBugs: data.overview.bugs.total,
                    resolvedBugs: data.overview.bugs.resolved,
                    currentSprint: data.overview.sprints && data.overview.sprints.active > 0 ? { name: `Sprint đang chạy`, progress: 0 } : null, // Có thể sửa lại nếu backend trả về sprint cụ thể
                    recentProjects: data.recentProjects || [],
                    myTasks: data.myTasks || [],
                    recentBugs: data.recentBugs || []
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Fallback data for demo
                setStats({
                    totalProjects: 12,
                    activeProjects: 8,
                    completedProjects: 4,
                    totalTasks: 156,
                    completedTasks: 89,
                    totalBugs: 23,
                    resolvedBugs: 18,
                    currentSprint: {
                        name: 'Sprint 3',
                        startDate: '2024-01-15',
                        endDate: '2024-01-28',
                        progress: 65
                    },
                    recentProjects: [
                        {
                            id: '1',
                            name: 'Hệ thống Quản lý Khách hàng',
                            status: 'active',
                            progress: 75,
                            partner: 'Công ty ABC'
                        },
                        {
                            id: '2',
                            name: 'Ứng dụng Mobile Banking',
                            status: 'active',
                            progress: 45,
                            partner: 'Ngân hàng XYZ'
                        },
                        {
                            id: '3',
                            name: 'Website Thương mại Điện tử',
                            status: 'completed',
                            progress: 100,
                            partner: 'Shop Online'
                        }
                    ],
                    myTasks: [
                        {
                            id: '1',
                            title: 'Thiết kế giao diện đăng nhập',
                            status: 'in-progress',
                            priority: 'high',
                            dueDate: '2024-01-20'
                        },
                        {
                            id: '2',
                            title: 'Tích hợp API thanh toán',
                            status: 'todo',
                            priority: 'medium',
                            dueDate: '2024-01-25'
                        },
                        {
                            id: '3',
                            title: 'Test tính năng báo cáo',
                            status: 'completed',
                            priority: 'low',
                            dueDate: '2024-01-18'
                        }
                    ],
                    recentBugs: [
                        {
                            id: '1',
                            title: 'Lỗi hiển thị trên mobile',
                            severity: 'medium',
                            status: 'open',
                            reportedBy: 'QA Team'
                        },
                        {
                            id: '2',
                            title: 'Không thể upload file lớn',
                            severity: 'high',
                            status: 'in-progress',
                            reportedBy: 'User'
                        },
                        {
                            id: '3',
                            title: 'Lỗi validation email',
                            severity: 'low',
                            status: 'resolved',
                            reportedBy: 'Developer'
                        }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Chào mừng trở lại, {user?.fullName || user?.username}!
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng dự án</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.totalProjects}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/projects" className="font-medium text-blue-700 hover:text-blue-900">
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Tasks hoàn thành</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.completedTasks}/{stats.totalTasks}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/tasks" className="font-medium text-green-700 hover:text-green-900">
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Bugs đã sửa</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.resolvedBugs}/{stats.totalBugs}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/bugs" className="font-medium text-red-700 hover:text-red-900">
                                Xem tất cả
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Sprint hiện tại</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.currentSprint?.name || 'N/A'}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/sprints" className="font-medium text-purple-700 hover:text-purple-900">
                                Xem tất cả
                        </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Sprint Progress */}
            {stats.currentSprint && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Sprint hiện tại: {stats.currentSprint.name}
                        </h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                            <p>
                                {new Date(stats.currentSprint.startDate).toLocaleDateString('vi-VN')} - 
                                {new Date(stats.currentSprint.endDate).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                                <span className="text-sm font-medium text-gray-700">{stats.currentSprint.progress}%</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${stats.currentSprint.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Projects */}
            {stats.recentProjects && stats.recentProjects.length > 0 && (
                <div className="bg-white shadow rounded-lg mt-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Dự án gần đây
                        </h3>
                        <ul>
                            {stats.recentProjects.map((project, idx) => (
                                <li key={project._id || idx} className="mb-2">
                                    <span className="font-semibold">{project.name}</span> ({project.code}) - <span className="text-sm text-gray-500">{project.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* My Tasks */}
            {stats.myTasks && stats.myTasks.length > 0 && (
                <div className="bg-white shadow rounded-lg mt-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Tasks của bạn
                        </h3>
                        <ul>
                            {stats.myTasks.map((task, idx) => (
                                <li key={task._id || idx} className="mb-2">
                                    <span className="font-semibold">{task.title}</span> - <span className="text-sm text-gray-500">{task.status}</span>
                                    {task.project && <span className="ml-2 text-xs text-blue-600">[{task.project.name}]</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* Recent Bugs */}
            {stats.recentBugs && stats.recentBugs.length > 0 && (
                <div className="bg-white shadow rounded-lg mt-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Bugs gần đây
                        </h3>
                        <ul>
                            {stats.recentBugs.map((bug, idx) => (
                                <li key={bug._id || idx} className="mb-2">
                                    <span className="font-semibold">{bug.title}</span> - <span className="text-sm text-gray-500">{bug.status}</span>
                                    {bug.project && <span className="ml-2 text-xs text-blue-600">[{bug.project.name}]</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}