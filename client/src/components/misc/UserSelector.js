import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Search, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// User Table Row Component
const UserRow = ({ user, onSelect, isSelected }) => {
  const fullName = [user.given_name, user.middle_name, user.family_name]
    .filter(Boolean)
    .join(' ') || user.preferred_name || 'No Name';

  const primaryPhone = user.phone_numbers?.find(phone => phone.field === 'PHONE1')?.number || 'N/A';

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={() => onSelect(user)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{fullName}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email_address || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.company_name || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{primaryPhone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
          user.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      </td>
    </tr>
  );
};

// Main UserSelector Component
const UserSelector = ({ isOpen, onClose, onSelect, selectedUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const itemsPerPage = 10;

  // Load users
  const loadUsers = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * itemsPerPage;
      const queryParams = {
        limit: itemsPerPage,
        offset: offset,
        include_inactive: true,
        include_partners: true
      };

      const response = await keapAPI.getUsers(queryParams);
      
      // Filter users by search term (client-side filtering)
      let filteredUsers = response.users || [];
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => {
          const fullName = [user.given_name, user.middle_name, user.family_name, user.preferred_name]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          const email = (user.email_address || '').toLowerCase();
          const company = (user.company_name || '').toLowerCase();
          const userId = user.id.toString();
          
          return fullName.includes(searchLower) ||
                 email.includes(searchLower) ||
                 company.includes(searchLower) ||
                 userId.includes(searchLower);
        });
      }
      
      setUsers(filteredUsers);
      setTotalCount(response.count || filteredUsers.length);
      
      // Find and set selected user if it exists
      if (selectedUserId) {
        const selected = filteredUsers.find(user => user.id === parseInt(selectedUserId));
        setSelectedUser(selected || null);
      }
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers(currentPage, searchTerm);
    }
  }, [isOpen, currentPage]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadUsers(1, value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  // Confirm selection
  const handleConfirmSelection = () => {
    if (selectedUser) {
      onSelect(selectedUser);
      onClose();
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Select User</h3>
            <p className="text-sm text-gray-500">Choose a user to send the email from</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by name, email, company, or ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <Button
                onClick={() => loadUsers(currentPage, searchTerm)}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users available.'}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onSelect={handleUserSelect}
                      isSelected={selectedUser?.id === user.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
            disabled={!selectedUser}
            className="w-full sm:w-auto sm:ml-3"
          >
            Select User
          </Button>
          <Button
            onClick={onClose}
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

export default UserSelector;