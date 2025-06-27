import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

export default function BugDetailPage() {
  const { id } = useParams();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBugDetails();
  }, [id]);

  const fetchBugDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bugs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bug details');
      const data = await res.json();
      if (data.success) setBug(data.data.bug);
    } catch (error) {
      console.error('Error fetching bug details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = { open: 'bg-red-200 text-red-800', 'in-progress': 'bg-blue-200 text-blue-800', testing: 'bg-yellow-200 text-yellow-800', resolved: 'bg-green-200 text-green-800', closed: 'bg-gray-200 text-gray-800', reopened: 'bg-purple-200 text-purple-800' };
    return colors[status] || 'bg-gray-200';
  };
  const getSeverityColor = (severity) => {
    const colors = { low: 'bg-gray-200 text-gray-800', medium: 'bg-yellow-200 text-yellow-800', high: 'bg-orange-200 text-orange-800', critical: 'bg-red-200 text-red-800' };
    return colors[severity] || 'bg-gray-200';
  };
  const getPriorityColor = (priority) => {
    const colors = { low: 'bg-gray-200 text-gray-800', medium: 'bg-blue-200 text-blue-800', high: 'bg-red-200 text-red-800', critical: 'bg-red-400 text-white' };
    return colors[priority] || 'bg-gray-200 text-gray-800';
  };
  const getTypeColor = (type) => {
    const colors = { functional: 'bg-blue-200 text-blue-800', performance: 'bg-orange-200 text-orange-800', security: 'bg-red-200 text-red-800', 'ui-ux': 'bg-purple-200 text-purple-800', compatibility: 'bg-green-200 text-green-800', data: 'bg-yellow-200 text-yellow-800', other: 'bg-gray-200 text-gray-800' };
    return colors[type] || 'bg-gray-200 text-gray-800';
  };
  const getStatusText = (status) => status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  const getSeverityText = (severity) => severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : '';
  const getPriorityText = (priority) => priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '';
  const getTypeText = (type) => type ? type.charAt(0).toUpperCase() + type.slice(1) : '';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>;
  if (!bug) return <div className="text-center py-12"><h2 className="text-2xl font-semibold text-gray-900">Không tìm thấy bug</h2><p className="mt-2 text-gray-600">Bug bạn đang tìm kiếm không tồn tại.</p><Link to="/bugs" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md">Quay lại danh sách</Link></div>;

  const tabs = [
    { id: 'overview', name: 'Tổng quan' },
    { id: 'steps', name: 'Steps to Reproduce' },
    { id: 'environment', name: 'Environment' },
    { id: 'git', name: 'Git Info' },
    { id: 'resolution', name: 'Resolution' },
    { id: 'comments', name: 'Comments' },
    { id: 'attachments', name: 'Attachments' },
    { id: 'history', name: 'Lịch sử' }
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'steps':
        return <div><h3 className="font-semibold mb-2">Steps to Reproduce</h3><ol className="list-decimal ml-6 space-y-1">{bug.details?.stepsToReproduce?.map((step, idx) => <li key={idx}>{step}</li>)}</ol></div>;
      case 'environment':
        return <div><h3 className="font-semibold mb-2">Environment</h3><ul className="space-y-1"><li><b>Browser:</b> {bug.details?.environment?.browser || ''}</li><li><b>OS:</b> {bug.details?.environment?.os || ''}</li><li><b>Device:</b> {bug.details?.environment?.device || ''}</li><li><b>Version:</b> {bug.details?.environment?.version || ''}</li></ul></div>;
      case 'git':
        return <div><h3 className="font-semibold mb-2">Git Info</h3><ul className="space-y-1"><li><b>Branch:</b> {bug.gitInfo?.branch || ''}</li><li><b>Commits:</b> {bug.gitInfo?.commits?.length || 0}</li><li><b>Pull Request:</b> {bug.gitInfo?.pullRequest?.title ? <a href={bug.gitInfo.pullRequest.url} target="_blank" rel="noopener noreferrer">{bug.gitInfo.pullRequest.title}</a> : ''}</li></ul></div>;
      case 'resolution':
        return <div><h3 className="font-semibold mb-2">Resolution</h3><ul className="space-y-1"><li><b>Type:</b> {bug.resolution?.resolutionType || ''}</li><li><b>Notes:</b> {bug.resolution?.resolutionNotes || ''}</li><li><b>Resolved By:</b> {bug.resolution?.resolvedBy?.fullName || ''}</li><li><b>Resolved At:</b> {bug.resolution?.resolvedAt ? new Date(bug.resolution.resolvedAt).toLocaleString() : ''}</li><li><b>Closed By:</b> {bug.resolution?.closedBy?.fullName || ''}</li><li><b>Closed At:</b> {bug.resolution?.closedAt ? new Date(bug.resolution.closedAt).toLocaleString() : ''}</li><li><b>Verified By:</b> {bug.resolution?.verifiedBy?.fullName || ''}</li><li><b>Verified At:</b> {bug.resolution?.verifiedAt ? new Date(bug.resolution.verifiedAt).toLocaleString() : ''}</li></ul></div>;
      case 'comments':
        return <div><h3 className="font-semibold mb-2">Comments</h3><ul className="space-y-2">{bug.comments?.map((c, idx) => <li key={idx}><b>{c.author?.fullName || c.author}:</b> {c.content} <span className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span></li>)}</ul></div>;
      case 'attachments':
        return <div><h3 className="font-semibold mb-2">Attachments</h3><ul className="space-y-2">{bug.details?.attachments?.map((a, idx) => <li key={idx}><a href={a.url} target="_blank" rel="noopener noreferrer">{a.name}</a> <span className="text-xs text-gray-400">{a.type} {a.size || ''}</span></li>)}</ul></div>;
      case 'history':
        return <div className="flow-root"><ul role="list" className="-mb-8">{bug.history?.map((event, idx) => (<li key={event._id || idx}><div className="relative pb-8"><div className="relative flex space-x-3"><div><span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"><svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></span></div><div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4"><div><p className="text-sm text-gray-500">{event.user?.fullName || 'System'} <span className="font-medium text-gray-900">{event.action}</span> {event.note}</p></div><div className="text-right text-sm whitespace-nowrap text-gray-500"><time dateTime={event.time}>{event.time ? new Date(event.time).toLocaleString() : ''}</time></div></div></div></div></li>))}{(!bug.history || bug.history.length === 0) && <p>Không có lịch sử thay đổi.</p>}</ul></div>;
      case 'overview':
      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-semibold">Project:</span> {bug.project?.name}</div>
              <div><span className="font-semibold">Module:</span> {bug.module?.name}</div>
              <div><span className="font-semibold">Sprint:</span> {bug.sprint?.name}</div>
              <div><span className="font-semibold">User Story:</span> {bug.userStory?.title}</div>
              <div><span className="font-semibold">Task:</span> {bug.task?.title}</div>
              <div><span className="font-semibold">Assignee:</span> {bug.assignedTo?.fullName || 'Unassigned'}</div>
              <div><span className="font-semibold">Reporter:</span> {bug.reportedBy?.fullName || 'N/A'}</div>
              <div><span className="font-semibold">Created At:</span> {bug.createdAt ? new Date(bug.createdAt).toLocaleString() : ''}</div>
              <div><span className="font-semibold">Updated At:</span> {bug.updatedAt ? new Date(bug.updatedAt).toLocaleString() : ''}</div>
              <div><span className="font-semibold">Tags:</span> {bug.tags?.join(', ')}</div>
              <div><span className="font-semibold">Notes:</span> {bug.notes}</div>
            </div>
            <div className="mt-4"><span className="font-semibold">Description:</span><div className="whitespace-pre-line bg-gray-50 p-2 rounded mt-1">{bug.description}</div></div>
            <div className="mt-4"><span className="font-semibold">Expected Result:</span><div className="whitespace-pre-line bg-gray-50 p-2 rounded mt-1">{bug.details?.expectedResult}</div></div>
            <div className="mt-4"><span className="font-semibold">Actual Result:</span><div className="whitespace-pre-line bg-gray-50 p-2 rounded mt-1">{bug.details?.actualResult}</div></div>
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
            <Link to="/bugs" className="text-blue-600 hover:text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{bug.title}</h1>
              <p className="text-sm text-gray-500">{bug.code} • {bug.project?.name}</p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 max-w-4xl">{bug.description}</p>
        </div>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(bug.status)}`}>{getStatusText(bug.status)}</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityColor(bug.severity)}`}>{getSeverityText(bug.severity)}</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(bug.priority)}`}>{getPriorityText(bug.priority)}</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(bug.type)}`}>{getTypeText(bug.type)}</span>
        </div>
      </div>
      {/* Bug Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Status</p><p className="text-2xl font-semibold text-gray-900">{getStatusText(bug.status)}</p></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg"><svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Estimated</p><p className="text-2xl font-semibold text-gray-900">{bug.timeTracking?.estimatedTime || 0}h</p></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Actual</p><p className="text-2xl font-semibold text-gray-900">{bug.timeTracking?.actualTime || 0}h</p></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Comments</p><p className="text-2xl font-semibold text-gray-900">{bug.comments?.length || 0}</p></div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{tab.name}</button>
            ))}
          </nav>
        </div>
        <div className="p-6">{renderTab()}</div>
      </div>
    </div>
  );
}
