import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { ChevronDown, ChevronRight, X, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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

// Batch Delete Confirmation Modal
const BatchDeleteConfirmationModal = ({ isOpen, onClose, onConfirm, selectedEmails, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Confirm Batch Delete</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete {selectedEmails.length} email{selectedEmails.length > 1 ? 's' : ''}? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4 max-h-40 overflow-y-auto">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Selected emails:
            </div>
            {selectedEmails.map((email) => (
              <div key={email.id} className="text-xs text-gray-600 mb-1 p-2 bg-white rounded border">
                <div className="font-medium truncate">
                  {email.subject || 'No Subject'}
                </div>
                <div className="text-gray-500">
                  To: {email.sent_to_address} | ID: {email.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedEmails.length} Email{selectedEmails.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal for Delete (single email)
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, email, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Confirm Delete</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this email? This action cannot be undone.
          </p>
          
          {email && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-1">
                  {email.subject || 'No Subject'}
                </div>
                <div className="text-gray-600">
                  To: {email.sent_to_address}
                </div>
                <div className="text-gray-500">
                  ID: {email.id}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Email
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Modal component for email content
const EmailModal = ({ email, isOpen, onClose, loading }) => {
  const [activeTab, setActiveTab] = useState('html');

  // Function to decode Base64 content
  const decodeBase64 = (base64String) => {
    try {
      return atob(base64String);
    } catch (error) {
      console.error('Error decoding Base64:', error);
      return base64String; // Return original if decoding fails
    }
  };

  // Check if content is Base64 encoded and decode if necessary
  const getDecodedContent = (content) => {
    if (!content) return content;
    
    // Simple check if it looks like Base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (base64Regex.test(content) && content.length > 100) {
      return decodeBase64(content);
    }
    return content;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Email Content</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading email content...</p>
          </div>
        ) : email ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Subject:</strong> {email.subject || 'N/A'}</div>
                <div><strong>From:</strong> {email.sent_from_address || 'N/A'}</div>
                <div><strong>To:</strong> {email.sent_to_address || 'N/A'}</div>
                <div><strong>Sent:</strong> {email.sent_date ? new Date(email.sent_date).toLocaleString() : 'N/A'}</div>
                {email.sent_to_cc_addresses && (
                  <div><strong>CC:</strong> {email.sent_to_cc_addresses}</div>
                )}
                {email.sent_to_bcc_addresses && (
                  <div><strong>BCC:</strong> {email.sent_to_bcc_addresses}</div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {/* Tabs for different content types */}
              <div className="border-b">
                <nav className="flex space-x-8 px-4" aria-label="Tabs">
                  <button 
                    onClick={() => setActiveTab('html')}
                    className={`py-2 px-1 text-sm font-medium border-b-2 ${
                      activeTab === 'html' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    HTML Content
                  </button>
                  <button 
                    onClick={() => setActiveTab('plain')}
                    className={`py-2 px-1 text-sm font-medium border-b-2 ${
                      activeTab === 'plain' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Plain Text
                  </button>
                  <button 
                    onClick={() => setActiveTab('headers')}
                    className={`py-2 px-1 text-sm font-medium border-b-2 ${
                      activeTab === 'headers' 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Headers
                  </button>
                </nav>
              </div>

              {/* HTML Content */}
              {activeTab === 'html' && (
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-2">HTML Content:</div>
                  {email.html_content ? (
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={getDecodedContent(email.html_content)}
                        className="w-full h-96"
                        title="Email HTML Content"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded text-sm text-gray-500">
                      No HTML content available
                    </div>
                  )}
                </div>
              )}

              {/* Plain Text Content */}
              {activeTab === 'plain' && (
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-2">Plain Text Content:</div>
                  <div className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-auto">
                    {getDecodedContent(email.plain_content) || 'No plain text content available'}
                  </div>
                </div>
              )}

              {/* Headers */}
              {activeTab === 'headers' && (
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-2">Email Headers:</div>
                  <div className="bg-gray-100 p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                    {getDecodedContent(email.headers) || 'No headers available'}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Failed to load email content
          </div>
        )}
      </div>
    </div>
  );
};

// Main Emails Component
export function Emails() {
  const navigate = useNavigate();

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [modalEmail, setModalEmail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Selection states
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Delete confirmation modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    email: null,
    loading: false
  });

  // Batch delete modal states
  const [batchDeleteModal, setBatchDeleteModal] = useState({
    isOpen: false,
    loading: false
  });
  
  // Search parameters
  const [contactId, setContactId] = useState('');
  const [email, setEmail] = useState('');
  const [limit, setLimit] = useState(3);
  const [offset, setOffset] = useState(0);
  const [sinceSentDate, setSinceSentDate] = useState('');
  const [untilSentDate, setUntilSentDate] = useState('');
  const [ordered, setOrdered] = useState(true);

  // Pagination states
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Selection handlers
  const handleSelectEmail = (emailItem, checked) => {
    if (checked) {
      setSelectedEmails(prev => [...prev, emailItem]);
    } else {
      setSelectedEmails(prev => prev.filter(e => e.id !== emailItem.id));
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEmails([...emails]);
    } else {
      setSelectedEmails([]);
    }
  };

  // Update selectAll state when selectedEmails changes
  const updateSelectAllState = () => {
    if (emails.length > 0 && selectedEmails.length === emails.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  // Effect to update selectAll state
  useEffect(() => {
    updateSelectAllState();
  }, [selectedEmails, emails]);

  const handlePagination = async (action) => {
    let data;
    if (action === 'next') {
      data = await keapAPI.getEmailsPaginated(next);
      setOffset(Number(offset) + Number(limit));
    } else {
      data = await keapAPI.getEmailsPaginated(previous);
      if (Number(offset) - Number(limit) > -1) {
        setOffset(Number(offset) - Number(limit));
      }
    }
    console.log(data);
    setEmails(data.emails);
    setNext(data.next);
    setPrevious(data.previous);
    // Clear selections when changing pages
    setSelectedEmails([]);
    setSelectAll(false);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const formattedSince = formatDateForAPI(sinceSentDate);
      const formattedUntil = formatDateForAPI(untilSentDate);
      
      const queryParams = {
        contact_id: contactId ? parseInt(contactId) : undefined,
        email,
        limit,
        offset,
        ordered,
        since_sent_date: formattedSince,
        until_sent_date: formattedUntil
      };

      console.log('Search params:', queryParams);
      const data = await keapAPI.getEmails(queryParams);
      setEmails(data.emails);
      setPrevious(data.previous);
      setNext(data.next);
      
      // Clear selections when searching
      setSelectedEmails([]);
      setSelectAll(false);
      
    } catch (error) {
      console.log('Search error:', error);   
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return undefined;
    return dateTimeLocal + ':00.000Z';
  };

  const toggleExpanded = (emailId) => {
    setExpandedEmail(expandedEmail === emailId ? null : emailId);
  };

  const openModal = async (email) => {
    setModalEmail(null);
    setModalLoading(true);
    
    try {
      const emailDetails = await keapAPI.getEmailById(email.id);
      setModalEmail(emailDetails);
      
    } catch (error) {
      console.error('Error loading email details:', error);
      setModalEmail(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalEmail(null);
    setModalLoading(false);
  };

  // Single delete functionality
  const openDeleteModal = (emailToDelete) => {
    setDeleteModal({
      isOpen: true,
      email: emailToDelete,
      loading: false
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      email: null,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.email) return;

    setDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      const response = await keapAPI.deleteEmailRecord(deleteModal.email.id);
      if (response?.error.status === 400) {
        toast.error('User does not have permission to delete this record');
        return;
      }

      setEmails(prevEmails => prevEmails.filter(email => email.id !== deleteModal.email.id));
      setSelectedEmails(prev => prev.filter(email => email.id !== deleteModal.email.id));
      
      if (expandedEmail === deleteModal.email.id) {
        setExpandedEmail(null);
      }
      
      if (modalEmail && modalEmail.id === deleteModal.email.id) {
        closeModal();
      }
      
      closeDeleteModal();
      
      console.log('Email deleted successfully:', deleteModal.email.id);
      
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Failed to delete email. Please try again.');
    } finally {
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Batch delete functionality
  const openBatchDeleteModal = () => {
    setBatchDeleteModal({
      isOpen: true,
      loading: false
    });
  };

  const closeBatchDeleteModal = () => {
    setBatchDeleteModal({
      isOpen: false,
      loading: false
    });
  };

  const handleBatchDeleteConfirm = async () => {
    if (selectedEmails.length === 0) return;

    setBatchDeleteModal(prev => ({ ...prev, loading: true }));

    try {
      const emailIds = selectedEmails.map(email => email.id);
      const response = await keapAPI.deleteEmailRecordsBatch(emailIds);
      
      console.log('Batch delete response:', response);
      
      // Check if response contains error information for individual IDs
      if (response && typeof response === 'object') {
        const errorIds = [];
        const successIds = [];
        
        // Analyze the response to separate successful deletions from errors
        emailIds.forEach(id => {
          const idStr = id.toString();
          if (response[idStr]) {
            // This ID has an error
            errorIds.push({ id: id, error: response[idStr] });
          } else {
            // This ID was successfully deleted (not present in error response)
            successIds.push(id);
          }
        });
        
        // If all emails failed to delete
        if (errorIds.length === emailIds.length) {
          const permissionErrors = errorIds.filter(item => item.error === 'NO_PERMISSION').length;
          if (permissionErrors === errorIds.length) {
            toast.error('No permission to delete any of the selected emails.');
          } else {
            toast.error('Failed to delete all selected emails. Check the errors in console.');
          }
          console.error('All emails failed to delete:', errorIds);
          return; // Don't update the UI if nothing was deleted
        }
        
        // If some succeeded and some failed
        if (errorIds.length > 0 && successIds.length > 0) {
          const permissionErrors = errorIds.filter(item => item.error === 'NO_PERMISSION').length;
          toast.warning(
            `${successIds.length} email${successIds.length > 1 ? 's' : ''} deleted successfully. ` +
            `${errorIds.length} failed (${permissionErrors} permission denied).`
          );
          console.warn('Partial success in batch delete:', { successIds, errorIds });
        }
        
        // If all succeeded (no errors in response)
        if (errorIds.length === 0) {
          toast.success(`${emailIds.length} email${emailIds.length > 1 ? 's' : ''} deleted successfully`);
        }
        
        // Remove only successfully deleted emails from the list
        const idsToRemove = errorIds.length > 0 ? successIds : emailIds;
        setEmails(prevEmails => prevEmails.filter(email => !idsToRemove.includes(email.id)));
        
        // Update selections to remove only successfully deleted emails
        setSelectedEmails(prev => prev.filter(email => !idsToRemove.includes(email.id)));
        
        // If no emails are left selected, uncheck select all
        if (selectedEmails.every(email => idsToRemove.includes(email.id))) {
          setSelectAll(false);
        }
        
        // Close expanded view if it was one of the successfully deleted emails
        if (expandedEmail && idsToRemove.includes(expandedEmail)) {
          setExpandedEmail(null);
        }
        
        // Close modal if it was one of the successfully deleted emails
        if (modalEmail && idsToRemove.includes(modalEmail.id)) {
          closeModal();
        }
        
      } else {
        // Unexpected response format
        console.error('Unexpected response format:', response);
        toast.error('Unexpected response from server. Please try again.');
      }
      
      closeBatchDeleteModal();
      
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast.error('Failed to delete emails. Please try again.');
    } finally {
      setBatchDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Emails</h1>

      {/* Compact Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Contact ID"
            type="number"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          />
          <Input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Limit"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 3)}
              min="1"
              max="1000"
              className="w-20"
            />
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={ordered}
                onChange={(e) => setOrdered(e.target.checked)}
                className="rounded"
              />
              <span>Ordered</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Since Sent Date</label>
            <Input
              type="datetime-local"
              value={sinceSentDate}
              onChange={(e) => setSinceSentDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Until Sent Date</label>
            <Input
              type="datetime-local"
              value={untilSentDate}
              onChange={(e) => setUntilSentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search Emails'}
          </Button>
          <Button variant='secondary' onClick={() => navigate(`/emails/create`)} disabled={loading}>
            Create email/record
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Results ({emails.length})
            </h3>
            
            {/* Batch Actions */}
            {selectedEmails.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedEmails.length} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={openBatchDeleteModal}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-6 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No emails found. Click search to start.</p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Select all emails on this page
                </span>
              </label>
            </div>

            <div className="divide-y divide-gray-200">
              {emails.map((emailItem) => (
                <div key={emailItem.id} className="hover:bg-gray-50">
                  {/* Compact Row */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedEmails.some(e => e.id === emailItem.id)}
                        onChange={(e) => handleSelectEmail(emailItem, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {/* Expand/Collapse */}
                      <div 
                        className="flex-shrink-0 cursor-pointer"
                        onClick={() => toggleExpanded(emailItem.id)}
                      >
                        {expandedEmail === emailItem.id ? 
                          <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      
                      {/* Email Info */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => toggleExpanded(emailItem.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="font-medium text-gray-900 truncate">
                            {emailItem.subject || 'No Subject'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {emailItem.sent_to_address}
                          </div>
                          <div className="text-sm text-gray-400 whitespace-nowrap">
                            {formatDate(emailItem.sent_date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(emailItem);
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(emailItem);
                        }}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedEmail === emailItem.id && (
                    <div className="px-4 pb-3 bg-gray-50 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">ID:</span>
                          <span className="ml-2 text-gray-600">{emailItem.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Contact ID:</span>
                          <span className="ml-2 text-gray-600">{emailItem.contact_id || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">From:</span>
                          <span className="ml-2 text-gray-600">{emailItem.sent_from_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Reply To:</span>
                          <span className="ml-2 text-gray-600">{emailItem.sent_from_reply_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">CC:</span>
                          <span className="ml-2 text-gray-600">{emailItem.sent_to_cc_addresses || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">BCC:</span>
                          <span className="ml-2 text-gray-600">{emailItem.sent_to_bcc_addresses || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Opened:</span>
                          <span className="ml-2 text-gray-600">{formatDate(emailItem.opened_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Clicked:</span>
                          <span className="ml-2 text-gray-600">{formatDate(emailItem.clicked_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Received:</span>
                          <span className="ml-2 text-gray-600">{formatDate(emailItem.received_date)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Provider:</span>
                          <span className="ml-2 text-gray-600">{emailItem.original_provider || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && emails.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={offset === 0}
                onClick={() => handlePagination('previous')}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Showing {offset + 1} - {Math.min(offset + limit, offset + emails.length)}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                disabled={emails.length < limit}
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Email Content Modal */}
      <EmailModal 
        email={modalEmail} 
        isOpen={!!modalEmail || modalLoading} 
        onClose={closeModal}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        email={deleteModal.email}
        loading={deleteModal.loading}
      />

      {/* Batch Delete Confirmation Modal */}
      <BatchDeleteConfirmationModal
        isOpen={batchDeleteModal.isOpen}
        onClose={closeBatchDeleteModal}
        onConfirm={handleBatchDeleteConfirm}
        selectedEmails={selectedEmails}
        loading={batchDeleteModal.loading}
      />
    </div>
  );
}