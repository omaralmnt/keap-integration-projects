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

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    file_name: '',
    is_public: false,
    file_association: 'USER',
    contact_id: ''
  });

  // File details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [selectedFileForDetails, setSelectedFileForDetails] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Replace file modal state
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [fileToReplace, setFileToReplace] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [replaceForm, setReplaceForm] = useState({
    file_name: '',
    is_public: false,
    file_association: 'USER',
    contact_id: ''
  });

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

  // File upload functions
  const openUploadModal = () => {
    setShowUploadModal(true);
    setSelectedFile(null);
    setUploadForm({
      file_name: '',
      is_public: false,
      file_association: 'USER',
      contact_id: ''
    });
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadForm({
      file_name: '',
      is_public: false,
      file_association: 'USER',
      contact_id: ''
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill the file name if not already set
      if (!uploadForm.file_name) {
        setUploadForm(prev => ({
          ...prev,
          file_name: file.name
        }));
      }
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data:mime;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const updateUploadForm = (field, value) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploadLoading(true);
      
      // Convert file to base64
      const fileData = await convertFileToBase64(selectedFile);
      
      // Prepare the payload
      const payload = {
        file_name: uploadForm.file_name,
        public: uploadForm.is_public, // Note: API expects 'public', not 'is_public'
        file_data: fileData,
        is_public: uploadForm.is_public,
        file_association: uploadForm.file_association
      };

      // Add contact_id only if file_association is CONTACT
      if (uploadForm.file_association === 'CONTACT' && uploadForm.contact_id) {
        payload.contact_id = parseInt(uploadForm.contact_id);
      }

      console.log('Uploading file:', payload);
      const response = await keapAPI.uploadFile(payload);
      console.log('File uploaded successfully:', response);
      
      // Close modal and refresh files list
      closeUploadModal();
      handleSearch();
      
    } catch (error) {
      console.log('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const isUploadFormValid = () => {
    if (!selectedFile || !uploadForm.file_name.trim()) {
      return false;
    }
    
    // If association is CONTACT, contact_id is required
    if (uploadForm.file_association === 'CONTACT' && !uploadForm.contact_id.trim()) {
      return false;
    }
    
    return true;
  };

  // File details functions
  const openDetailsModal = async (file) => {
    setSelectedFileForDetails(file);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    setFileDetails(null);
    
    try {
      const details = await keapAPI.getFileById(file.id);
      setFileDetails(details);
      console.log('File details:', details);
    } catch (error) {
      console.log('Error fetching file details:', error);
      setFileDetails({ error: 'Failed to load file details' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedFileForDetails(null);
    setFileDetails(null);
  };

  const getFileIcon = (fileType) => {
    const icons = {
      'Image': '🖼️',
      'Application': '📄',
      'Attachment': '📎',
      'Fax': '📠',
      'Contact': '👤',
      'Ticket': '🎫',
      'DigitalProduct': '💿',
      'WebForm': '📝',
      'Import': '📥'
    };
    return icons[fileType] || '📄';
  };

  // Delete file functions
  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      setDeleteLoading(true);
      console.log('Deleting file:', fileToDelete.id);
      
      await keapAPI.deleteFile(fileToDelete.id);
      console.log('File deleted successfully');
      
      // Close modal and refresh files list
      closeDeleteModal();
      handleSearch();
      
    } catch (error) {
      console.log('Delete error:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Replace file functions
  const openReplaceModal = (file) => {
    setFileToReplace(file);
    setShowReplaceModal(true);
    setReplaceFile(null);
    setReplaceForm({
      file_name: file.file_name || '',
      is_public: file.public || false,
      file_association: 'USER', // Default, user can change
      contact_id: file.contact_id ? file.contact_id.toString() : ''
    });
  };

  const closeReplaceModal = () => {
    setShowReplaceModal(false);
    setFileToReplace(null);
    setReplaceFile(null);
    setReplaceForm({
      file_name: '',
      is_public: false,
      file_association: 'USER',
      contact_id: ''
    });
  };

  const handleReplaceFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReplaceFile(file);
      // Auto-fill the file name with new file name if user wants
      setReplaceForm(prev => ({
        ...prev,
        file_name: file.name
      }));
    }
  };

  const updateReplaceForm = (field, value) => {
    setReplaceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReplaceSubmit = async () => {
    if (!replaceFile || !fileToReplace) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setReplaceLoading(true);
      
      // Convert file to base64
      const fileData = await convertFileToBase64(replaceFile);
      
      // Prepare the payload
      const payload = {
        file_name: replaceForm.file_name,
        public: replaceForm.is_public,
        file_data: fileData,
        is_public: replaceForm.is_public,
        file_association: replaceForm.file_association
      };

      // Add contact_id only if file_association is CONTACT
      if (replaceForm.file_association === 'CONTACT' && replaceForm.contact_id) {
        payload.contact_id = parseInt(replaceForm.contact_id);
      }

      console.log('Replacing file:', fileToReplace.id, payload);
      const response = await keapAPI.replaceFile(fileToReplace.id, payload);
      console.log('File replaced successfully:', response);
      
      // Close modal and refresh files list
      closeReplaceModal();
      handleSearch();
      
    } catch (error) {
      console.log('Replace error:', error);
      alert('Failed to replace file. Please try again.');
    } finally {
      setReplaceLoading(false);
    }
  };

  const isReplaceFormValid = () => {
    if (!replaceFile || !replaceForm.file_name.trim()) {
      return false;
    }
    
    // If association is CONTACT, contact_id is required
    if (replaceForm.file_association === 'CONTACT' && !replaceForm.contact_id.trim()) {
      return false;
    }
    
    return true;
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
          <Button variant="secondary" onClick={openUploadModal}>
            Upload File
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
                      <div className="flex flex-wrap gap-1">
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
                          onClick={() => openDetailsModal(file)}
                          className="text-xs"
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReplaceModal(file)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          Replace
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteModal(file)}
                          className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          Delete
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

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Upload File</h3>
                <button
                  onClick={closeUploadModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUploadSubmit(); }} className="space-y-6">
                {/* File Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}
                </div>

                {/* File Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={uploadForm.file_name}
                    onChange={(e) => updateUploadForm('file_name', e.target.value)}
                    placeholder="Enter file name"
                    required
                  />
                </div>

                {/* File Association */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Association <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={uploadForm.file_association}
                    onChange={(e) => updateUploadForm('file_association', e.target.value)}
                    required
                  >
                    <option value="USER">User</option>
                    <option value="COMPANY">Company</option>
                    <option value="CONTACT">Contact</option>
                  </Select>
                </div>

                {/* Contact ID - Only show if file_association is CONTACT */}
                {uploadForm.file_association === 'CONTACT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={uploadForm.contact_id}
                      onChange={(e) => updateUploadForm('contact_id', e.target.value)}
                      placeholder="Enter contact ID"
                      min="1"
                      required
                    />
                  </div>
                )}

                {/* Public/Private Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={uploadForm.is_public}
                    onChange={(e) => updateUploadForm('is_public', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_public" className="ml-2 block text-sm font-medium text-gray-700">
                    Make file public
                  </label>
                </div>

                {/* Info about public files */}
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-xs text-blue-800">
                    <strong>Public files</strong> can be accessed by anyone with the link. 
                    <strong> Private files</strong> require authentication to access.
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeUploadModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploadLoading || !isUploadFormValid()}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {showDetailsModal && selectedFileForDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="text-2xl mr-2">
                    {getFileIcon(selectedFileForDetails.file_box_type)}
                  </span>
                  File Details
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading file details...</span>
                </div>
              ) : fileDetails?.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800">{fileDetails.error}</span>
                  </div>
                </div>
              ) : fileDetails ? (
                <div className="space-y-6">
                  {/* File Header Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">File Name</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900 break-all">
                          {fileDetails.file_descriptor.file_name}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">File ID</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          {fileDetails.file_descriptor.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Properties Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Type</h4>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getFileTypeColor(fileDetails.file_descriptor.file_box_type)}`}>
                          {fileDetails.file_descriptor.file_box_type}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Category</h4>
                        <p className="text-gray-900">{fileDetails.file_descriptor.category || 'N/A'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">File Size</h4>
                        <p className="text-gray-900">{formatFileSize(fileDetails.file_descriptor.file_size)}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Visibility</h4>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          fileDetails.file_descriptor.public 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {fileDetails.file_descriptor.public ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Contact ID</h4>
                        <p className="text-gray-900">{fileDetails.file_descriptor.contact_id || 'N/A'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Created By</h4>
                        <p className="text-gray-900">{fileDetails.file_descriptor.created_by || 'N/A'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Date Created</h4>
                        <p className="text-gray-900">{formatDate(fileDetails.file_descriptor.date_created)}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Last Updated</h4>
                        <p className="text-gray-900">{formatDate(fileDetails.file_descriptor.last_updated)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remote File Key */}
                  {fileDetails.file_descriptor.remote_file_key && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Remote File Key</h4>
                      <div className="bg-gray-50 rounded-md p-3">
                        <code className="text-sm text-gray-800 break-all">
                          {fileDetails.file_descriptor.remote_file_key}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* File Data Preview */}
                  {fileDetails.file_data && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">File Data</h4>
                      <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                        {fileDetails.file_descriptor.file_box_type === 'Image' ? (
                          <div className="text-center">
                            <img 
                              src={`data:image/*;base64,${fileDetails.file_data}`}
                              alt={fileDetails.file_descriptor.file_name}
                              className="max-w-full max-h-24 mx-auto rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <p className="text-sm text-gray-500 mt-2" style={{display: 'none'}}>
                              Unable to display image preview
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <p>Base64 encoded file data available ({fileDetails.file_data.length} characters)</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Preview: {fileDetails.file_data.substring(0, 100)}...
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-3">
                      {fileDetails.file_descriptor.download_url && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(fileDetails.file_descriptor.download_url, '_blank')}
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download File
                        </Button>
                      )}
                      
                      {fileDetails.file_data && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:application/octet-stream;base64,${fileDetails.file_data}`;
                            link.download = fileDetails.file_descriptor.file_name;
                            link.click();
                          }}
                          className="flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                          </svg>
                          Download Base64
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={closeDetailsModal}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Replace File Modal */}
      {showReplaceModal && fileToReplace && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Replace File
                </h3>
                <button
                  onClick={closeReplaceModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Current File Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current File:</h4>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getFileIcon(fileToReplace.file_box_type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 break-all">
                      {fileToReplace.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {fileToReplace.id} • {fileToReplace.file_box_type} • {formatFileSize(fileToReplace.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleReplaceSubmit(); }} className="space-y-6">
                {/* File Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={handleReplaceFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {replaceFile && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-xs text-blue-800">
                        New file: {replaceFile.name} ({(replaceFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}
                </div>

                {/* File Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={replaceForm.file_name}
                    onChange={(e) => updateReplaceForm('file_name', e.target.value)}
                    placeholder="Enter file name"
                    required
                  />
                </div>

                {/* File Association */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Association <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={replaceForm.file_association}
                    onChange={(e) => updateReplaceForm('file_association', e.target.value)}
                    required
                  >
                    <option value="USER">User</option>
                    <option value="COMPANY">Company</option>
                    <option value="CONTACT">Contact</option>
                  </Select>
                </div>

                {/* Contact ID - Only show if file_association is CONTACT */}
                {replaceForm.file_association === 'CONTACT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={replaceForm.contact_id}
                      onChange={(e) => updateReplaceForm('contact_id', e.target.value)}
                      placeholder="Enter contact ID"
                      min="1"
                      required
                    />
                  </div>
                )}

                {/* Public/Private Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="replace_is_public"
                    checked={replaceForm.is_public}
                    onChange={(e) => updateReplaceForm('is_public', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="replace_is_public" className="ml-2 block text-sm font-medium text-gray-700">
                    Make file public
                  </label>
                </div>

                {/* Warning about replacement */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-yellow-800 font-medium text-sm">Replace Warning</h4>
                      <p className="text-yellow-700 text-xs mt-1">
                        This will permanently replace the existing file content. The original file data will be lost and cannot be recovered.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeReplaceModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={replaceLoading || !isReplaceFormValid()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {replaceLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Replacing...
                      </div>
                    ) : (
                      'Replace File'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Delete File
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  disabled={deleteLoading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-red-800 font-medium">Warning: This action cannot be undone</h4>
                      <p className="text-red-700 text-sm mt-1">
                        This will permanently delete the file from the system.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-700">
                    Are you sure you want to delete the following file?
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">
                        {getFileIcon(fileToDelete.file_box_type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 break-all">
                          {fileToDelete.file_name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>ID: {fileToDelete.id}</span>
                          <span>•</span>
                          <span>{fileToDelete.file_box_type}</span>
                          <span>•</span>
                          <span>{formatFileSize(fileToDelete.file_size)}</span>
                          {fileToDelete.contact_id && (
                            <>
                              <span>•</span>
                              <span>Contact: {fileToDelete.contact_id}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteFile}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                >
                  {deleteLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete File
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}