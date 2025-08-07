import { useState } from 'react';
import { Button } from '../ui/Button';
import { User, Users, Eye, Edit, X, Edit3, Trash2 } from 'lucide-react';
import ContactSelector from '../misc/ContactSelector';
import UserSelector from '../misc/UserSelector';
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

// Main Appointments Component
export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showSearchContactSelector, setShowSearchContactSelector] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [contactDetails, setContactDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [updateType, setUpdateType] = useState('update');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [selectorMode, setSelectorMode] = useState('create'); // 'create' or 'edit'
  
  // Search parameters
  const [contactId, setContactId] = useState('');
  const [selectedSearchContact, setSelectedSearchContact] = useState(null);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Create form data
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    contact_id: '',
    user: '',
    remind_time: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit form data
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    contact_id: '',
    user: '',
    remind_time: ''
  });
  const [editSelectedContact, setEditSelectedContact] = useState(null);
  const [editSelectedUser, setEditSelectedUser] = useState(null);

  // Pagination function
  const handlePagination = async (action) => {
    try {
      setLoading(true);
      let data;
      if (action === 'next') {
        data = await keapAPI.getAppointmentsPaginated(next);
      } else {
        data = await keapAPI.getAppointmentsPaginated(previous);
      }
      console.log(data);
      setNext(data.next);
      setPrevious(data.previous);
      setAppointments(data.appointments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirmModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setAppointmentToDelete(null);
  };

  // Confirm delete appointment
  const confirmDeleteAppointment = async () => {
    try {
      setLoading(true);
      console.log('Deleting appointment:', appointmentToDelete.id);
      
      await keapAPI.deleteAppointment(appointmentToDelete.id);
      console.log('Appointment deleted successfully');
      
      // Close modal and refresh list
      closeDeleteConfirmModal();
      handleSearch();
      
    } catch (error) {
      console.log('Error deleting appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const newAppointment = () => {
    setSelectorMode('create');
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      console.log('Creating appointment:', createForm);
      
      // Prepare the data for the API
      const appointmentData = {
        title: createForm.title,
        start_date: createForm.start_date,
        end_date: createForm.end_date
      };

      // Add optional fields only if they have values
      if (createForm.description.trim()) {
        appointmentData.description = createForm.description;
      }
      if (createForm.location.trim()) {
        appointmentData.location = createForm.location;
      }
      // Use selected contact if available, otherwise use manual input
      if (selectedContact && selectedContact.id) {
        appointmentData.contact_id = selectedContact.id;
      } else if (createForm.contact_id.trim()) {
        appointmentData.contact_id = parseInt(createForm.contact_id);
      }
      // Use selected user if available, otherwise use manual input
      if (selectedUser && selectedUser.id) {
        appointmentData.user = selectedUser.id;
      } else if (createForm.user.trim()) {
        appointmentData.user = parseInt(createForm.user);
      }
      if (createForm.remind_time) {
        appointmentData.remind_time = parseInt(createForm.remind_time);
      }

      const response = await keapAPI.createAppointment(appointmentData);
      console.log('appointment created', response);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        contact_id: '',
        user: '',
        remind_time: ''
      });
      setSelectedContact(null);
      setSelectedUser(null);
      
      // Refresh the appointments list
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

  // Handle contact selection for search
  const handleSearchContactSelect = (contact) => {
    setSelectedSearchContact(contact);
    setContactId(''); // Clear manual input when using selector
  };

  // Clear selected search contact
  const clearSearchContact = () => {
    setSelectedSearchContact(null);
  };

  // Handle contact selection for create form
  const handleContactSelect = (contact) => {
    if (selectorMode === 'create') {
      setSelectedContact(contact);
      updateCreateForm('contact_id', ''); // Clear manual input when using selector
    } else if (selectorMode === 'edit') {
      setEditSelectedContact(contact);
      updateEditForm('contact_id', ''); // Clear manual input when using selector
    }
  };

  // Handle user selection for create form
  const handleUserSelect = (user) => {
    if (selectorMode === 'create') {
      setSelectedUser(user);
      updateCreateForm('user', ''); // Clear manual input when using selector
    } else if (selectorMode === 'edit') {
      setEditSelectedUser(user);
      updateEditForm('user', ''); // Clear manual input when using selector
    }
  };

  // Handle view appointment
  const handleViewAppointment = async (appointment) => {
    setViewingAppointment(appointment);
    setShowViewModal(true);
    setDetailsLoading(true);
    setAppointmentDetails(null);
    setContactDetails(null);

    try {
      // Get full appointment details
      const appointmentData = await keapAPI.getAppointmentById(appointment.id || appointment.contact_id);
      setAppointmentDetails(appointmentData);

      // Get contact details if contact_id exists
      if (appointmentData.contact_id || appointment.contact_id) {
        try {
          const contactData = await keapAPI.getContactById(appointmentData.contact_id || appointment.contact_id);
          setContactDetails(contactData);
        } catch (contactError) {
          console.log('Could not fetch contact details:', contactError);
        }
      }
    } catch (error) {
      console.log('Error fetching appointment details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingAppointment(null);
    setAppointmentDetails(null);
    setContactDetails(null);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowEditModal(true);
    setUpdateType('update');
    
    // Populate edit form with current appointment data
    setEditForm({
      title: appointment.title || '',
      description: appointment.description || '',
      start_date: appointment.start_date || '',
      end_date: appointment.end_date || '',
      location: appointment.location || '',
      contact_id: appointment.contact_id ? appointment.contact_id.toString() : '',
      user: appointment.user ? appointment.user.toString() : '',
      remind_time: appointment.remind_time ? appointment.remind_time.toString() : ''
    });

    // Clear selected entities initially
    setEditSelectedContact(null);
    setEditSelectedUser(null);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAppointment(null);
    setEditForm({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      contact_id: '',
      user: '',
      remind_time: ''
    });
    setEditSelectedContact(null);
    setEditSelectedUser(null);
    setUpdateType('update');
  };

  // Update edit form
  const updateEditForm = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit contact selection
  const handleEditContactSelect = (contact) => {
    setEditSelectedContact(contact);
    updateEditForm('contact_id', ''); // Clear manual input
  };

  // Handle edit user selection
  const handleEditUserSelect = (user) => {
    setEditSelectedUser(user);
    updateEditForm('user', ''); // Clear manual input
  };

  // Remove edit contact selection
  const handleRemoveEditContact = () => {
    setEditSelectedContact(null);
    if (updateType === 'update') {
      // In update mode, keep the current value
      updateEditForm('contact_id', editingAppointment?.contact_id?.toString() || '');
    }
  };

  // Remove edit user selection
  const handleRemoveEditUser = () => {
    setEditSelectedUser(null);
    if (updateType === 'update') {
      // In update mode, keep the current value
      updateEditForm('user', editingAppointment?.user?.toString() || '');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      console.log('Updating appointment:', editingAppointment.id, editForm, updateType);
      
      // Prepare the data for the API
      const appointmentData = {
        title: editForm.title,
        start_date: editForm.start_date,
        end_date: editForm.end_date
      };

      // Add optional fields based on update type
      if (updateType === 'replace' || editForm.description.trim()) {
        appointmentData.description = editForm.description;
      }
      if (updateType === 'replace' || editForm.location.trim()) {
        appointmentData.location = editForm.location;
      }

      // Handle contact ID
      if (editSelectedContact && editSelectedContact.id) {
        appointmentData.contact_id = editSelectedContact.id;
      } else if (updateType === 'replace' || editForm.contact_id.trim()) {
        appointmentData.contact_id = editForm.contact_id.trim() ? parseInt(editForm.contact_id) : null;
      }

      // Handle user ID
      if (editSelectedUser && editSelectedUser.id) {
        appointmentData.user = editSelectedUser.id;
      } else if (updateType === 'replace' || editForm.user.trim()) {
        appointmentData.user = editForm.user.trim() ? parseInt(editForm.user) : null;
      }

      // Handle remind time
      if (updateType === 'replace' || editForm.remind_time) {
        appointmentData.remind_time = editForm.remind_time ? parseInt(editForm.remind_time) : null;
      }

      // Use the appropriate API method based on update type
      const response = updateType === 'replace' 
        ? await keapAPI.replaceAppointment(editingAppointment.id, appointmentData)
        : await keapAPI.updateAppointment(editingAppointment.id, appointmentData);
      
      console.log('appointment updated', response);
      
      // Close modal and refresh list
      closeEditModal();
      handleSearch();
      
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        limit,
        offset
      };

      // Add optional parameters only if they have values
      if (contactId.trim()) {
        queryParams.contact_id = parseInt(contactId);
      }
      // Use selected contact from selector if available
      if (selectedSearchContact && selectedSearchContact.id) {
        queryParams.contact_id = selectedSearchContact.id;
      }
      if (since) {
        queryParams.since = since;
      }
      if (until) {
        queryParams.until = until;
      }

      const data = await keapAPI.getAppointments(queryParams);
      setNext(data.next);
      setPrevious(data.previous);
      console.log(data);
      setAppointments(data.appointments);
    } catch (error) {
      console.log(error);   
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Format date for input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // Handle date input change
  const handleDateChange = (setter) => (e) => {
    const value = e.target.value;
    if (value) {
      // Convert to ISO string
      const isoDate = new Date(value).toISOString();
      setter(isoDate);
    } else {
      setter('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact</label>
            <div className="flex gap-2">
              {selectedSearchContact ? (
                <div className="flex-1 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-900">
                      {[selectedSearchContact.given_name, selectedSearchContact.family_name]
                        .filter(Boolean)
                        .join(' ') || `Contact ${selectedSearchContact.id}`}
                    </span>
                  </div>
                  <button
                    onClick={clearSearchContact}
                    className="text-blue-600 hover:text-blue-800 ml-2"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <Input
                  type="number"
                  placeholder="Enter contact ID"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  min="1"
                  className="flex-1"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSearchContactSelector(true)}
                className="px-3"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Since</label>
            <Input
              type="datetime-local"
              value={formatDateForInput(since)}
              onChange={handleDateChange(setSince)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Until</label>
            <Input
              type="datetime-local"
              value={formatDateForInput(until)}
              onChange={handleDateChange(setUntil)}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={newAppointment}>
            Create Appointment
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({appointments.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No appointments found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment, index) => (
                  <tr key={`${appointment.contact_id}-${appointment.start_date}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {appointment.title || 'No Title'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {appointment.contact_id || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(appointment.start_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(appointment.end_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={appointment.location}>
                        {appointment.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {appointment.user || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={appointment.description}>
                        {appointment.description || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAppointment(appointment)}
                          className="text-xs p-1"
                          title="View appointment details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-xs p-1"
                          title="Edit appointment"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="text-xs p-1 text-red-600 hover:text-red-800 hover:border-red-300"
                          title="Delete appointment"
                        >
                          <Trash2 className="h-4 w-4" />
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
        {!loading && appointments.length > 0 && (
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

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Appointment</h3>
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
                    placeholder="Enter appointment title"
                    required
                  />
                </div>

                {/* Start Date - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(createForm.start_date)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isoDate = value ? new Date(value).toISOString() : '';
                      updateCreateForm('start_date', isoDate);
                    }}
                    required
                  />
                </div>

                {/* End Date - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(createForm.end_date)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isoDate = value ? new Date(value).toISOString() : '';
                      updateCreateForm('end_date', isoDate);
                    }}
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
                    placeholder="Enter appointment description"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    value={createForm.location}
                    onChange={(e) => updateCreateForm('location', e.target.value)}
                    placeholder="Enter appointment location"
                  />
                </div>

                {/* Contact ID and User ID - Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact
                      <span className="text-xs text-gray-500 block">Required for pop-up reminders</span>
                    </label>
                    <div className="flex gap-2">
                      {selectedContact ? (
                        <div className="flex-1 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-900">
                              {[selectedContact.given_name, selectedContact.family_name]
                                .filter(Boolean)
                                .join(' ') || `Contact ${selectedContact.id}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedContact(null)}
                            className="text-blue-600 hover:text-blue-800 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          value={createForm.contact_id}
                          onChange={(e) => updateCreateForm('contact_id', e.target.value)}
                          placeholder="Enter contact ID"
                          min="1"
                          className="flex-1"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectorMode('create');
                          setShowContactSelector(true);
                        }}
                        className="px-3"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User
                      <span className="text-xs text-gray-500 block">Required for pop-up reminders</span>
                    </label>
                    <div className="flex gap-2">
                      {selectedUser ? (
                        <div className="flex-1 flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-900">
                              {[selectedUser.given_name, selectedUser.family_name]
                                .filter(Boolean)
                                .join(' ') || `User ${selectedUser.id}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(null)}
                            className="text-green-600 hover:text-green-800 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          value={createForm.user}
                          onChange={(e) => updateCreateForm('user', e.target.value)}
                          placeholder="Enter user ID"
                          min="1"
                          className="flex-1"
                        />
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectorMode('create');
                          setShowUserSelector(true);
                        }}
                        className="px-3"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Remind Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remind Time (minutes before start)
                  </label>
                  <select
                    value={createForm.remind_time}
                    onChange={(e) => updateCreateForm('remind_time', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">No reminder</option>
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
                  </select>
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
                    disabled={loading || !createForm.title.trim() || !createForm.start_date || !createForm.end_date}
                  >
                    {loading ? 'Creating...' : 'Create Appointment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Contact Selector for Search */}
      <ContactSelector
        isOpen={showSearchContactSelector}
        onClose={() => setShowSearchContactSelector(false)}
        onSelect={handleSearchContactSelect}
        mode="single"
      />

      {/* Contact Selector - Shared between Create and Edit */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleContactSelect}
        mode="single"
      />

      {/* User Selector - Shared between Create and Edit */}
      <UserSelector
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        onSelect={handleUserSelect}
      />

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit Appointment</h3>
                  <p className="text-sm text-gray-500">ID: {editingAppointment.id || 'N/A'}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
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
                      <p className="text-xs text-gray-500 mt-1">Choose how to update the appointment</p>
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
                    placeholder="Enter appointment title"
                    required
                  />
                </div>

                {/* Start Date - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(editForm.start_date)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isoDate = value ? new Date(value).toISOString() : '';
                      updateEditForm('start_date', isoDate);
                    }}
                    required
                  />
                </div>

                {/* End Date - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(editForm.end_date)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const isoDate = value ? new Date(value).toISOString() : '';
                      updateEditForm('end_date', isoDate);
                    }}
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
                    placeholder="Enter appointment description"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {updateType === 'replace' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Replace mode: Leave empty to clear existing content
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => updateEditForm('location', e.target.value)}
                    placeholder="Enter appointment location"
                  />
                  {updateType === 'replace' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Replace mode: Leave empty to clear existing location
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
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={editForm.contact_id}
                          onChange={(e) => updateEditForm('contact_id', e.target.value)}
                          placeholder="Enter contact ID"
                          min="1"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectorMode('edit');
                            setShowContactSelector(true);
                          }}
                          className="px-3"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {updateType === 'replace' && !editSelectedContact && !editForm.contact_id && (
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
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={editForm.user}
                          onChange={(e) => updateEditForm('user', e.target.value)}
                          placeholder="Enter user ID"
                          min="1"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectorMode('edit');
                            setShowUserSelector(true);
                          }}
                          className="px-3"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {updateType === 'replace' && !editSelectedUser && !editForm.user && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Replace mode: No user selected will clear existing user
                      </p>
                    )}
                  </div>
                </div>

                {/* Remind Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remind Time (minutes before start)
                  </label>
                  <select
                    value={editForm.remind_time}
                    onChange={(e) => updateEditForm('remind_time', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">No reminder</option>
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
                  </select>
                  {updateType === 'replace' && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Replace mode: Select "No reminder" to clear existing reminder
                    </p>
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
                    disabled={loading || !editForm.title.trim() || !editForm.start_date || !editForm.end_date}
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
                        {updateType === 'update' ? 'Update Appointment' : 'Replace Appointment'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && appointmentToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Delete Appointment</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Appointment to delete:</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Title:</span> {appointmentToDelete.title || 'N/A'}</p>
                    <p><span className="font-medium">Start:</span> {formatDate(appointmentToDelete.start_date)}</p>
                    <p><span className="font-medium">End:</span> {formatDate(appointmentToDelete.end_date)}</p>
                    {appointmentToDelete.contact_id && (
                      <p><span className="font-medium">Contact ID:</span> {appointmentToDelete.contact_id}</p>
                    )}
                    {appointmentToDelete.location && (
                      <p><span className="font-medium">Location:</span> {appointmentToDelete.location}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">Warning</h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete the appointment and cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDeleteConfirmModal}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmDeleteAppointment}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Appointment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {showViewModal && viewingAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Appointment Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading appointment details...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Appointment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Appointment Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Title</label>
                        <p className="text-sm text-gray-900 mt-1">{(appointmentDetails?.title || viewingAppointment.title) || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Location</label>
                        <p className="text-sm text-gray-900 mt-1">{(appointmentDetails?.location || viewingAppointment.location) || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Start Date</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(appointmentDetails?.start_date || viewingAppointment.start_date)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">End Date</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(appointmentDetails?.end_date || viewingAppointment.end_date)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">User ID</label>
                        <p className="text-sm text-gray-900 mt-1">{(appointmentDetails?.user || viewingAppointment.user) || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase">Remind Time</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {(appointmentDetails?.remind_time || viewingAppointment.remind_time) 
                            ? `${appointmentDetails?.remind_time || viewingAppointment.remind_time} minutes before` 
                            : 'No reminder'}
                        </p>
                      </div>
                    </div>
                    {(appointmentDetails?.description || viewingAppointment.description) && (
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase">Description</label>
                        <p className="text-sm text-gray-900 mt-1">{appointmentDetails?.description || viewingAppointment.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  {contactDetails && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-blue-700 uppercase">Name</label>
                          <p className="text-sm text-blue-900 mt-1">
                            {[contactDetails.given_name, contactDetails.middle_name, contactDetails.family_name]
                              .filter(Boolean)
                              .join(' ') || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 uppercase">Contact ID</label>
                          <p className="text-sm text-blue-900 mt-1">{contactDetails.id}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 uppercase">Email</label>
                          <p className="text-sm text-blue-900 mt-1">
                            {contactDetails.email_addresses?.find(email => email.field === 'EMAIL1')?.email || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-700 uppercase">Phone</label>
                          <p className="text-sm text-blue-900 mt-1">
                            {contactDetails.phone_numbers?.find(phone => phone.field === 'PHONE1')?.number || 'N/A'}
                          </p>
                        </div>
                        {contactDetails.company && (
                          <div>
                            <label className="block text-xs font-medium text-blue-700 uppercase">Company</label>
                            <p className="text-sm text-blue-900 mt-1">{contactDetails.company.company_name || 'N/A'}</p>
                          </div>
                        )}
                        {contactDetails.job_title && (
                          <div>
                            <label className="block text-xs font-medium text-blue-700 uppercase">Job Title</label>
                            <p className="text-sm text-blue-900 mt-1">{contactDetails.job_title}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-blue-700 uppercase">Email Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          contactDetails.email_status === 'Marketable' ? 'bg-green-100 text-green-800' :
                          contactDetails.email_status === 'NonMarketable' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contactDetails.email_status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* No Contact Found Message */}
                  {!detailsLoading && !contactDetails && (appointmentDetails?.contact_id || viewingAppointment.contact_id) && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Contact Information</h4>
                      <p className="text-sm text-yellow-700">
                        Contact ID: {appointmentDetails?.contact_id || viewingAppointment.contact_id} (Contact details could not be loaded)
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeViewModal}
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