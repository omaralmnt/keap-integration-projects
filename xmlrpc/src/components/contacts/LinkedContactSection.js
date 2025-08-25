import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, X, User, Mail, Phone, Trash2 } from 'lucide-react';
import keapAPI from '../../services/keapAPI';
import ContactSelector from '../misc/ContactSelector';

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
    : variant === 'danger'
    ? 'text-white bg-red-600 border border-transparent hover:bg-red-700 focus:ring-red-500'
    : 'text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:ring-blue-500';
  const sizeClasses = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2" />{title}
    </h3>
    {children}
  </div>
);

// Unlink Confirmation Modal
const UnlinkConfirmationModal = ({ isOpen, onClose, onConfirm, contact, loading }) => {
  if (!isOpen) return null;

  const getContactDisplayName = (contact) => {
    const firstName = contact['Contact.FirstName'] || '';
    const lastName = contact['Contact.LastName'] || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Contact';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Unlink Contact</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to unlink this contact?
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-gray-400" />
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {getContactDisplayName(contact)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {contact['Contact.Id']} • Link ID: {contact['Link.Id']}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button 
              type="button"
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="danger"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Unlinking...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Unlink Contact
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Linked Contact Modal - Ahora usa ContactSelector
const AddLinkedContactModal = ({ isOpen, onClose, onAdd, contactId }) => {
  const [formData, setFormData] = useState({
    linkedContactId: '',
    linkTypeName: 'friends'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        linkedContactId: '',
        linkTypeName: ''
      });
      setError('');
      setSelectedContact(null);
    }
  }, [isOpen]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle contact selection from ContactSelector
  const handleContactSelect = (contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData(prev => ({ ...prev, linkedContactId: contact.id }));
    }
    setShowContactSelector(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await keapAPI.linkContacts(contactId, formData.linkedContactId);
    
    if (result.success === false) {
      console.error('Error adding linked contact:', result.error);
      
      let errorMessage = 'Failed to link contact';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 400) {
        errorMessage = 'Invalid contact information. Please check all fields and try again.';
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to link contacts.';
      } else if (result.error?.status === 404) {
        errorMessage = 'Contact not found.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    console.log('Linked contact created successfully:', result);
    onAdd(); // Refresh the parent component
    onClose(); // Close modal
    setLoading(false);
  };

  if (!isOpen) return null;

  // Helper function to get contact display name
  const getContactDisplayName = (contact) => {
    if (!contact) return '';
    const fullName = [contact.given_name, contact.middle_name, contact.family_name]
      .filter(Boolean)
      .join(' ') || contact.preferred_name;
    return fullName || `Contact ${contact.id}`;
  };

  const getContactEmail = (contact) => {
    if (!contact) return '';
    return contact.email_addresses?.find(email => email.field === 'EMAIL1')?.email || 
           contact.email_addresses?.[0]?.email || '';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Link Contact</h3>
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
              {/* Contact Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Contact *
                </label>
                
                {selectedContact ? (
                  <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getContactDisplayName(selectedContact)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getContactEmail(selectedContact) && (
                              <span>{getContactEmail(selectedContact)}</span>
                            )}
                            {getContactEmail(selectedContact) && <span className="mx-1">•</span>}
                            <span>ID: {selectedContact.id}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowContactSelector(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowContactSelector(true)}
                    className="w-full justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Select Contact
                  </Button>
                )}
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Type *
                </label>
                <Input 
                  value={formData.linkTypeName} 
                  onChange={(e) => updateField('linkTypeName', e.target.value)}
                  placeholder="e.g., Friend, Colleague, Client, Family Member..."
                  
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter any relationship type (e.g., Friend, Colleague, Client, Family Member)
                </p>
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
                  disabled={loading || !formData.linkedContactId || formData.linkTypeName.trim()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Linking...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Link Contact
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ContactSelector Modal */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelect={handleContactSelect}
        mode="single"
        excludeContactId={contactId} // Exclude current contact
      />
    </>
  );
};

export function LinkedContactsSection({ contactId }) {
  const [linkedContacts, setLinkedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [contactToUnlink, setContactToUnlink] = useState(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  const fetchLinkedContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const result = await keapAPI.getLinkedContacts(contactId);
    
    if (result.success === false) {
      console.error('Error loading linked contacts:', result.error);
      
      let errorMessage = 'Failed to load linked contacts';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 404) {
        // If it's 404, probably no linked contacts, don't show error
        setLinkedContacts([]);
        setLoading(false);
        return;
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to view linked contacts.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setLinkedContacts([]);
      setLoading(false);
      return;
    }
    
    // Success - handle the API response format
    const contacts = result.result || result || [];
    setLinkedContacts(contacts);
    setLoading(false);
  }, [contactId]);

  useEffect(() => {
    if (contactId) {
      fetchLinkedContacts();
    }
  }, [contactId, fetchLinkedContacts]);

  const handleAddContact = () => {
    fetchLinkedContacts(); // Refresh the list
    setShowAddModal(false);
  };

  const handleUnlinkClick = (contact) => {
    setContactToUnlink(contact);
    setShowUnlinkModal(true);
  };

  const handleUnlinkConfirm = async () => {
    if (!contactToUnlink) return;

    setUnlinkLoading(true);
    
    const result = await keapAPI.unlinkContacts(contactId, contactToUnlink['Contact.Id']);
    
    if (result.success === false) {
      console.error('Error unlinking contact:', result.error);
      
      let errorMessage = 'Failed to unlink contact';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 400) {
        errorMessage = 'Invalid request. Please try again.';
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to unlink contacts.';
      } else if (result.error?.status === 404) {
        errorMessage = 'Link not found or already removed.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setUnlinkLoading(false);
      return;
    }
    
    console.log('Contact unlinked successfully:', result);
    setShowUnlinkModal(false);
    setContactToUnlink(null);
    setUnlinkLoading(false);
    fetchLinkedContacts(); // Refresh the list
  };

  const handleUnlinkCancel = () => {
    setShowUnlinkModal(false);
    setContactToUnlink(null);
  };

  const getLinkTypeColor = (linkType) => {
    // Generate a consistent color based on the text
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800'
    ];
    
    // Simple hash function to get consistent color for same text
    let hash = 0;
    for (let i = 0; i < linkType.length; i++) {
      hash = ((hash << 5) - hash + linkType.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatLinkTypeName = (linkType) => {
    return linkType || 'Unknown';
  };

  const getContactDisplayName = (contact) => {
    const firstName = contact['Contact.FirstName'] || '';
    const lastName = contact['Contact.LastName'] || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Contact';
  };

  if (loading) {
    return (
      <Section icon={Users} title="Linked Contacts">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading linked contacts...</span>
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section icon={Users} title="Linked Contacts">
        {/* Header with actions */}
        <div className="flex justify-end items-center mb-4">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Contact
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
            <button 
              onClick={() => setError('')} 
              className="text-red-600 hover:text-red-800 text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Linked Contacts List */}
        <div className="space-y-3">
          {linkedContacts.map((contact, index) => (
            <div key={contact['Contact.Id'] || index} className="flex items-center p-4 bg-gray-50 rounded-lg border group">
              <div className="flex items-center space-x-4 flex-1">
                <User className="h-8 w-8 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">
                      {getContactDisplayName(contact)}
                    </span>
                    {contact['Link.TypeName'] && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLinkTypeColor(contact['Link.TypeName'])}`}>
                        {formatLinkTypeName(contact['Link.TypeName'])}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {contact['Contact.Email'] && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{contact['Contact.Email']}</span>
                      </div>
                    )}
                    <span>ID: {contact['Contact.Id']}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-400">
                  Link ID: {contact['Link.Id']}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleUnlinkClick(contact)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Unlink contact"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {linkedContacts.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No linked contacts found</p>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Link First Contact
              </Button>
            </div>
          )}
        </div>
      </Section>

      {/* Add Linked Contact Modal */}
      <AddLinkedContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddContact}
        contactId={contactId}
      />

      {/* Unlink Confirmation Modal */}
      <UnlinkConfirmationModal
        isOpen={showUnlinkModal}
        onClose={handleUnlinkCancel}
        onConfirm={handleUnlinkConfirm}
        contact={contactToUnlink}
        loading={unlinkLoading}
      />
    </>
  );
}