import { useState } from 'react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import keapAPI from '../../services/keapAPI';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Select component
const Select = ({ value, onChange, children, className = '', ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Main Tasks Component
export function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Pagination
  const [next, setNext] = useState('');
  const [previous, setPrevious] = useState('');

  // Search parameters
  const [searchParams, setSearchParams] = useState({
    completed: '', // '' for all, 'true' for completed, 'false' for incomplete
    contact_id: '',
    has_due_date: '', // '' for all, 'true' for has due date, 'false' for no due date
    limit: 10,
    offset: 0,
    order: '',
    since: '',
    until: '',
    user_id: ''
  });

  // Create form data
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    due_date: '',
    user_id: '',
    priority: 0,
    type: '',
    url: '',
    funnel_id: '',
    jgraph_id: '',
    remind_time: '',
    completed: false,
    completion_date: '',
    // Contact fields (will be merged into contact object)
    contact_email: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_id: ''
  });

  // Handle pagination
  const handlePagination = async (action) => {
    try {
      setLoading(true);
      let data;
      if (action === 'next') {
        data = await keapAPI.getTasksPaginated(next);
      } else {
        data = await keapAPI.getTasksPaginated(previous);
      }
      setNext(data.next || '');
      setPrevious(data.previous || '');
      setTasks(data.tasks || []);
    } catch (error) {
      console.log('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query params, only including non-empty values
      const queryParams = {};
      Object.keys(searchParams).forEach(key => {
        const value = searchParams[key];
        if (value !== '' && value !== null && value !== undefined) {
          queryParams[key] = value;
        }
      });

      const data = await keapAPI.getTasks(queryParams);
      setNext(data.next || '');
      setPrevious(data.previous || '');
      setTasks(data.tasks || []);
    } catch (error) {
      console.log('Search error:', error);   
    } finally {
      setLoading(false);
    }
  };

  // Update search params
  const updateSearchParam = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new task
  const newTask = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      console.log('Creating task:', createForm);
      
      // Build create payload, only including non-empty values
      const payload = {};
      Object.keys(createForm).forEach(key => {
        const value = createForm[key];
        if (value !== '' && value !== null && value !== undefined) {
          // Handle contact fields specially
          if (key.startsWith('contact_')) {
            return; // Skip individual contact fields, handle separately
          }
          payload[key] = value;
        }
      });

      // Build contact object if any contact fields are provided
      const contactFields = {};
      if (createForm.contact_email) contactFields.email = createForm.contact_email;
      if (createForm.contact_first_name) contactFields.first_name = createForm.contact_first_name;
      if (createForm.contact_last_name) contactFields.last_name = createForm.contact_last_name;
      if (createForm.contact_id) contactFields.id = parseInt(createForm.contact_id);

      if (Object.keys(contactFields).length > 0) {
        payload.contact = contactFields;
      }

      const response = await keapAPI.createTask(payload);
      console.log('Task created:', response);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        due_date: '',
        user_id: '',
        priority: 0,
        type: '',
        url: '',
        funnel_id: '',
        jgraph_id: '',
        remind_time: '',
        completed: false,
        completion_date: '',
        contact_email: '',
        contact_first_name: '',
        contact_last_name: '',
        contact_id: ''
      });
      
      // Refresh the tasks list
      handleSearch();
      
    } catch (error) {
      console.log('Create error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCreateForm = (field, value) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // View task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {/* Completed Status */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Completed Status</label>
            <Select
              value={searchParams.completed}
              onChange={(e) => updateSearchParam('completed', e.target.value)}
            >
              <option value="">All Tasks</option>
              <option value="true">Completed</option>
              <option value="false">Incomplete</option>
            </Select>
          </div>

          {/* Has Due Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Due Date Filter</label>
            <Select
              value={searchParams.has_due_date}
              onChange={(e) => updateSearchParam('has_due_date', e.target.value)}
            >
              <option value="">All Tasks</option>
              <option value="true">Has Due Date</option>
              <option value="false">No Due Date</option>
            </Select>
          </div>

          {/* Contact ID */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact ID</label>
            <Input
              type="number"
              value={searchParams.contact_id}
              onChange={(e) => updateSearchParam('contact_id', e.target.value)}
              placeholder="Contact ID"
            />
          </div>

          {/* User ID */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">User ID</label>
            <Input
              type="number"
              value={searchParams.user_id}
              onChange={(e) => updateSearchParam('user_id', e.target.value)}
              placeholder="User ID"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order By</label>
            <Input
              value={searchParams.order}
              onChange={(e) => updateSearchParam('order', e.target.value)}
              placeholder="e.g., creation_date, due_date, title"
            />
          </div>

          {/* Since Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Since Date</label>
            <Input
              type="datetime-local"
              value={searchParams.since}
              onChange={(e) => updateSearchParam('since', e.target.value)}
            />
          </div>

          {/* Until Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Until Date</label>
            <Input
              type="datetime-local"
              value={searchParams.until}
              onChange={(e) => updateSearchParam('until', e.target.value)}
            />
          </div>

          {/* Limit */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={searchParams.limit}
              onChange={(e) => updateSearchParam('limit', parseInt(e.target.value) || 10)}
              min="1"
              max="1000"
            />
          </div>

          {/* Offset */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Offset</label>
            <Input
              type="number"
              value={searchParams.offset}
              onChange={(e) => updateSearchParam('offset', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={newTask}>
            Create Task
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({tasks.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tasks found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id || Math.random()} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">
                        {task.title || 'Untitled'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority >= 3  
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority || 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {task.contact ? (
                        <div>
                          <div className="font-medium">
                            {task.contact.first_name} {task.contact.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.contact.email}
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {task.type || 'Task'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(task.creation_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTask(task)}
                        className="text-xs"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && tasks.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={!previous}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('previous')}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!next}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateSubmit(); }} className="space-y-6">
                {/* Title - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => updateCreateForm('title', e.target.value)}
                    placeholder="Task title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => updateCreateForm('description', e.target.value)}
                    placeholder="Task description"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={createForm.due_date}
                    onChange={(e) => updateCreateForm('due_date', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.user_id}
                      onChange={(e) => updateCreateForm('user_id', e.target.value)}
                      placeholder="Assigned user ID"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <Input
                      type="number"
                      value={createForm.priority}
                      onChange={(e) => updateCreateForm('priority', parseInt(e.target.value) || 0)}
                      placeholder="Priority level"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <Input
                      value={createForm.type}
                      onChange={(e) => updateCreateForm('type', e.target.value)}
                      placeholder="Task type"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <Input
                      type="url"
                      value={createForm.url}
                      onChange={(e) => updateCreateForm('url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Funnel ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funnel ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.funnel_id}
                      onChange={(e) => updateCreateForm('funnel_id', e.target.value)}
                      placeholder="Funnel ID"
                    />
                  </div>

                  {/* JGraph ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JGraph ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.jgraph_id}
                      onChange={(e) => updateCreateForm('jgraph_id', e.target.value)}
                      placeholder="JGraph ID"
                    />
                  </div>
                </div>

                {/* Remind Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remind Time (minutes before due date)
                  </label>
                  <Select
                    value={createForm.remind_time}
                    onChange={(e) => updateCreateForm('remind_time', e.target.value)}
                  >
                    <option value="">No Reminder</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                    <option value="1440">1 day</option>
                    <option value="2880">2 days</option>
                  </Select>
                </div>

                {/* Completed Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={createForm.completed}
                    onChange={(e) => updateCreateForm('completed', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="completed" className="ml-2 block text-sm font-medium text-gray-700">
                    Mark as Completed
                  </label>
                </div>

                {/* Completion Date - only show if completed is checked */}
                {createForm.completed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={createForm.completion_date}
                      onChange={(e) => updateCreateForm('completion_date', e.target.value)}
                    />
                  </div>
                )}

                {/* Contact Information Section */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Contact Information (Optional)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact ID
                      </label>
                      <Input
                        type="number"
                        value={createForm.contact_id}
                        onChange={(e) => updateCreateForm('contact_id', e.target.value)}
                        placeholder="Existing contact ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <Input
                        type="email"
                        value={createForm.contact_email}
                        onChange={(e) => updateCreateForm('contact_email', e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        value={createForm.contact_first_name}
                        onChange={(e) => updateCreateForm('contact_first_name', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={createForm.contact_last_name}
                        onChange={(e) => updateCreateForm('contact_last_name', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !createForm.title.trim()}
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Task Details
                </h3>
                <button
                  onClick={closeTaskModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTask.title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTask.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedTask.completed ? 'Completed' : 'Pending'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Priority</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTask.priority || 1}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTask.type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Due Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedTask.due_date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedTask.creation_date)}</p>
                  </div>
                </div>

                {selectedTask.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>
                )}

                {selectedTask.contact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact</label>
                    <div className="mt-1 text-sm text-gray-900">
                      <p className="font-medium">
                        {selectedTask.contact.first_name} {selectedTask.contact.last_name}
                      </p>
                      <p className="text-gray-600">{selectedTask.contact.email}</p>
                    </div>
                  </div>
                )}

                {selectedTask.url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">URL</label>
                    <p className="mt-1 text-sm text-blue-600">
                      <a href={selectedTask.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {selectedTask.url}
                      </a>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">User ID:</span> {selectedTask.user_id || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Funnel ID:</span> {selectedTask.funnel_id || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">JGraph ID:</span> {selectedTask.jgraph_id || 'N/A'}
                  </div>
                </div>

                {selectedTask.completion_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Completed On</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedTask.completion_date)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeTaskModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}