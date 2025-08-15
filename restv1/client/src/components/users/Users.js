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

// Main Users Component
export function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailSignature, setEmailSignature] = useState('');
  const [signatureLoading, setSignatureLoading] = useState(false);
  
  // Search parameters
  const [includeInactive, setIncludeInactive] = useState(true);
  const [includePartners, setIncludePartners] = useState(true);
  const [limit, setLimit] = useState(3);
  const [offset, setOffset] = useState(0);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Create form data
  const [createForm, setCreateForm] = useState({
    email: '',
    given_name: '',
    admin: false,
    partner: false
  });

  // Search function
  const handlePagination = async (action) => {
    let data;
    if (action === 'next') {
      data = await keapAPI.getContactsPaginated(next);
    } else {
      data = await keapAPI.getContactsPaginated(previous);
    }
    console.log(data);
    setNext(data.next);
    setPrevious(data.previous);
    setUsers(data.users);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        include_inactive: includeInactive,
        include_partners: includePartners,
        limit,
        offset
      };

      const data = await keapAPI.getUsers(queryParams);
      setNext(data.next);
      setPrevious(data.previous);
      console.log(data);
      setUsers(data.users);
    } catch (error) {
      console.log(error);   
    } finally {
      setLoading(false);
    }
  };

  const newUser = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      console.log('Creating user:', createForm);
      const response = await keapAPI.createUser(createForm);
      console.log('usercreated',response)
      // Close modal and reset form
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        given_name: '',
        admin: false,
        partner: false
      });
      
      // Refresh the users list
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

  const handleViewEmailSignature = async (user) => {
    setSelectedUser(user);
    setShowSignatureModal(true);
    setSignatureLoading(true);
    setEmailSignature('');
    
    try {
      const signature = await keapAPI.getUserEmailSignature(user.id);
      setEmailSignature(signature || 'No email signature found.');
    } catch (error) {
      console.log('Error fetching email signature:', error);
      setEmailSignature('Error loading email signature.');
    } finally {
      setSignatureLoading(false);
    }
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setSelectedUser(null);
    setEmailSignature('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeInactive"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeInactive" className="ml-2 block text-sm text-gray-700">
              Include Inactive
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includePartners"
              checked={includePartners}
              onChange={(e) => setIncludePartners(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includePartners" className="ml-2 block text-sm text-gray-700">
              Include Partners
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 3)}
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
          <Button variant="secondary" onClick={newUser}>
            Create
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({users.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No users found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">{user.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {user.given_name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'Inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.admin 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.partner 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.partner ? 'Partner' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewEmailSignature(user)}
                        className="text-xs"
                      >
                        View Signature
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
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
                {/* Email - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => updateCreateForm('email', e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                {/* Given Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Given Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={createForm.given_name}
                    onChange={(e) => updateCreateForm('given_name', e.target.value)}
                    placeholder="Enter given name"
                    required
                  />
                </div>

                {/* Admin Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="admin"
                    checked={createForm.admin}
                    onChange={(e) => updateCreateForm('admin', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="admin" className="ml-2 block text-sm font-medium text-gray-700">
                    Admin User
                  </label>
                </div>

                {/* Partner Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partner"
                    checked={createForm.partner}
                    onChange={(e) => updateCreateForm('partner', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="partner" className="ml-2 block text-sm font-medium text-gray-700">
                    Partner User
                  </label>
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
                    disabled={loading || !createForm.email.trim() || !createForm.given_name.trim()}
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Email Signature Modal */}
      {showSignatureModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Email Signature - {selectedUser.given_name || selectedUser.email}
                </h3>
                <button
                  onClick={closeSignatureModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px]">
                {signatureLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading signature...</span>
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-800"
                    dangerouslySetInnerHTML={{ __html: emailSignature }}
                  />
                )}
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={closeSignatureModal}
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