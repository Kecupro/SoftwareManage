import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function SprintDetailPage() {
  const { id } = useParams();
  const [sprint, setSprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const teamMembers = useMemo(() => {
    if (!sprint?.backlog) return [];
    
    const membersMap = new Map();
    
    const addUser = (user) => {
      if (user && user._id && !membersMap.has(user._id)) {
        membersMap.set(user._id, {
          _id: user._id,
          fullName: user.fullName,
          role: user.role || 'Member' 
        });
      }
    };

    sprint.backlog.userStories?.forEach(item => addUser(item.assignee));
    sprint.backlog.tasks?.forEach(item => addUser(item.assignee));
    sprint.backlog.bugs?.forEach(item => addUser(item.assignee));
    
    return Array.from(membersMap.values());
  }, [sprint]);

  useEffect(() => {
    fetchSprintDetails();
  }, [id]);

  const fetchSprintDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sprints/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch sprint details');
      const data = await res.json();
      if (data.success) {
        setSprint(data.data.sprint);
      } else {
        throw new Error(data.message || 'Failed to fetch sprint details');
      }
    } catch (error) {
      console.error('Error fetching sprint details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'to-do': 'bg-gray-100 text-gray-800',
      open: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      planning: 'Lập kế hoạch',
      'in-progress': 'Đang thực hiện',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      'to-do': 'Chưa bắt đầu',
      open: 'Mở',
      resolved: 'Đã giải quyết'
    };
    return texts[status] || status;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityText = (severity) => {
    const texts = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    return texts[severity] || severity;
  };

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getVelocityColor = (velocity, capacity) => {
    const ratio = capacity > 0 ? velocity / capacity : 0;
    if (ratio >= 0.9) return 'text-green-600';
    if (ratio >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy sprint</h2>
        <p className="mt-2 text-gray-600">Sprint bạn đang tìm kiếm không tồn tại.</p>
        <Link to="/sprints" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { id: 'team', name: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { id: 'stories', name: 'User Stories', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'tasks', name: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'bugs', name: 'Bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { id: 'daily-scrum', name: 'Daily Scrum', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <Link to="/sprints" className="text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{sprint.name}</h1>
              <p className="text-sm text-gray-500">{sprint.project?.name}</p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">{sprint.goals?.join(', ')}</p>
          <p className="mt-1 text-sm text-gray-500">
            {sprint.timeline?.startDate ? new Date(sprint.timeline.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {sprint.timeline?.endDate ? new Date(sprint.timeline.endDate).toLocaleDateString('vi-VN') : 'N/A'}
          </p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(sprint.status)}`}>
            {getStatusText(sprint.status)}
          </span>
        </div>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tiến độ</p>
              <p className="text-2xl font-semibold text-gray-900">{calculateProgress(sprint.completedPoints, sprint.totalPoints)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Story Points</p>
              <p className="text-2xl font-semibold text-gray-900">{sprint.completedPoints}/{sprint.totalPoints}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Velocity</p>
              <p className={`text-2xl font-semibold ${getVelocityColor(sprint.velocity, sprint.capacity)}`}>
                {sprint.velocity}/{sprint.capacity}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Bugs</p>
              <p className="text-2xl font-semibold text-gray-900">{sprint.bugs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin sprint</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Scrum Master</dt>
                      <dd className="text-sm text-gray-900">{sprint.scrumMaster?.fullName || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Team Size</dt>
                      <dd className="text-sm text-gray-900">{sprint.teamMembers?.length || 0} thành viên</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User Stories</dt>
                      <dd className="text-sm text-gray-900">{sprint.backlog?.userStories?.length || 0} stories</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tasks</dt>
                      <dd className="text-sm text-gray-900">{sprint.backlog?.tasks?.length || 0} tasks</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                      <dd className="text-sm text-gray-900">{sprint.createdAt ? new Date(sprint.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê chi tiết</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Story Points Progress</span>
                        <span>{calculateProgress(sprint.statistics?.completedStoryPoints, sprint.statistics?.plannedStoryPoints)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculateProgress(sprint.statistics?.completedStoryPoints, sprint.statistics?.plannedStoryPoints)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Velocity Efficiency</span>
                        <span>{sprint.capacity > 0 ? Math.round((sprint.statistics?.velocity / sprint.capacity) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${sprint.capacity > 0 ? Math.min((sprint.statistics?.velocity / sprint.capacity) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Bug Resolution Rate</span>
                        <span>{sprint.statistics?.totalBugs > 0 ? Math.round(((sprint.statistics?.resolvedBugs) / sprint.statistics?.totalBugs) * 100) : 100}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${sprint.statistics?.totalBugs > 0 ? Math.round(((sprint.statistics?.resolvedBugs) / sprint.statistics?.totalBugs) * 100) : 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin version/tag */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Version/Tag</h3>
                  <p className="text-sm text-gray-900">{sprint.versionTag}</p>
                </div>
              </div>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Thêm thành viên
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div key={member._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{member.fullName?.charAt(0) || 'M'}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Stories Tab */}
          {activeTab === 'stories' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Stories</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Thêm story
                </button>
              </div>
              <div className="space-y-4">
                {sprint.backlog?.userStories?.map((story) => (
                  <div key={story._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{story.title}</h4>
                        <p className="text-sm text-gray-500">Assignee: {story.assignee?.fullName || 'N/A'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(story.status)}`}>
                          {getStatusText(story.status)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {story.storyPoints || 0} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Thêm task
                </button>
              </div>
              <div className="space-y-4">
                {sprint.backlog?.tasks?.map((task) => (
                  <div key={task._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">Assignee: {task.assignee?.fullName || 'N/A'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        <span className="text-sm text-gray-600">{task.estimatedHours || 0}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bugs Tab */}
          {activeTab === 'bugs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bugs</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Báo cáo bug
                </button>
              </div>
              <div className="space-y-4">
                {sprint.backlog?.bugs?.length > 0 ? (
                  sprint.backlog.bugs.map((bug) => (
                    <div key={bug._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{bug.title}</h4>
                          <p className="text-sm text-gray-500">Assignee: {bug.assignee?.fullName || 'N/A'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
                            {getStatusText(bug.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(bug.severity)}`}>
                            {getSeverityText(bug.severity)}
                          </span>
                          <span className="text-sm text-gray-600">{bug.estimatedHours || 0}h</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Không có bug nào được báo cáo</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Daily Scrum Tab */}
          {activeTab === 'daily-scrum' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Daily Scrum Meetings</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Thêm meeting
                </button>
              </div>
              <div className="space-y-4">
                {sprint.events?.dailyScrums?.map((meeting, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Daily Scrum - {new Date(meeting.date).toLocaleDateString('vi-VN')}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{meeting.notes}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {meeting.participants?.length || 0} attendees
                        </span>
                        {meeting.blockers > 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {meeting.blockers} blockers
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 