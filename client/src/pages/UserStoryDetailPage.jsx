import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserStoryDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [userStory, setUserStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  // State cho quy trình bàn giao & phê duyệt
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState('');

  // Kiểm tra quyền
  const canUpdateStatus = userStory && currentUser && userStory.assignedTo && userStory.assignedTo._id === currentUser._id;
  const canApprove = userStory && currentUser && (currentUser.role === 'qa' || currentUser.role === 'reviewer');

  useEffect(() => {
    fetchUserStoryDetails();
  }, [id]);

  const fetchUserStoryDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user-stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch user story details');
      const data = await res.json();
      if (data.data.userStory && !Array.isArray(data.data.userStory.history)) {
        data.data.userStory.history = [];
      }
      setUserStory(data.data.userStory);
    } catch (error) {
      console.error('Error fetching user story details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi API thao tác quy trình bàn giao & phê duyệt
  const handleDeliver = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user-stories/${id}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: 'Bàn giao user story' })
      });
      if (!res.ok) throw new Error('Bàn giao thất bại');
      await fetchUserStoryDetails();
    } catch {
      setErrorMsg('Bàn giao thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật trạng thái
  const handleStatusChange = async (newStatus) => {
    if (!canUpdateStatus) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user-stories/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();
      if (data.success) {
        fetchUserStoryDetails();
      }
    } catch {
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  // Duyệt user story
  const handleApprove = async (status) => {
    if (!canApprove) return;
    setApproveLoading(true);
    setApproveError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user-stories/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, note: approveNote })
      });
      const data = await res.json();
      if (data.success) {
        fetchUserStoryDetails();
        setApproveNote('');
      } else {
        setApproveError(data.message || 'Lỗi khi duyệt');
      }
    } catch {
      setApproveError('Lỗi kết nối server');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      setErrorMsg('Vui lòng nhập lý do từ chối');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user-stories/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: rejectNote })
      });
      if (!res.ok) throw new Error('Từ chối thất bại');
      setShowRejectInput(false);
      setRejectNote('');
      await fetchUserStoryDetails();
    } catch {
      setErrorMsg('Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'backlog': 'bg-gray-100 text-gray-800',
      'sprint-backlog': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'testing': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'backlog': 'Backlog',
      'sprint-backlog': 'Sprint Backlog',
      'in-progress': 'Đang thực hiện',
      'testing': 'Đang test',
      'completed': 'Hoàn thành',
      'accepted': 'Đã chấp nhận',
      'rejected': 'Đã từ chối'
    };
    return texts[status] || status;
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao',
      critical: 'Khẩn cấp'
    };
    return texts[priority] || priority;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userStory) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy user story</h2>
        <p className="mt-2 text-gray-600">User story bạn đang tìm kiếm không tồn tại.</p>
        <Link to="/user-stories" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { id: 'acceptance', name: 'Acceptance Criteria', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'tasks', name: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'bugs', name: 'Bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { id: 'comments', name: 'Comments', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'attachments', name: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'time-tracking', name: 'Time Tracking', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <Link to="/user-stories" className="text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 line-clamp-2">{userStory.title}</h1>
              <p className="text-sm text-gray-500">{userStory.projectName} • {userStory.sprintName}</p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 max-w-4xl">{userStory.description}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(userStory.status)}`}>
            {getStatusText(userStory.status)}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(userStory.priority)}`}>
            {getPriorityText(userStory.priority)}
          </span>
        </div>
      </div>

      {/* Quy trình bàn giao & phê duyệt */}
                  <div className="bg-white rounded-xl shadow-lg border border-white/50 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <span className="font-semibold">Trạng thái bàn giao:&nbsp;</span>
            {userStory.deliveryStatus === 'pending' && <span className="text-yellow-600 font-medium">Chờ phê duyệt</span>}
            {userStory.deliveryStatus === 'accepted' && <span className="text-green-600 font-medium">Đã phê duyệt</span>}
            {userStory.deliveryStatus === 'rejected' && <span className="text-red-600 font-medium">Đã từ chối</span>}
            {userStory.deliveryStatus === undefined && <span className="text-gray-600">Chưa bàn giao</span>}
            {userStory.approvalNote && userStory.deliveryStatus === 'rejected' && (
              <span className="ml-2 text-xs text-red-500">(Lý do: {userStory.approvalNote})</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            {/* Nút thao tác, có thể kiểm tra quyền user ở đây nếu cần */}
            {userStory.deliveryStatus !== 'pending' && userStory.deliveryStatus !== 'accepted' && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                onClick={handleDeliver}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang bàn giao...' : 'Bàn giao'}
              </button>
            )}
            {userStory.deliveryStatus === 'pending' && (
              <>
                {/* Nút cập nhật trạng thái */}
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleStatusChange('in-progress')} className="bg-blue-500 text-white px-3 py-1 rounded">Bắt đầu</button>
                  <button onClick={() => handleStatusChange('completed')} className="bg-green-600 text-white px-3 py-1 rounded">Mark as Done</button>
                </div>
                {/* Nút duyệt user story */}
                <div className="mt-4">
                  <label className="block font-medium mb-1">Ghi chú duyệt</label>
                  <textarea value={approveNote} onChange={e => setApproveNote(e.target.value)} className="w-full border rounded px-2 py-1 mb-2" rows={2} />
                  {approveError && <div className="text-red-600 text-sm mb-2">{approveError}</div>}
                  <div className="flex gap-2">
                    <button disabled={approveLoading} onClick={() => handleApprove('accepted')} className="bg-green-600 text-white px-3 py-1 rounded">Duyệt user story</button>
                    <button disabled={approveLoading} onClick={() => handleApprove('rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Từ chối</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Input lý do từ chối */}
        {showRejectInput && userStory.deliveryStatus === 'pending' && (
          <div className="mt-2 flex flex-col md:flex-row md:items-center gap-2">
            <input
              type="text"
              className="border rounded px-2 py-1 flex-1"
              placeholder="Nhập lý do từ chối..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              disabled={actionLoading}
            />
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
              onClick={handleReject}
              disabled={actionLoading}
            >
              Xác nhận từ chối
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md text-sm"
              onClick={() => setShowRejectInput(false)}
              disabled={actionLoading}
            >
              Hủy
            </button>
          </div>
        )}
        {errorMsg && <div className="text-red-500 text-sm mt-2">{errorMsg}</div>}
      </div>

      {/* User Story Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tiến độ</p>
              <p className="text-2xl font-semibold text-gray-900">{calculateProgress(userStory.completedTasks, userStory.tasks)}%</p>
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
              <p className="text-2xl font-semibold text-gray-900">{userStory.storyPoints}</p>
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
              <p className="text-sm font-medium text-gray-500">Giờ làm</p>
              <p className="text-2xl font-semibold text-gray-900">{userStory.timeTracking?.logged || 0}h</p>
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
              <p className="text-2xl font-semibold text-gray-900">{userStory.statistics?.totalBugs || 0}</p>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin user story</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Epic</dt>
                      <dd className="text-sm text-gray-900">{userStory.epic}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Assignee</dt>
                      <dd className="text-sm text-gray-900">{userStory.assigneeName || 'Chưa giao'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reporter</dt>
                      <dd className="text-sm text-gray-900">{userStory.creatorName || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                      <dd className="text-sm text-gray-900">{new Date(userStory.createdAt).toLocaleDateString('vi-VN')}</dd>
                    </div>
                    {userStory.completedAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ngày hoàn thành</dt>
                        <dd className="text-sm text-gray-900">{new Date(userStory.completedAt).toLocaleDateString('vi-VN')}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê chi tiết</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Task Progress</span>
                        <span>{calculateProgress(userStory.completedTasks, userStory.tasks)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${calculateProgress(userStory.completedTasks, userStory.tasks)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Time Tracking</span>
                        <span>{userStory.timeTracking?.logged || 0}/{userStory.timeTracking?.estimated || 0}h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(((userStory.timeTracking?.logged || 0) / (userStory.timeTracking?.estimated || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Bug Resolution</span>
                        <span>{userStory.statistics?.totalBugs > 0 ? Math.round(((userStory.statistics?.totalBugs - userStory.statistics?.resolvedBugs) / userStory.statistics?.totalBugs) * 100) : 100}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${userStory.statistics?.totalBugs > 0 ? Math.round(((userStory.statistics?.totalBugs - userStory.statistics?.resolvedBugs) / userStory.statistics?.totalBugs) * 100) : 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Thông tin commit liên quan */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Commit liên quan</h3>
                <ul>
                  {userStory.relatedCommits?.map((c, idx) => (
                    <li key={idx} className="text-sm text-gray-900">{c}</li>
                  )) || <li className="text-sm text-gray-500">Chưa có commit nào</li>}
                </ul>
              </div>
              {/* Lịch sử thao tác */}
              {userStory.history && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Lịch sử thao tác</h3>
                  <ul className="space-y-2">
                    {userStory.history.map((h, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        {h.time && new Date(h.time).toLocaleString('vi-VN')} - {h.user?.fullName || h.user} - {h.action} - {h.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Acceptance Criteria Tab */}
          {activeTab === 'acceptance' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Acceptance Criteria</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{userStory.acceptanceCriteria}</pre>
                </div>
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
                {userStory.storyTasks?.map((task) => (
                  <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-500">Assignee: {task.assignee}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </span>
                        <span className="text-sm text-gray-600">{task.hours}h</span>
                      </div>
                    </div>
                  </div>
                )) || <p className="text-gray-500">Chưa có task nào</p>}
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
                {userStory.bugs > 0 ? (
                  userStory.storyBugs.map((bug) => (
                    <div key={bug.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{bug.title}</h4>
                          <p className="text-sm text-gray-500">Assignee: {bug.assignee}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
                            {getStatusText(bug.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(bug.severity)}`}>
                            {getSeverityText(bug.severity)}
                          </span>
                          <span className="text-sm text-gray-600">{bug.hours}h</span>
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

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Comments ({userStory.storyComments.length})</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Thêm comment
                </button>
              </div>
              <div className="space-y-4">
                {userStory.storyComments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">{comment.author.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                          <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tài liệu ({userStory.storyAttachments.length})</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                  Upload tài liệu
                </button>
              </div>
              <div className="space-y-4">
                {userStory.storyAttachments.map((attachment) => (
                  <div key={attachment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{attachment.name}</h4>
                          <p className="text-sm text-gray-500">Uploaded by {attachment.uploadedBy}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{attachment.size}</p>
                        <p className="text-xs text-gray-500">{attachment.type.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Tracking Tab */}
          {activeTab === 'time-tracking' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Time Tracking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Estimated</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStory.timeTracking?.estimated || 0}h</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Logged</p>
                    <p className="text-2xl font-semibold text-blue-600">{userStory.timeTracking?.logged || 0}h</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStory.timeTracking?.remaining || 0}h</p>
                  </div>
                </div>
              </div>
              
              <h4 className="text-md font-medium text-gray-900 mb-3">Activity Log</h4>
              <div className="space-y-3">
                {userStory.timeTracking?.activities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{activity.hours}h</span>
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