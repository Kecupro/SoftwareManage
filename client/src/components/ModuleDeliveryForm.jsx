import React, { useState } from 'react';

export default function ModuleDeliveryForm({ module, currentUser, onDelivered }) {
  // Kiểm tra quyền: chỉ assignedTo hoặc devOps mới được giao
  const canDeliver = module && currentUser && (
    (module.assignedTo && module.assignedTo._id === currentUser._id) ||
    (module.devOps && module.devOps._id === currentUser._id)
  );

  const [deliveryCommit, setDeliveryCommit] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!canDeliver) {
    return <div className="text-gray-500 italic">Bạn không có quyền bàn giao module này.</div>;
  }

  const handleFileChange = (e) => {
    setDeliveryFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('deliveryCommit', deliveryCommit);
      formData.append('deliveryNote', deliveryNote);
      deliveryFiles.forEach(file => formData.append('deliveryFiles', file));

      const res = await fetch(`/api/modules/${module._id}/deliver`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg('Bàn giao thành công!');
        setDeliveryCommit('');
        setDeliveryNote('');
        setDeliveryFiles([]);
        if (onDelivered) onDelivered(result.data.module);
      } else {
        setErrorMsg(result.message || 'Lỗi khi bàn giao');
      }
    } catch {
      setErrorMsg('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
      <div>
        <label className="font-medium text-gray-700 mb-1 block">Commit Hash <span className="text-red-500">*</span></label>
        <input type="text" value={deliveryCommit} onChange={e => setDeliveryCommit(e.target.value)} required className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" placeholder="Nhập commit hash..." />
      </div>
      <div>
        <label className="font-medium text-gray-700 mb-1 block">Ghi chú bàn giao</label>
        <textarea value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" placeholder="Ghi chú thêm (nếu có)..." rows={2} />
      </div>
      <div>
        <label className="font-medium text-gray-700 mb-1 block">File bàn giao</label>
        <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-600" />
        {deliveryFiles.length > 0 && (
          <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
            {deliveryFiles.map((file, idx) => <li key={idx}>{file.name}</li>)}
          </ul>
        )}
      </div>
      {errorMsg && <div className="text-red-600 text-sm font-medium">{errorMsg}</div>}
      {successMsg && <div className="text-green-600 text-sm font-medium">{successMsg}</div>}
      <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? 'Đang bàn giao...' : 'Bàn giao'}
      </button>
    </form>
  );
} 