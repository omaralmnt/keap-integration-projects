import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Search, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Product Table Row Component
const ProductRow = ({ product, onSelect, isSelected }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-red-100 text-red-800',
      'true': 'bg-green-100 text-green-800',
      'false': 'bg-red-100 text-red-800'
    };
    return statusColors[status?.toString().toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
      onClick={() => onSelect(product)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{product.product_name || 'Unnamed Product'}</div>
            <div className="text-sm text-gray-500">ID: {product.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate" title={product.product_desc}>
          {product.product_desc || 'No description'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{product.sku || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {product.product_price ? formatCurrency(product.product_price) : 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
          getStatusColor(product.active)
        }`}>
          {product.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col text-xs text-gray-500">
          <span className={product.shippable ? 'text-green-600' : 'text-gray-400'}>
            {product.shippable ? '✓ Shippable' : '✗ Not Shippable'}
          </span>
          <span className={product.taxable ? 'text-green-600' : 'text-gray-400'}>
            {product.taxable ? '✓ Taxable' : '✗ Not Taxable'}
          </span>
        </div>
      </td>
    </tr>
  );
};

// Main ProductSelector Component
const ProductSelector = ({ isOpen, onClose, onSelect, selectedProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  
  const itemsPerPage = 10;

  // Load products
  const loadProducts = async (page = 1, search = '', activeOnly = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (page - 1) * itemsPerPage;
      const queryParams = {
        limit: itemsPerPage,
        offset: offset
      };

      // Add active filter if specified
      if (activeOnly === 'active') {
        queryParams.active = true;
      } else if (activeOnly === 'inactive') {
        queryParams.active = false;
      }

      const response = await keapAPI.getProducts(queryParams);
      
      // Filter products by search term (client-side filtering)
      let filteredProducts = response.products || [];
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => {
          const name = (product.product_name || '').toLowerCase();
          const description = (product.product_desc || '').toLowerCase();
          const sku = (product.sku || '').toLowerCase();
          const productId = product.id.toString();
          
          return name.includes(searchLower) ||
                 description.includes(searchLower) ||
                 sku.includes(searchLower) ||
                 productId.includes(searchLower);
        });
      }
      
      setProducts(filteredProducts);
      setTotalCount(response.count || filteredProducts.length);
      
      // Find and set selected product if it exists
      if (selectedProductId) {
        const selected = filteredProducts.find(product => product.id === parseInt(selectedProductId));
        setSelectedProduct(selected || null);
      }
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts(currentPage, searchTerm, activeFilter);
    }
  }, [isOpen, currentPage, activeFilter]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadProducts(1, value, activeFilter);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    loadProducts(1, searchTerm, filter);
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  // Confirm selection
  const handleConfirmSelection = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
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
            <h3 className="text-lg font-medium text-gray-900">Select Product</h3>
            <p className="text-sm text-gray-500">Choose a product to add to the order</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by name, description, SKU, or ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleFilterChange('all')}
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All
              </Button>
              <Button
                onClick={() => handleFilterChange('active')}
                variant={activeFilter === 'active' ? 'default' : 'outline'}
                size="sm"
              >
                Active Only
              </Button>
              <Button
                onClick={() => handleFilterChange('inactive')}
                variant={activeFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
              >
                Inactive Only
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <Button
                onClick={() => loadProducts(currentPage, searchTerm, activeFilter)}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Properties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onSelect={handleProductSelect}
                      isSelected={selectedProduct?.id === product.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && products.length > 0 && (
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
            disabled={!selectedProduct}
            className="w-full sm:w-auto sm:ml-3"
          >
            Select Product
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            Cancel
          </Button>
          {selectedProduct && (
            <div className="hidden sm:flex items-center mr-4">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedProduct.product_name}</span>
                <span className="text-xs text-gray-500 ml-1">(ID: {selectedProduct.id})</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductSelector;