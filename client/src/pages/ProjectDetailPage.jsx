// client/src/pages/ProjectDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import FileManager from '../components/FileManager';
import UsersPage from './UsersPage'; // Để fetch user nếu cần
import { UserIcon, BeakerIcon, CheckBadgeIcon, Cog6ToothIcon, CalendarIcon, ArrowDownTrayIcon, ExclamationTriangleIcon, FlagIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

// Helper: Tính tiến độ module dựa trên task/user story con
function calcModuleProgress(module, tasks, userStories) {
  // Ưu tiên tính theo task con nếu có
  const moduleTasks = tasks.filter(t => t.moduleId === module._id || t.module === module._id);
  if (moduleTasks.length > 0) {
    const completed = moduleTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / moduleTasks.length) * 100);
  }
  // Nếu không có task, thử theo user story
  const moduleStories = userStories.filter(us => us.moduleId === module._id || us.module === module._id);
  if (moduleStories.length > 0) {
    const completed = moduleStories.filter(us => us.status === 'completed').length;
    return Math.round((completed / moduleStories.length) * 100);
  }
  // Nếu không có gì, fallback theo trạng thái
  if (module.status === 'completed') return 100;
  if (module.status === 'in-progress') return 50;
  return 0;
}

// Helper: Tính tiến độ user story dựa trên task con
function calcUserStoryProgress(userStory, tasks) {
  const storyTasks = tasks.filter(t => t.userStoryId === userStory._id || t.userStory === userStory._id);
  if (storyTasks.length > 0) {
    const completed = storyTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / storyTasks.length) * 100);
  }
  if (userStory.status === 'completed') return 100;
  if (userStory.status === 'in-progress') return 50;
  return 0;
}

// Helper: Tính tiến độ sprint dựa trên task/user story trong sprint
function calcSprintProgress(sprint, tasks, userStories) {
  const sprintTasks = tasks.filter(t => t.sprintId === sprint._id || t.sprint === sprint._id);
  const sprintStories = userStories.filter(us => us.sprintId === sprint._id || us.sprint === sprint._id);
  const total = sprintTasks.length + sprintStories.length;
  if (total > 0) {
    const completed = sprintTasks.filter(t => t.status === 'completed').length + sprintStories.filter(us => us.status === 'completed').length;
    return Math.round((completed / total) * 100);
  }
  if (sprint.status === 'completed') return 100;
  if (sprint.status === 'active') return 50;
  return 0;
}

// Thêm hàm kiểm tra hoàn thành
const isCompleted = status => ['completed', 'done', 'complete'].includes(status);

// Helper to get full avatar URL cho local và production
const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('/uploads/')) {
    return backendUrl + avatar;
  }
  return avatar;
};

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { user: currentUser } = useAuth(); // Lấy user hiện tại
    const [project, setProject] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [modules, setModules] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showEditTeamModal, setShowEditTeamModal] = useState(false);
    const [editTeam, setEditTeam] = useState({});
    const [usersList, setUsersList] = useState([]);
    const [editTeamLoading, setEditTeamLoading] = useState(false);
    const [editTeamResult, setEditTeamResult] = useState(null);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    // Fetch users for team selection
    useEffect(() => {
        if (showEditTeamModal) {
            fetchUsersList();
        }
    }, [showEditTeamModal]);

        const fetchProjectDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch project details
            const projectRes = await fetch(`/api/projects/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!projectRes.ok) {
                throw new Error('Failed to fetch project');
            }
            
            const projectData = await projectRes.json();
            
            if (!projectData.success) {
                throw new Error(projectData.message || 'Failed to fetch project');
            }
            
            setProject(projectData.data.project);
            
            // Fetch related data
            const [sprintsRes, tasksRes, bugsRes, modulesRes, userStoriesRes] = await Promise.all([
                fetch(`/api/sprints?projectId=${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/tasks?projectId=${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/bugs?projectId=${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/modules?projectId=${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/user-stories?project=${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            const sprintsData = await sprintsRes.json();
            const tasksData = await tasksRes.json();
            const bugsData = await bugsRes.json();
            const modulesData = await modulesRes.json();
            const userStoriesData = await userStoriesRes.json();
            
            if (sprintsData.success) setSprints(sprintsData.data.sprints || []);
            if (tasksData.success) setTasks(tasksData.data.tasks || []);
            if (bugsData.success) setBugs(bugsData.data.bugs || []);
            if (modulesData.success) setModules(modulesData.data.modules || []);
            if (userStoriesData.success) setUserStories(userStoriesData.data.userStories || []);
            
        } catch (error) {
            console.error('Error fetching project details:', error);
        } finally {
                setLoading(false);
            }
        };

    const fetchUsersList = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users?limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setUsersList(data.data.users);
        } catch (error) {
            console.error('Error fetching users list:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            planning: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            onHold: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            planning: 'Lập kế hoạch',
            active: 'Đang thực hiện',
            completed: 'Hoàn thành',
            onHold: 'Tạm dừng'
        };
        return texts[status] || status;
    };

    const getPriorityText = (priority) => {
        const texts = {
            low: 'Thấp',
            medium: 'Trung bình',
            high: 'Cao'
        };
        return texts[priority] || priority;
    };

    // Improved progress calculation function
    const calculateProgress = () => {
        const totalItems = tasks.length + modules.length + userStories.length;
        if (totalItems === 0) return 0;
        const completedTasks = tasks.filter(t => isCompleted(t.status)).length;
        const completedModules = modules.filter(m => isCompleted(m.status)).length;
        const completedUserStories = userStories.filter(us => isCompleted(us.status)).length;
        const totalCompleted = completedTasks + completedModules + completedUserStories;
        return Math.round((totalCompleted / totalItems) * 100);
    };

    const openEditTeamModal = () => {
        setEditTeam({ ...project.team });
        setEditTeamResult(null);
        setShowEditTeamModal(true);
    };

    const handleEditTeamChange = (role, value) => {
        setEditTeam((prev) => ({ ...prev, [role]: value }));
    };

    const handleSaveTeam = async () => {
        setEditTeamLoading(true);
        setEditTeamResult(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ team: editTeam })
            });
            const data = await res.json();
            if (data.success) {
                setEditTeamResult({ success: true });
                setShowEditTeamModal(false);
                fetchProjectDetails();
            } else {
                setEditTeamResult({ success: false, message: data.message });
            }
        } catch (error) {
            console.error('Error saving team:', error);
        } finally {
            setEditTeamLoading(false);
        }
    };

    // Hàm cập nhật trạng thái
    const handleUpdateStatus = async (type, entityId, status) => {
        const token = localStorage.getItem('token');
        let url = '';
        if (type === 'task') url = `/api/tasks/${entityId}/status`;
        if (type === 'userStory') url = `/api/user-stories/${entityId}/status`;
        if (type === 'module') url = `/api/modules/${entityId}/status`;
        await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        fetchProjectDetails();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy dự án</h2>
                <p className="mt-2 text-gray-600">Dự án bạn đang tìm kiếm không tồn tại.</p>
                <Link to="/projects" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Tổng quan', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
        { id: 'team', name: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
        { id: 'modules', name: 'Modules', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
        { id: 'user-stories', name: 'User Stories', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'sprints', name: 'Sprints', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'tasks', name: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { id: 'bugs', name: 'Bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
        { id: 'documents', name: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'history', name: 'Lịch sử', icon: 'M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-3">
                        <Link to="/projects" className="text-blue-600 hover:text-blue-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
                            <p className="text-sm text-gray-500">{project.code}</p>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-600 max-w-3xl">{project.description}</p>
                    
                    {/* Partner Info */}
                    {project.partner && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-sm font-medium text-blue-900">Đối tác: {project.partner.name}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Git Repository Info */}
                    {project.gitConfig?.repository && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <a href={project.gitConfig.repository} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 truncate">
                                    {project.gitConfig.repository}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                        {getPriorityText(project.priority)}
                    </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Chỉnh sửa
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm">
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xóa
                        </button>
                    </div>
                </div>
            </div>

            {/* Thông tin tổng quan và thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thống kê</h3>
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-500">Tiến độ:</span>
                            <span className="font-semibold text-blue-600">
                                {calculateProgress()}%
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                                <div 
                                    className="h-2 bg-blue-600 rounded-full" 
                                    style={{ 
                                        width: `${calculateProgress()}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            * Tiến độ được tính dựa trên tỷ lệ hoàn thành của Tasks, Modules và User Stories
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Progress</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {calculateProgress()}%
                            </p>
                            <p className="text-xs text-gray-500">Tự động tính từ Tasks, Modules và User Stories</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Team Size</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {project.team ? Object.values(project.team).flat().filter(Boolean).length : 0}
                            </p>
                            <p className="text-xs text-gray-500">Thành viên được phân công</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Sprints</p>
                            <p className="text-2xl font-semibold text-gray-900">{sprints.length}</p>
                            <p className="text-xs text-gray-500">Sprint đã tạo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Stats bổ sung box Task và Bug */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Tasks</p>
                        <p className="text-2xl font-semibold text-gray-900">{tasks.length}</p>
                        <p className="text-xs text-gray-500">Task đã tạo</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Modules</p>
                        <p className="text-2xl font-semibold text-gray-900">{modules.length}</p>
                        <p className="text-xs text-gray-500">Module đã tạo</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Bugs</p>
                        <p className="text-2xl font-semibold text-gray-900">{bugs.length}</p>
                        <p className="text-xs text-gray-500">Bug đã báo cáo</p>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Cách hoạt động của thống kê</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• <strong>Progress:</strong> Tự động tính từ tỷ lệ hoàn thành của Tasks, Modules và User Stories</li>
                            <li>• <strong>Team Size:</strong> Số thành viên đã được phân công vào dự án</li>
                            <li>• <strong>Sprints/Tasks/Modules/User Stories/Bugs:</strong> Số lượng đã tạo trong dự án này</li>
                            <li>• Các số liệu sẽ cập nhật khi bạn tạo thêm dữ liệu trong các tab tương ứng</li>
                            <li>• <strong>Lưu ý:</strong> Progress = (Completed Tasks + Completed Modules + Completed User Stories) / (Total Items) × 100</li>
                        </ul>
                    </div>
                </div>
            </div> */}

            {/* Tabs */}
            <div className="mt-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

            {/* Tab Content */}
            <div className="mt-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin dự án</h3>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Project Manager</dt>
                                        <dd className="text-sm text-gray-900">
                                            {project.team?.projectManager?.fullName || 'Chưa phân công'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Người tạo</dt>
                                        <dd className="text-sm text-gray-900">
                                            {project.createdBy?.fullName || project.createdBy?.username || 'Unknown'}
                                        </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                                        <dd className="text-sm text-gray-900">
                                            {project.timeline?.startDate ? new Date(project.timeline.startDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Ngày kết thúc</dt>
                                        <dd className="text-sm text-gray-900">
                                            {project.timeline?.endDate ? new Date(project.timeline.endDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Thời gian ước tính</dt>
                                        <dd className="text-sm text-gray-900">
                                            {project.timeline?.estimatedDuration ? `${project.timeline.estimatedDuration} ngày` : 'Chưa cập nhật'}
                                        </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                                        <dd className="text-sm text-gray-900">
                                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                        </dd>
                                        </div>
                                    </dl>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Modules</span>
                                            <span>{modules.length}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${modules.length > 0 ? (modules.filter(m => m.status === 'completed').length / modules.length) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Tasks</span>
                                            <span>{tasks.length}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => ['completed', 'done', 'complete'].includes(t.status)).length / tasks.length) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Bugs</span>
                                            <span>{bugs.length}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full"
                                                style={{ width: `${bugs.length > 0 ? (bugs.filter(b => b.status === 'resolved').length / bugs.length) * 100 : 0}%` }}
                                                ></div>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'team' && (
                        <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm" onClick={openEditTeamModal}>
                                Chỉnh sửa team
                            </button>
                        </div>
                        {project.team && Object.values(project.team).flat().filter(Boolean).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(project.team).map(([role, members]) => {
                                    if (!members || (Array.isArray(members) && members.length === 0)) return null;
                                    const memberList = Array.isArray(members) ? members : [members];
                                    return memberList.map((member) => (
                                        <div key={member._id || member.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                                {member.profile?.avatar || member.avatar ? (
                                                    <img
                                                        src={getAvatarUrl(member.profile?.avatar || member.avatar)}
                                                        alt={member.fullName || member.username}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {member.fullName ? member.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{member.fullName || member.username}</p>
                                                    <p className="text-sm text-gray-500">{role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })}
                                    </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <p className="text-gray-500">Chưa có thành viên nào trong team</p>
                            </div>
                        )}
                        </div>
                    )}
                    {activeTab === 'modules' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Modules</h3>
                        {modules.length > 0 ? (
                            <div className="space-y-4">
                                    {modules.map((module) => {
                                        const progress = calcModuleProgress(module, tasks, userStories);
                                        return (
                                            <div key={module._id || module.id} className="bg-gray-50 p-4 rounded-lg transition-shadow border border-gray-100 hover:shadow-lg">
                                        <div className="flex items-center justify-between">
                                                    <div className="w-full">
                                                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                            {module.name}
                                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                module.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                module.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                                module.status === 'delivered' ? 'bg-indigo-100 text-indigo-700' :
                                                                module.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {module.status}
                                                            </span>
                                                        </h4>
                                                        {/* Nhóm trường tích hợp */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                                                            {/* Gitlab */}
                                            <div>
                                                                <div className="font-semibold mb-1 text-xs text-gray-700">Gitlab</div>
                                                                <div className="text-xs">Commit: <span className="font-mono">{module.gitCommitHash || 'N/A'}</span></div>
                                                                <div className="text-xs">Branch: <span>{module.gitBranch || 'N/A'}</span></div>
                                                                <div className="text-xs">MR: <span>#{module.pullRequestId || 'N/A'} {module.pullRequestTitle || ''}</span></div>
                                                                <div className="text-xs">Pipeline: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ml-1 ${
                                                                    module.pipelineStatus === 'success' ? 'bg-green-100 text-green-700' :
                                                                    module.pipelineStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                                    module.pipelineStatus === 'running' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>{module.pipelineStatus || 'N/A'}</span></div>
                                            </div>
                                                            {/* Jira */}
                                                            <div>
                                                                <div className="font-semibold mb-1 text-xs text-gray-700">Jira</div>
                                                                <div className="text-xs">Ticket: <span>{module.jiraId || 'N/A'}</span></div>
                                                                <div className="text-xs">Trạng thái: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ml-1 ${
                                                                    module.jiraStatus === 'done' ? 'bg-green-100 text-green-700' :
                                                                    module.jiraStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                                    module.jiraStatus === 'todo' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>{module.jiraStatus || 'N/A'}</span></div>
                                                                <div className="text-xs">Assignee: <span>{module.jiraAssignee || 'N/A'}</span></div>
                                                                <div className="text-xs">Priority: <span>{module.jiraPriority || 'N/A'}</span></div>
                                                            </div>
                                                            {/* SonarQube */}
                                                            <div>
                                                                <div className="font-semibold mb-1 text-xs text-gray-700">SonarQube</div>
                                                                <div className="text-xs">Status: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ml-1 ${
                                                                    module.sonarStatus === 'passed' ? 'bg-green-100 text-green-700' :
                                                                    module.sonarStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>{module.sonarStatus || 'N/A'}</span></div>
                                                                <div className="text-xs">Coverage: <span>{typeof module.sonarCoverage === 'number' ? module.sonarCoverage + '%' : 'N/A'}</span></div>
                                                                <div className="text-xs">Bugs: <span>{typeof module.sonarBugs === 'number' ? module.sonarBugs : 'N/A'}</span></div>
                                                                <div className="text-xs">Code Smells: <span>{typeof module.sonarCodeSmells === 'number' ? module.sonarCodeSmells : 'N/A'}</span></div>
                                                                <div className="text-xs">Duplications: <span>{typeof module.sonarDuplications === 'number' ? module.sonarDuplications + '%' : 'N/A'}</span></div>
                                                            </div>
                                                            {/* Jenkins */}
                                                            <div>
                                                                <div className="font-semibold mb-1 text-xs text-gray-700">Jenkins</div>
                                                                <div className="text-xs">Build: <span>#{module.jenkinsBuildNumber || 'N/A'}</span></div>
                                                                <div className="text-xs">Status: <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ml-1 ${
                                                                    module.jenkinsStatus === 'success' ? 'bg-green-100 text-green-700' :
                                                                    module.jenkinsStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                                                    module.jenkinsStatus === 'running' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                                }`}>{module.jenkinsStatus || 'N/A'}</span></div>
                                                                <div className="text-xs">Triggered by: <span>{module.jenkinsTriggeredBy || 'N/A'}</span></div>
                                                                <div className="text-xs">Duration: <span>{module.jenkinsDuration ? module.jenkinsDuration + 's' : 'N/A'}</span></div>
                                                            </div>
                                                        </div>
                                                        {/* End nhóm trường tích hợp */}
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {[
                                                                { label: 'Dev', user: module.assignedTo, color: 'bg-blue-100', icon: <UserIcon className="w-4 h-4 text-blue-500" /> },
                                                                { label: 'QA', user: module.qa, color: 'bg-yellow-100', icon: <BeakerIcon className="w-4 h-4 text-yellow-500" /> },
                                                                { label: 'Reviewer', user: module.reviewer, color: 'bg-purple-100', icon: <CheckBadgeIcon className="w-4 h-4 text-purple-500" /> },
                                                                { label: 'DevOps', user: module.deliveredBy, color: 'bg-gray-100', icon: <Cog6ToothIcon className="w-4 h-4 text-gray-500" /> }
                                                            ].map((role, idx) => (
                                                                <div key={idx} className={`flex items-center text-xs rounded px-2 py-1 shadow-sm border ${role.color} relative group`}>
                                                                    {role.user?.avatar ? (
                                                                        <img src={role.user.avatar} alt={role.user.fullName || role.user.username} className="w-6 h-6 rounded-full mr-1" />
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-1 text-gray-500 font-semibold">
                                                                            {(role.user?.fullName || role.user?.username || role.label).charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    {role.icon}
                                                                    <span className="font-medium text-gray-700 ml-1">{role.label}:</span>
                                                                    <span className="text-gray-600 ml-1">{role.user?.fullName || role.user?.username || 'Chưa phân công'}</span>
                                                                    {/* Tooltip */}
                                                                    {(role.user?.fullName || role.user?.email) && (
                                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                                            {role.user?.fullName} {role.user?.email && <><br />{role.user.email}</>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 items-center">
                                                            <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Deadline: {module.deadline ? new Date(module.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                                            <div className="flex items-center gap-1"><ArrowDownTrayIcon className="w-4 h-4" /> Bàn giao: <span className={module.deliveryStatus === 'accepted' ? 'text-green-600' : module.deliveryStatus === 'pending' ? 'text-yellow-600' : 'text-gray-600'}>{module.deliveryStatus === 'accepted' ? 'Đã bàn giao' : module.deliveryStatus === 'pending' ? 'Chờ duyệt' : 'Chưa bàn giao'}</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right min-w-[80px]">
                                                        <p className="text-sm font-medium text-gray-900">{progress}%</p>
                                                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <p className="text-gray-500">Chưa có module nào</p>
                            </div>
                        )}
                        </div>
                    )}
                    {activeTab === 'sprints' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Sprints</h3>
                        {sprints.length > 0 ? (
                            <div className="space-y-4">
                                    {sprints.map((sprint) => {
                                        const progress = calcSprintProgress(sprint, tasks, userStories);
                                        return (
                                            <div key={sprint._id || sprint.id} className="bg-gray-50 p-4 rounded-lg transition-shadow border border-gray-100 hover:shadow-lg">
                                        <div className="flex items-center justify-between">
                                                    <div className="w-full">
                                                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                            {sprint.name}
                                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                sprint.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                sprint.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                                sprint.status === 'onHold' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {sprint.status}
                                            </span>
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {[{ label: 'Owner', user: sprint.owner, color: 'bg-blue-100', icon: <UserIcon className="w-4 h-4 text-blue-500" /> }].map((role, idx) => (
                                                                <div key={idx} className={`flex items-center text-xs rounded px-2 py-1 shadow-sm border ${role.color} relative group`}>
                                                                    {role.user?.avatar ? (
                                                                        <img src={role.user.avatar} alt={role.user.fullName || role.user.username} className="w-6 h-6 rounded-full mr-1" />
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-1 text-gray-500 font-semibold">
                                                                            {(role.user?.fullName || role.user?.username || role.label).charAt(0).toUpperCase()}
                                        </div>
                                                                    )}
                                                                    {role.icon}
                                                                    <span className="font-medium text-gray-700 ml-1">{role.label}:</span>
                                                                    <span className="text-gray-600 ml-1">{role.user?.fullName || role.user?.username || 'Chưa phân công'}</span>
                                                                    {(role.user?.fullName || role.user?.email) && (
                                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                                            {role.user?.fullName} {role.user?.email && <><br />{role.user.email}</>}
                                                                        </div>
                                                                    )}
                                    </div>
                                ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 items-center">
                                                            <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                                <span>Tiến độ</span>
                                                                <span>{progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500">Chưa có sprint nào</p>
                            </div>
                        )}
                        </div>
                    )}
                    {activeTab === 'tasks' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks</h3>
                        {tasks.length > 0 ? (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                        <div key={task._id || task.id} className="bg-gray-50 p-4 rounded-lg transition-shadow border border-gray-100 hover:shadow-lg">
                                        <div className="flex items-center justify-between">
                                                <div className="w-full">
                                                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {task.title}
                                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                            task.status === 'onHold' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {task.status}
                                                </span>
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {[{ label: 'Assignee', user: task.assignee, color: 'bg-blue-100', icon: <UserIcon className="w-4 h-4 text-blue-500" /> }].map((role, idx) => (
                                                            <div key={idx} className={`flex items-center text-xs rounded px-2 py-1 shadow-sm border ${role.color} relative group`}>
                                                                {role.user?.avatar ? (
                                                                    <img src={role.user.avatar} alt={role.user.fullName || role.user.username} className="w-6 h-6 rounded-full mr-1" />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-1 text-gray-500 font-semibold">
                                                                        {(role.user?.fullName || role.user?.username || role.label).charAt(0).toUpperCase()}
                                            </div>
                                                                )}
                                                                {role.icon}
                                                                <span className="font-medium text-gray-700 ml-1">{role.label}:</span>
                                                                <span className="text-gray-600 ml-1">{role.user?.fullName || role.user?.username || 'Chưa phân công'}</span>
                                                                {(role.user?.fullName || role.user?.email) && (
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                                        {role.user?.fullName} {role.user?.email && <><br />{role.user.email}</>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 items-center">
                                                        <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                                        <div className="flex items-center gap-1"><FlagIcon className="w-4 h-4" /> Độ ưu tiên: <span className={task.priority === 'high' ? 'text-red-600' : task.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'}>{task.priority || 'N/A'}</span></div>
                                                    </div>
                                                    {typeof task.progress === 'number' && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                                <span>Tiến độ</span>
                                                                <span>{task.progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Nút hoàn thành cho assignee */}
                                                    {task.assignee?._id === currentUser?._id && task.status !== 'completed' && (
                                                        <button
                                                            className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                            onClick={() => handleUpdateStatus('task', task._id, 'completed')}
                                                        >
                                                            Đánh dấu hoàn thành
                                                        </button>
                                                    )}
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500">Chưa có task nào</p>
                            </div>
                        )}
                        </div>
                    )}
                    {activeTab === 'bugs' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Bugs</h3>
                        {bugs.length > 0 ? (
                            <div className="space-y-4">
                                {bugs.map((bug) => (
                                        <div key={bug._id || bug.id} className="bg-gray-50 p-4 rounded-lg transition-shadow border border-gray-100 hover:shadow-lg">
                                        <div className="flex items-center justify-between">
                                                <div className="w-full">
                                                    <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {bug.title}
                                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            bug.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                            bug.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                            bug.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {bug.status}
                                                </span>
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {[{ label: 'Assignee', user: bug.assignedTo, color: 'bg-blue-100', icon: <UserIcon className="w-4 h-4 text-blue-500" /> }].map((role, idx) => (
                                                            <div key={idx} className={`flex items-center text-xs rounded px-2 py-1 shadow-sm border ${role.color} relative group`}>
                                                                {role.user?.avatar ? (
                                                                    <img src={role.user.avatar} alt={role.user.fullName || role.user.username} className="w-6 h-6 rounded-full mr-1" />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-1 text-gray-500 font-semibold">
                                                                        {(role.user?.fullName || role.user?.username || role.label).charAt(0).toUpperCase()}
                                            </div>
                                                                )}
                                                                {role.icon}
                                                                <span className="font-medium text-gray-700 ml-1">{role.label}:</span>
                                                                <span className="text-gray-600 ml-1">{role.user?.fullName || role.user?.username || 'Chưa phân công'}</span>
                                                                {(role.user?.fullName || role.user?.email) && (
                                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                                                                        {role.user?.fullName} {role.user?.email && <><br />{role.user.email}</>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 items-center">
                                                        <div className="flex items-center gap-1"><ExclamationTriangleIcon className="w-4 h-4" /> Severity: <span className={bug.severity === 'high' ? 'text-red-600' : bug.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'}>{bug.severity || 'N/A'}</span></div>
                                                        <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Deadline: {bug.deadline ? new Date(bug.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                                    </div>
                                                    {typeof bug.progress === 'number' && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                                <span>Tiến độ</span>
                                                                <span>{bug.progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${bug.progress}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-gray-500">Chưa có bug nào được báo cáo</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'user-stories' && (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">User Stories</h3>
                        {userStories.length > 0 ? (
                            <div className="space-y-4">
                                    {userStories.map((userStory) => {
                                        const progress = calcUserStoryProgress(userStory, tasks);
                                        return (
                                            <div key={userStory._id || userStory.id} className="bg-gray-50 p-4 rounded-lg transition-shadow border border-gray-100 hover:shadow-lg">
                                        <div className="flex items-center justify-between">
                                                    <div className="w-full">
                                                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                            {userStory.title}
                                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                userStory.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                userStory.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                                                userStory.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {userStory.status}
                                                </span>
                                                        </h4>
                                                        {/* ... các trường khác ... */}
                                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 items-center">
                                                            <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> Deadline: {userStory.deadline ? new Date(userStory.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                            </div>
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                                <span>Tiến độ</span>
                                                                <span>{progress}%</span>
                                        </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500">Chưa có user story nào</p>
                            </div>
                        )}
                        </div>
                    )}
                    {activeTab === 'documents' && (
                        <div>
                            <FileManager
                                entityType="project"
                            entityId={project._id || project.id}
                                description={`Tài liệu cho dự án ${project.name}`}
                            />
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-4">Lịch sử thay đổi dự án</h3>
                        {project.history && project.history.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người thực hiện</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết thay đổi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {project.history.slice().reverse().map((h, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(h.time).toLocaleString()}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{h.user || 'Hệ thống'}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{h.action}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{h.note}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {h.changes && h.changes.length > 0 ? (
                                                        <ul className="list-disc pl-4">
                                                            {h.changes.map((c, i) => (
                                                                <li key={i}>
                                                                    <span className="font-medium">{c.field}:</span> <span className="text-red-600 line-through">{String(c.oldValue)}</span> → <span className="text-green-600">{String(c.newValue)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-gray-500">Chưa có lịch sử thay đổi nào.</div>
                        )}
                    </div>
                )}
            </div>
        

        {/* Edit Team Modal */}
        {showEditTeamModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200">
                <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-fadeIn">
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowEditTeamModal(false)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h2 className="text-xl font-bold mb-6 text-center">Chỉnh sửa team dự án</h2>
                    <div className="space-y-5">
                        {/* Project Manager */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                            <select value={editTeam.projectManager?._id || ''} onChange={e => handleEditTeamChange('projectManager', usersList.find(u => u._id === e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="">-- Chọn PM --</option>
                                {usersList.filter(u => u.role === 'pm').map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
                            </select>
                        </div>
                        {/* Product Owner */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Owner</label>
                            <select value={editTeam.productOwner?._id || ''} onChange={e => handleEditTeamChange('productOwner', usersList.find(u => u._id === e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="">-- Chọn PO --</option>
                                {usersList.filter(u => u.role === 'po').map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
                            </select>
                        </div>
                        {/* Business Analyst */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Analyst</label>
                            <select value={editTeam.businessAnalyst?._id || ''} onChange={e => handleEditTeamChange('businessAnalyst', usersList.find(u => u._id === e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="">-- Chọn BA --</option>
                                {usersList.filter(u => u.role === 'ba').map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
                            </select>
                        </div>
                        {/* Developers */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Developers</label>
                            <select multiple value={editTeam.developers?.map(u => u._id) || []} onChange={e => handleEditTeamChange('developers', Array.from(e.target.selectedOptions).map(opt => usersList.find(u => u._id === opt.value)))} className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[48px]">
                                {usersList.filter(u => u.role === 'dev').map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
                            </select>
                        </div>
                        {/* Testers */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Testers</label>
                            <select multiple value={editTeam.testers?.map(u => u._id) || []} onChange={e => handleEditTeamChange('testers', Array.from(e.target.selectedOptions).map(opt => usersList.find(u => u._id === opt.value)))} className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[48px]">
                                {usersList.filter(u => u.role === 'qa').map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
                            </select>
                        </div>
                        {/* DevOps */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DevOps</label>
                            <select multiple value={editTeam.devops?.map(u => u._id) || []} onChange={e => handleEditTeamChange('devops', Array.from(e.target.selectedOptions).map(opt => usersList.find(u => u._id === opt.value)))} className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[48px]">
                                {usersList.filter(u => u.role === 'devops').map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-8">
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2" onClick={() => setShowEditTeamModal(false)}>Hủy</button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow" onClick={handleSaveTeam} disabled={editTeamLoading}>{editTeamLoading ? 'Đang lưu...' : 'Lưu'}</button>
                    </div>
                    {editTeamResult && (
                        <div className={`mt-4 p-3 rounded ${editTeamResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {editTeamResult.success ? 'Cập nhật team thành công!' : editTeamResult.message}
                        </div>
                    )}
                </div>
            </div>
        )}
        </div>
    );
}