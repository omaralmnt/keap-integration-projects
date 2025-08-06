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

// Main Notes Component
export function Notes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Search parameters
  const [contactId, setContactId] = useState('');
  const [userId, setUserId] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Create form data
  const [createForm, setCreateForm] = useState({
    title: '',
    body: '',
    contact_id: '',
    user_id: '',
    type: 'Appointment'
  });

  // Note types for dropdown
  const noteTypes = [
    'Appointment',
    'Call',
    'Email',
    'Meeting',
    'Task',
    'Other'
  ];

  // Search function
  const handlePagination = async (action) => {
    let data;
    if (action === 'next') {
      data = await keapAPI.getNotesPaginated(next);
    } else {
      data = await keapAPI.getNotesPaginated(previous);
    }
    console.log(data);
    setNext(data.next);
    setPrevious(data.previous);
    setNotes(data.notes);
    setTotalCount(data.count);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        limit,
        offset
      };

      // Only add filters if they have values
      if (contactId.trim()) {
        queryParams.contact_id = parseInt(contactId);
      }
      if (userId.trim()) {
        queryParams.user_id = parseInt(userId);
      }

      const data = await keapAPI.getNotes(queryParams);
      setNext(data.next);
      setPrevious(data.previous);
      setTotalCount(data.count);
      console.log(data);
      setNotes(data.notes);
    } catch (error) {
      console.log(error);   
    } finally {
      setLoading(false);
    }
  };

  const newNote = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      console.log('Creating note:', createForm);
      
      // Prepare the data for API
      const noteData = {
        title: createForm.title,
        body: createForm.body,
        type: createForm.type
      };

      if (createForm.contact_id.trim()) {
        noteData.contact_id = parseInt(createForm.contact_id);
      }
      if (createForm.user_id.trim()) {
        noteData.user_id = parseInt(createForm.user_id);
      }

      const response = await keapAPI.createNote(noteData);
      console.log('note created', response);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        body: '',
        contact_id: '',
        user_id: '',
        type: 'Appointment'
      });
      
      // Refresh the notes list
      handleSearch();
      
    } catch (error) {
      console.log(error);
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

  const handleViewNote = (note) => {
    setSelectedNote(note);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedNote(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      'Appointment': 'bg-blue-100 text-blue-800',
      'Call': 'bg-green-100 text-green-800',
      'Email': 'bg-purple-100 text-purple-800',
      'Meeting': 'bg-orange-100 text-orange-800',
      'Task': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notes</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact ID</label>
            <Input
              type="number"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="Filter by contact ID"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">User ID</label>
            <Input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Filter by user ID"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
              min="1"
              max="1000"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Offset</label>
            <Input
              type="number"
              value={offset}
              onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={newNote}>
            Create Note
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({notes.length}) {totalCount > 0 && `of ${totalCount} total`}
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No notes found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notes.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">{note.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="truncate font-medium">{note.title || 'Untitled'}</p>
                        {note.body && (
                          <p className="text-gray-500 text-xs truncate mt-1">
                            {note.body.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(note.type)}`}>
                        {note.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {note.contact_id || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {note.user_id || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(note.date_created)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(note.last_updated)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {note.last_updated_by ? (
                        <div>
                          <p className="text-xs">
                            {note.last_updated_by.given_name} {note.last_updated_by.family_name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {note.last_updated_by.user_id}</p>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewNote(note)}
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
        {!loading && notes.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {offset + 1} to {offset + notes.length} of {totalCount} results
              </div>
              <div className="flex items-center space-x-3">
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
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Note</h3>
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
                    placeholder="Enter note title"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => updateCreateForm('type', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {noteTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body
                  </label>
                  <textarea
                    value={createForm.body}
                    onChange={(e) => updateCreateForm('body', e.target.value)}
                    placeholder="Enter note content"
                    rows="4"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.contact_id}
                      onChange={(e) => updateCreateForm('contact_id', e.target.value)}
                      placeholder="Enter contact ID"
                      min="1"
                    />
                  </div>

                  {/* User ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <Input
                      type="number"
                      value={createForm.user_id}
                      onChange={(e) => updateCreateForm('user_id', e.target.value)}
                      placeholder="Enter user ID"
                      min="1"
                    />
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
                    {loading ? 'Creating...' : 'Create Note'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Note Modal */}
      {showViewModal && selectedNote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Note Details
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Title and Type */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedNote.title || 'Untitled'}
                    </h4>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(selectedNote.type)}`}>
                      {selectedNote.type}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">ID:</span>
                    <span className="ml-2">{selectedNote.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Contact ID:</span>
                    <span className="ml-2">{selectedNote.contact_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">User ID:</span>
                    <span className="ml-2">{selectedNote.user_id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(selectedNote.date_created)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-500">Last Updated:</span>
                    <span className="ml-2">{formatDate(selectedNote.last_updated)}</span>
                    {selectedNote.last_updated_by && (
                      <span className="ml-2 text-gray-400">
                        by {selectedNote.last_updated_by.given_name} {selectedNote.last_updated_by.family_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                {selectedNote.body && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Content:</h5>
                    <div className="border rounded-lg p-4 bg-gray-50 whitespace-pre-wrap">
                      {selectedNote.body}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button variant="outline" onClick={closeViewModal}>
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