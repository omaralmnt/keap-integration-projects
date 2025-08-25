import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/Button';
import { Search, User, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import keapAPI from '../../services/keapAPI';

// Local Input component
const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// Contact Table Row Component
const ContactRow = ({ contact, onToggle, isSelected, mode }) => {
  const fullName = [contact.given_name, contact.middle_name, contact.family_name]
    .filter(Boolean)
    .join(' ') || contact.preferred_name || 'No Name';

  const primaryEmail = contact.email_addresses?.find(email => email.field === 'EMAIL1')?.email || 'N/A';
  const primaryPhone = contact.phone_numbers?.find(phone => phone.field === 'PHONE1')?.number || 'N/A';

  const getEmailStatusColor = (status) => {
    switch (status) {
      case 'UnengagedMarketable':
        return 'bg-yellow-100 text-yellow-800';
      case 'Marketable':
        return 'bg-green-100 text-green-800';
      case 'UnMarketable':
        return 'bg-red-100 text-red-800';
      case 'Engaged':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={() => onToggle(contact)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-5 w-5 mr-3">
            {mode === 'multiple' ? (
              <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300'
              }`}>
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            ) : (
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-gray-300'
              }`}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{fullName}</div>
            <div className="text-sm text-gray-500">ID: {contact.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{primaryEmail}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{contact.company_name || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{primaryPhone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${getEmailStatusColor(contact.email_status)}`}>
          {contact.email_status}
        </span>
      </td>
    </tr>
  );
};

// Selected Contacts Summary Component
const SelectedContactsSummary = ({ selectedContacts, onRemove, mode }) => {
  if (selectedContacts.length === 0 || mode === 'single') return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-blue-900">
          Selected Contacts ({selectedContacts.length})
        </h4>
        <Button
          onClick={() => selectedContacts.forEach(contact => onRemove(contact))}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-300 hover:bg-blue-100"
        >
          Clear All
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {selectedContacts.map((contact) => {
          const name = [contact.given_name, contact.family_name]
            .filter(Boolean)
            .join(' ') || contact.preferred_name || `Contact ${contact.id}`;
          
          return (
            <div
              key={contact.id}
              className="inline-flex items-center bg-white border border-blue-300 rounded-full px-3 py-1 text-sm"
            >
              <span className="text-blue-900 truncate max-w-32">{name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(contact);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main ContactSelector Component
const ContactSelector = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedContactIds = [], 
  mode = 'multiple', // 'single' or 'multiple'
  excludeContactId = null // Contact ID to exclude from results (useful for merge functionality)
}) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');
  
  // Use refs to prevent infinite loops
  const isLoadingRef = useRef(false);
  const lastSearchRef = useRef('');
  const searchTimeoutRef = useRef(null);
  
  const itemsPerPage = 10;

  // Simplified loadContacts function without useCallback to prevent dependency issues
  const loadContacts = async (page = 1, search = '') => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * itemsPerPage;
      
      const queryParams = {
        limit: itemsPerPage,
        page: offset,
        OrderBy: 'FirstName',
        asc: true,
        query: {}
      };

      // Handle search
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        
        if (search.includes('@')) {
          queryParams.query.Email = search;
        } else if (!/^\d+$/.test(search.trim())) {
          const nameParts = search.trim().split(/\s+/);
          if (nameParts.length > 0) {
            queryParams.query.FirstName = nameParts[0];
          }
          if (nameParts.length > 1) {
            queryParams.query.LastName = nameParts.slice(1).join(' ');
          }
        }
      }

      const response = await keapAPI.getContacts(queryParams);
      console.log(response);
      
      let filteredContacts = response.contacts || [];
      
      // Client-side filtering for more flexible search
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filteredContacts = filteredContacts.filter(contact => {
          const fullName = [contact.given_name, contact.middle_name, contact.family_name, contact.preferred_name]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          const email = contact.email_addresses?.[0]?.email?.toLowerCase() || '';
          const company = (contact.company_name || '').toLowerCase();
          const contactId = contact.id.toString();
          
          return fullName.includes(searchLower) ||
                 email.includes(searchLower) ||
                 company.includes(searchLower) ||
                 contactId.includes(searchLower);
        });
      }

      // Exclude specific contact if provided
      if (excludeContactId) {
        filteredContacts = filteredContacts.filter(contact => contact.id !== parseInt(excludeContactId));
      }
      
      setContacts(filteredContacts);
      setTotalCount(response.count || filteredContacts.length);
      setPrevious(response.previous || '');
      setNext(response.next || '');
      
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Handle pagination
  const handlePagination = async (action) => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (action === 'next' && next) {
        response = await keapAPI.getContactsPaginated(next);
        setCurrentPage(prev => prev + 1);
      } else if (action === 'previous' && previous) {
        response = await keapAPI.getContactsPaginated(previous);
        setCurrentPage(prev => Math.max(prev - 1, 1));
      }

      if (response) {
        let filteredContacts = response.contacts || [];
        
        // Apply same filtering logic for paginated results
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredContacts = filteredContacts.filter(contact => {
            const fullName = [contact.given_name, contact.middle_name, contact.family_name, contact.preferred_name]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            const email = contact.email_addresses?.[0]?.email?.toLowerCase() || '';
            const company = (contact.company_name || '').toLowerCase();
            const contactId = contact.id.toString();
            
            return fullName.includes(searchLower) ||
                   email.includes(searchLower) ||
                   company.includes(searchLower) ||
                   contactId.includes(searchLower);
          });
        }

        // Exclude specific contact if provided
        if (excludeContactId) {
          filteredContacts = filteredContacts.filter(contact => contact.id !== parseInt(excludeContactId));
        }

        setContacts(filteredContacts);
        setNext(response.next || '');
        setPrevious(response.previous || '');
      }
    } catch (err) {
      console.error('Error in pagination:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  // Initialize selected contacts from IDs - only run when modal opens
  useEffect(() => {
    if (isOpen && selectedContactIds.length > 0) {
      const initialSelected = selectedContactIds.map(id => ({ 
        id: parseInt(id), 
        given_name: `Contact`, 
        family_name: id 
      }));
      setSelectedContacts(mode === 'single' ? initialSelected.slice(0, 1) : initialSelected);
    } else if (isOpen) {
      setSelectedContacts([]);
    }
  }, [isOpen]); // Only depend on isOpen

  // Load contacts when modal opens - simplified
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
      lastSearchRef.current = '';
      loadContacts(1, '');
    }
  }, [isOpen]);

  // Handle search with debounce - completely rewritten to prevent loops
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      // Only search if the value has actually changed and we're not already loading
      if (value !== lastSearchRef.current && !isLoadingRef.current) {
        lastSearchRef.current = value;
        setCurrentPage(1);
        loadContacts(1, value);
      }
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle contact selection toggle
  const handleContactToggle = (contact) => {
    setSelectedContacts(prev => {
      if (mode === 'single') {
        return [contact];
      } else {
        const isSelected = prev.some(c => c.id === contact.id);
        if (isSelected) {
          return prev.filter(c => c.id !== contact.id);
        } else {
          return [...prev, contact];
        }
      }
    });
  };

  // Remove contact from selection
  const handleRemoveContact = (contact) => {
    setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
  };

  // Confirm selection
  const handleConfirmSelection = () => {
    if (mode === 'single') {
      onSelect(selectedContacts[0] || null);
    } else {
      onSelect(selectedContacts);
    }
    onClose();
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setSelectedContacts([]);
    setContacts([]);
    setError(null);
    lastSearchRef.current = '';
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Select Contact{mode === 'multiple' ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-500">
              {mode === 'single' 
                ? 'Choose a contact' 
                : 'Choose contacts'
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Selected Contacts Summary */}
        <div className="p-6 border-b border-gray-200">
          <SelectedContactsSummary
            selectedContacts={selectedContacts}
            onRemove={handleRemoveContact}
            mode={mode}
          />
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, email, company, or ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading contacts...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <Button
                onClick={() => loadContacts(currentPage, searchTerm)}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No contacts found matching your search.' : 'No contacts available.'}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      onToggle={handleContactToggle}
                      isSelected={selectedContacts.some(c => c.id === contact.id)}
                      mode={mode}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && contacts.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => handlePagination('previous')}
                disabled={!previous}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePagination('next')}
                disabled={!next}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page {currentPage} of results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePagination('previous')}
                    disabled={!previous}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => handlePagination('next')}
                    disabled={!next}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            onClick={handleConfirmSelection}
            disabled={selectedContacts.length === 0}
            className="w-full sm:w-auto sm:ml-3"
          >
            {mode === 'single' 
              ? `Select Contact${selectedContacts.length > 0 ? '' : ''}` 
              : `Select ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`
            }
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ContactSelector;