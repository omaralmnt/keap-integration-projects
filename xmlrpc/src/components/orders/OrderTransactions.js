import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  CreditCard, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Package,
  RefreshCw
} from 'lucide-react';
import keapAPI from '../../services/keapAPI';

export function OrderTransactions({ orderId, contactId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    contact_id: contactId || '',
    limit: 50,
    offset: 0,
    since: '',
    until: ''
  });

  useEffect(() => {
    if (orderId) {
      loadTransactions();
    }
  }, [orderId, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        // Remove empty values
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
        )
      };

      const transactionsData = await keapAPI.getOrderTransactions(orderId, queryParams);
      console.log('Order transactions:', transactionsData);
      
      setTransactions(transactionsData?.transactions || []);
      setPagination({
        count: transactionsData?.count || 0,
        next: transactionsData?.next || null,
        previous: transactionsData?.previous || null
      });
      
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'completed':
      case 'success':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'declined':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'completed':
      case 'success':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'declined':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTotalTransactionsAmount = () => {
    return transactions.reduce((total, transaction) => total + (transaction.amount || 0), 0);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset offset when filters change
    }));
  };

  const handlePagination = (direction) => {
    if (direction === 'next' && pagination.next) {
      setFilters(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    } else if (direction === 'previous' && pagination.previous) {
      setFilters(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadTransactions} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
            <span className="text-sm text-gray-500">({pagination.count} total)</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(getTotalTransactionsAmount())}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact ID
            </label>
            <input
              type="number"
              value={filters.contact_id}
              onChange={(e) => handleFilterChange('contact_id', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contact ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Since
            </label>
            <input
              type="date"
              value={filters.since}
              onChange={(e) => handleFilterChange('since', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Until
            </label>
            <input
              type="date"
              value={filters.until}
              onChange={(e) => handleFilterChange('until', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
          <p className="mt-1 text-sm text-gray-500">
            No transactions found for this order with the current filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gateway
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <tr key={transaction.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getTransactionStatusIcon(transaction.status)}
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">
                          #{transaction.id || 'N/A'}
                        </div>
                        {transaction.test && (
                          <div className="text-xs text-orange-600">
                            TEST
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    {transaction.currency && transaction.currency !== 'USD' && (
                      <div className="text-xs text-gray-500">
                        {transaction.currency}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getTransactionStatusColor(transaction.status)}`}>
                      {transaction.status || 'Unknown'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        <div>{formatDate(transaction.transaction_date)}</div>
                        {transaction.paymentDate && transaction.paymentDate !== transaction.transaction_date && (
                          <div className="text-xs text-gray-500">
                            Paid: {formatDate(transaction.paymentDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.gateway || 'N/A'}
                    </div>
                    {transaction.gateway_account_name && (
                      <div className="text-xs text-gray-500">
                        {transaction.gateway_account_name}
                      </div>
                    )}
                    {transaction.collection_method && (
                      <div className="text-xs text-gray-500">
                        {transaction.collection_method}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.contact_id ? (
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-blue-600">#{transaction.contact_id}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {transaction.type || 'N/A'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    {transaction.orders && transaction.orders.length > 0 ? (
                      <div className="space-y-1">
                        {transaction.orders.slice(0, 2).map((order, idx) => (
                          <div key={order.id || idx} className="flex items-center text-sm">
                            <Package className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-blue-600">#{order.id}</span>
                            {order.title && (
                              <span className="text-gray-600 ml-1 truncate max-w-32" title={order.title}>
                                - {order.title}
                              </span>
                            )}
                          </div>
                        ))}
                        {transaction.orders.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{transaction.orders.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : transaction.order_ids ? (
                      <div className="text-sm text-gray-600">
                        {transaction.order_ids}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination and Footer */}
      {transactions.length > 0 && (
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {filters.offset + 1} - {Math.min(filters.offset + filters.limit, pagination.count)} of {pagination.count}
              </span>
              
              {(pagination.previous || pagination.next) && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination('previous')}
                    disabled={!pagination.previous}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePagination('next')}
                    disabled={!pagination.next}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <span className="font-medium text-gray-900">
                Total: {formatCurrency(getTotalTransactionsAmount())}
              </span>
            </div>
          </div>
          
          {transactions.some(t => t.errors) && (
            <div className="mt-2 text-xs text-red-600">
              * Some transactions have errors. Check individual transaction details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}