import { useState } from 'react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { User, X, Trash2, Edit3 } from 'lucide-react';
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

// Main Notes Component
export function Notes() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showSearchContactSelector, setShowSearchContactSelector] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showSearchUserSelector, setShowSearchUserSelector] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedSearchContact, setSelectedSearchContact] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSearchUser, setSelectedSearchUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Edit form data
  const [editForm, setEditForm] = useState({
    title: '',
    body: '',
    type: 'Appointment'
  });
  const [editSelectedContact, setEditSelectedContact] = useState(null);
  const [editSelectedUser, setEditSelectedUser] = useState(null);
  const [showEditContactSelector, setShowEditContactSelector] = useState(false);
  const [showEditUserSelector, setShowEditUserSelector] = useState(false);
  const [updateType, setUpdateType] = useState('update'); // 'update' or 'replace'
  
  // Search parameters
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Create form data
  const [createForm, setCreateForm] = useState({
    title: '',
    body: '',
    type: 'Appointment'
  });

  // Note types for dropdown
  const noteTypes = [
    'Appointment',
    'Call',
    'Email',
    'Fax',
    'Letter',
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
      if (selectedSearchContact) {
        queryParams.contact_id = selectedSearchContact.id;
      }
      if (selectedSearchUser) {
        queryParams.user_id = selectedSearchUser.id;
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

      if (selectedContact) {
        noteData.contact_id = selectedContact.id;
      }
      if (selectedUser) {
        noteData.user_id = selectedUser.id;
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

  const handleEditNote = (note) => {
    setSelectedNote(note);
    
    // Pre-populate the edit form with current values
    setEditForm({
      title: note.title || '',
      body: note.body || '',
      type: note.type || 'Appointment'
    });
    
    // Set selected contact and user if they exist
    if (note.contact_id) {
      // For now, create a minimal contact object with the ID
      // In a real app, you might want to fetch the full contact details
      setEditSelectedContact({
        id: note.contact_id,
        given_name: 'Contact',
        family_name: note.contact_id.toString()
      });
    } else {
      setEditSelectedContact(null);
    }
    
    if (note.user_id) {
      // Similar for user
      setEditSelectedUser({
        id: note.user_id,
        given_name: 'User',
        family_name: note.user_id.toString()
      });
    } else {
      setEditSelectedUser(null);
    }
    
    setUpdateType('update'); // Default to update
    setShowEditModal(true);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    try {
      setDeleteLoading(true);
      await keapAPI.deleteNote(noteToDelete.id);
      
      // Remove the note from the current list
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id));
      
      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
      
      // Optionally refresh the list to get updated pagination
      // handleSearch();
      
    } catch (error) {
      console.error('Error deleting note:', error);
      // You might want to show an error message to the user here
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setShowContactSelector(false);
  };

  const handleSearchContactSelect = (contact) => {
    setSelectedSearchContact(contact);
    setShowSearchContactSelector(false);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserSelector(false);
  };

  const handleSearchUserSelect = (user) => {
    setSelectedSearchUser(user);
    setShowSearchUserSelector(false);
  };

  const handleRemoveContact = () => {
    setSelectedContact(null);
  };

  const handleRemoveSearchContact = () => {
    setSelectedSearchContact(null);
  };

  const handleRemoveUser = () => {
    setSelectedUser(null);
  };

  const handleRemoveSearchUser = () => {
    setSelectedSearchUser(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedNote(null);
    setEditForm({
      title: '',
      body: '',
      type: 'Appointment'
    });
    setEditSelectedContact(null);
    setEditSelectedUser(null);
    setUpdateType('update');
  };

  const handleEditSubmit = async () => {
    if (!selectedNote) return;

    try {
      setLoading(true);
      
      // Prepare the data for API
      const noteData = {
        title: editForm.title,
        body: editForm.body,
        type: editForm.type
      };

      if (editSelectedContact) {
        noteData.contact_id = editSelectedContact.id;
      }
      if (editSelectedUser) {
        noteData.user_id = editSelectedUser.id;
      }

      let response;
      if (updateType === 'update') {
        response = await keapAPI.updateNote(selectedNote.id, noteData);
      } else {
        response = await keapAPI.replaceNote(selectedNote.id, noteData);
      }
      
      console.log('note updated', response);
      
      // Close modal and reset form
      closeEditModal();
      
      // Refresh the notes list
      handleSearch();
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateEditForm = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditContactSelect = (contact) => {
    setEditSelectedContact(contact);
    setShowEditContactSelector(false);
  };

  const handleEditUserSelect = (user) => {
    setEditSelectedUser(user);
    setShowEditUserSelector(false);
  };

  const handleRemoveEditContact = () => {
    setEditSelectedContact(null);
  };

  const handleRemoveEditUser = () => {
    setEditSelectedUser(null);
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
      'Fax': 'bg-pink-100 text-pink-800',
      'Letter': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notes</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact</label>
            {selectedSearchContact ? (
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-5 w-5 mr-2">
                    <div className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
                      <User className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {[selectedSearchContact.given_name, selectedSearchContact.family_name]
                        .filter(Boolean)
                        .join(' ') || selectedSearchContact.preferred_name || `Contact ${selectedSearchContact.id}`}
                    </p>
                    <p className="text-xs text-gray-500">ID: {selectedSearchContact.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSearchContact}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSearchContactSelector(true)}
                className="w-full justify-start text-gray-500 h-10"
              >
                <User className="h-4 w-4 mr-2" />
                Select Contact
              </Button>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">User</label>
            {selectedSearchUser ? (
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-5 w-5 mr-2">
                    <div className="h-5 w-5 rounded-full bg-blue-400 flex items-center justify-center">
                      <User className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {[selectedSearchUser.given_name, selectedSearchUser.family_name]
                        .filter(Boolean)
                        .join(' ') || selectedSearchUser.preferred_name || `User ${selectedSearchUser.id}`}
                    </p>
                    <p className="text-xs text-gray-500">ID: {selectedSearchUser.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSearchUser}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSearchUserSelector(true)}
                className="w-full justify-start text-gray-500 h-10"
              >
                <User className="h-4 w-4 mr-2" />
                Select User
              </Button>
            )}
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Offset</label>
            <Input
              type="number"
              value={offset}
              onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div className="flex items-end">
            {(selectedSearchContact || selectedSearchUser) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedSearchContact(null);
                  setSelectedSearchUser(null);
                  setOffset(0);
                }}
                className="mr-3"
              >
                Clear Filters
              </Button>
            )}
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
                      {note.contact_id ? (
                        <div>
                          <span className="font-medium">{note.contact_id}</span>
                          {selectedSearchContact && selectedSearchContact.id === note.contact_id && (
                            <p className="text-xs text-gray-500 truncate">
                              {[selectedSearchContact.given_name, selectedSearchContact.family_name]
                                .filter(Boolean)
                                .join(' ') || selectedSearchContact.preferred_name}
                            </p>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {note.user_id ? (
                        <div>
                          <span className="font-medium">{note.user_id}</span>
                          {selectedSearchUser && selectedSearchUser.id === note.user_id && (
                            <p className="text-xs text-gray-500 truncate">
                              {[selectedSearchUser.given_name, selectedSearchUser.family_name]
                                .filter(Boolean)
                                .join(' ') || selectedSearchUser.preferred_name}
                            </p>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="Edit note"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
                  {/* Contact Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    {selectedContact ? (
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 mr-2">
                            <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {[selectedContact.given_name, selectedContact.family_name]
                                .filter(Boolean)
                                .join(' ') || selectedContact.preferred_name || `Contact ${selectedContact.id}`}
                            </p>
                            <p className="text-xs text-gray-500">ID: {selectedContact.id}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveContact}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowContactSelector(true)}
                        className="w-full justify-start text-gray-500"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Select Contact
                      </Button>
                    )}
                  </div>

                  {/* User Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User
                    </label>
                    {selectedUser ? (
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-blue-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 mr-2">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {[selectedUser.given_name, selectedUser.family_name]
                                .filter(Boolean)
                                .join(' ') || selectedUser.preferred_name || `User ${selectedUser.id}`}
                            </p>
                            <p className="text-xs text-gray-500">ID: {selectedUser.id}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveUser}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowUserSelector(true)}
                        className="w-full justify-start text-gray-500"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Select User
                      </Button>
                    )}
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

      {/* Contact Selector Modal for Create */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleContactSelect}
        mode="single"
      />

      {/* Contact Selector Modal for Search */}
      <ContactSelector
        isOpen={showSearchContactSelector}
        onClose={() => setShowSearchContactSelector(false)}
        onSelect={handleSearchContactSelect}
        mode="single"
      />

      {/* User Selector Modal for Create */}
      <UserSelector
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onSelect={handleUserSelect}
        selectedUserId={selectedUser?.id}
      />

      {/* User Selector Modal for Search */}
      <UserSelector
        isOpen={showSearchUserSelector}
        onClose={() => setShowSearchUserSelector(false)}
        onSelect={handleSearchUserSelect}
        selectedUserId={selectedSearchUser?.id}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && noteToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Note</h3>
                <button
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  disabled={deleteLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Are you sure you want to delete this note?
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {noteToDelete.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {noteToDelete.id} • {getTypeColor(noteToDelete.type) && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(noteToDelete.type)}`}>
                          {noteToDelete.type}
                        </span>
                      )}
                    </p>
                    {noteToDelete.body && (
                      <p className="text-xs text-gray-600 mt-2 truncate">
                        {noteToDelete.body.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-red-600 mt-3 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {deleteLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal - Complete implementation */}
      {showEditModal && selectedNote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit Note</h3>
                  <p className="text-sm text-gray-500">ID: {selectedNote.id}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="space-y-6">
                {/* Update Type Selection - Compact */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Update Method <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Choose how to update the note</p>
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
                    value={editForm.type}
                    onChange={(e) => updateEditForm('type', e.target.value)}
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
                    value={editForm.body}
                    onChange={(e) => updateEditForm('body', e.target.value)}
                    placeholder="Enter note content"
                    rows="4"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {updateType === 'replace' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Replace mode: Leave empty to clear existing content
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                    </label>
                    {editSelectedContact ? (
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 mr-2">
                            <div className="h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {[editSelectedContact.given_name, editSelectedContact.family_name]
                                .filter(Boolean)
                                .join(' ') || editSelectedContact.preferred_name || `Contact ${editSelectedContact.id}`}
                            </p>
                            <p className="text-xs text-gray-500">ID: {editSelectedContact.id}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveEditContact}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEditContactSelector(true)}
                        className="w-full justify-start text-gray-500"
                      >
                        <User className="h-4 w-4 mr-2" />
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
                      User
                    </label>
                    {editSelectedUser ? (
                      <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-blue-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 mr-2">
                            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {[editSelectedUser.given_name, editSelectedUser.family_name]
                                .filter(Boolean)
                                .join(' ') || editSelectedUser.preferred_name || `User ${editSelectedUser.id}`}
                            </p>
                            <p className="text-xs text-gray-500">ID: {editSelectedUser.id}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveEditUser}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEditUserSelector(true)}
                        className="w-full justify-start text-gray-500"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Select User
                      </Button>
                    )}
                    {updateType === 'replace' && !editSelectedUser && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Replace mode: No user selected will clear existing user
                      </p>
                    )}
                  </div>
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
                        <Edit3 className="h-4 w-4 mr-2" />
                        {updateType === 'update' ? 'Update Note' : 'Replace Note'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
        selectedUserId={editSelectedUser?.id}
      />
    </div>
  );
}