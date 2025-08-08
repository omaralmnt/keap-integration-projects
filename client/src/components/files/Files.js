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

// Select component
const Select = ({ 
  value, 
  onChange, 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Main Files Component
export function Files() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  
  // Pagination
  const [next, setNext] = useState('');
  const [previous, setPrevious] = useState('');

  // Search parameters
  const [contactId, setContactId] = useState('');
  const [limit, setLimit] = useState(25);
  const [name, setName] = useState('');
  const [offset, setOffset] = useState(0);
  const [permission, setPermission] = useState('BOTH');
  const [type, setType] = useState('');
  const [viewable, setViewable] = useState('BOTH');

  // File type options
  const fileTypes = [
    'Application', 'Image', 'Fax', 'Attachment', 'Ticket', 'Contact', 
    'DigitalProduct', 'Import', 'Hidden', 'WebForm', 'StyledCart', 
    'ReSampledImage', 'TemplateThumbnail', 'Funnel', 'LogoThumbnail', 
    'Unlayer', 'BrandingCenterLogo'
  ];

  // Pagination function
  const handlePagination = async (action) => {
    try {
      setLoading(true);
      let data;
      if (action === 'next') {
        data = await keapAPI.getFilesPaginated(next);
      } else {
        data = await keapAPI.getFilesPaginated(previous);
      }
      console.log(data);
      setNext(data.next || '');
      setPrevious(data.previous || '');
      setFiles(data.files || []);
      setCount(data.count || 0);
    } catch (error) {
      console.log('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        ...(contactId && { contact_id: parseInt(contactId) }),
        limit,
        ...(name && { name }),
        offset,
        permission,
        ...(type && { type }),
        viewable
      };

      const data = await keapAPI.getFiles(queryParams);
      setNext(data.next || '');
      setPrevious(data.previous || '');
      setFiles(data.files || []);
      setCount(data.count || 0);
      console.log('Files data:', data);
    } catch (error) {
      console.log('Search error:', error);   
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleReset = () => {
    setContactId('');
    setLimit(25);
    setName('');
    setOffset(0);
    setPermission('BOTH');
    setType('');
    setViewable('BOTH');
    setFiles([]);
    setCount(0);
    setNext('');
    setPrevious('');
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get file type color
  const getFileTypeColor = (fileType) => {
    const colors = {
      'Image': 'bg-green-100 text-green-800',
      'Application': 'bg-blue-100 text-blue-800',
      'Attachment': 'bg-purple-100 text-purple-800',
      'Fax': 'bg-yellow-100 text-yellow-800',
      'Contact': 'bg-pink-100 text-pink-800',
      'Ticket': 'bg-red-100 text-red-800'
    };
    return colors[fileType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Files</h1>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search Filters</h3>
        
        {/* First row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Contact ID</label>
            <Input
              type="number"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="Enter contact ID"
              min="1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">File Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by name (use * for wildcards)"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">File Type</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              {fileTypes.map((fileType) => (
                <option key={fileType} value={fileType}>
                  {fileType}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Permission</label>
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="BOTH">Both</option>
              <option value="USER">User</option>
              <option value="COMPANY">Company</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Viewable</label>
            <Select
              value={viewable}
              onChange={(e) => setViewable(e.target.value)}
            >
              <option value="BOTH">Both</option>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Limit</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 25)}
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

        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search Files'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Files ({count > 0 ? count : files.length} total)
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No files found. Click "Search Files" to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900">{file.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={file.file_name}>
                        {file.file_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(file.file_box_type)}`}>
                        {file.file_box_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{file.category || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{formatFileSize(file.file_size)}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        file.public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {file.public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {file.contact_id || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="text-xs">
                        {formatDate(file.date_created)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        {file.download_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(file.download_url, '_blank')}
                            className="text-xs"
                          >
                            Download
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log('View file details:', file)}
                          className="text-xs"
                        >
                          Details
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
        {!loading && files.length > 0 && (next || previous) && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {files.length} results {count > 0 && `of ${count} total`}
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
    </div>
  );
}