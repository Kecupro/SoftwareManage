import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BugsPage() {
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    severity: 'medium',
    priority: 'medium',
    type: 'functional',
    browser: '',
    os: '',
    device: '',
    version: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [bugsRes, projectsRes, usersRes] = await Promise.all([
        fetch('/api/bugs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const bugsData = await bugsRes.json();
      const projectsData = await projectsRes.json();
      const usersData = await usersRes.json();
      if (bugsData.success) setBugs(bugsData.data.bugs || []);
      if (projectsData.success) setProjects(projectsData.data.projects || []);
      if (usersData.success) setUsers(usersData.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    if (!newBug.project) {
      alert('Vui lòng chọn một dự án.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const bugToCreate = {
        ...newBug,
        code: `BUG-${Date.now().toString().slice(-6).toUpperCase()}`,
        tags: newBug.tags ? newBug.tags.split(',').map(t => t.trim()) : [],
        details: {
          environment: {
            browser: newBug.browser,
            os: newBug.os,
            device: newBug.device,
            version: newBug.version
          }
        }
      };
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bugToCreate)
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      setShowCreateModal(false);
      setNewBug({
          title: '', description: '', project: '', assignedTo: '', severity: 'medium', priority: 'medium', type: 'functional', browser: '', os: '', device: '', version: '', tags: '', notes: ''
        });
      } else {
        alert('Lỗi khi tạo bug: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating bug:', error);
      alert('Đã xảy ra lỗi nghiêm trọng khi tạo bug.');
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
  const getStatusText = (status) => status.charAt(0).toUpperCase() + status.slice(1);
  const getSeverityText = (severity) => severity.charAt(0).toUpperCase() + severity.slice(1);

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = (bug.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (bug.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
    const matchesProject = projectFilter === 'all' || bug.project?._id === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || bug.assignedTo?._id === assigneeFilter;
    return matchesSearch && matchesStatus && matchesSeverity && matchesProject && matchesAssignee;
  });

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Danh sách Bug</h1>
        <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-base">Báo cáo Bug</button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input type="text" placeholder="Tìm kiếm theo tiêu đề hoặc mã bug..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
            <option value="all">Tất cả dự án</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
            <option value="all">Tất cả người xử lý</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
            </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
             <option value="all">Tất cả trạng thái</option>
             {['open', 'in-progress', 'testing', 'resolved', 'closed', 'reopened'].map(s => <option key={s} value={s}>{getStatusText(s)}</option>)}
            </select>
           <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
             <option value="all">Tất cả mức độ</option>
             {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{getSeverityText(s)}</option>)}
            </select>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tiêu đề</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dự án</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mức độ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Độ ưu tiên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Loại bug</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Người xử lý</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Người báo cáo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Thời gian</th>
              {/* <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Khác</th> */}
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-base">
              {filteredBugs.map((bug) => (
              <tr key={bug._id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link to={`/bugs/${bug._id}`} className="font-medium text-blue-600 hover:text-blue-800 text-base">{bug.title}</Link>
                  <p className="text-xs text-gray-500">{bug.code}</p>
                  </td>
                <td className="px-6 py-3">{bug.project?.name}</td>
                <td className="px-6 py-3"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bug.status)}`}>{getStatusText(bug.status)}</span></td>
                <td className="px-6 py-3"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(bug.severity)}`}>{getSeverityText(bug.severity)}</span></td>
                <td className="px-6 py-3">{bug.priority}</td>
                <td className="px-6 py-3">{bug.type}</td>
                <td className="px-6 py-3">{bug.assignedTo?.fullName || 'Chưa gán'}</td>
                <td className="px-6 py-3">{bug.reportedBy?.fullName || 'N/A'}</td>
                <td className="px-6 py-3">
                  <span title={`Tạo: ${bug.createdAt ? new Date(bug.createdAt).toLocaleDateString('vi-VN') : ''}\nCập nhật: ${bug.updatedAt ? new Date(bug.updatedAt).toLocaleDateString('vi-VN') : ''}\nHoàn thành: ${bug.resolution?.resolvedAt ? new Date(bug.resolution.resolvedAt).toLocaleDateString('vi-VN') : ''}`}>
                    {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString('vi-VN') : ''}
                    {bug.resolution?.resolvedAt && <>
                      <br /><span className="text-green-600 text-xs">✔ {new Date(bug.resolution.resolvedAt).toLocaleDateString('vi-VN')}</span>
                    </>}
                      </span>
                  </td>
                {/* <td className="px-6 py-3">
                  {bug.details?.environment && (
                    <span title={
                      `Trình duyệt: ${bug.details.environment.browser || ''}\nHĐH: ${bug.details.environment.os || ''}\nThiết bị: ${bug.details.environment.device || ''}\nPhiên bản: ${bug.details.environment.version || ''}`
                    }>
                      {bug.details.environment.browser || ''} {bug.details.environment.os ? '• ' + bug.details.environment.os : ''}
                    </span>
                  )}
                  </td>
                <td className="px-6 py-3">
                  {bug.gitInfo?.branch && <span title={`Nhánh: ${bug.gitInfo.branch}`}>{bug.gitInfo.branch}</span>}
                  {bug.gitInfo?.commits?.length > 0 && <span title={bug.gitInfo.commits.map(c => `${c.hash}: ${c.message}`).join('\n')} className="ml-1 text-xs text-blue-600">[{bug.gitInfo.commits.length}c]</span>}
                  {bug.gitInfo?.pullRequest?.title && <a href={bug.gitInfo.pullRequest.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-purple-600" title={bug.gitInfo.pullRequest.title}>PR</a>}
                  </td> */}
                {/* <td className="px-6 py-3">
                  <span title="Bình luận"><svg className="inline w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2h2" /></svg> {bug.comments?.length || 0}</span>
                  <span title="Tệp đính kèm" className="ml-2"><svg className="inline w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586" /></svg> {bug.details?.attachments?.length || 0}</span>
                  {bug.resolution?.resolutionType && <span className="ml-2 text-xs text-green-700" title={bug.resolution.resolutionNotes}>{bug.resolution.resolutionType}</span>}
                  {bug.tags?.length > 0 && <span className="ml-2 text-xs text-gray-500" title={bug.tags.join(', ')}>[tags]</span>}
                  </td> */}
                <td className="px-6 py-3 text-center">
                  <Link to={`/bugs/${bug._id}`} title="Xem chi tiết">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 hover:text-blue-800 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 0a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                      </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-2xl max-h-screen overflow-y-auto p-5 border shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo Bug mới</h3>
            <form onSubmit={handleCreateBug} className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề *</label>
                <input type="text" placeholder="Nhập tiêu đề bug" value={newBug.title} onChange={e => setNewBug({...newBug, title: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
                </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả *</label>
                <textarea placeholder="Mô tả chi tiết bug" value={newBug.description} onChange={e => setNewBug({...newBug, description: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
                </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dự án *</label>
                <select required value={newBug.project} onChange={e => setNewBug({...newBug, project: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
                      <option value="">Chọn dự án</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Người xử lý</label>
                <select value={newBug.assignedTo} onChange={e => setNewBug({...newBug, assignedTo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
                  <option value="">Chưa gán</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.fullName}</option>)}
                </select>
                  </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mức độ nghiêm trọng</label>
                  <select value={newBug.severity} onChange={e => setNewBug({...newBug, severity: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
                    <option value="medium">Trung bình</option>
                      <option value="low">Thấp</option>
                      <option value="high">Cao</option>
                      <option value="critical">Nghiêm trọng</option>
                    </select>
                  </div>
                  <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Độ ưu tiên</label>
                  <select value={newBug.priority} onChange={e => setNewBug({...newBug, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
                    <option value="medium">Trung bình</option>
                      <option value="low">Thấp</option>
                      <option value="high">Cao</option>
                    <option value="critical">Khẩn cấp</option>
                    </select>
                  </div>
                  <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Loại bug</label>
                  <select value={newBug.type} onChange={e => setNewBug({...newBug, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-base">
                    <option value="functional">Chức năng</option>
                    <option value="performance">Hiệu năng</option>
                    <option value="security">Bảo mật</option>
                    <option value="ui-ux">Giao diện/UX</option>
                    <option value="compatibility">Tương thích</option>
                    <option value="data">Dữ liệu</option>
                    <option value="other">Khác</option>
                    </select>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trình duyệt</label>
                  <input type="text" placeholder="Chrome, Firefox..." value={newBug.browser} onChange={e => setNewBug({...newBug, browser: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hệ điều hành</label>
                  <input type="text" placeholder="Windows, macOS..." value={newBug.os} onChange={e => setNewBug({...newBug, os: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Thiết bị</label>
                  <input type="text" placeholder="PC, iPhone..." value={newBug.device} onChange={e => setNewBug({...newBug, device: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phiên bản</label>
                  <input type="text" placeholder="v.v..." value={newBug.version} onChange={e => setNewBug({...newBug, version: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (phân cách bởi dấu phẩy)</label>
                <input type="text" placeholder="bug, urgent, ui..." value={newBug.tags} onChange={e => setNewBug({...newBug, tags: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                <textarea placeholder="Ghi chú thêm..." value={newBug.notes} onChange={e => setNewBug({...newBug, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 text-base" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-md border font-semibold">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold">Tạo mới</button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
} 
