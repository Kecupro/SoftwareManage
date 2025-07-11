import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import PartnerDeliveryForm from './PartnerDeliveryForm';
import { EnvelopeIcon, UserIcon, UserGroupIcon, CheckBadgeIcon, Cog6ToothIcon, DocumentTextIcon, ClockIcon, CodeBracketIcon, LinkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// AccordionSection: Section có thể thu gọn/mở rộng
function AccordionSection({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-md mb-4">
      <button
        className="w-full flex items-center justify-between p-4 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center text-lg font-semibold text-primary-700">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </span>
        <span className={`transform transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
}

function StatusBadge({ status, deliveryStatus }) {
  let color = 'bg-gray-200 text-gray-700';
  let text = status;
  if (status === 'completed') {
    color = 'bg-green-100 text-green-700'; text = 'Hoàn thành';
  } else if (status === 'in-progress') {
    color = 'bg-blue-100 text-blue-700'; text = 'Đang thực hiện';
  } else if (status === 'delivered') {
    color = 'bg-indigo-100 text-indigo-700'; text = 'Đã bàn giao';
  } else if (status === 'cancelled') {
    color = 'bg-red-100 text-red-700'; text = 'Đã hủy';
  } else if (status === 'active') {
    color = 'bg-yellow-100 text-yellow-700'; text = 'Đang hoạt động';
  }
  if (deliveryStatus === 'pending') {
    color = 'bg-yellow-100 text-yellow-700'; text = 'Chờ phê duyệt';
  } else if (deliveryStatus === 'accepted') {
    color = 'bg-green-100 text-green-700'; text = 'Đã duyệt bàn giao';
  } else if (deliveryStatus === 'rejected') {
    color = 'bg-red-100 text-red-700'; text = 'Từ chối bàn giao';
  }
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
}

function PriorityBadge({ priority }) {
  let color = 'bg-gray-100 text-gray-700';
  let text = 'Thường';
  if (priority === 'high') { color = 'bg-red-100 text-red-700'; text = 'Cao'; }
  else if (priority === 'medium') { color = 'bg-blue-100 text-blue-700'; text = 'Trung bình'; }
  else if (priority === 'low') { color = 'bg-gray-100 text-gray-700'; text = 'Thấp'; }
  return <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color}`}>{text}</span>;
}

function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
    </div>
  );
}

function AvatarGroup({ people }) {
  const iconMap = [
    <UserIcon className="w-4 h-4 text-gray-400" />, // Developer
    <UserGroupIcon className="w-4 h-4 text-gray-400" />, // QA
    <CheckBadgeIcon className="w-4 h-4 text-gray-400" />, // Reviewer
    <Cog6ToothIcon className="w-4 h-4 text-gray-400" /> // DevOps
  ];
  return (
    <div className="flex flex-wrap gap-4">
      {people.map((p, idx) => (
        <div key={idx} className="flex flex-col items-center text-center min-w-[80px]">
          <div className="relative">
            {p.user?.avatar ? (
              <img src={p.user.avatar} alt={p.user.name} className="w-10 h-10 rounded-full border mb-1" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-1">
                {iconMap[idx]}
              </div>
            )}
            {p.user?.email && (
              <span title={p.user.email} className="absolute -bottom-2 right-0 bg-white rounded-full shadow p-1 cursor-pointer">
                <a href={`mailto:${p.user.email}`}><EnvelopeIcon className="w-4 h-4 text-blue-500" /></a>
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-gray-900 truncate max-w-[80px]">{p.user?.name || <span className="text-gray-400">Chưa phân công</span>}</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center">{iconMap[idx]}<span className="ml-1">{p.label}</span></div>
        </div>
      ))}
    </div>
  );
}

function CompactTimeline({ history }) {
  const getColor = (type) => {
    switch (type) {
      case 'delivered': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };
  return (
    <ul className="relative border-l-2 border-primary-200 pl-4">
      {history.slice(-5).map((item, idx) => (
        <li key={idx} className="mb-4 group relative">
          <span className={`absolute -left-3 top-1 w-3 h-3 rounded-full ${getColor(item.actionType)}`}></span>
          <div className="text-xs text-gray-700 truncate">
            <span className="font-semibold">{item.user.name}</span> - {item.action}
            <span className="ml-2 text-gray-400">{new Date(item.date).toLocaleDateString('vi-VN')}</span>
            {item.note && (
              <span className="ml-2 text-gray-400 cursor-pointer group-hover:underline" title={item.note}>ⓘ</span>
            )}
          </div>
        </li>
      ))}
      {history.length > 5 && (
        <li className="text-xs text-blue-500 cursor-pointer hover:underline" title="Xem tất cả lịch sử">...</li>
      )}
    </ul>
  );
}

export default function PartnerModuleDetail({ module, project, currentUser, onDeliverySuccess }) {
  const { showSuccess } = useNotifications();
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState('');

  const demoModule = {
    _id: 'mod1',
    name: 'Module Demo 1',
    code: 'MD01',
    status: 'completed',
    deliveryStatus: 'accepted',
    assignedTo: { fullName: 'Dev Demo' },
    qa: { fullName: 'QA Demo' },
    reviewer: { fullName: 'Reviewer Demo' },
    deliveredBy: { fullName: 'DevOps Demo' }
  };
  const moduleData = module || demoModule;

  // Quyền giao module
  const canDeliver = moduleData && currentUser && (
    (moduleData.assignedTo && moduleData.assignedTo._id === currentUser._id) ||
    (moduleData.devOps && moduleData.devOps._id === currentUser._id)
  );
  // Quyền duyệt bàn giao
  const canApprove = moduleData && currentUser &&
    moduleData.deliveryStatus === 'pending' &&
    ((moduleData.reviewer && moduleData.reviewer._id === currentUser._id) ||
     (moduleData.qa && moduleData.qa._id === currentUser._id));

  // Quyền cập nhật trạng thái
  const canUpdateStatus = moduleData && currentUser && (
    (moduleData.assignedTo && moduleData.assignedTo._id === currentUser._id) ||
    (moduleData.devOps && moduleData.devOps._id === currentUser._id)
  );

  const handleDeliverySuccess = () => {
    setShowDeliveryForm(false);
    if (onDeliverySuccess) {
      onDeliverySuccess();
    }
    showSuccess('Bàn giao module thành công!');
  };

  // Duyệt bàn giao
  const handleApprove = async (status) => {
    setApproveLoading(true);
    setApproveError('');
    try {
      const res = await fetch(`/api/modules/${moduleData._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, note: approveNote })
      });
      const result = await res.json();
      if (result.success) {
        setShowApproveForm(false);
        showSuccess('Cập nhật trạng thái bàn giao thành công!');
        if (onDeliverySuccess) onDeliverySuccess();
      } else {
        setApproveError(result.message || 'Lỗi khi duyệt bàn giao');
      }
    } catch {
      setApproveError('Lỗi kết nối server');
    } finally {
      setApproveLoading(false);
    }
  };

  // Người phụ trách
  const people = [
    { label: 'Developer', user: moduleData.assignedTo },
    { label: 'QA', user: moduleData.qa },
    { label: 'Reviewer', user: moduleData.reviewer },
    { label: 'DevOps/Bàn giao', user: moduleData.deliveredBy }
  ];

  if (showDeliveryForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDeliveryForm(false)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h2 className="text-lg font-medium text-gray-900">
              Bàn giao Module: {moduleData.name}
            </h2>
          </div>
        </div>
        
        <PartnerDeliveryForm
          module={moduleData}
          project={project}
          onSuccess={handleDeliverySuccess}
          onCancel={() => setShowDeliveryForm(false)}
        />
      </div>
    );
  }

  if (showApproveForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowApproveForm(false)} className="flex items-center text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h2 className="text-lg font-medium text-gray-900">Duyệt bàn giao Module: {moduleData.name}</h2>
        </div>
        <div>
          <label className="font-medium text-gray-700 mb-1 block">Ghi chú duyệt</label>
          <textarea value={approveNote} onChange={e => setApproveNote(e.target.value)} className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" placeholder="Ghi chú thêm (nếu có)..." rows={2} />
        </div>
        {approveError && <div className="text-red-600 text-sm font-medium">{approveError}</div>}
        <div className="flex gap-2">
          <button disabled={approveLoading} onClick={() => handleApprove('accepted')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60">Duyệt bàn giao</button>
          <button disabled={approveLoading} onClick={() => handleApprove('rejected')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60">Từ chối</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Section 1: Tổng quan module */}
      <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Tổng quan module</h2>
          <div className="mb-2"><span className="font-medium">Tên module:</span> {moduleData.name}</div>
          <div className="mb-2"><span className="font-medium">Mã:</span> {moduleData.code}</div>
          <div className="mb-2"><span className="font-medium">Mô tả:</span> {moduleData.description || <span className='text-gray-400'>Chưa có mô tả</span>}</div>
          <div className="mb-2 flex items-center gap-2"><span className="font-medium">Trạng thái:</span> <StatusBadge status={moduleData.status} deliveryStatus={moduleData.deliveryStatus} /></div>
          <div className="mb-2 flex items-center gap-2"><span className="font-medium">Độ ưu tiên:</span> <PriorityBadge priority={moduleData.priority} /></div>
          <div className="mb-2"><span className="font-medium">Deadline:</span> {moduleData.deadline ? new Date(moduleData.deadline).toLocaleDateString('vi-VN') : 'N/A'}</div>
          <div className="mb-2"><span className="font-medium">Ước tính:</span> {moduleData.estimatedHours || 'N/A'} giờ</div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><UserGroupIcon className="w-5 h-5" /> Người phụ trách</h2>
          <AvatarGroup people={people} />
        </div>
      </div>

      {/* Section 2: Tiến độ, traceability, action */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-medium">Tiến độ:</span>
          <ProgressBar percent={moduleData.progress || 0} />
          <span className="ml-2 text-blue-700 font-semibold">{moduleData.progress || 0}%</span>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <div><span className="font-medium">Jira:</span> {moduleData.traceability?.jiraTicket || <span className="text-gray-400">N/A</span>}</div>
          <div><span className="font-medium">GitLab MR:</span> {moduleData.traceability?.gitlabMr || <span className="text-gray-400">N/A</span>}</div>
          <div><span className="font-medium">SonarQube:</span> {moduleData.traceability?.sonarQubeStatus || <span className="text-gray-400">N/A</span>}</div>
          <div><span className="font-medium">Jenkins:</span> {moduleData.traceability?.jenkinsBuild || <span className="text-gray-400">N/A</span>}</div>
        </div>
        {/* Nút hành động theo quyền */}
        <div className="flex gap-2 mt-2">
          {canDeliver && moduleData.deliveryStatus !== 'accepted' && (
            <button onClick={() => setShowDeliveryForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Bàn giao module</button>
          )}
          {canApprove && (
            <button onClick={() => setShowApproveForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Duyệt bàn giao</button>
          )}
          {canUpdateStatus && (
            <span className="text-xs text-gray-400">(Bạn có quyền cập nhật trạng thái module)</span>
          )}
        </div>
      </div>

      {/* Section 3: Thông tin bàn giao */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">Thông tin bàn giao</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2"><span className="font-medium">Commit Hash:</span> {moduleData.gitCommitHash ? <a href={`https://gitlab.viettel.com.vn/${project.code}/-/commit/${moduleData.gitCommitHash}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{moduleData.gitCommitHash.substring(0, 8)}</a> : 'N/A'}</div>
            <div className="mb-2"><span className="font-medium">Thời gian bàn giao:</span> {moduleData.deliveryTime ? new Date(moduleData.deliveryTime).toLocaleString('vi-VN') : 'N/A'}</div>
            <div className="mb-2"><span className="font-medium">Ghi chú:</span> {moduleData.deliveryNote || 'N/A'}</div>
            <div className="mb-2"><span className="font-medium">Người bàn giao:</span> {moduleData.deliveredBy?.name || moduleData.deliveredBy?.fullName || 'N/A'}</div>
          </div>
          <div>
            <div className="mb-2"><span className="font-medium">File bàn giao:</span>
              <ul className="list-disc ml-5">
                {(moduleData.deliveryFiles || []).map((file, idx) => (
                  <li key={idx}>
                    <a href={`/${file.path?.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {file.originalname || file.name || file.path}
                    </a>
                  </li>
                ))}
                {(!moduleData.deliveryFiles || moduleData.deliveryFiles.length === 0) && <li className="text-gray-400">Không có file</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Truy vết & liên kết */}
      <div className="bg-white rounded-xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" />
            <span className="font-medium">JIRA:</span>
            <a href={`https://jira.viettel.com.vn/browse/${moduleData.jiraId}`} className="text-blue-600 hover:underline text-xs" target="_blank" rel="noopener noreferrer">{moduleData.jiraId || 'N/A'}</a>
          </div>
          <div className="mb-2 flex items-center gap-2"><CodeBracketIcon className="w-4 h-4" />
            <span className="font-medium">Branch:</span>
            <span className="font-medium text-xs">{moduleData.gitBranch || 'develop'}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">Pull Request:</span>
            <a href={`https://gitlab.viettel.com.vn/${project.code}/-/merge_requests/${moduleData.pullRequestId}`} className="text-blue-600 hover:underline text-xs" target="_blank" rel="noopener noreferrer">{moduleData.pullRequestId ? `#${moduleData.pullRequestId}` : 'N/A'}</a>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">Build:</span>
            <span className={`font-medium text-xs ${moduleData.buildStatus === 'success' ? 'text-green-600' : moduleData.buildStatus === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>{moduleData.buildStatus || 'N/A'}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">Deploy:</span>
            <span className={`font-medium text-xs ${moduleData.deployStatus === 'success' ? 'text-green-600' : moduleData.deployStatus === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>{moduleData.deployStatus || 'N/A'}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">SonarQube:</span>
            <span className={`font-medium text-xs ${moduleData.sonarStatus === 'passed' ? 'text-green-600' : moduleData.sonarStatus === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>{moduleData.sonarStatus || 'N/A'}</span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">Test:</span>
            <span className={`font-medium text-xs ${moduleData.testStatus === 'passed' ? 'text-green-600' : moduleData.testStatus === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>{moduleData.testStatus || 'Chưa test'}</span>
          </div>
        </div>
      </div>

      {/* Section 5: Lịch sử thao tác */}
      {moduleData.statusHistory && moduleData.statusHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Lịch sử thao tác</h3>
          <CompactTimeline history={moduleData.statusHistory} />
        </div>
      )}
    </div>
  );
} 