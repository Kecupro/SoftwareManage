import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserStoriesPage() {
  const [userStories, setUserStories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sprintFilter, setSprintFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    acceptanceCriteria: '',
    projectId: '',
    sprintId: '',
    priority: 'medium',
    storyPoints: '',
    assignee: '',
    epic: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Lấy user stories
      const resStories = await fetch('/api/user-stories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataStories = await resStories.json();
      setUserStories(dataStories.data.userStories);

      // Lấy projects
      const resProjects = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProjects = await resProjects.json();
      setProjects(dataProjects.data.projects);

      // Lấy sprints
      const resSprints = await fetch('/api/sprints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataSprints = await resSprints.json();
      setSprints(dataSprints.data.sprints);

      // Lấy users
      const resUsers = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataUsers = await resUsers.json();
      setUsers(dataUsers.data.users);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Tạo object dữ liệu để gửi
      const storyData = {
        title: newStory.title,
        description: newStory.description,
        acceptanceCriteria: newStory.acceptanceCriteria,
        project: newStory.projectId,
        sprint: newStory.sprintId,
        priority: newStory.priority,
        storyPoints: newStory.storyPoints,
        epic: newStory.epic
      };
      
      // Chỉ thêm assignee nếu có giá trị
      if (newStory.assignee && newStory.assignee.trim() !== '') {
        storyData.assignee = newStory.assignee;
      }
      
      const res = await fetch('/api/user-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storyData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Tạo user story thất bại');
      }
      
      const data = await res.json();
      setShowCreateModal(false);
      setNewStory({
        title: '',
        description: '',
        acceptanceCriteria: '',
        projectId: '',
        sprintId: '',
        priority: 'medium',
        storyPoints: '',
        assignee: '',
        epic: ''
      });
      fetchData();
      
      // Chuyển hướng đến trang chi tiết user story vừa tạo
      if (data.data && data.data.userStory && data.data.userStory._id) {
        navigate(`/user-stories/${data.data.userStory._id}`);
      }
    } catch (error) {
      console.error('Error creating user story:', error);
      alert('Lỗi: ' + error.message);
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

  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const filteredUserStories = userStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (story.epic && story.epic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || story.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || story.projectId === projectFilter;
    const matchesSprint = sprintFilter === 'all' || story.sprintId === sprintFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesSprint;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý User Stories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý và theo dõi các user stories trong dự án
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo user story
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo title hoặc epic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="all" value="all">Tất cả</option>
              <option key="backlog" value="backlog">Backlog</option>
              <option key="sprint-backlog" value="sprint-backlog">Sprint Backlog</option>
              <option key="in-progress" value="in-progress">Đang thực hiện</option>
              <option key="testing" value="testing">Đang test</option>
              <option key="completed" value="completed">Hoàn thành</option>
              <option key="accepted" value="accepted">Đã chấp nhận</option>
              <option key="rejected" value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Độ ưu tiên
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="all" value="all">Tất cả</option>
              <option key="low" value="low">Thấp</option>
              <option key="medium" value="medium">Trung bình</option>
              <option key="high" value="high">Cao</option>
              <option key="critical" value="critical">Khẩn cấp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dự án
            </label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả dự án</option>
              {projects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint
            </label>
            <select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option key="all" value="all">Tất cả sprint</option>
              {sprints.map(sprint => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setProjectFilter('all');
              setSprintFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* User Stories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Story
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dự án/Sprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiến độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Story Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái bàn giao
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUserStories.map((story) => (
                <tr key={story._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {story.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Epic: {story.epic}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {story.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{story.projectName}</div>
                      <div className="text-sm text-gray-500">{story.sprintName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(story.status)}`}>
                        {getStatusText(story.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(story.priority)}`}>
                        {getPriorityText(story.priority)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(story.statistics?.completedTasks || 0, story.statistics?.totalTasks || 0)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{calculateProgress(story.statistics?.completedTasks || 0, story.statistics?.totalTasks || 0)}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {story.statistics?.completedTasks || 0}/{story.statistics?.totalTasks || 0} tasks
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{story.storyPoints || 0} pts</div>
                    <div className="text-xs text-gray-500">
                      {story.statistics?.totalBugs > 0 ? `${story.statistics.totalBugs} bugs` : 'No bugs'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{story.assigneeName || 'Chưa giao'}</div>
                    <div className="text-xs text-gray-500">
                      {story.statistics?.totalTasks || 0} tasks
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {story.deliveryStatus === 'pending' && <span className="text-yellow-600 font-medium">Chờ phê duyệt</span>}
                    {story.deliveryStatus === 'accepted' && <span className="text-green-600 font-medium">Đã phê duyệt</span>}
                    {story.deliveryStatus === 'rejected' && <span className="text-red-600 font-medium">Đã từ chối</span>}
                    {!story.deliveryStatus && <span className="text-gray-600">Chưa bàn giao</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/user-stories/${story._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Chi tiết
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo user story mới</h3>
              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (As a... I want to... so that...) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStory.title}
                    onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                    placeholder="As a user, I want to..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={newStory.description}
                    onChange={(e) => setNewStory({...newStory, description: e.target.value})}
                    rows={3}
                    placeholder="Mô tả chi tiết về user story..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acceptance Criteria
                  </label>
                  <textarea
                    value={newStory.acceptanceCriteria}
                    onChange={(e) => setNewStory({...newStory, acceptanceCriteria: e.target.value})}
                    rows={4}
                    placeholder="1. Criteria 1\n2. Criteria 2\n3. Criteria 3..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dự án *
                    </label>
                    <select
                      required
                      value={newStory.projectId}
                      onChange={(e) => setNewStory({...newStory, projectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="default" value="">Chọn dự án</option>
                      {projects.map(project => (
                        <option key={project._id || project.id} value={project._id || project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sprint
                    </label>
                    <select
                      required
                      value={newStory.sprintId}
                      onChange={e => setNewStory({ ...newStory, sprintId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="default" value="">Chọn sprint</option>
                      {sprints.map(sprint => (
                        <option key={sprint._id} value={sprint._id}>
                          {sprint.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newStory.priority}
                      onChange={(e) => setNewStory({...newStory, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="low" value="low">Thấp</option>
                      <option key="medium" value="medium">Trung bình</option>
                      <option key="high" value="high">Cao</option>
                      <option key="critical" value="critical">Khẩn cấp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Story Points
                    </label>
                    <input
                      type="number"
                      value={newStory.storyPoints}
                      onChange={(e) => setNewStory({...newStory, storyPoints: e.target.value})}
                      placeholder="1, 2, 3, 5, 8, 13..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Epic
                    </label>
                    <input
                      type="text"
                      value={newStory.epic}
                      onChange={(e) => setNewStory({...newStory, epic: e.target.value})}
                      placeholder="Epic name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newStory.assignee}
                    onChange={(e) => setNewStory({...newStory, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option key="default" value="">Chọn người được giao</option>
                    {users.map(user => (
                      <option key={user._id} value={user.username}>
                        {user.fullName || user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tạo user story
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 