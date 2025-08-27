import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { toast } from 'react-toastify';
import { ProductInventory } from './ProductInventory';

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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [showDeleteSubscriptionConfirm, setShowDeleteSubscriptionConfirm] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false);
  const [deleteSubscriptionError, setDeleteSubscriptionError] = useState(null);

  // New states for subscription editing
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [isEditingSubscription, setIsEditingSubscription] = useState(false);
  const [isSavingSubscription, setIsSavingSubscription] = useState(false);
  const [saveSubscriptionError, setSaveSubscriptionError] = useState(null);
  const [saveSubscriptionSuccess, setSaveSubscriptionSuccess] = useState(false);

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

  // Form state for subscription creation
  const [subscriptionData, setSubscriptionData] = useState({
    active: true,
    cycle_type: 'MONTH',
    frequency: 1,
    number_of_cycles: 0,
    plan_price: 0,
    subscription_plan_index: 1
  });

  // Form state for subscription editing
  const [editSubscriptionData, setEditSubscriptionData] = useState({
    active: true,
    cycle_type: 'MONTH',
    frequency: 1,
    number_of_cycles: 0,
    plan_price: 0
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await keapAPI.getProductById(productId);
        console.log('pro', productData);
        setProduct(productData);

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
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      await keapAPI.updateProduct(productId, formData);

      setIsEditing(false);
      setSaveSuccess(true);
      const updatedProduct = await keapAPI.getProductById(productId);
      setProduct(updatedProduct);

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
      toast.info('XML-RPC does not support delete for products');
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

  // New subscription editing functions
  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setEditSubscriptionData({
      active: subscription.active ?? true,
      cycle_type: subscription.cycle_type || 'MONTH',
      frequency: subscription.frequency || 1,
      number_of_cycles: subscription.number_of_cycles || 0,
      plan_price: subscription.plan_price || 0
    });
    setIsEditingSubscription(true);
    setSaveSubscriptionError(null);
    setSaveSubscriptionSuccess(false);
  };

  const handleSaveSubscription = async () => {
    if (!editingSubscription) return;

    try {
      setIsSavingSubscription(true);
      setSaveSubscriptionError(null);
      setSaveSubscriptionSuccess(false);

      console.log('Updating subscription plan with data:', editSubscriptionData);

      const result = await keapAPI.updateProductSubscription(editingSubscription.id, editSubscriptionData);

      if (result.success) {
        console.log('Subscription plan updated successfully');

        const updatedProduct = await keapAPI.getProductById(productId);
        setProduct(updatedProduct);

        setSaveSubscriptionSuccess(true);
        setIsEditingSubscription(false);
        setEditingSubscription(null);

        setTimeout(() => {
          setSaveSubscriptionSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error?.message || 'Failed to update subscription plan');
      }

    } catch (err) {
      console.error('Subscription update error:', err);
      setSaveSubscriptionError(err.message || 'Failed to update subscription plan');
    } finally {
      setIsSavingSubscription(false);
    }
  };

  const handleCancelEditSubscription = () => {
    setIsEditingSubscription(false);
    setEditingSubscription(null);
    setSaveSubscriptionError(null);
    setSaveSubscriptionSuccess(false);
    setEditSubscriptionData({
      active: true,
      cycle_type: 'MONTH',
      frequency: 1,
      number_of_cycles: 0,
      plan_price: 0
    });
  };

  const handleEditSubscriptionInputChange = (field, value) => {
    setEditSubscriptionData(prev => ({
      ...prev,
      [field]: value
    }));
    if (saveSubscriptionSuccess) {
      setSaveSubscriptionSuccess(false);
    }
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

      const base64Data = await fileToBase64(selectedFile);
      const checksum = await generateSHA256(base64Data);

      const imageData = {
        checksum: checksum,
        file_data: base64Data,
        file_name: selectedFile.name
      };

      await keapAPI.uploadProductImage(productId, imageData);

      setUploadSuccess(true);
      setShowImageUpload(false);
      setSelectedFile(null);
      setImagePreview(null);

      const updatedProduct = await keapAPI.getProductById(productId);
      setProduct(updatedProduct);

      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please select a PNG, GIF, JPG, or JPEG image.');
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 3MB.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Subscription functions
  const handleCreateSubscription = async () => {
    try {
      setIsCreatingSubscription(true);
      setSubscriptionError(null);
      setSubscriptionSuccess(false);

      console.log('Creating subscription with data:', subscriptionData);

      const newSubscription = await keapAPI.createProductSubscription(productId, subscriptionData);

      console.log('Subscription created successfully:', newSubscription);

      const updatedProduct = await keapAPI.getProductById(productId);
      setProduct(updatedProduct);

      setSubscriptionSuccess(true);
      setShowSubscriptionModal(false);

      setSubscriptionData({
        active: true,
        cycle_type: 'MONTH',
        frequency: 1,
        number_of_cycles: 0,
        plan_price: 0,
        subscription_plan_index: 1
      });

      setTimeout(() => {
        setSubscriptionSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Subscription creation error:', err);
      setSubscriptionError(err.message || 'Failed to create subscription');
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleSubscriptionInputChange = (field, value) => {
    setSubscriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShowSubscriptionModal = () => {
    const currentPlans = product.subscription_plans || [];
    const nextIndex = currentPlans.length > 0 ? Math.max(...currentPlans.map(p => p.subscription_plan_index || 0)) + 1 : 1;

    setSubscriptionData(prev => ({
      ...prev,
      subscription_plan_index: nextIndex
    }));

    setShowSubscriptionModal(true);
    setSubscriptionError(null);
  };

  const handleCancelSubscription = () => {
    setShowSubscriptionModal(false);
    setSubscriptionError(null);
    setSubscriptionData({
      active: true,
      cycle_type: 'MONTH',
      frequency: 1,
      number_of_cycles: 0,
      plan_price: 0,
      subscription_plan_index: 1
    });
  };

  // Delete subscription functions
  const handleDeleteSubscription = async () => {
    if (!subscriptionToDelete) return;

    try {
      setIsDeletingSubscription(true);
      setDeleteSubscriptionError(null);

      console.log('Deleting subscription:', subscriptionToDelete.id);

      toast.info('XML RPC does not support deleting subscription plans');
      setShowDeleteSubscriptionConfirm(false);
      setSubscriptionToDelete(null);

    } catch (err) {
      console.error('Subscription deletion error:', err);
      setDeleteSubscriptionError(err.message || 'Failed to delete subscription');
    } finally {
      setIsDeletingSubscription(false);
    }
  };

  const handleDeleteSubscriptionClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setShowDeleteSubscriptionConfirm(true);
    setDeleteSubscriptionError(null);
  };

  const handleCancelDeleteSubscription = () => {
    setShowDeleteSubscriptionConfirm(false);
    setSubscriptionToDelete(null);
    setDeleteSubscriptionError(null);
  };

  // Utility functions
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const generateSHA256 = async (base64String) => {
    try {
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex;
    } catch (error) {
      throw error;
    }
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

      {saveSubscriptionSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Subscription plan updated successfully!
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

      {saveSubscriptionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Subscription Update Error: {saveSubscriptionError}
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

      {subscriptionSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Subscription plan created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {subscriptionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Subscription Error: {subscriptionError}
              </p>
            </div>
          </div>
        </div>
      )}

      {deleteSubscriptionError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Delete Subscription Error: {deleteSubscriptionError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          {product.large_image && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h2>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <img
                    src={`data:image/jpeg;base64,${product.large_image}`}
                    alt={product.product_name || 'Product image'}
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      console.error('Failed to load product image:', e);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Failed to load image</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Product Information */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
                {!isEditing && !isEditingSubscription && (
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
          {product.subscription_plans && product.subscription_plans.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Subscription Plans ({product.subscription_plans.length})</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowSubscriptionModal}
                    disabled={isEditing || isCreatingSubscription || isEditingSubscription}
                    className="text-blue-600 hover:text-blue-800 hover:border-blue-300"
                  >
                    Add Plan
                  </Button>
                </div>
                <div className="space-y-4">
                  {product.subscription_plans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {plan.subscription_plan_name || `Plan ${plan.subscription_plan_index}`}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Plan ID: {plan.id}</span>
                            <span>Index: {plan.subscription_plan_index}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={(isEditingSubscription && editingSubscription?.id === plan.id ? editSubscriptionData.active : plan.active) ? 'success' : 'error'}>
                            {(isEditingSubscription && editingSubscription?.id === plan.id ? editSubscriptionData.active : plan.active) ? 'Active' : 'Inactive'}
                          </Badge>
                          {!isEditingSubscription && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSubscription(plan)}
                                disabled={isEditing || isDeletingSubscription || isCreatingSubscription}
                                className="text-blue-600 hover:text-blue-800 hover:border-blue-300"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSubscriptionClick(plan)}
                                disabled={isEditing || isDeletingSubscription}
                                className="text-red-600 hover:text-red-800 hover:border-red-300"
                              >
                                {isDeletingSubscription && subscriptionToDelete?.id === plan.id ? 'Deleting...' : 'Delete'}
                              </Button>
                            </>
                          )}
                          {isEditingSubscription && editingSubscription?.id === plan.id && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={handleSaveSubscription}
                                disabled={isSavingSubscription}
                                className="flex items-center space-x-1"
                              >
                                {isSavingSubscription && (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                )}
                                <span>{isSavingSubscription ? 'Saving...' : 'Save'}</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEditSubscription}
                                disabled={isSavingSubscription}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isEditingSubscription && editingSubscription?.id === plan.id ? (
                        // Editing mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Input
                              label="Price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={editSubscriptionData.plan_price}
                              onChange={(e) => handleEditSubscriptionInputChange('plan_price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              disabled={isSavingSubscription}
                            />

                            <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-500">Cycle Type</label>
                              <select
                                value={editSubscriptionData.cycle_type}
                                onChange={(e) => handleEditSubscriptionInputChange('cycle_type', e.target.value)}
                                disabled={isSavingSubscription}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                              >
                                <option value="DAY">Daily</option>
                                <option value="WEEK">Weekly</option>
                                <option value="MONTH">Monthly</option>
                                <option value="YEAR">Yearly</option>
                              </select>
                            </div>

                            <Input
                              label="Frequency"
                              type="number"
                              min="1"
                              value={editSubscriptionData.frequency}
                              onChange={(e) => handleEditSubscriptionInputChange('frequency', parseInt(e.target.value) || 1)}
                              placeholder="1"
                              disabled={isSavingSubscription}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Number of Cycles"
                              type="number"
                              min="0"
                              value={editSubscriptionData.number_of_cycles}
                              onChange={(e) => handleEditSubscriptionInputChange('number_of_cycles', parseInt(e.target.value) || 0)}
                              placeholder="0 (unlimited)"
                              disabled={isSavingSubscription}
                            />

                            <div className="flex items-end">
                              <Checkbox
                                label="Active Plan"
                                checked={editSubscriptionData.active}
                                onChange={(e) => handleEditSubscriptionInputChange('active', e.target.checked)}
                                disabled={isSavingSubscription}
                              />
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Updated Plan Preview</h4>
                            <div className="text-xs text-blue-800 space-y-1">
                              <p><strong>Price:</strong> {formatPrice(editSubscriptionData.plan_price)}</p>
                              <p><strong>Billing:</strong> Every {editSubscriptionData.frequency} {formatCycleType(editSubscriptionData.cycle_type).toLowerCase()}</p>
                              <p><strong>Duration:</strong> {editSubscriptionData.number_of_cycles === 0 ? 'Unlimited' : `${editSubscriptionData.number_of_cycles} cycles`}</p>
                              <p><strong>Status:</strong> {editSubscriptionData.active ? 'Active' : 'Inactive'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Display mode
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                              <p className="text-gray-900 font-semibold">{formatPrice(plan.plan_price)}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Billing Cycle</label>
                              <p className="text-gray-900">
                                Every {plan.frequency} {formatCycleType(plan.cycle_type)}
                                {plan.frequency > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                              <p className="text-gray-900">{plan.frequency}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Total Cycles</label>
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

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Cycle Value: {plan.cycle || 0}</span>
                              <span>
                                {plan.number_of_cycles === 0 ?
                                  'Recurring indefinitely' :
                                  `${plan.number_of_cycles} total payments`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Add Subscription Plan section - show when no plans exist */}
          {(!product.subscription_plans || product.subscription_plans.length === 0) && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowSubscriptionModal}
                    disabled={isEditing || isCreatingSubscription || isEditingSubscription}
                    className="text-blue-600 hover:text-blue-800 hover:border-blue-300"
                  >
                    Add Plan
                  </Button>
                </div>
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">No subscription plans created yet</p>
                  <Button
                    onClick={handleShowSubscriptionModal}
                    disabled={isEditing || isCreatingSubscription || isEditingSubscription}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create First Plan
                  </Button>
                </div>
              </div>
            </Card>
          )}
          <ProductInventory productId={productId} />

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

                <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-500">Subscription Plans</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.subscription_plans?.length || 0}
                  </span>
                </div>

                {product.subscription_plans && product.subscription_plans.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-500">Active Plans</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.subscription_plans.filter(plan => plan.active).length}
                    </span>
                  </div>
                )}

                {product.large_image && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-500">Image</span>
                    <Badge variant="success">Available</Badge>
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
                    disabled={isEditingSubscription}
                  >
                    Edit Product
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={handleSave}
                      disabled={isSaving || isEditingSubscription}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancel}
                      disabled={isSaving || isEditingSubscription}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full text-blue-600 hover:text-blue-800 hover:border-blue-300"
                  onClick={() => {
                    setShowImageUpload(true);
                    setUploadError(null);
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  disabled={isEditing || isUploading || isEditingSubscription}
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-800 hover:border-red-300"
                  onClick={handleDeleteClick}
                  disabled={isEditing || isDeleting || isEditingSubscription}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </Button>
              </div>
              {(!isEditing && !isEditingSubscription) && (
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

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">Upload Product Image</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image File
                  </label>
                  <input
                    type="file"
                    accept=".png,.gif,.jpg,.jpeg,image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={isUploading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: PNG, GIF, JPG, JPEG. Max size: 3MB
                  </p>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-32 object-contain mx-auto"
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{uploadError}</p>
                  </div>
                )}
              </div>

              <div className="items-center px-4 py-3 mt-6">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowImageUpload(false);
                      setUploadError(null);
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleImageUpload}
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Upload'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Subscription Plan Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-center mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-6">Create Subscription Plan</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Plan Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={subscriptionData.plan_price}
                    onChange={(e) => handleSubscriptionInputChange('plan_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isCreatingSubscription}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">Cycle Type</label>
                    <select
                      value={subscriptionData.cycle_type}
                      onChange={(e) => handleSubscriptionInputChange('cycle_type', e.target.value)}
                      disabled={isCreatingSubscription}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="DAY">Daily</option>
                      <option value="WEEK">Weekly</option>
                      <option value="MONTH">Monthly</option>
                      <option value="YEAR">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Frequency"
                    type="number"
                    min="1"
                    value={subscriptionData.frequency}
                    onChange={(e) => handleSubscriptionInputChange('frequency', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    disabled={isCreatingSubscription}
                  />

                  <Input
                    label="Number of Cycles"
                    type="number"
                    min="0"
                    value={subscriptionData.number_of_cycles}
                    onChange={(e) => handleSubscriptionInputChange('number_of_cycles', parseInt(e.target.value) || 0)}
                    placeholder="0 (unlimited)"
                    disabled={isCreatingSubscription}
                  />
                </div>

                <Input
                  label="Plan Index"
                  type="number"
                  min="0"
                  value={subscriptionData.subscription_plan_index}
                  onChange={(e) => handleSubscriptionInputChange('subscription_plan_index', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  disabled={isCreatingSubscription}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    label="Active Plan"
                    checked={subscriptionData.active}
                    onChange={(e) => handleSubscriptionInputChange('active', e.target.checked)}
                    disabled={isCreatingSubscription}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Plan Summary</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p><strong>Price:</strong> {formatPrice(subscriptionData.plan_price)}</p>
                    <p><strong>Billing:</strong> Every {subscriptionData.frequency} {formatCycleType(subscriptionData.cycle_type).toLowerCase()}</p>
                    <p><strong>Duration:</strong> {subscriptionData.number_of_cycles === 0 ? 'Unlimited' : `${subscriptionData.number_of_cycles} cycles`}</p>
                    <p><strong>Status:</strong> {subscriptionData.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                {subscriptionError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{subscriptionError}</p>
                  </div>
                )}
              </div>

              <div className="items-center px-4 py-3 mt-6">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelSubscription}
                    disabled={isCreatingSubscription}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleCreateSubscription}
                    disabled={isCreatingSubscription || subscriptionData.plan_price <= 0}
                  >
                    {isCreatingSubscription ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Plan'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscription Confirmation Modal */}
      {showDeleteSubscriptionConfirm && subscriptionToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Subscription Plan</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-3">
                  Are you sure you want to delete this subscription plan?
                </p>
                <div className="bg-gray-50 rounded-md p-3 text-left">
                  <div className="text-sm">
                    <p><strong>Plan:</strong> {subscriptionToDelete.subscription_plan_name || `Plan ${subscriptionToDelete.subscription_plan_index}`}</p>
                    <p><strong>Price:</strong> {formatPrice(subscriptionToDelete.plan_price)}</p>
                    <p><strong>Billing:</strong> Every {subscriptionToDelete.frequency} {formatCycleType(subscriptionToDelete.cycle_type)}</p>
                    <p><strong>ID:</strong> {subscriptionToDelete.id}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  This action cannot be undone.
                </p>
              </div>

              {deleteSubscriptionError && (
                <div className="mx-7 mb-3">
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{deleteSubscriptionError}</p>
                  </div>
                </div>
              )}

              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelDeleteSubscription}
                    disabled={isDeletingSubscription}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteSubscription}
                    disabled={isDeletingSubscription}
                  >
                    {isDeletingSubscription ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </div>
                    ) : (
                      'Delete Plan'
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