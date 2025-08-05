import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
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

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Main ApplyTagToContactsModal Component
export function ApplyTagToContactsModal({ 
  isOpen, 
  onClose, 
  tagId, 
  tagName,
  onSuccess 
}) {
  const [contacts, setContacts] = useState([]);
  const [taggedContactIds, setTaggedContactIds] = useState(new Set());
  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  
  // Search parameters
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);

  // Fetch contacts
  const fetchContacts = async (searchParams = {}) => {
    try {
      setLoading(true);
      
      // Build query parameters based on search
      const queryParams = {
        limit,
        offset: searchParams.offset || 0
      };

      // Add search filters - only one at a time to avoid conflicts
      const nameQuery = searchParams.nameQuery || searchName;
      const emailQuery = searchParams.emailQuery || searchEmail;
      
      if (emailQuery.trim()) {
        queryParams.email = emailQuery.trim();
      } else if (nameQuery.trim()) {
        queryParams.given_name = nameQuery.trim();
      }

      const contactsData = await keapAPI.getContacts(queryParams);
      setContacts(contactsData.contacts || []);
      
      // Fetch tagged contacts to mark them
      await fetchTaggedContacts();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts that already have this tag
  const fetchTaggedContacts = async () => {
    try {
      const taggedData = await keapAPI.getTaggedContacts(tagId, { limit: 1000 });
      const taggedIds = new Set((taggedData.contacts || []).map(item => item.contact.id));
      setTaggedContactIds(taggedIds);
      
      // Auto-select already tagged contacts and make them non-deselectable
      setSelectedContactIds(prev => {
        const newSelected = new Set(prev);
        taggedIds.forEach(id => newSelected.add(id));
        return newSelected;
      });
    } catch (error) {
      console.error('Error fetching tagged contacts:', error);
      setTaggedContactIds(new Set());
    }
  };

  // Load contacts when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedContactIds(new Set());
      setSearchName('');
      setSearchEmail('');
      setOffset(0);
      fetchContacts();
    }
  }, [isOpen]);

  // Search handler
  const handleSearch = () => {
    setOffset(0);
    fetchContacts({ 
      offset: 0, 
      nameQuery: searchName, 
      emailQuery: searchEmail 
    });
  };

  // Pagination handlers
  const handlePrevious = () => {
    const newOffset = Math.max(0, offset - limit);
    setOffset(newOffset);
    fetchContacts({ 
      offset: newOffset, 
      nameQuery: searchName, 
      emailQuery: searchEmail 
    });
  };

  const handleNext = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchContacts({ 
      offset: newOffset, 
      nameQuery: searchName, 
      emailQuery: searchEmail 
    });
  };

  // Selection handlers
  const handleSelectContact = (contactId) => {
    // Don't allow deselecting contacts that already have the tag
    if (taggedContactIds.has(contactId)) {
      return;
    }
    
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  const handleSelectAll = () => {
    // Only select/deselect contacts that don't already have the tag
    const selectableContacts = contacts.filter(contact => !taggedContactIds.has(contact.id));
    
    if (selectedContactIds.size === selectableContacts.length) {
      // Deselect all selectable contacts
      const newSelected = new Set();
      // Keep any tagged contacts that might be selected
      selectedContactIds.forEach(id => {
        if (taggedContactIds.has(id)) {
          newSelected.add(id);
        }
      });
      setSelectedContactIds(newSelected);
    } else {
      // Select all selectable contacts
      const newSelected = new Set(selectedContactIds);
      selectableContacts.forEach(contact => {
        newSelected.add(contact.id);
      });
      setSelectedContactIds(newSelected);
    }
  };

  // Apply tag to selected contacts
  const handleApplyTag = async () => {
    if (selectedContactIds.size === 0) return;

    try {
      setApplying(true);
      
      await keapAPI.applyTagToContacts(tagId, {
        ids: Array.from(selectedContactIds)
      });

      // Success callback
      if (onSuccess) {
        onSuccess(selectedContactIds.size);
      }

      // Reset and close
      setSelectedContactIds(new Set());
      onClose();
      
    } catch (error) {
      console.error('Error applying tag to contacts:', error);
      // You might want to show an error message here
    } finally {
      setApplying(false);
    }
  };

  // Format contact display name
  const getContactDisplayName = (contact) => {
    const firstName = contact.given_name || '';
    const lastName = contact.family_name || '';
    const preferredName = contact.preferred_name || '';
    
    if (preferredName) return preferredName;
    return `${firstName} ${lastName}`.trim() || 'Unnamed Contact';
  };

  // Get contact email
  const getContactEmail = (contact) => {
    if (contact.email_addresses && contact.email_addresses.length > 0) {
      return contact.email_addresses[0].email;
    }
    return null;
  };

  // Get contact phone
  const getContactPhone = (contact) => {
    if (contact.phone_numbers && contact.phone_numbers.length > 0) {
      return contact.phone_numbers[0].number;
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Apply Tag to Contacts</h2>
            <p className="text-sm text-gray-600">
              Apply "{tagName}" to selected contacts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 space-y-3">
          <Input
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Input
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading} className="w-full">
            {loading ? 'Searching...' : 'Search Contacts'}
          </Button>
        </div>

        {/* Selection Summary */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedContactIds.size} selected
              {taggedContactIds.size > 0 && (
                <span className="text-xs text-gray-600 ml-1">
                  ({taggedContactIds.size} already tagged)
                </span>
              )}
            </span>
            {contacts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-600 text-xs px-2 py-1"
              >
                {(() => {
                  const selectableContacts = contacts.filter(contact => !taggedContactIds.has(contact.id));
                  const selectedSelectableCount = selectableContacts.filter(contact => selectedContactIds.has(contact.id)).length;
                  return selectedSelectableCount === selectableContacts.length ? 'Deselect All' : 'Select All';
                })()}
              </Button>
            )}
          </div>
        </div>

        {/* Contacts List */}
        <div className="border rounded-lg max-h-64 overflow-y-auto mb-4">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Loading...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No contacts found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => {
                const isSelected = selectedContactIds.has(contact.id);
                const isAlreadyTagged = taggedContactIds.has(contact.id);
                const displayName = getContactDisplayName(contact);
                const email = getContactEmail(contact);
                
                return (
                  <div
                    key={contact.id}
                    className={`p-3 transition-colors ${
                      isAlreadyTagged 
                        ? 'bg-green-50 cursor-not-allowed' 
                        : `cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`
                    }`}
                    onClick={() => !isAlreadyTagged && handleSelectContact(contact.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isAlreadyTagged && handleSelectContact(contact.id)}
                        disabled={isAlreadyTagged}
                        className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${
                          isAlreadyTagged 
                            ? 'text-green-600 bg-green-100 cursor-not-allowed' 
                            : 'text-blue-600 cursor-pointer'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            isAlreadyTagged ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {displayName}
                          </span>
                          {isAlreadyTagged && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Already Tagged
                            </span>
                          )}
                        </div>
                        {email && (
                          <p className={`text-xs truncate ${
                            isAlreadyTagged ? 'text-green-600' : 'text-gray-600'
                          }`}>{email}</p>
                        )}
                        {contact.company_name && (
                          <p className={`text-xs truncate ${
                            isAlreadyTagged ? 'text-green-500' : 'text-gray-500'
                          }`}>{contact.company_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && contacts.length > 0 && (
          <div className="flex justify-between items-center mb-4 text-xs">
            <span className="text-gray-500">
              {contacts.length} contacts
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={handlePrevious}
                className="px-2 py-1 text-xs"
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={contacts.length < limit}
                onClick={handleNext}
                className="px-2 py-1 text-xs"
              >
                →
              </Button>
            </div>
          </div>
        )}

        {/* Apply Button - More Prominent */}
        <div className="space-y-3">
          <Button
            onClick={handleApplyTag}
            disabled={applying || selectedContactIds.size === 0 || selectedContactIds.size === taggedContactIds.size}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 disabled:bg-gray-400"
          >
            {applying ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Applying Tag...</span>
              </div>
            ) : (
              (() => {
                const newContactsCount = selectedContactIds.size - taggedContactIds.size;
                return newContactsCount > 0 
                  ? `Apply Tag to ${newContactsCount} New Contact${newContactsCount !== 1 ? 's' : ''}`
                  : 'Select contacts to apply tag';
              })()
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={applying}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}