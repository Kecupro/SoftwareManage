import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../components/ToastContainer';

const ROLES = [
  { value: '', label: 'Tất cả' },
  { value: 'admin', label: 'Admin' },
  { value: 'pm', label: 'PM' },
  { value: 'po', label: 'Product Owner' },
  { value: 'ba', label: 'Business Analyst' },
  { value: 'dev', label: 'Developer' },
  { value: 'qa', label: 'Tester' },
  { value: 'devops', label: 'DevOps' },
  { value: 'guest', label: 'Khách' },
];

const STATUS = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'inactive', label: 'Inactive' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({});
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '', role: 'dev' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const inviteLinkRef = useRef();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', role: 'dev', password: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ _id: '', fullName: '', email: '', role: 'dev', status: 'active' });
  const [editLoading, setEditLoading] = useState(false);
  const [editResult, setEditResult] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, role, status, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit,
        search,
        role,
        status,
      });
      const res = await fetch(`/api/users?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch {
      // TODO: handle error
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(inviteForm)
      });
      const data = await res.json();
      if (data.success) {
        setInviteResult({ success: true, link: data.data.inviteLink });
        setInviteForm({ fullName: '', email: '', role: 'dev' });
        fetchUsers();
        showSuccess('Mời thành viên thành công!');
      } else {
        setInviteResult({ success: false, message: data.message });
        showError(data.message || 'Mời thành viên thất bại!');
      }
    } catch {
      setInviteResult({ success: false, message: 'Lỗi server' });
      showError('Lỗi server khi mời thành viên!');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (data.success) {
        setCreateResult({ success: true });
        setCreateForm({ fullName: '', email: '', role: 'dev', password: '' });
        fetchUsers();
        showSuccess('Tạo thành viên thành công!');
      } else {
        setCreateResult({ success: false, message: data.message });
        showError(data.message || 'Tạo thành viên thất bại!');
      }
    } catch {
      setCreateResult({ success: false, message: 'Lỗi server' });
      showError('Lỗi server khi tạo thành viên!');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditForm({
      _id: user._id,
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'dev',
      status: user.status || 'active',
    });
    setEditResult(null);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${editForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setEditResult({ success: true });
        fetchUsers();
        showSuccess('Cập nhật thành viên thành công!');
      } else {
        setEditResult({ success: false, message: data.message });
        showError(data.message || 'Cập nhật thành viên thất bại!');
      }
    } catch {
      setEditResult({ success: false, message: 'Lỗi server' });
      showError('Lỗi server khi cập nhật thành viên!');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    setDeleteResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${confirmDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeleteResult({ success: true });
        fetchUsers();
        showSuccess('Đã xóa thành viên!');
        setTimeout(() => setConfirmDelete(null), 1000);
      } else {
        setDeleteResult({ success: false, message: data.message });
        showError(data.message || 'Xóa thành viên thất bại!');
      }
    } catch {
      setDeleteResult({ success: false, message: 'Lỗi server' });
      showError('Lỗi server khi xóa thành viên!');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý thành viên</h1>
            <p className="mt-1 text-sm text-gray-500">Danh sách user/member trong hệ thống</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md" onClick={() => setShowInviteModal(true)}>Mời thành viên</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md" onClick={() => setShowCreateModal(true)}>Tạo mới</button>
          </div>
        </div>

        {/* Filter/Search */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tên, email, username..."
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              value={role}
              onChange={e => { setRole(e.target.value); setPage(1); }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowInviteModal(false); setInviteResult(null); }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">Mời thành viên mới</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <input type="text" required value={inviteForm.fullName} onChange={e => setInviteForm(f => ({ ...f, fullName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {ROLES.filter(r => r.value).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2" onClick={() => { setShowInviteModal(false); setInviteResult(null); }}>Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md" disabled={inviteLoading}>{inviteLoading ? 'Đang gửi...' : 'Mời'}</button>
                </div>
              </form>
              {inviteResult && (
                <div className={`mt-4 p-3 rounded ${inviteResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {inviteResult.success ? (
                    <div>
                      <div className="mb-2 font-medium">Đã tạo thành viên và sinh link invite:</div>
                      <div className="flex items-center space-x-2">
                        <input ref={inviteLinkRef} readOnly value={inviteResult.link} className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50" />
                        <button type="button" className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs" onClick={() => { inviteLinkRef.current.select(); document.execCommand('copy'); }}>Copy</button>
                      </div>
                    </div>
                  ) : (
                    <div>{inviteResult.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowCreateModal(false); setCreateResult(null); }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">Tạo thành viên mới</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <input type="text" required value={createForm.fullName} onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {ROLES.filter(r => r.value).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input type="password" required value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2" onClick={() => { setShowCreateModal(false); setCreateResult(null); }}>Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={createLoading}>{createLoading ? 'Đang tạo...' : 'Tạo'}</button>
                </div>
              </form>
              {createResult && (
                <div className={`mt-4 p-3 rounded ${createResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {createResult.success ? 'Tạo thành viên thành công!' : createResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowEditModal(false); setEditResult(null); }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-lg font-semibold mb-4">Chỉnh sửa thành viên</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                  <input type="text" required value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {ROLES.filter(r => r.value).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {STATUS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2" onClick={() => { setShowEditModal(false); setEditResult(null); }}>Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={editLoading}>{editLoading ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
              </form>
              {editResult && (
                <div className={`mt-4 p-3 rounded ${editResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {editResult.success ? 'Cập nhật thành viên thành công!' : editResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirm Dialog */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setConfirmDelete(null)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-lg font-semibold mb-4 text-red-700">Xác nhận xóa thành viên</h2>
              <p className="mb-4">Bạn có chắc chắn muốn xóa thành viên <span className="font-semibold">{confirmDelete.fullName}</span> ({confirmDelete.email}) không?</p>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md" onClick={() => setConfirmDelete(null)}>Hủy</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Đang xóa...' : 'Xóa'}</button>
              </div>
              {deleteResult && (
                <div className={`mt-4 p-3 rounded ${deleteResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {deleteResult.success ? 'Đã xóa thành viên!' : deleteResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                      <span className="text-gray-500">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-500">Chưa có thành viên nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td className="px-4 py-2 whitespace-nowrap">{user.fullName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap capitalize">{user.role}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'invited' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{user.status}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditModal(user)}>Sửa</button>
                      <button className="text-red-600 hover:underline" onClick={() => setConfirmDelete(user)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Trước
            </button>
            <span>Trang {pagination?.currentPage || 1} / {pagination?.totalPages || 1}</span>
            <button
              disabled={page === (pagination?.totalPages || 1)}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </>
  );
} 