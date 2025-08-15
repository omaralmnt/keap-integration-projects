import { useState, useEffect, useCallback } from 'react';
import { Mail, ChevronDown, ChevronRight, Search, Calendar, User, Send, Eye, MousePointer, Plus, X } from 'lucide-react';
import keapAPI from '../../services/keapAPI';

const Input = ({ type = 'text', placeholder, value, onChange, ...props }) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value || ''} 
    onChange={onChange}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
    {...props} 
  />
);

const Select = ({ value, onChange, children, ...props }) => (
  <select value={value || ''} onChange={onChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" {...props}>
    {children}
  </select>
);

const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = variant === 'secondary' 
    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500' 
    : 'text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:ring-blue-500';
  const sizeClasses = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const TextArea = ({ placeholder, value, onChange, rows = 3, ...props }) => (
  <textarea
    placeholder={placeholder}
    value={value || ''}
    onChange={onChange}
    rows={rows}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    {...props}
  />
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2" />{title}
    </h3>
    {children}
  </div>
);

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

// Get status color based on email interactions
const getEmailStatusColor = (email) => {
  if (email.clicked_date) {
    return 'bg-green-100 text-green-800';
  } else if (email.opened_date) {
    return 'bg-blue-100 text-blue-800';
  } else if (email.sent_date) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-gray-100 text-gray-800';
};

// Get status text based on email interactions
const getEmailStatusText = (email) => {
  if (email.clicked_date) {
    return 'Clicked';
  } else if (email.opened_date) {
    return 'Opened';
  } else if (email.sent_date) {
    return 'Sent';
  }
  return 'Draft';
};

// Add Email Modal
const AddEmailModal = ({ isOpen, onClose, onAdd, contactId }) => {
  const [formData, setFormData] = useState({
    subject: '',
    sent_to_address: '',
    sent_to_cc_addresses: '',
    sent_to_bcc_addresses: '',
    sent_from_address: '',
    sent_from_reply_address: '',
    html_content: '',
    plain_content: '',
    headers: '',
    sent_date: '',
    received_date: '',
    opened_date: '',
    clicked_date: '',
    original_provider: 'UNKNOWN',
    original_provider_id: '',
    provider_source_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        subject: '',
        sent_to_address: '',
        sent_to_cc_addresses: '',
        sent_to_bcc_addresses: '',
        sent_from_address: '',
        sent_from_reply_address: '',
        html_content: '',
        plain_content: '',
        headers: '',
        sent_date: '',
        received_date: '',
        opened_date: '',
        clicked_date: '',
        original_provider: 'UNKNOWN',
        original_provider_id: '',
        provider_source_id: ''
      });
      setError('');
    }
  }, [isOpen]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateTimeForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const formatDateTimeForAPI = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toISOString();
    } catch {
      return null;
    }
  };

  const encodeBase64 = (str) => {
    if (!str) return '';
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return str;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailData = {
      ...formData,
      contact_id: parseInt(contactId),
      html_content: formData.html_content ? encodeBase64(formData.html_content) : '',
      plain_content: formData.plain_content ? encodeBase64(formData.plain_content) : '',
      sent_date: formatDateTimeForAPI(formData.sent_date),
      received_date: formatDateTimeForAPI(formData.received_date),
      opened_date: formatDateTimeForAPI(formData.opened_date),
      clicked_date: formatDateTimeForAPI(formData.clicked_date),
    };

    // Remove empty fields
    Object.keys(emailData).forEach(key => {
      if (emailData[key] === '' || emailData[key] === null) {
        delete emailData[key];
      }
    });

    const result = await keapAPI.createEmailRecord(contactId, emailData);
    
    // Verificar si la operación fue exitosa
    if (result.success === false) {
      console.error('Error creating email:', result.error);
      
      let errorMessage = 'Failed to create email';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 400) {
        errorMessage = 'Invalid email information. Please check all fields and try again.';
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to create emails.';
      } else if (result.error?.status === 404) {
        errorMessage = 'Contact not found.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    // Éxito
    console.log('Email created successfully:', result);
    onAdd(); // Refresh the parent component
    onClose(); // Close modal
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add Email Record</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Email Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <Input
                  placeholder="Email subject"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.sent_to_address}
                    onChange={(e) => updateField('sent_to_address', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Address
                  </label>
                  <Input
                    type="email"
                    placeholder="sender@example.com"
                    value={formData.sent_from_address}
                    onChange={(e) => updateField('sent_from_address', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CC Addresses
                  </label>
                  <Input
                    placeholder="cc1@example.com, cc2@example.com"
                    value={formData.sent_to_cc_addresses}
                    onChange={(e) => updateField('sent_to_cc_addresses', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BCC Addresses
                  </label>
                  <Input
                    placeholder="bcc1@example.com, bcc2@example.com"
                    value={formData.sent_to_bcc_addresses}
                    onChange={(e) => updateField('sent_to_bcc_addresses', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply To Address
                </label>
                <Input
                  type="email"
                  placeholder="reply@example.com"
                  value={formData.sent_from_reply_address}
                  onChange={(e) => updateField('sent_from_reply_address', e.target.value)}
                />
              </div>
            </div>

            {/* Email Content */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Content</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plain Text Content
                </label>
                <TextArea
                  placeholder="Plain text email content (will be Base64 encoded)"
                  value={formData.plain_content}
                  onChange={(e) => updateField('plain_content', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content
                </label>
                <TextArea
                  placeholder="HTML email content (will be Base64 encoded)"
                  value={formData.html_content}
                  onChange={(e) => updateField('html_content', e.target.value)}
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headers
                </label>
                <TextArea
                  placeholder="Email headers (JSON format)"
                  value={formData.headers}
                  onChange={(e) => updateField('headers', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Dates</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sent Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.sent_date)}
                    onChange={(e) => updateField('sent_date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.received_date)}
                    onChange={(e) => updateField('received_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opened Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.opened_date)}
                    onChange={(e) => updateField('opened_date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clicked Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.clicked_date)}
                    onChange={(e) => updateField('clicked_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Provider Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Provider Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Provider
                  </label>
                  <Select 
                    value={formData.original_provider} 
                    onChange={(e) => updateField('original_provider', e.target.value)}
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="INFUSIONSOFT">Infusionsoft</option>
                    <option value="MICROSOFT">Microsoft</option>
                    <option value="GOOGLE">Google</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider ID
                  </label>
                  <Input
                    placeholder="Provider-specific ID"
                    value={formData.original_provider_id}
                    onChange={(e) => updateField('original_provider_id', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Source ID
                  </label>
                  <Input
                    type="email"
                    placeholder="source@example.com"
                    value={formData.provider_source_id}
                    onChange={(e) => updateField('provider_source_id', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 justify-end pt-6 border-t">
              <Button 
                type="button"
                variant="secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EmailListItem = ({ email, isExpanded, onToggle }) => {
  const statusColor = getEmailStatusColor(email);
  const statusText = getEmailStatusText(email);

  return (
    <div className="border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      {/* Email Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {email.subject || 'No Subject'}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                {statusText}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Send className="h-3 w-3 mr-1" />
                To: {email.sent_to_address}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(email.sent_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Details - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  From
                </label>
                <p className="text-sm text-gray-900 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1 text-gray-400" />
                  {email.sent_from_address}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  To
                </label>
                <p className="text-sm text-gray-900 mt-1">{email.sent_to_address}</p>
              </div>

              {email.sent_to_cc_addresses && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    CC
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{email.sent_to_cc_addresses}</p>
                </div>
              )}

              {email.sent_to_bcc_addresses && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    BCC
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{email.sent_to_bcc_addresses}</p>
                </div>
              )}

              {email.sent_from_reply_address && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Reply To
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{email.sent_from_reply_address}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Sent Date
                </label>
                <p className="text-sm text-gray-900 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  {formatDate(email.sent_date)}
                </p>
              </div>

              {email.received_date && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Received Date
                  </label>
                  <p className="text-sm text-gray-900 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    {formatDate(email.received_date)}
                  </p>
                </div>
              )}

              {email.opened_date && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Opened Date
                  </label>
                  <p className="text-sm text-gray-900 flex items-center mt-1">
                    <Eye className="h-3 w-3 mr-1 text-gray-400" />
                    {formatDate(email.opened_date)}
                  </p>
                </div>
              )}

              {email.clicked_date && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Clicked Date
                  </label>
                  <p className="text-sm text-gray-900 flex items-center mt-1">
                    <MousePointer className="h-3 w-3 mr-1 text-gray-400" />
                    {formatDate(email.clicked_date)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Provider
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {email.original_provider || 'Unknown'}
                  {email.original_provider_id && ` (ID: ${email.original_provider_id})`}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email ID
                </label>
                <p className="text-sm text-gray-900 mt-1">{email.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function EmailSection({ contactId }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedEmails, setExpandedEmails] = useState(new Set());
  const [searchEmail, setSearchEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    limit: 10,
    offset: 0
  });

  const fetchEmails = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    
    const queryParams = {
      limit: pagination.limit,
      offset: pagination.offset,
      ...params
    };

    if (searchEmail) {
      queryParams.email = searchEmail;
    }

    const result = await keapAPI.getEmailsByContactId(contactId, queryParams);
    
    // Verificar si la operación fue exitosa
    if (result.success === false) {
      console.error('Error loading emails:', result.error);
      
      let errorMessage = 'Failed to load emails';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 404) {
        // Si es 404, probablemente no hay emails, no mostrar error
        setEmails([]);
        setPagination(prev => ({ ...prev, count: 0, next: null, previous: null }));
        setLoading(false);
        return;
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to view emails.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setEmails([]);
      setLoading(false);
      return;
    }
    
    // Éxito
    setEmails(result.emails || []);
    setPagination(prev => ({
      ...prev,
      count: result.count || 0,
      next: result.next,
      previous: result.previous
    }));
    setLoading(false);
  }, [contactId, pagination.limit, pagination.offset, searchEmail]);

  useEffect(() => {
    if (contactId) {
      fetchEmails();
    }
  }, [contactId, fetchEmails]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    fetchEmails({ offset: 0 });
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, offset: 0 }));
    fetchEmails({ limit: newLimit, offset: 0 });
  };

  const handleNextPage = () => {
    if (pagination.next) {
      const newOffset = pagination.offset + pagination.limit;
      setPagination(prev => ({ ...prev, offset: newOffset }));
      fetchEmails({ offset: newOffset });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous && pagination.offset > 0) {
      const newOffset = Math.max(0, pagination.offset - pagination.limit);
      setPagination(prev => ({ ...prev, offset: newOffset }));
      fetchEmails({ offset: newOffset });
    }
  };

  const handleAddEmail = () => {
    fetchEmails(); // Refresh the list
    setShowAddModal(false);
  };
  
  const toggleEmailExpansion = (emailId) => {
    setExpandedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Section icon={Mail} title="Emails">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading emails...</span>
        </div>
      </Section>
    );
  }

  return (
    <Section icon={Mail} title="Emails">
      {/* Search and Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Search by email address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Email
          </Button>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Show:</span>
            <Select 
              value={pagination.limit} 
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-20"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Select>
            <span className="text-sm text-gray-500">per page</span>
          </div>

          {pagination.count > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.count)} of {pagination.count} emails
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!pagination.previous || pagination.offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Emails List */}
      <div className="space-y-3">
        {emails.map((email) => (
          <EmailListItem
            key={email.id}
            email={email}
            isExpanded={expandedEmails.has(email.id)}
            onToggle={() => toggleEmailExpansion(email.id)}
          />
        ))}

        {emails.length === 0 && !error && (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No emails found</p>
            {searchEmail && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setSearchEmail('');
                  handleSearch();
                }}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Email Modal */}
      <AddEmailModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEmail}
        contactId={contactId}
      />
    </Section>
  );
}