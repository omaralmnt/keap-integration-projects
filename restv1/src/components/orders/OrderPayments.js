import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  CreditCard, 
  Plus, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import keapAPI from '../../services/keapAPI';

export function OrderPayments({ orderId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add payment modal states
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [addPaymentLoading, setAddPaymentLoading] = useState(false);
  const [newPayment, setNewPayment] = useState({
    payment_amount: '',
    payment_method_type: 'CREDIT_CARD',
    charge_now: true,
    date: new Date().toISOString().split('T')[0], // Today's date
    notes: '',
    credit_card_id: '',
    payment_gateway_id: '',
    apply_to_commissions: true
  });

  useEffect(() => {
    if (orderId) {
      loadPayments();
    }
  }, [orderId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const paymentsData = await keapAPI.getOrderPayments(orderId);
      console.log('Order payments:', paymentsData);
      setPayments(paymentsData || []);
      
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  const getPaymentStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'paid':
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'declined':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    
    switch (statusLower) {
      case 'paid':
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'declined':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddPayment = async () => {
    try {
      setAddPaymentLoading(true);
      
      const payload = {
        payment_amount: parseFloat(newPayment.payment_amount).toString(),
        payment_method_type: newPayment.payment_method_type,
        charge_now: newPayment.charge_now,
        apply_to_commissions: newPayment.apply_to_commissions,
      };

      // Add optional fields only if they have values
      if (newPayment.notes.trim()) {
        payload.notes = newPayment.notes.trim();
      }

    //   if (newPayment.credit_card_id && newPayment.payment_method_type === 'CREDIT_CARD') {
        payload.credit_card_id = parseInt(newPayment.credit_card_id);
    //   }

      if (newPayment.payment_gateway_id.trim()) {
        payload.payment_gateway_id = newPayment.payment_gateway_id.trim();
      }

      // Add date if not charging now or if it's different from today
      if (!newPayment.charge_now || newPayment.date !== new Date().toISOString().split('T')[0]) {
        payload.date = new Date(newPayment.date + 'T12:00:00.000Z').toISOString();
      }

      console.log('Creating payment:', payload);
      await keapAPI.createOrderPayment(orderId, payload);
      
      // Reset form and close modal
      setNewPayment({
        payment_amount: '',
        payment_method_type: 'CREDIT_CARD',
        charge_now: true,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        credit_card_id: '',
        payment_gateway_id: '',
        apply_to_commissions: true
      });
      setShowAddPayment(false);
      
      // Reload payments
      await loadPayments();
      
    } catch (err) {
      console.error('Error creating payment:', err);
      alert('Failed to create payment. Please try again.');
    } finally {
      setAddPaymentLoading(false);
    }
  };

  const getTotalPaymentsAmount = () => {
    return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">Payments</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">Payments</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadPayments} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">Payments</h2>
              <span className="text-sm text-gray-500">({payments.length} payments)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(getTotalPaymentsAmount())}
                </p>
              </div>
              <Button
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setShowAddPayment(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Payment</span>
              </Button>
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
            <p className="mt-1 text-sm text-gray-500">
              No payments have been recorded for this order yet.
            </p>
            <div className="mt-6">
              <Button
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setShowAddPayment(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add First Payment</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pay Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr key={payment.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getPaymentStatusIcon(payment.pay_status)}
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            #{payment.payment_id || payment.id || 'N/A'}
                          </div>
                          {payment.refund_invoice_payment_id && (
                            <div className="text-xs text-red-600">
                              Refund of #{payment.refund_invoice_payment_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(payment.pay_status)}`}>
                        {payment.pay_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(payment.pay_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.invoice_id ? (
                        <span className="text-blue-600">#{payment.invoice_id}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.note ? (
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={payment.note}>
                          <FileText className="h-4 w-4 text-gray-400 inline mr-1" />
                          {payment.note}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        payment.skip_commission 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {payment.skip_commission ? 'Skip' : 'Include'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {payments.length > 0 && (
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Last updated: {payments.length > 0 ? formatDate(Math.max(...payments.map(p => new Date(p.last_updated || 0)))) : 'N/A'}
              </span>
              <span className="font-medium text-gray-900">
                Total: {formatCurrency(getTotalPaymentsAmount())}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Payment</h3>
              
              <div className="space-y-4">
                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPayment.payment_amount}
                      onChange={(e) => setNewPayment({...newPayment, payment_amount: e.target.value})}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Payment Method Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newPayment.payment_method_type}
                    onChange={(e) => setNewPayment({...newPayment, payment_method_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="CHECK">Check</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                {/* Credit Card ID (only show if CREDIT_CARD is selected) */}
                {/* {newPayment.payment_method_type === 'CREDIT_CARD' && ( */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Card ID
                    </label>
                    <input
                      type="number"
                      value={newPayment.credit_card_id}
                      onChange={(e) => setNewPayment({...newPayment, credit_card_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter credit card ID"
                    />
                  </div>
                {/* )} */}

                {/* Payment Gateway ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Gateway ID
                  </label>
                  <input
                    type="text"
                    value={newPayment.payment_gateway_id}
                    onChange={(e) => setNewPayment({...newPayment, payment_gateway_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional gateway ID"
                  />
                </div>

                {/* Charge Now Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="charge_now"
                    checked={newPayment.charge_now}
                    onChange={(e) => setNewPayment({...newPayment, charge_now: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="charge_now" className="ml-2 text-sm text-gray-700">
                    Charge Now
                  </label>
                </div>

                {/* Date (show if not charging now) */}
                {!newPayment.charge_now && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={newPayment.date}
                        onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Apply to Commissions Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="apply_to_commissions"
                    checked={newPayment.apply_to_commissions}
                    onChange={(e) => setNewPayment({...newPayment, apply_to_commissions: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="apply_to_commissions" className="ml-2 text-sm text-gray-700">
                    Apply to Commissions
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddPayment(false);
                    // Reset form
                    setNewPayment({
                      payment_amount: '',
                      payment_method_type: 'CREDIT_CARD',
                      charge_now: true,
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                      credit_card_id: '',
                      payment_gateway_id: '',
                      apply_to_commissions: true
                    });
                  }}
                  disabled={addPaymentLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPayment}
                  disabled={addPaymentLoading || !newPayment.payment_amount}
                  className="flex items-center space-x-2"
                >
                  {addPaymentLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{addPaymentLoading ? 'Adding...' : 'Add Payment'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}