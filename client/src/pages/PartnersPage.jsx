import React, { useEffect, useState } from 'react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    code: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    businessType: '',
    contractDate: '',
    status: '',
    note: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/partners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPartners(data.data.partners || data.data || []);
      } else {
        setError(data.message || 'Không lấy được danh sách đối tác');
      }
    } catch {
      setError('Lỗi khi lấy danh sách đối tác');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newPartner.name,
          code: newPartner.code,
          description: newPartner.description,
          contact: { primaryContact: { name: newPartner.contactName, email: newPartner.contactEmail, phone: newPartner.contactPhone } },
          business: { type: newPartner.businessType },
          contractDate: newPartner.contractDate,
          status: newPartner.status,
          note: newPartner.note
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewPartner({ name: '', code: '', description: '', contactName: '', contactEmail: '', contactPhone: '', businessType: '', contractDate: '', status: '', note: '' });
        fetchPartners();
        alert('Thêm đối tác thành công!');
      } else {
        alert('Lỗi khi thêm đối tác: ' + (data.message || '')); 
      }
    } catch {
      alert('Lỗi nghiêm trọng khi thêm đối tác.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Đang tải danh sách đối tác...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div className="max-w-7xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4"> 
        <div> 
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách Đối tác</h1>
          <p className="mt-1 text-sm text-gray-500">Danh sách đối tác đã ký hợp đồng với công ty</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          onClick={() => setShowCreateModal(true)}
        >
          Thêm đối tác
        </button>
      </div>
      {partners.length === 0 ? (
        <div>Chưa có đối tác nào.</div>
      ) : (
        <div className="overflow-x-auto mt-4 bg-white p-4 rounded-lg shadow">
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Tên đối tác</th>
                <th className="px-4 py-2 border-b">Mã</th>
                <th className="px-4 py-2 border-b">Mô tả</th>
                <th className="px-4 py-2 border-b">Người liên hệ</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">SĐT</th>
                <th className="px-4 py-2 border-b">Loại hình</th>
                <th className="px-4 py-2 border-b">Ngày ký HĐ</th>
                <th className="px-4 py-2 border-b">Trạng thái</th>
                <th className="px-4 py-2 border-b">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b font-medium">{partner.name}</td>
                  <td className="px-4 py-2 border-b">{partner.code}</td>
                  <td className="px-4 py-2 border-b">{partner.description}</td>
                  <td className="px-4 py-2 border-b">{partner.contact?.primaryContact?.name || ''}</td>
                  <td className="px-4 py-2 border-b">{partner.contact?.primaryContact?.email || ''}</td>
                  <td className="px-4 py-2 border-b">{partner.contact?.primaryContact?.phone || ''}</td>
                  <td className="px-4 py-2 border-b">{partner.business?.type || ''}</td>
                  <td className="px-4 py-2 border-b">{formatDate(partner.contractDate)}</td>
                  <td className="px-4 py-2 border-b">{partner.status}</td>
                  <td className="px-4 py-2 border-b">{partner.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="relative w-full max-w-2xl max-h-screen overflow-y-auto p-5 border shadow-lg rounded-md bg-white">
            <h2 className="text-lg font-semibold mb-4">Thêm đối tác mới</h2>
            <form onSubmit={handleCreatePartner} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tên đối tác *</label>
                <input type="text" required className="w-full border px-3 py-2 rounded" value={newPartner.name} onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã *</label>
                <input type="text" required className="w-full border px-3 py-2 rounded" value={newPartner.code} onChange={e => setNewPartner({ ...newPartner, code: e.target.value.replace(/[^A-Z0-9_]/g, '').toUpperCase() })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea className="w-full border px-3 py-2 rounded" value={newPartner.description} onChange={e => setNewPartner({ ...newPartner, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Người liên hệ</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={newPartner.contactName} onChange={e => setNewPartner({ ...newPartner, contactName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border px-3 py-2 rounded" value={newPartner.contactEmail} onChange={e => setNewPartner({ ...newPartner, contactEmail: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SĐT</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={newPartner.contactPhone} onChange={e => setNewPartner({ ...newPartner, contactPhone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Loại hình *</label>
                <select className="w-full border px-3 py-2 rounded" value={newPartner.businessType} onChange={e => setNewPartner({ ...newPartner, businessType: e.target.value })} required>
                  <option value="">Chọn loại hình</option>
                  <option value="startup">Startup</option>
                  <option value="sme">SME</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="government">Government</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày ký HĐ</label>
                <input type="date" className="w-full border px-3 py-2 rounded" value={newPartner.contractDate} onChange={e => setNewPartner({ ...newPartner, contractDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <input type="text" className="w-full border px-3 py-2 rounded" value={newPartner.status} onChange={e => setNewPartner({ ...newPartner, status: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea className="w-full border px-3 py-2 rounded" value={newPartner.note} onChange={e => setNewPartner({ ...newPartner, note: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" onClick={() => setShowCreateModal(false)} disabled={creating}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={creating}>{creating ? 'Đang lưu...' : 'Thêm đối tác'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 