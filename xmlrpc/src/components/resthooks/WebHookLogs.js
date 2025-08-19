import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

// Real API service calling your Cloud Run function
const webhookAPI = {
  getLogs: async (filters = {}) => {
    try {
      const response = await fetch('https://omar-keap-resthooks-logs-869624733715.us-central1.run.app/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'API returned error');
      }

      // Transform the response to match component expectations
      return {
        logs: data.data.logs || [],
        total: data.data.pagination?.total || 0,
        page: data.data.pagination?.page || 1,
        pageSize: data.data.pagination?.pageSize || 20
      };

    } catch (error) {
      console.error('Error calling webhook logs API:', error);
      throw error;
    }
  }
};

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

// Format date helper
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    return dateString;
  }
};

// Get event type color
const getEventTypeColor = (eventKey) => {
  if (eventKey.includes('add')) return 'text-green-600 bg-green-100';
  if (eventKey.includes('delete')) return 'text-red-600 bg-red-100';
  if (eventKey.includes('edit') || eventKey.includes('update')) return 'text-blue-600 bg-blue-100';
  if (eventKey.includes('complete')) return 'text-purple-600 bg-purple-100';
  return 'text-gray-600 bg-gray-100';
};

// Time ago helper
const timeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch (error) {
    return '';
  }
};

export default function WebhookLogs({ selectedHook, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    eventKey: selectedHook?.eventKey || '',
    objectType: '',
    dateFrom: '',
    dateTo: '',
    objectId: ''
  });

  // Load logs function
  const loadLogs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await webhookAPI.getLogs({
        ...filters,
        page,
        pageSize: pagination.pageSize
      });

      setLogs(response.logs || []);
      setPagination({
        page: response.page || 1,
        pageSize: response.pageSize || 20,
        total: response.total || 0
      });

    } catch (err) {
      console.error('Error loading logs:', err);
      setError('Failed to load webhook logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadLogs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    loadLogs(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      eventKey: selectedHook?.eventKey || '',
      objectType: '',
      dateFrom: '',
      dateTo: '',
      objectId: ''
    });
    // Auto-apply after clearing
    setTimeout(() => loadLogs(1), 100);
  };

  // Pagination helpers
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Event Key</label>
            <Select
              value={filters.eventKey}
              onChange={(e) => handleFilterChange('eventKey', e.target.value)}
            >
              <option value="">All Events</option>
              <option value="task.add">task.add</option>
              <option value="task.edit">task.edit</option>
              <option value="task.delete">task.delete</option>
              <option value="task.complete">task.complete</option>
              <option value="contact.add">contact.add</option>
              <option value="contact.edit">contact.edit</option>
              <option value="contact.delete">contact.delete</option>
              <option value="note.add">note.add</option>
              <option value="note.edit">note.edit</option>
              <option value="note.delete">note.delete</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Object Type</label>
            <Select
              value={filters.objectType}
              onChange={(e) => handleFilterChange('objectType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="task">Task</option>
              <option value="contact">Contact</option>
              <option value="note">Note</option>
              <option value="appointment">Appointment</option>
              <option value="company">Company</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Object ID</label>
            <Input
              type="number"
              placeholder="Filter by ID"
              value={filters.objectId}
              onChange={(e) => handleFilterChange('objectId', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
            <Input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
            <Input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button onClick={applyFilters} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => loadLogs(pagination.page)}
              className="text-blue-600"
            >
              Refresh
            </Button>
          </div>
          
          {selectedHook && (
            <div className="text-sm text-gray-600">
              Showing logs for: <span className="font-medium">{selectedHook.eventKey}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading webhook logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <p className="text-gray-500">No webhook logs found</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedHook ? 'Try adjusting your filters or create some events in Keap' : 'Start creating hooks to see logs here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Object
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Object ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(log.event_key)}`}>
                        {log.event_key}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{log.object_type}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {log.object_id}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.api_url}>
                        <a 
                          href={log.api_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {log.api_url}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-sm">{formatDate(log.timestamp)}</div>
                        <div className="text-xs text-gray-500">{timeAgo(log.timestamp)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="text-sm">{formatDate(log.created_at)}</div>
                        <div className="text-xs text-gray-500">{timeAgo(log.created_at)}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadLogs(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadLogs(pagination.page + 1)}
                disabled={pagination.page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}