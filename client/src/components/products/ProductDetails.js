import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';

// Card component for sections
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Badge component for status indicators
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Input component for form fields
const Input = ({ label, value, onChange, type = 'text', placeholder, disabled, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
        {...props}
      />
    </div>
  );
};

// Textarea component for longer text fields
const Textarea = ({ label, value, onChange, placeholder, disabled, rows = 4, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
        {...props}
      />
    </div>
  );
};

// Checkbox component
const Checkbox = ({ label, checked, onChange, disabled }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
};

export function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form state for editable fields
  const [formData, setFormData] = useState({
    active: true,
    product_desc: '',
    product_name: '',
    product_price: 0,
    product_short_desc: '',
    sku: '',
    subscription_only: false
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await keapAPI.getProductById(productId);
        setProduct(productData);
        
        // Initialize form data with current product data
        setFormData({
          active: productData.active ?? true,
          product_desc: productData.product_desc || '',
          product_name: productData.product_name || '',
          product_price: productData.product_price || 0,
          product_short_desc: productData.product_short_desc || '',
          sku: productData.sku || '',
          subscription_only: productData.subscription_only ?? false
        });
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear success message when user starts editing
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Call the API to update the product
      const updatedProduct = await keapAPI.updateProduct(productId, formData);
      
      // Update local state with the response
      setProduct(updatedProduct);
      setIsEditing(false);
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err) {
      setSaveError(err.message || 'Failed to update product');
      console.error('Error updating product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original product data
    setFormData({
      active: product.active ?? true,
      product_desc: product.product_desc || '',
      product_name: product.product_name || '',
      product_price: product.product_price || 0,
      product_short_desc: product.product_short_desc || '',
      sku: product.sku || '',
      subscription_only: product.subscription_only ?? false
    });
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Call the API to delete the product
      await keapAPI.deleteProduct(productId);
      
      // Navigate back to products list after successful deletion
      navigate('/products');

    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  // Image upload functions
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);

      // Convert file to base64
      const base64Data = await fileToBase64(selectedFile);
      
      // Generate SHA256 checksum
      const checksum = await generateSHA256(base64Data);

      const imageData = {
        checksum: checksum,
        file_data: base64Data,
        file_name: selectedFile.name
      };

      // Call the API to upload the image
      await keapAPI.uploadProductImage(productId, imageData);
      
      setUploadSuccess(true);
      setShowImageUpload(false);
      setSelectedFile(null);
      setImagePreview(null);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

    } catch (err) {
      setUploadError(err.message || 'Failed to upload image');
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please select a PNG, GIF, JPG, or JPEG image.');
      return;
    }

    // Validate file size (3MB max)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 3MB.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUploadClick = () => {
    setShowImageUpload(true);
    setUploadError(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleCancelImageUpload = () => {
    setShowImageUpload(false);
    setUploadError(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Utility functions
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:image/...;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const generateSHA256 = async (base64String) => {
    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate SHA256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatCycleType = (cycleType) => {
    const types = {
      'DAY': 'Daily',
      'WEEK': 'Weekly', 
      'MONTH': 'Monthly',
      'YEAR': 'Yearly'
    };
    return types[cycleType] || cycleType;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          <Button variant="outline" onClick={() => navigate('/products')}>
            ← Back to Products
          </Button>
        </div>
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Product Not Found</p>
          <p className="text-gray-500 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/products')}>
            Return to Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/products')}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? formData.product_name || 'Edit Product' : product.product_name}
            </h1>
            <p className="text-sm text-gray-500">Product ID: {product.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={(isEditing ? formData.active : product.active) ? 'success' : 'error'}>
            {(isEditing ? formData.active : product.active) ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant={(isEditing ? formData.subscription_only : product.subscription_only) ? 'info' : 'default'}>
            {(isEditing ? formData.subscription_only : product.subscription_only) ? 'Subscription' : 'One-time'}
          </Badge>
        </div>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Product updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Error: {saveError}
              </p>
            </div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Delete Error: {deleteError}
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Image uploaded successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Upload Error: {uploadError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange('product_name', e.target.value)}
                    placeholder="Enter product name"
                  />
                  
                  <Input
                    label="SKU"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                  />

                  <Input
                    label="Price"
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={formData.product_price}
                    onChange={(e) => handleInputChange('product_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />

                  <Input
                    label="Short Description"
                    value={formData.product_short_desc}
                    onChange={(e) => handleInputChange('product_short_desc', e.target.value)}
                    placeholder="Enter short description"
                  />

                  <Textarea
                    label="Full Description"
                    value={formData.product_desc}
                    onChange={(e) => handleInputChange('product_desc', e.target.value)}
                    placeholder="Enter full description"
                    rows={6}
                  />

                  <div className="flex items-center space-x-6">
                    <Checkbox
                      label="Active"
                      checked={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                    />
                    <Checkbox
                      label="Subscription Only"
                      checked={formData.subscription_only}
                      onChange={(e) => handleInputChange('subscription_only', e.target.checked)}
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2"
                    >
                      {isSaving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
                    <p className="text-sm text-gray-900">{product.product_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">SKU</label>
                    <p className="text-sm text-gray-900 font-mono">{product.sku}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Short Description</label>
                    <p className="text-sm text-gray-900">{product.product_short_desc || 'No short description available'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Description</label>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {product.product_desc || 'No description available'}
                    </div>
                  </div>

                  {product.url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Product URL</label>
                      <a 
                        href={product.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {product.url}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Subscription Plans */}
          {product.subscription_only && product.subscription_plans && product.subscription_plans.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h2>
                <div className="space-y-4">
                  {product.subscription_plans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {plan.subscription_plan_name || `Plan ${plan.subscription_plan_index + 1}`}
                          </h3>
                          <p className="text-sm text-gray-500">Plan ID: {plan.id}</p>
                        </div>
                        <Badge variant={plan.active ? 'success' : 'error'}>
                          {plan.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                          <p className="text-gray-900 font-semibold">{formatPrice(plan.plan_price)}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Cycle</label>
                          <p className="text-gray-900">{formatCycleType(plan.cycle_type)}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                          <p className="text-gray-900">{plan.frequency}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Cycles</label>
                          <p className="text-gray-900">{plan.number_of_cycles === 0 ? 'Unlimited' : plan.number_of_cycles}</p>
                        </div>
                      </div>

                      {plan.url && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Plan URL</label>
                          <a 
                            href={plan.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {plan.url}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-500">Base Price</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(isEditing ? formData.product_price : product.product_price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <Badge variant={(isEditing ? formData.active : product.active) ? 'success' : 'error'}>
                    {(isEditing ? formData.active : product.active) ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <Badge variant={(isEditing ? formData.subscription_only : product.subscription_only) ? 'info' : 'default'}>
                    {(isEditing ? formData.subscription_only : product.subscription_only) ? 'Subscription' : 'One-time'}
                  </Badge>
                </div>
                
                {(isEditing ? formData.subscription_only : product.subscription_only) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-500">Plans</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.subscription_plans?.length || 0}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {!isEditing ? (
                  <Button 
                    className="w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Product
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full text-blue-600 hover:text-blue-800 hover:border-blue-300"
                  onClick={handleImageUploadClick}
                  disabled={isEditing || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-800 hover:border-red-300" 
                  onClick={handleDeleteClick}
                  disabled={isEditing || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </Button>
              </div>
              {!isEditing && (
                <p className="text-xs text-gray-500 mt-3">
                  Some actions will be available in a future update
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{product.product_name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}