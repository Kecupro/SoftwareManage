import React, { useState } from 'react';

export default function ModuleDeliveryForm({ moduleId, onDelivered }) {
  const [deliveryCommit, setDeliveryCommit] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setDeliveryFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('deliveryCommit', deliveryCommit);
      formData.append('deliveryNote', deliveryNote);
      deliveryFiles.forEach(file => formData.append('deliveryFiles', file));

      const res = await fetch(`/api/modules/${moduleId}/deliver`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        alert('Bàn giao thành công!');
        if (onDelivered) onDelivered(result.data.module);
      } else {
        alert(result.message || 'Lỗi khi bàn giao');
      }
    } catch {
      alert('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Commit Hash bàn giao *</label>
        <input type="text" value={deliveryCommit} onChange={e => setDeliveryCommit(e.target.value)} required className="input w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">Ghi chú bàn giao</label>
        <textarea value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="input w-full" />
      </div>
      <div>
        <label className="block font-medium mb-1">File bàn giao</label>
        <input type="file" multiple onChange={handleFileChange} />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Đang bàn giao...' : 'Bàn giao'}
      </button>
    </form>
  );
} 