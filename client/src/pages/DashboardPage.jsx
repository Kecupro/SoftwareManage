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
        totalTasks: 0,
        completedTasks: 0,
        totalBugs: 0,
        resolvedBugs: 0,
        currentSprint: null,
        recentActivities: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/dashboard/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Fallback data for demo
                setStats({
                    totalProjects: 12,
                    activeProjects: 8,
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
                    recentActivities: [
                        { id: 1, type: 'task', message: 'Task "Implement login feature" completed', time: '2 hours ago' },
                        { id: 2, type: 'bug', message: 'Bug "Payment not working" reported', time: '4 hours ago' },
                        { id: 3, type: 'sprint', message: 'Sprint 3 started', time: '1 day ago' },
                        { id: 4, type: 'project', message: 'New project "E-commerce Platform" created', time: '2 days ago' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusColor = (type) => {
        const colors = {
            task: 'bg-green-100 text-green-800',
            bug: 'bg-red-100 text-red-800',
            sprint: 'bg-blue-100 text-blue-800',
            project: 'bg-purple-100 text-purple-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (type) => {
        const icons = {
            task: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            bug: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
            sprint: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            project: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        };
        return icons[type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    };

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

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Hoạt động gần đây
                    </h3>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {stats.recentActivities.map((activity, activityIdx) => (
                                <li key={activity.id}>
                                    <div className="relative pb-8">
                                        {activityIdx !== stats.recentActivities.length - 1 ? (
                                            <span
                                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(activity.type)}`}>
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(activity.type)} />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">{activity.message}</p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time>{activity.time}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}