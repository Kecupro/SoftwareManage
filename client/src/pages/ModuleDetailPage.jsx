import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import ModuleDeliveryForm from '../components/ModuleDeliveryForm';

const statusTextMap = {
  todo: 'Chưa bắt đầu',
  'in-progress': 'Đang thực hiện',
  'in-review': 'Đang review',
  done: 'Hoàn thành',
  blocked: 'Bị chặn'
};

const getStatusTextDisplay = (status) => statusTextMap[status] || status;

export default function ModuleDetailPage() {
  const { id } = useParams();
  const location = useLocation();

  const [data, setData] = useState(null); // Sẽ chứa module hoặc module request
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Xác định xem trang này đang hiển thị Module hay ModuleRequest
  const isRequestPage = location.pathname.includes('/module-requests/');

  useEffect(() => {
    fetchDetails();
  }, [id, isRequestPage]);

  const fetchDetails = async () => {
    setLoading(true);
    // Chọn đúng API endpoint dựa vào loại trang
    const apiUrl = isRequestPage ? `/api/module-requests/${id}` : `/api/modules/${id}`;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch details');
      }

      const result = await res.json();
      const fetchedData = isRequestPage ? result.data.request : result.data.module;
      
      // Đảm bảo history là một mảng
      if (fetchedData && !Array.isArray(fetchedData.history)) {
          fetchedData.history = [];
      }
      setData(fetchedData);
      
      if (!isRequestPage) {
        setTasks(result.data.tasks || []);
      }

    } catch (error) {
      console.error('Error fetching details:', error);
      setData(null); // Reset data on error
    } finally {
      setLoading(false);
    }
  };

  const moduleProgress = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { totalEstimated: 0, totalActual: 0, progress: 0 };
    }
    const totalEstimated = tasks.reduce((acc, task) => acc + (task.estimatedHours || 0), 0);
    const totalActual = tasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);
    const progress = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;
    return { totalEstimated, totalActual, progress };
  }, [tasks]);

  // Các hàm approve/reject chỉ dành cho trang request
  const handleApproveRequest = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/module-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reviewNote: 'Approved' }) // Có thể thêm form để nhập note
      });
      if (!res.ok) throw new Error('Phê duyệt thất bại');
      await fetchDetails();
    } catch (err){
      setErrorMsg(err.message || 'Phê duyệt thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!rejectNote.trim()) {
      setErrorMsg('Vui lòng nhập lý do từ chối');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/module-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reviewNote: rejectNote })
      });
      if (!res.ok) throw new Error('Từ chối thất bại');
      setShowRejectInput(false);
      setRejectNote('');
      await fetchDetails();
    } catch(err) {
      setErrorMsg(err.message || 'Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-yellow-100 text-yellow-800',
      'in-development': 'bg-blue-100 text-blue-800',
      testing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
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

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    return texts[priority] || priority;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy dữ liệu</h2>
        <p className="mt-2 text-gray-600">
          {isRequestPage ? 'Yêu cầu module' : 'Module'} bạn đang tìm kiếm không tồn tại.
        </p>
        <Link to={isRequestPage ? "/module-requests" : "/modules"} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">
          Quay lại danh sách
        </Link>
      </div>
    );
  }
  
  const item = data; // Đổi tên để dễ sử dụng bên dưới

  const canBeActioned = isRequestPage && item.status === 'pending';

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    // Nếu là trang request chỉ cho phép tab lịch sử
    ...(!isRequestPage ? [
      { id: 'team', name: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
      { id: 'tasks', name: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { id: 'bugs', name: 'Bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
      { id: 'testing', name: 'Testing', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { id: 'documents', name: 'Tài liệu', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
    ] : []),
    { id: 'history', name: 'Lịch sử', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Thông tin riêng cho Module Request */}
            {isRequestPage && (
              <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div>
                  <strong>Ngày bắt đầu mong muốn:</strong>{' '}
                  {item.timeline?.requestedStartDate ? new Date(item.timeline.requestedStartDate).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
                <div>
                  <strong>Ngày hoàn thành mong muốn:</strong>{' '}
                  {item.timeline?.requestedEndDate ? new Date(item.timeline.requestedEndDate).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
                <div>
                  <strong>Yêu cầu kỹ thuật:</strong> {item.requirements?.technical || 'N/A'}
                </div>
                <div>
                  <strong>Yêu cầu nghiệp vụ:</strong> {item.requirements?.business || 'N/A'}
                </div>
                <div>
                  <strong>Số giờ ước tính:</strong> {item.estimatedHours || 'N/A'}
                </div>
                <div>
                  <strong>File đính kèm:</strong>
                  <ul>
                    {(item.attachments || []).map((file, idx) => (
                      <li key={idx}>
                        <a href={`/${file.path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                          {file.originalname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {/* Form bàn giao module thực tế */}
            {!isRequestPage && item.status === 'completed' && (
              <div className="my-6">
                <h3 className="text-lg font-medium mb-2">Bàn giao module</h3>
                <ModuleDeliveryForm moduleId={item._id} onDelivered={fetchDetails} />
              </div>
            )}
            {/* Hiển thị thông tin bàn giao nếu đã có */}
            {!isRequestPage && item.delivery && item.delivery.deliveryTime && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
                <div><strong>Commit Hash:</strong> {item.delivery.deliveryCommit}</div>
                <div><strong>Thời gian bàn giao:</strong> {new Date(item.delivery.deliveryTime).toLocaleString('vi-VN')}</div>
                <div><strong>Ghi chú:</strong> {item.delivery.deliveryNote}</div>
                <div><strong>Người bàn giao:</strong> {item.delivery.deliveredBy?.fullName || 'N/A'}</div>
                <div>
                  <strong>File bàn giao:</strong>
                  <ul>
                    {(item.delivery.deliveryFiles || []).map((file, idx) => (
                      <li key={idx}>
                        <a href={`/${file.path.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">
                          {file.originalname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {/* Phần còn lại giữ nguyên, nhưng chỉ render nếu không phải trang request */}
            {!isRequestPage && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin module</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                        <dd className="text-sm text-gray-900">{item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ngày kết thúc</dt>
                        <dd className="text-sm text-gray-900">{item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tiến độ (Giờ làm)</dt>
                        <dd className="text-sm text-gray-900">
                          {moduleProgress.totalActual}h / {moduleProgress.totalEstimated}h
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Module Manager</dt>
                        <dd className="text-sm text-gray-900">{item.manager?.fullName || 'Chưa gán'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                        <dd className="text-sm text-gray-900">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê chi tiết</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Tiến độ tổng</span>
                          <span>{moduleProgress.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${moduleProgress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Số tasks</span>
                          <span>{tasks.length}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Bugs</span>
                          <span>{item.bugCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-6">Mô tả</h3>
                <p className="text-sm text-gray-600">
                  {item.description || 'Chưa có mô tả chi tiết cho module này.'}
                </p>

                {/* Thông tin bàn giao và truy vết */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin bàn giao</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phiên bản</dt>
                      <dd className="text-sm text-gray-900">{item.version?.current || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Commit Hash bàn giao</dt>
                      <dd className="text-sm text-gray-900">{item.deliveryCommit}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Thời gian bàn giao</dt>
                      <dd className="text-sm text-gray-900">{item.deliveryTime && new Date(item.deliveryTime).toLocaleString('vi-VN')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ghi chú bàn giao</dt>
                      <dd className="text-sm text-gray-900">{item.deliveryNote}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Người bàn giao</dt>
                      <dd className="text-sm text-gray-900">{item.deliveredBy?.fullName || item.deliveredBy}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">File bàn giao</dt>
                      <dd className="text-sm text-gray-900">
                        <ul>
                          {item.deliveryFiles?.map((f, idx) => (
                            <li key={idx}><a href={f} target="_blank" rel="noopener noreferrer">{f}</a></li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
            {/* Lịch sử thao tác vẫn hiển thị cho cả hai loại */}
            {item.history && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Lịch sử thao tác</h3>
                <ul className="space-y-2">
                  {item.history.map((h, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {h.time && new Date(h.time).toLocaleString('vi-VN')} - {h.user?.fullName || h.user} - {h.action} - {h.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'team':
        if (isRequestPage) return null;
        // ... existing code ...
        break;
      case 'tasks':
        if (isRequestPage) return null;
        // ... existing code ...
        break;
      case 'bugs':
        if (isRequestPage) return null;
        // ... existing code ...
        break;
      case 'testing':
        if (isRequestPage) return null;
        // ... existing code ...
        break;
      case 'documents':
        if (isRequestPage) return null;
        // ... existing code ...
        break;
      case 'history':
        return (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {item.history && item.history.length > 0 ? (
                item.history.map((event, eventIdx) => (
                <li key={event._id || eventIdx}>
                  <div className="relative pb-8">
                    {eventIdx !== item.history.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                          {/* Icon can be improved later */}
                          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {event.action} by <span className="font-medium text-gray-900">{event.user?.username || 'System'}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={event.time}>{new Date(event.time).toLocaleString()}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
              ) : (
                <li className="text-gray-500">Chưa có lịch sử thao tác</li>
              )}
            </ul>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <Link to="/modules" className="text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{item.name}</h1>
              <p className="text-sm text-gray-500">{item.code}</p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 max-w-3xl">{item.description}</p>
          <p className="mt-1 text-sm text-gray-500">Dự án: {item.project?.name}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(item.status)}`}>
            {getStatusTextDisplay(item.status)}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(item.priority)}`}>
            {getPriorityText(item.priority)}
          </span>
        </div>
      </div>

      {/* Module Stats - Chỉ hiển thị cho module thực tế, không hiển thị cho module request */}
      {!isRequestPage && (
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
                <p className="text-2xl font-semibold text-gray-900">{item.progress}%</p>
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
                <p className="text-2xl font-semibold text-gray-900">{item.actualHours}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Test Pass Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{item.testPassRate}%</p>
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
                <p className="text-2xl font-semibold text-gray-900">{item.bugs}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons cho trang Request */}
      {canBeActioned && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 2.98-1.742 2.98H4.42c-1.532 0-2.492-1.646-1.742-2.98l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-yellow-700">Yêu cầu này đang chờ được xem xét.</p>
                    <div className="mt-3 md:mt-0 md:ml-6 flex space-x-4">
                        <button
                          onClick={handleApproveRequest}
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
                        </button>
                        <button
                          onClick={() => setShowRejectInput(true)}
                          disabled={actionLoading}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                    </div>
                </div>
            </div>
             {showRejectInput && (
              <div className="mt-4">
                  <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Nhập lý do từ chối..."
                      className="w-full p-2 border rounded-md"
                      rows="2"
                  ></textarea>
                  <div className="mt-2 flex justify-end space-x-2">
                      <button onClick={() => setShowRejectInput(false)} className="text-sm text-gray-600">Hủy</button>
                      <button onClick={handleRejectRequest} className="text-sm text-white bg-red-600 px-3 py-1 rounded-md">Xác nhận Từ chối</button>
                  </div>
              </div>
            )}
            {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
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
    </div>
  );
} 