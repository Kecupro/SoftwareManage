import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);
  const [hoursToLog, setHoursToLog] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch task details');
      const data = await res.json();
      if (data.success) {
        setTask(data.data.task);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${id}`, {
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
        setTask(prevTask => ({ ...prevTask, status: newStatus }));
        // Optionally, refetch everything to get the latest history entry
        fetchTaskDetails();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actualHours: Number(hoursToLog) })
      });
      if (!res.ok) throw new Error('Failed to log hours');
      const data = await res.json();
      if (data.success) {
        setShowLogHoursModal(false);
        fetchTaskDetails(); // Refetch to get all updates including history
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Error logging hours:', error);
      alert('Cập nhật giờ làm thất bại!');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (!res.ok) throw new Error('Failed to post comment');
      const data = await res.json();

      if (data.success) {
        setTask(data.data.task); // Update the task with the new comment
        setNewComment(''); // Clear the input
      } else {
        alert('Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Gửi bình luận thất bại!');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-200 text-gray-800',
      'in-progress': 'bg-blue-200 text-blue-800',
      'in-review': 'bg-purple-200 text-purple-800',
      done: 'bg-green-200 text-green-800',
      blocked: 'bg-red-200 text-red-800'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTaskTypeColor = (type) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      testing: 'bg-green-100 text-green-800',
      documentation: 'bg-yellow-100 text-yellow-800',
      bugfix: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    return texts[priority] || priority;
  };

  const getTaskTypeText = (type) => {
    const texts = {
      development: 'Development',
      design: 'Design',
      testing: 'Testing',
      documentation: 'Documentation',
      bugfix: 'Bug Fix'
    };
    return texts[type] || type;
  };

  const calculateProgress = (actual, estimated) => {
    if (!estimated || estimated === 0) return 0;
    return Math.round(((actual || 0) / estimated) * 100);
  };

  if (loading || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy task</h2>
        <p className="mt-2 text-gray-600">Task bạn đang tìm kiếm không tồn tại.</p>
        <Link to="/tasks" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan' },
    { id: 'history', name: 'Lịch sử' },
    { id: 'subtasks', name: 'Subtasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'dependencies', name: 'Dependencies', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { id: 'comments', name: 'Comments', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'attachments', name: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'time-tracking', name: 'Time Tracking', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'related', name: 'Related Tasks', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {task.history?.slice().reverse().map((event, eventIdx) => (
                <li key={event._id || eventIdx}>
                  <div className="relative pb-8">
                    {eventIdx !== task.history.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                          <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{event.user?.fullName || 'System'}</span>
                            {' '}{event.action}
                          </p>
                          {event.changes && event.changes.length > 0 && (
                            <div className="mt-2 text-sm text-gray-700">
                              <ul className="list-disc pl-5 space-y-1">
                                {event.changes.map((change, index) => (
                                  <li key={index}>
                                    Trường <strong className="font-semibold">{change.field}</strong> đã thay đổi từ <span className="italic text-red-600">{`'${change.oldValue}'`}</span> thành <span className="italic text-green-600">{`'${change.newValue}'`}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleString('vi-VN')}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {(!task.history || task.history.length === 0) && <p>Không có lịch sử thay đổi.</p>}
            </ul>
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-4">
            <p>{task.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-semibold">Assignee:</span> {task.assignee?.fullName || 'Chưa gán'}</div>
              <div><span className="font-semibold">Reporter:</span> {task.reporter?.fullName || 'N/A'}</div>
              <div><span className="font-semibold">Start Date:</span> {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-semibold">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</div>
              <div><span className="font-semibold">Estimated Hours:</span> {task.estimatedHours ?? 'N/A'}</div>
              <div><span className="font-semibold">Actual Hours:</span> {task.actualHours ?? 'N/A'}</div>
              <div><span className="font-semibold">Commit Hash:</span> {task.commitHash || 'N/A'}</div>
            </div>
          </div>
        );
      case 'comments':
        return (
          <div>
            <div className="space-y-6">
              {task.comments?.map(comment => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{comment.user?.fullName || 'Người dùng'}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700 bg-gray-100 rounded-md p-3">
                      <p>{comment.content}</p>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('vi-VN')}</time>
                    </div>
                  </div>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && <p>Chưa có bình luận nào.</p>}
            </div>

            <form onSubmit={handleCommentSubmit} className="mt-6 flex space-x-3">
              <div className="flex-shrink-0">
                 <span className="inline-block h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" />
                    </svg>
                  </span>
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <label htmlFor="comment" className="sr-only">Thêm bình luận</label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                    placeholder="Thêm bình luận..."
                  />
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <Link to="/tasks" className="text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 line-clamp-2">{task.title}</h1>
              <p className="text-sm text-gray-500">
                Trong <Link to={`/projects/${task.project?._id}`} className="text-blue-600">{task.project?.name}</Link>
                {task.sprint && <> • <Link to={`/sprints/${task.sprint?._id}`} className="text-blue-600">{task.sprint?.name}</Link></>}
                {task.userStory && <> • <Link to={`/user-stories/${task.userStory?._id}`} className="text-blue-600">{task.userStory?.title}</Link></>}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 max-w-4xl">{task.description}</p>
          <p className="mt-1 text-sm text-gray-500">
            User Story: {task.userStory?.title}
          </p>
        </div>
        <div className="flex space-x-2 items-center">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-1 text-sm font-medium rounded-full border-2 ${getStatusColor(task.status)}`}
          >
            <option value="todo">Chưa bắt đầu</option>
            <option value="in-progress">Đang thực hiện</option>
            <option value="in-review">Đang review</option>
            <option value="done">Hoàn thành</option>
            <option value="blocked">Bị chặn</option>
          </select>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(task.priority)}`}>
            {getPriorityText(task.priority)}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTaskTypeColor(task.type)}`}>
            {getTaskTypeText(task.type)}
          </span>
        </div>
      </div>

      {/* Task Stats */}
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
              <p className="text-2xl font-semibold text-gray-900">{calculateProgress(task.actualHours, task.estimatedHours)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Giờ làm</p>
              <p className="text-2xl font-semibold text-gray-900">{task.actualHours || 0}h / {task.estimatedHours || 0}h</p>
            </div>
            <button
              onClick={() => {
                setHoursToLog(task.actualHours || '0');
                setShowLogHoursModal(true);
              }}
              className="ml-auto text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Comments</p>
              <p className="text-2xl font-semibold text-gray-900">{task.comments?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Attachments</p>
              <p className="text-2xl font-semibold text-gray-900">{task.attachmentCount}</p>
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
          {renderContent()}
        </div>
      </div>

      {showLogHoursModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cập nhật giờ làm thực tế</h3>
            <form onSubmit={handleLogHours}>
              <div>
                <label htmlFor="actualHours" className="block text-sm font-medium text-gray-700">
                  Số giờ đã làm
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="actualHours"
                    value={hoursToLog}
                    onChange={(e) => setHoursToLog(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tổng số giờ đã làm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Giờ ước tính ban đầu: {task.estimatedHours || 0}h
                </p>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogHoursModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 