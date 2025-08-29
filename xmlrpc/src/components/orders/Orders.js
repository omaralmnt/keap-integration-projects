import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { useNavigate } from 'react-router-dom';
import { formatKeapDate } from '../../utils/dateUtils';

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

// Main Orders Component
export function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search parameters
  const [contactId, setContactId] = useState('');
  const [productId, setProductId] = useState('');
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [order, setOrder] = useState('order_date');
  const [orderStatus, setOrderStatus] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [orderType, setOrderType] = useState('');
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');

  // Load orders on component mount
  useEffect(() => {
    handleSearch();
  }, []);

  const handlePagination = async (action) => {
    let newOffset;
    if (action === 'next') {
      newOffset = Number(offset) + Number(limit);
    } else {
      newOffset = Math.max(0, Number(offset) - Number(limit));
    }
    
    setOffset(newOffset);
    
    // Re-run search with new offset
    const queryParams = buildQueryParams(newOffset);
    const response = await keapAPI.getOrdersFromJob(queryParams);
    
    if (response.success) {
      setOrders(response.orders);
      setNext(response.next);
      setPrevious(response.previous);
    }
  };

  const buildQueryParams = (currentOffset = offset) => {
    const queryParams = {
      contact_id: contactId || undefined,
      product_id: productId || undefined,
      limit,
      offset: currentOffset,
      order,
      order_direction: 'desc', // Most recent first
      order_status: orderStatus !== '' ? parseInt(orderStatus) : undefined,
      job_status: jobStatus || undefined,
      order_type: orderType || undefined
    };

    // Remove undefined values
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );

    return queryParams;
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setOffset(0); // Reset to first page on new search

      const queryParams = buildQueryParams(0);
      const data = await keapAPI.getOrdersFromJob(queryParams);
      
      if (data.success) {
        setOrders(data.orders);
        setPrevious(data.previous);
        setNext(data.next);
      } else {
        console.error('Error fetching orders:', data.error);
        setOrders([]);
      }

    } catch (error) {
      console.error('Error in handleSearch:', error);   
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return undefined;
    return dateTimeLocal + ':00.000Z';
  };

  const viewOrderDetails = (orderId) => {
    navigate(`/orders/details/${orderId}`);
  };

  const createOrder = () => {
    navigate('/orders/create');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'IN_FULFILLMENT': 'bg-green-100 text-green-800',
      'PENDING_PAYMENT': 'bg-red-100 text-red-800',
      'PAID': 'bg-green-100 text-green-800',
      'UNPAID': 'bg-red-100 text-red-800'
    };
    return statusColors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'IN_FULFILLMENT': 'In Fulfillment',
      'PENDING_PAYMENT': 'Pending Payment'
    };
    return labels[status] || status || 'Unknown';
  };

  const getOrderTypeColor = (type) => {
    const typeColors = {
      'Online': 'bg-blue-100 text-blue-800',
      'Offline': 'bg-purple-100 text-purple-800',
      'Invoice': 'bg-green-100 text-green-800',
      'Order': 'bg-indigo-100 text-indigo-800',
      'Subscription': 'bg-yellow-100 text-yellow-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (payStatus) => {
    const statusColors = {
      0: 'bg-red-100 text-red-800',     // Unpaid
      1: 'bg-green-100 text-green-800', // Paid
      2: 'bg-yellow-100 text-yellow-800', // Partially Paid
      3: 'bg-blue-100 text-blue-800'    // Overpaid
    };
    return statusColors[payStatus] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusLabel = (payStatus) => {
    const labels = {
      0: 'Unpaid',
      1: 'Paid',
      2: 'Partial',
      3: 'Overpaid'
    };
    return labels[payStatus] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Contact ID"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          />
          <Input
            placeholder="Product ID"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order Status</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="0">In Fulfillment (Paid)</option>
              <option value="1">Pending Payment (Unpaid)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
          <div>
            <label className="block text-xs text-gray-500 mb-1">Order By</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="order_date">Order Date</option>
              <option value="update_date">Update Date</option>
              <option value="due_date">Due Date</option>
              <option value="start_date">Start Date</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Job Status</label>
            <Input
              placeholder="e.g., Active, Complete"
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
            />
          </div>
        </div>


        <div className="flex space-x-3">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={createOrder}>
            Create Order
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({orders.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No orders found. Click search to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      <span className="text-blue-600 font-medium">#{order.id}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.contact_id ? (
                        <span className="text-blue-600 font-medium">#{order.contact_id}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.invoice_total)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(order.total_paid)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-red-600">
                      {formatCurrency(order.total_due)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.pay_status)}`}>
                        {getPaymentStatusLabel(order.pay_status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(order.invoice_type)}`}>
                        {order.invoice_type || 'Invoice'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatKeapDate(order.date_created) || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order.id)}
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
        {!loading && orders.length > 0 && (
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
                disabled={orders.length < limit}
                className="inline-flex items-center px-4 py-2 text-sm font-medium"
                onClick={() => handlePagination('next')}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}