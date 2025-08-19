import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { useNavigate } from 'react-router-dom';

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
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Main Tags Component
export function Tags() {
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Search parameters
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [limit, setLimit] = useState(3);
  const [offset, setOffset] = useState(0);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Tag modal states
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [newTagCategoryId, setNewTagCategoryId] = useState('');

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  // Function to extract unique categories from tags data
  const extractCategoriesFromTags = (tagsData) => {
    const categoriesMap = new Map();
    
    tagsData.forEach(tag => {
      if (tag.category && tag.category.id) {
        categoriesMap.set(tag.category.id, {
          id: tag.category.id,
          name: tag.category.name,
          description: tag.category.description
        });
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Update categories whenever tags change
  useEffect(() => {
    if (tags.length > 0) {
      const categories = extractCategoriesFromTags(tags);
      setAvailableCategories(categories);
    }
  }, [tags]);

  // Pagination function
  const handlePagination = async (action) => {
    console.log('Pagination:', action);
    let response;
    if (action === 'next') {
      response = await keapAPI.getTagsPaginated(next);
      setOffset(Number(offset) + Number(limit));
    } else {
      response = await keapAPI.getTagsPaginated(previous);
      const addedOffset = Number(offset) - Number(limit);
      if (addedOffset > -1) {
        setOffset(addedOffset);
      }
    }
    setTags(response.tags);
    setNext(response.next);
    setPrevious(response.previous);
  };

  // Search function
  const handleSearch = async () => {
    try {
      setLoading(true);

      const queryParams = {
        name,
        description,
        limit,
        offset
      };

      console.log('Search params:', queryParams);

      const data = await keapAPI.getTags(queryParams);
      console.log('Tags data:', data);
      
      setTags(data.tags);
      setPrevious(data.previous);
      setNext(data.next);
    } catch (error) {
      console.log('Error fetching tags:', error);   
    } finally {
      setLoading(false);
    }
  };

  // Create tag function
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setIsCreatingTag(true);
      
      const tagData = {
        name: newTagName,
        description: newTagDescription || undefined,
        category_id: newTagCategoryId || undefined
      };

      await keapAPI.createTag(tagData);
      
      // Reset form
      setNewTagName('');
      setNewTagDescription('');
      setNewTagCategoryId('');
      setIsTagModalOpen(false);
      
      // Refresh the list
      handleSearch();
    } catch (error) {
      console.log('Error creating tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Create category function
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setIsCreatingCategory(true);
      
      const categoryData = {
        name: newCategoryName,
        description: newCategoryDescription || undefined
      };

      // Aquí debes implementar la llamada a la API para crear categoría
      const newCategory = await keapAPI.createTagCategory(categoryData);
      
      // Agregar la nueva categoría a la lista de categorías disponibles
      setAvailableCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Reset form
      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsCategoryModalOpen(false);
      
    } catch (error) {
      console.log('Error creating category:', error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const openCreateTagModal = () => {
    setIsTagModalOpen(true);
  };

  const openCreateCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const viewTag = (tagId) => {
    navigate(`/tags/details/${tagId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tags</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Tag Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
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
          <Button variant="secondary" onClick={openCreateTagModal}>
            Create Tag
          </Button>
          <Button variant="outline" onClick={openCreateCategoryModal}>
            Create Category
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({tags.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tags found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-4 py-4 text-sm text-gray-900">{tag.id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {tag.description || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {tag.category ? (
                        <div>
                          <div className="font-medium">{tag.category.name}</div>
                          <div className="text-xs text-gray-500">{tag.category.description}</div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewTag(tag.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && tags.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={offset === 0}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('previous')}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={tags.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Tag Modal */}
      <Modal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Tag</h2>
            <button
              onClick={() => setIsTagModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name *
              </label>
              <Input
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter tag description (optional)"
                value={newTagDescription}
                onChange={(e) => setNewTagDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (optional)
              </label>
              <select
                value={newTagCategoryId}
                onChange={(e) => setNewTagCategoryId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.description && ` - ${category.description}`}
                  </option>
                ))}
              </select>
              {availableCategories.length === 0 && tags.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No categories available from current results
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsTagModalOpen(false)}
              disabled={isCreatingTag}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={isCreatingTag || !newTagName.trim()}
            >
              {isCreatingTag ? 'Creating...' : 'Create Tag'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Category</h2>
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter category description (optional)"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
            >
              {isCreatingCategory ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}