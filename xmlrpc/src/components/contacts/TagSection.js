import { useState, useEffect, useCallback } from 'react';
import { Tag, ChevronLeft, ChevronRight, Plus, X, Search, Trash2 } from 'lucide-react';
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

const Button = ({ variant = 'primary', size = 'md', children, className = '', disabled = false, ...props }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variant === 'secondary' 
    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500' 
    : variant === 'danger'
    ? 'text-white bg-red-600 border border-transparent hover:bg-red-700 focus:ring-red-500'
    : 'text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:ring-blue-500';
  const sizeClasses = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
  
  return (
    <button 
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} 
      {...props}
    >
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

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5; // Show 5 page numbers at most
  
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);
  
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {pages.map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'secondary'}
            size="sm" 
            onClick={() => onPageChange(page)}
            disabled={loading}
            className="min-w-[2rem]"
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Tag color generator based on tag name/id
const getTagColor = (tagName) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-cyan-100 text-cyan-800'
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Apply Tags Modal
const ApplyTagsModal = ({ isOpen, onClose, onApply, contactId, appliedTagIds = [] }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  const [applying, setApplying] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const fetchAvailableTags = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    
    const offset = (page - 1) * limit;
    
    const result = await keapAPI.getTags({ offset, limit, name: search || undefined });
    
    if (result.success === false) {
      console.error('Error loading available tags:', result.error);
      setError('Failed to load available tags');
      setAvailableTags([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    
    const responseData = result || {};
    let tagsList = responseData.tags || [];
    let count = responseData.count || 0;
    
    // Filter out already applied tags if showOnlyAvailable is true
    if (showOnlyAvailable) {
      tagsList = tagsList.filter(tag => !appliedTagIds.includes(tag.id));
      count = tagsList.length; // Adjust count for filtering
    }
    
    setAvailableTags(tagsList);
    setTotalCount(count);
    setTotalPages(Math.max(1, Math.ceil(count / limit)));
    setCurrentPage(page);
    setLoading(false);
  }, [limit, appliedTagIds, showOnlyAvailable]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTags(new Set());
      setSearchTerm('');
      setCurrentPage(1);
      setError('');
      fetchAvailableTags(1, '');
    }
  }, [isOpen, fetchAvailableTags]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    fetchAvailableTags(1, searchValue);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      fetchAvailableTags(page, searchTerm);
    }
  };

  const toggleTagSelection = (tagId) => {
    const newSelection = new Set(selectedTags);
    if (newSelection.has(tagId)) {
      newSelection.delete(tagId);
    } else {
      newSelection.add(tagId);
    }
    setSelectedTags(newSelection);
  };

  const handleApplyTags = async () => {
    if (selectedTags.size === 0) return;
    
    setApplying(true);
    setError('');
    
    try {
      const tagIds = Array.from(selectedTags);
      const result = await keapAPI.applyTagsToContact(contactId, tagIds);
      
      if (result.success === false) {
        setError('Failed to apply tags. Please try again.');
        setApplying(false);
        return;
      }
      
      onApply(); // Refresh parent component
      onClose(); // Close modal
    } catch (error) {
      console.error('Error applying tags:', error);
      setError('Failed to apply tags. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleFilterToggle = () => {
    setShowOnlyAvailable(!showOnlyAvailable);
    setCurrentPage(1);
    fetchAvailableTags(1, searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Apply Tags</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={handleFilterToggle}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-gray-700">Show only available tags</span>
            </label>
            <span className="text-xs text-gray-500">
              ({appliedTagIds.length} tags already applied)
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Selected tags count */}
          {selectedTags.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-blue-800 text-sm">
                {selectedTags.size} tag{selectedTags.size !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Tags list */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading tags...</span>
              </div>
            ) : availableTags.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'No tags found matching your search' : 
                   showOnlyAvailable ? 'No available tags to apply' : 'No tags available'}
                </p>
                {showOnlyAvailable && appliedTagIds.length > 0 && (
                  <p className="text-gray-400 text-xs mt-2">
                    Try unchecking "Show only available tags" to see all tags
                  </p>
                )}
              </div>
            ) : (
              availableTags.map((tag) => {
                const isApplied = appliedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTags.has(tag.id)
                        ? 'bg-blue-50 border-blue-200'
                        : isApplied
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => !isApplied && toggleTagSelection(tag.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isApplied
                          ? 'bg-green-600 border-green-600'
                          : selectedTags.has(tag.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {(selectedTags.has(tag.id) || isApplied) && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTagColor(tag.name)}`}>
                            {tag.name}
                          </span>
                          {tag.category && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                              {tag.category.name}
                            </span>
                          )}
                          {isApplied && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-medium">
                              Applied
                            </span>
                          )}
                        </div>
                        {tag.description && (
                          <p className="text-xs text-gray-500 mt-1">{tag.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {totalCount > 0 && `${totalCount} tags ${showOnlyAvailable ? 'available' : 'total'}`}
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                onClick={onClose}
                disabled={applying}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApplyTags}
                disabled={selectedTags.size === 0 || applying}
              >
                {applying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Apply {selectedTags.size > 0 ? `${selectedTags.size} ` : ''}Tag{selectedTags.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Tag Confirmation Modal
const DeleteTagModal = ({ isOpen, onClose, onConfirm, tagName, tagCount, isDeleting }) => {
  if (!isOpen) return null;

  const isMultiple = tagCount > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Remove Tag{isMultiple ? 's' : ''}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600">
              {isMultiple ? (
                <>
                  Are you sure you want to remove <span className="font-semibold">{tagCount} selected tags</span> from this contact?
                </>
              ) : (
                <>
                  Are you sure you want to remove the tag <span className="font-semibold">"{tagName}"</span> from this contact?
                </>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button 
              variant="secondary" 
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove Tag{isMultiple ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export function TagSection({ contactId }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [selectedTagsForDeletion, setSelectedTagsForDeletion] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const fetchTags = useCallback(async (page = 1, pageLimit = limit) => {
    setLoading(true);
    setError('');
    
    // Calculate offset based on page and limit
    const offset = (page - 1) * pageLimit;
    
    const result = await keapAPI.getContactTags(contactId, { offset, limit: pageLimit });
    // console.log('tags',result)
    // Check if the operation was successful
    if (result.success === false) {
      console.error('Error loading contact tags:', result.error);
      
      let errorMessage = 'Failed to load contact tags';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 404) {
        // If 404, probably no tags, don't show error
        setTags([]);
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
        setLoading(false);
        return;
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to view contact tags.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setTags([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    
    // Success
    const responseData = result || {};
    const tagsList = responseData.tags || [];
    const count = responseData.count || 0;
    
    setTags(tagsList);
    setTotalCount(count);
    setTotalPages(Math.max(1, Math.ceil(count / pageLimit)));
    setCurrentPage(page);
    setLoading(false);
  }, [contactId, limit]);

  useEffect(() => {
    if (contactId) {
      fetchTags(1, limit);
    }
  }, [contactId, limit, fetchTags]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      fetchTags(page, limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    fetchTags(1, newLimit); // Reset to first page when changing limit
  };

  const handleApplyTags = () => {
    fetchTags(currentPage, limit); // Refresh the current page
    setShowApplyModal(false);
  };

  const handleDeleteTag = (contactTag) => {
    setTagToDelete(contactTag);
    setSelectedTagsForDeletion(new Set());
    setShowDeleteModal(true);
  };

  const handleMultipleDelete = () => {
    if (selectedTagsForDeletion.size === 0) return;
    setTagToDelete(null);
    setShowDeleteModal(true);
  };

  const toggleTagSelection = (tagId) => {
    const newSelection = new Set(selectedTagsForDeletion);
    if (newSelection.has(tagId)) {
      newSelection.delete(tagId);
    } else {
      newSelection.add(tagId);
    }
    setSelectedTagsForDeletion(newSelection);
  };

  const selectAllTags = () => {
    const allTagIds = tags.map(contactTag => contactTag.tag?.id).filter(Boolean);
    setSelectedTagsForDeletion(new Set(allTagIds));
  };

  const clearSelection = () => {
    setSelectedTagsForDeletion(new Set());
    setIsSelectMode(false);
  };

  const confirmDeleteTag = async () => {
    setIsDeleting(true);
    
    try {
      if (selectedTagsForDeletion.size > 0) {
        // Multiple tags deletion
        const tagIds = Array.from(selectedTagsForDeletion);
        const result = await keapAPI.removeTagsFromContact(contactId, tagIds);
        
        if (result.success === false) {
          setError('Failed to remove tags. Please try again.');
          setIsDeleting(false);
          return;
        }
      } else if (tagToDelete) {
        // Single tag deletion
        const result = await keapAPI.removeTagsFromContact(contactId, [tagToDelete.tag.id] );
        
        if (result.success === false) {
          setError('Failed to remove tag. Please try again.');
          setIsDeleting(false);
          return;
        }
      }
      
      // Refresh the tags list
      fetchTags(currentPage, limit);
      setShowDeleteModal(false);
      setTagToDelete(null);
      setSelectedTagsForDeletion(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error('Error removing tag(s):', error);
      setError('Failed to remove tag(s). Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get applied tag IDs for the modal
  const appliedTagIds = tags.map(contactTag => contactTag.tag?.id).filter(Boolean);

  if (loading && currentPage === 1) {
    return (
      <Section icon={Tag} title="Contact Tags">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tags...</span>
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section icon={Tag} title="Contact Tags">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <Select 
              value={limit} 
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Select>
            <span className="text-sm text-gray-500">per page</span>
          </div>
          
          {totalCount > 0 && (
            <div className="text-sm text-gray-500">
              Total: {totalCount} tag{totalCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {tags.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) {
                  clearSelection();
                }
              }}
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </Button>
          )}
          
          <Button
            size="sm"
            onClick={() => setShowApplyModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Apply Tag
          </Button>
        </div>
      </div>

      {/* Selection controls - only show when in select mode */}
      {isSelectMode && tags.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-800">
                {selectedTagsForDeletion.size} of {tags.length} tag{tags.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={selectAllTags}
                  disabled={selectedTagsForDeletion.size === tags.length}
                >
                  Select All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedTagsForDeletion.size === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <Button
              variant="danger"
              size="sm"
              onClick={handleMultipleDelete}
              disabled={selectedTagsForDeletion.size === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Selected ({selectedTagsForDeletion.size})
            </Button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Tags List */}
      <div className="space-y-3">
        {tags.map((contactTag, index) => {
          const tag = contactTag.tag || {};
          const isSelected = selectedTagsForDeletion.has(tag.id);
          
          return (
            <div 
              key={tag.id || index} 
              className={`flex items-center p-4 rounded-lg border transition-colors ${
                isSelectMode 
                  ? isSelected 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onClick={isSelectMode ? () => toggleTagSelection(tag.id) : undefined}
            >
              {isSelectMode && (
                <div className="mr-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4 flex-1">
                <Tag className="h-6 w-6 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTagColor(tag.name || 'default')}`}>
                      {tag.name || 'Unnamed Tag'}
                    </span>
                    {tag.category && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {tag.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {contactTag.date_applied && (
                      <span>Applied on {formatDate(contactTag.date_applied)}</span>
                    )}
                    {tag.description && (
                      <>
                        <span>•</span>
                        <span>{tag.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {!isSelectMode && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeleteTag(contactTag)}
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}

        {tags.length === 0 && !loading && (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No tags applied to this contact</p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowApplyModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Apply First Tag
            </Button>
          </div>
        )}
      </div>

      {/* Loading overlay for pagination */}
      {loading && currentPage > 1 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 text-sm">Loading...</span>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </Section>

    {/* Apply Tags Modal */}
    <ApplyTagsModal
      isOpen={showApplyModal}
      onClose={() => setShowApplyModal(false)}
      onApply={handleApplyTags}
      contactId={contactId}
      appliedTagIds={appliedTagIds}
    />

    {/* Delete Tag Modal */}
    <DeleteTagModal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setTagToDelete(null);
        setSelectedTagsForDeletion(new Set());
      }}
      onConfirm={confirmDeleteTag}
      tagName={tagToDelete?.tag?.name || ''}
      tagCount={selectedTagsForDeletion.size || 1}
      isDeleting={isDeleting}
    />
  </>);
}