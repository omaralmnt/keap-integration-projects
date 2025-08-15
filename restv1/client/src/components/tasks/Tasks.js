import { useState } from 'react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import keapAPI from '../../services/keapAPI';
import ContactSelector from '../misc/ContactSelector';
import UserSelector from '../misc/UserSelector';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showSearchContactSelector, setShowSearchContactSelector] = useState(false);
  const [showSearchUserSelector, setShowSearchUserSelector] = useState(false);
  const [showEditContactSelector, setShowEditContactSelector] = useState(false);
  const [showEditUserSelector, setShowEditUserSelector] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchSelectedContact, setSearchSelectedContact] = useState(null);
  const [searchSelectedUser, setSearchSelectedUser] = useState(null);
  const [editSelectedContact, setEditSelectedContact] = useState(null);
  const [editSelectedUser, setEditSelectedUser] = useState(null);
  const [updateType, setUpdateType] = useState('update');
  
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
    priority: 1,
    type: '',
    url: '',
    funnel_id: '',
    jgraph_id: '',
    remind_time: '',
    completed: false,
    completion_date: ''
  });

  // Edit form data
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    due_date: '',
    user_id: '',
    priority: 1,
    type: '',
    url: '',
    funnel_id: '',
    jgraph_id: '',
    remind_time: '',
    completed: false,
    completion_date: ''
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
          payload[key] = value;
        }
      });

      // Add contact object if selected
      if (selectedContact) {
        payload.contact = {
          id: selectedContact.id,
          email: selectedContact.email_addresses?.[0]?.email || '',
          first_name: selectedContact.given_name || '',
          last_name: selectedContact.family_name || ''
        };
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
        priority: 1,
        type: '',
        url: '',
        funnel_id: '',
        jgraph_id: '',
        remind_time: '',
        completed: false,
        completion_date: ''
      });
      setSelectedContact(null);
      setSelectedUser(null);
      
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

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // View task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Edit task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    
    // Populate edit form with current task data
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      user_id: task.user_id ? task.user_id.toString() : '',
      priority: task.priority || 1,
      type: task.type || '',
      url: task.url || '',
      funnel_id: task.funnel_id ? task.funnel_id.toString() : '',
      jgraph_id: task.jgraph_id ? task.jgraph_id.toString() : '',
      remind_time: task.remind_time ? task.remind_time.toString() : '',
      completed: task.completed || false,
      completion_date: task.completion_date ? new Date(task.completion_date).toISOString().slice(0, 16) : ''
    });

    // Set selected contact and user if they exist
    setEditSelectedContact(task.contact || null);
    setEditSelectedUser(null); // You might want to fetch user details here
    
    setUpdateType('update');
    setShowEditModal(true);
  };

  // Delete task functions
  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);
      console.log('Deleting task:', taskToDelete.id);
      
      await keapAPI.deleteTask(taskToDelete.id);
      console.log('Task deleted successfully');
      
      // Close modal and refresh
      setShowDeleteModal(false);
      setTaskToDelete(null);
      handleSearch();
      
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
    setEditSelectedContact(null);
    setEditSelectedUser(null);
    setUpdateType('update');
  };

  // Handle contact selection
  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setShowContactSelector(false);
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    updateCreateForm('user_id', user.id.toString());
    setShowUserSelector(false);
  };

  // Handle search contact selection
  const handleSearchContactSelect = (contact) => {
    setSearchSelectedContact(contact);
    updateSearchParam('contact_id', contact.id.toString());
    setShowSearchContactSelector(false);
  };

  // Handle search user selection
  const handleSearchUserSelect = (user) => {
    setSearchSelectedUser(user);
    updateSearchParam('user_id', user.id.toString());
    setShowSearchUserSelector(false);
  };

  // Handle edit contact selection
  const handleEditContactSelect = (contact) => {
    setEditSelectedContact(contact);
    setShowEditContactSelector(false);
  };

  // Handle edit user selection
  const handleEditUserSelect = (user) => {
    setEditSelectedUser(user);
    updateEditForm('user_id', user.id.toString());
    setShowEditUserSelector(false);
  };

  // Remove edit contact
  const handleRemoveEditContact = () => {
    setEditSelectedContact(null);
  };

  // Remove edit user
  const handleRemoveEditUser = () => {
    setEditSelectedUser(null);
    updateEditForm('user_id', '');
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      
      // Build update payload
      const payload = {};
      
      if (updateType === 'replace') {
        // Replace mode: include all fields
        payload.title = editForm.title;
        payload.description = editForm.description;
        payload.due_date = editForm.due_date ? new Date(editForm.due_date).toISOString() : null;
        payload.user_id = editForm.user_id ? parseInt(editForm.user_id) : null;
        payload.priority = editForm.priority;
        payload.type = editForm.type;
        payload.url = editForm.url;
        payload.funnel_id = editForm.funnel_id ? parseInt(editForm.funnel_id) : null;
        payload.jgraph_id = editForm.jgraph_id ? parseInt(editForm.jgraph_id) : null;
        payload.remind_time = editForm.remind_time ? parseInt(editForm.remind_time) : null;
        payload.completed = editForm.completed;
        payload.completion_date = editForm.completion_date ? new Date(editForm.completion_date).toISOString() : null;
        
        // Add contact object
        if (editSelectedContact) {
          payload.contact = {
            id: editSelectedContact.id,
            email: editSelectedContact.email_addresses?.[0]?.email || editSelectedContact.email || '',
            first_name: editSelectedContact.given_name || '',
            last_name: editSelectedContact.family_name || ''
          };
        } else {
          payload.contact = null;
        }
      } else {
        // Update mode: only include changed fields
        Object.keys(editForm).forEach(key => {
          const value = editForm[key];
          if (value !== '' && value !== null && value !== undefined) {
            if (key === 'due_date' || key === 'completion_date') {
              if (value) {
                payload[key] = new Date(value).toISOString();
              }
            } else if (key === 'user_id' || key === 'funnel_id' || key === 'jgraph_id' || key === 'remind_time') {
              if (value) {
                payload[key] = parseInt(value);
              }
            } else {
              payload[key] = value;
            }
          }
        });

        // Add contact if selected
        if (editSelectedContact) {
          payload.contact = {
            id: editSelectedContact.id,
            email: editSelectedContact.email_addresses?.[0]?.email || editSelectedContact.email || '',
            first_name: editSelectedContact.given_name || '',
            last_name: editSelectedContact.family_name || ''
          };
        }
      }

      console.log('Updating task:', payload);
      
      const response = updateType === 'replace' 
        ? await keapAPI.replaceTask(selectedTask.id, payload)
        : await keapAPI.updateTask(selectedTask.id, payload);
      
      console.log('Task updated:', response);
      
      // Close modal and refresh
      closeEditModal();
      handleSearch();
      
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
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
            <label className="block text-xs text-gray-500 mb-1">Contact</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={searchParams.contact_id}
                onChange={(e) => updateSearchParam('contact_id', e.target.value)}
                placeholder="Contact ID"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSearchContactSelector(true)}
                className="flex-shrink-0 px-2"
              >
                Select
              </Button>
            </div>
            {searchSelectedContact && (
              <div className="mt-1 p-2 bg-green-50 rounded text-xs">
                <div className="font-medium text-green-900">
                  {searchSelectedContact.given_name} {searchSelectedContact.family_name}
                </div>
              </div>
            )}
          </div>

          {/* User ID */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">User</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={searchParams.user_id}
                onChange={(e) => updateSearchParam('user_id', e.target.value)}
                placeholder="User ID"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSearchUserSelector(true)}
                className="flex-shrink-0 px-2"
              >
                Select
              </Button>
            </div>
            {searchSelectedUser && (
              <div className="mt-1 p-2 bg-blue-50 rounded text-xs">
                <div className="font-medium text-blue-900">
                  {searchSelectedUser.given_name} {searchSelectedUser.family_name}
                </div>
              </div>
            )}
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
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewTask(task)}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTask(task)}
                          className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTask(task)}
                          className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Confirm Delete Task
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">
                    Task to delete:
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    {taskToDelete.title || 'Untitled Task'}
                  </p>
                  {taskToDelete.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {taskToDelete.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>ID: {taskToDelete.id}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      taskToDelete.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {taskToDelete.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={loading}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Delete Task
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
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
                {/* Title - Full Width */}
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

                {/* Description - Full Width */}
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

                {/* Row 1: Due Date, Priority, Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <Input
                      type="number"
                      value={createForm.priority}
                      onChange={(e) => updateCreateForm('priority', parseInt(e.target.value) || 1)}
                      placeholder="Priority level"
                      min="1"
                    />
                  </div>

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
                </div>

                {/* Row 2: User, Contact Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned User
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={createForm.user_id}
                        onChange={(e) => updateCreateForm('user_id', e.target.value)}
                        placeholder="User ID"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowUserSelector(true)}
                        className="flex-shrink-0"
                      >
                        Select User
                      </Button>
                    </div>
                    {selectedUser && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border">
                        <div className="text-sm font-medium text-blue-900">
                          {selectedUser.given_name} {selectedUser.family_name}
                        </div>
                        <div className="text-xs text-blue-700">{selectedUser.email_address}</div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={selectedContact ? `${selectedContact.given_name || ''} ${selectedContact.family_name || ''}`.trim() || `Contact ${selectedContact.id}` : ''}
                        placeholder="No contact selected"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowContactSelector(true)}
                        className="flex-shrink-0"
                      >
                        Select Contact
                      </Button>
                    </div>
                    {selectedContact && (
                      <div className="mt-2 p-2 bg-green-50 rounded border">
                        <div className="text-sm font-medium text-green-900">
                          {selectedContact.given_name} {selectedContact.family_name}
                        </div>
                        <div className="text-xs text-green-700">
                          {selectedContact.email_addresses?.[0]?.email || 'No email'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: URL, Remind Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Row 4: System Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funnel ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.funnel_id}
                      onChange={(e) => updateCreateForm('funnel_id', e.target.value)}
                      placeholder="Marketing funnel ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JGraph ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.jgraph_id}
                      onChange={(e) => updateCreateForm('jgraph_id', e.target.value)}
                      placeholder="Campaign graph ID"
                    />
                  </div>
                </div>

                {/* Completion Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
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

                  {createForm.completed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                  )}
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

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit Task</h3>
                  <p className="text-sm text-gray-500">ID: {selectedTask.id || selectedTask.title}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="space-y-6">
                {/* Update Type Selection */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Update Method <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Choose how to update the task</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="update"
                          checked={updateType === 'update'}
                          onChange={() => setUpdateType('update')}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-2">
                          <span className="text-sm font-medium text-gray-900">Update</span>
                          <p className="text-xs text-gray-500">Partial changes</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="replace"
                          checked={updateType === 'replace'}
                          onChange={() => setUpdateType('replace')}
                          className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <div className="ml-2">
                          <span className="text-sm font-medium text-gray-900">Replace</span>
                          <p className="text-xs text-gray-500">Complete overwrite</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {updateType === 'replace' && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                      ⚠️ Replace mode will overwrite all fields. Empty fields will clear existing data.
                    </div>
                  )}
                </div>

                {/* Title - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => updateEditForm('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    placeholder="Enter task description"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {updateType === 'replace' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Replace mode: Leave empty to clear existing description
                    </p>
                  )}
                </div>

                {/* Row 1: Due Date, Priority, Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={editForm.due_date}
                      onChange={(e) => updateEditForm('due_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <Input
                      type="number"
                      value={editForm.priority}
                      onChange={(e) => updateEditForm('priority', parseInt(e.target.value) || 1)}
                      placeholder="Priority level"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <Input
                      value={editForm.type}
                      onChange={(e) => updateEditForm('type', e.target.value)}
                      placeholder="Task type"
                    />
                  </div>
                </div>

                {/* Contact and User Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    {editSelectedContact ? (
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-green-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 mr-2">
                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {[editSelectedContact.first_name || editSelectedContact.given_name, 
                                editSelectedContact.last_name || editSelectedContact.family_name]
                                .filter(Boolean)
                                .join(' ') || editSelectedContact.preferred_name || `Contact ${editSelectedContact.id}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {editSelectedContact.email || editSelectedContact.email_addresses?.[0]?.email || `ID: ${editSelectedContact.id}`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveEditContact}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEditContactSelector(true)}
                        className="w-full justify-start text-gray-500"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Select Contact
                      </Button>
                    )}
                    {updateType === 'replace' && !editSelectedContact && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Replace mode: No contact selected will clear existing contact
                      </p>
                    )}
                  </div>

                  {/* User Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned User
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={editForm.user_id}
                        onChange={(e) => updateEditForm('user_id', e.target.value)}
                        placeholder="User ID"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEditUserSelector(true)}
                        className="flex-shrink-0"
                      >
                        Select User
                      </Button>
                    </div>
                    {editSelectedUser && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border">
                        <div className="text-sm font-medium text-blue-900">
                          {editSelectedUser.given_name} {editSelectedUser.family_name}
                        </div>
                        <div className="text-xs text-blue-700">{editSelectedUser.email_address}</div>
                      </div>
                    )}
                    {updateType === 'replace' && !editSelectedUser && !editForm.user_id && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Replace mode: No user selected will clear existing user
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: URL, Remind Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <Input
                      type="url"
                      value={editForm.url}
                      onChange={(e) => updateEditForm('url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remind Time (minutes before due date)
                    </label>
                    <Select
                      value={editForm.remind_time}
                      onChange={(e) => updateEditForm('remind_time', e.target.value)}
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
                </div>

                {/* Row 3: System Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funnel ID
                    </label>
                    <Input
                      type="number"
                      value={editForm.funnel_id}
                      onChange={(e) => updateEditForm('funnel_id', e.target.value)}
                      placeholder="Marketing funnel ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JGraph ID
                    </label>
                    <Input
                      type="number"
                      value={editForm.jgraph_id}
                      onChange={(e) => updateEditForm('jgraph_id', e.target.value)}
                      placeholder="Campaign graph ID"
                    />
                  </div>
                </div>

                {/* Completion Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="editCompleted"
                      checked={editForm.completed}
                      onChange={(e) => updateEditForm('completed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editCompleted" className="ml-2 block text-sm font-medium text-gray-700">
                      Mark as Completed
                    </label>
                  </div>

                  {editForm.completed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Completion Date
                        </label>
                        <Input
                          type="datetime-local"
                          value={editForm.completion_date}
                          onChange={(e) => updateEditForm('completion_date', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !editForm.title.trim()}
                    className={updateType === 'replace' ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : ''}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {updateType === 'update' ? 'Updating...' : 'Replacing...'}
                      </div>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        {updateType === 'update' ? 'Update Task' : 'Replace Task'}
                      </>
                    )}
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

      {/* Contact Selector Modal */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleContactSelect}
        mode="single"
      />

      {/* User Selector Modal */}
      <UserSelector
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onSelect={handleUserSelect}
        selectedUserId={createForm.user_id}
      />

      {/* Search Contact Selector Modal */}
      <ContactSelector
        isOpen={showSearchContactSelector}
        onClose={() => setShowSearchContactSelector(false)}
        onSelect={handleSearchContactSelect}
        mode="single"
      />

      {/* Search User Selector Modal */}
      <UserSelector
        isOpen={showSearchUserSelector}
        onClose={() => setShowSearchUserSelector(false)}
        onSelect={handleSearchUserSelect}
        selectedUserId={searchParams.user_id}
      />

      {/* Edit Contact Selector Modal */}
      <ContactSelector
        isOpen={showEditContactSelector}
        onClose={() => setShowEditContactSelector(false)}
        onSelect={handleEditContactSelect}
        mode="single"
      />

      {/* Edit User Selector Modal */}
      <UserSelector
        isOpen={showEditUserSelector}
        onClose={() => setShowEditUserSelector(false)}
        onSelect={handleEditUserSelect}
        selectedUserId={editForm.user_id}
      />
    </div>
  );
}