import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Package,
    CreditCard,
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    Truck,
    Plus,
    Trash2,
    Edit
} from 'lucide-react';
import keapAPI from '../../services/keapAPI';
import ProductSelector from '../misc/ProductSelector';
import { OrderPayments } from './OrderPayments';
import { OrderTransactions } from './OrderTransactions';
// Main OrderDetails Component
export function OrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Add order item states
    const [showAddItem, setShowAddItem] = useState(false);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [newItem, setNewItem] = useState({
        product_id: '',
        description: '',
        item_type: 'PRODUCT',
        price: '',
        quantity: 1
    });
    const [addItemLoading, setAddItemLoading] = useState(false);

    // Confirmation modal states
    const [showDeleteOrderConfirm, setShowDeleteOrderConfirm] = useState(false);
    const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Payment plan states
    const [showEditPaymentPlan, setShowEditPaymentPlan] = useState(false);
    const [paymentPlan, setPaymentPlan] = useState({
        auto_charge: true,
        credit_card_id: 0,
        days_between_payments: 0,
        initial_payment_amount: '',
        initial_payment_date: '',
        number_of_payments: 0,
        payment_gateway: {
            merchant_account_id: 0,
            use_default: true
        },
        plan_start_date: ''
    });
    const [updatePaymentPlanLoading, setUpdatePaymentPlanLoading] = useState(false);

    useEffect(() => {
        if (orderId) {
            loadOrderDetails();
        }
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const orderData = await keapAPI.getOrderById(orderId);
            console.log('Order details:', orderData);
            setOrder(orderData);

        } catch (err) {
            console.error('Error loading order details:', err);
            setError('Failed to load order details. Please try again.');
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
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'PAID': 'bg-green-100 text-green-800 border-green-200',
            'UNPAID': 'bg-red-100 text-red-800 border-red-200',
            'PARTIAL': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'DRAFT': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return statusColors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const goBack = () => {
        navigate('/orders');
    };

    const handleDeleteOrder = () => {
        setShowDeleteOrderConfirm(true);
    };

    const confirmDeleteOrder = async () => {
        try {
            setDeleteLoading(true);
            // XML-RPC doesn't support order deletion, so we'll show a message
            alert('Order deletion is not supported in XML-RPC mode.');
        } catch (err) {
            console.error('Error deleting order:', err);
            alert('Failed to delete order. Please try again.');
        } finally {
            setDeleteLoading(false);
            setShowDeleteOrderConfirm(false);
        }
    };

    const handleAddOrderItem = async () => {
        try {
            setAddItemLoading(true);

            // XML-RPC doesn't support adding order items to existing orders
            alert('Adding order items is not supported in XML-RPC mode. Please create a new order with the required items.');

            // Reset form and close modal
            setNewItem({
                product_id: '',
                description: '',
                item_type: 'PRODUCT',
                price: '',
                quantity: 1
            });
            setShowAddItem(false);

        } catch (err) {
            console.error('Error adding order item:', err);
            alert('Failed to add order item. Please try again.');
        } finally {
            setAddItemLoading(false);
        }
    };

    const handleDeleteOrderItem = (itemId) => {
        setItemToDelete(itemId);
        setShowDeleteItemConfirm(true);
    };

    const confirmDeleteOrderItem = async () => {
        try {
            // XML-RPC doesn't support deleting individual order items
            alert('Deleting individual order items is not supported in XML-RPC mode.');
        } catch (err) {
            console.error('Error deleting order item:', err);
            alert('Failed to delete order item. Please try again.');
        } finally {
            setShowDeleteItemConfirm(false);
            setItemToDelete(null);
        }
    };

    const handleProductSelect = (product) => {
        setNewItem(prev => ({
            ...prev,
            product_id: product.id.toString(),
            description: product.product_name || '',
            price: product.product_price ? product.product_price.toString() : ''
        }));
    };

    const handleEditPaymentPlan = () => {
        console.log('Edit payment plan clicked'); // Debug log
        console.log('Current order payment plan:', order?.payment_plan); // Debug log

        // Initialize form with existing payment plan data
        if (order?.payment_plan) {
            setPaymentPlan({
                auto_charge: order.payment_plan.auto_charge || false,
                credit_card_id: order.payment_plan.credit_card_id || 0,
                days_between_payments: order.payment_plan.days_between_payments || 0,
                initial_payment_amount: order.payment_plan.initial_payment_amount || '',
                initial_payment_date: order.payment_plan.initial_payment_date ?
                    order.payment_plan.initial_payment_date.split('T')[0] : '',
                number_of_payments: order.payment_plan.number_of_payments || 0,
                payment_gateway: {
                    merchant_account_id: order.payment_plan.payment_gateway?.merchant_account_id || 0,
                    use_default: order.payment_plan.payment_gateway?.use_default ?? true
                },
                plan_start_date: order.payment_plan.plan_start_date ?
                    order.payment_plan.plan_start_date.split('T')[0] : ''
            });
        } else {
            // Reset to default values if no payment plan exists
            setPaymentPlan({
                auto_charge: true,
                credit_card_id: 0,
                days_between_payments: 0,
                initial_payment_amount: '',
                initial_payment_date: '',
                number_of_payments: 0,
                payment_gateway: {
                    merchant_account_id: 0,
                    use_default: true
                },
                plan_start_date: ''
            });
        }

        console.log('Setting showEditPaymentPlan to true'); // Debug log
        setShowEditPaymentPlan(true);
    };

    const handleUpdatePaymentPlan = async () => {
        try {
            setUpdatePaymentPlanLoading(true);

            // XML-RPC doesn't support updating payment plans
            alert('Payment plan updates are not supported in XML-RPC mode.');

            // Close modal
            setShowEditPaymentPlan(false);

        } catch (err) {
            console.error('Error updating payment plan:', err);
            alert('Failed to update payment plan. Please try again.');
        } finally {
            setUpdatePaymentPlanLoading(false);
        }
    };

    const itemTypes = [
        'UNKNOWN', 'SHIPPING', 'TAX', 'SERVICE', 'PRODUCT', 'UPSELL',
        'FINANCE_CHARGE', 'SPECIAL', 'PROGRAM', 'SUBSCRIPTION',
        'SPECIAL_FREE_TRIAL_DAYS', 'SPECIAL_ORDER_TOTAL', 'SPECIAL_PRODUCT',
        'SPECIAL_CATEGORY', 'SPECIAL_SHIPPING', 'TIP', 'OTHER'
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <div className="space-x-3">
                        <Button onClick={loadOrderDetails} variant="outline">
                            Retry
                        </Button>
                        <Button onClick={goBack} variant="secondary">
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Order not found</p>
                    <Button onClick={goBack} variant="secondary">
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={goBack}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.id}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {order.title || `Order ${order.id}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={handleDeleteOrder}
                        disabled={deleteLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Order'}
                    </Button>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status || 'Unknown'}
                    </span>
                    {order.order_type && (
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${order.order_type?.toLowerCase() === 'online'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}>
                            {order.order_type}
                        </span>
                    )}
                    {order.invoice_number && (
                        <span className="text-sm text-gray-600">
                            Invoice: #{order.invoice_number}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Order Summary */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                                <p className="text-lg font-semibold text-green-600">{formatCurrency(order.total_paid)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Amount Due</p>
                                <p className="text-lg font-semibold text-red-600">{formatCurrency(order.total_due)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Refunded</p>
                                <p className="text-lg font-semibold text-gray-600">{formatCurrency(order.refund_total)}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Order Date</p>
                                <p className="text-sm text-gray-900">{formatDate(order.order_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Created</p>
                                <p className="text-sm text-gray-900">{formatDate(order.creation_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Last Modified</p>
                                <p className="text-sm text-gray-900">{formatDate(order.modification_date)}</p>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Package className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                                    <span className="text-sm text-gray-500">({order.order_items?.length || 0} items)</span>
                                </div>
                                <Button
                                    onClick={() => setShowAddItem(true)}
                                    size="sm"
                                    className="flex items-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Item</span>
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.order_items?.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.name || item.description || 'Unnamed Item'}
                                                    </div>
                                                    {item.product && (
                                                        <div className="text-xs text-gray-500">
                                                            Product: {item.product.name} (ID: {item.product.id})
                                                        </div>
                                                    )}
                                                    {item.description && item.name && (
                                                        <div className="text-xs text-gray-500">{item.description}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {item.product?.sku || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                    {item.type || 'PRODUCT'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {item.quantity || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {item.discount ? formatCurrency(item.discount) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency((item.price || 0) * (item.quantity || 0) - (item.discount || 0))}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <Button
                                                    onClick={() => handleDeleteOrderItem(item.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800 hover:border-red-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <OrderPayments orderId={orderId} />
                    <OrderTransactions orderId={orderId} />


                </div>

                {/* Right Column - Contact & Shipping */}
                <div className="space-y-6">

                    {/* Contact Information */}
                    {order.contact && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <User className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">Contact</h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {[order.contact.first_name, order.contact.last_name]
                                            .filter(Boolean)
                                            .join(' ') || 'No Name'}
                                    </p>
                                    <p className="text-sm text-gray-600">ID: {order.contact.id}</p>
                                </div>

                                {order.contact.email && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Email</p>
                                        <p className="text-sm text-gray-900">{order.contact.email}</p>
                                    </div>
                                )}

                                {order.contact.company_name && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Company</p>
                                        <p className="text-sm text-gray-900">{order.contact.company_name}</p>
                                    </div>
                                )}

                                {order.contact.job_title && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Job Title</p>
                                        <p className="text-sm text-gray-900">{order.contact.job_title}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Shipping Information */}
                    {order.shipping_information && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Truck className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="font-medium text-gray-900">
                                    {[
                                        order.shipping_information.first_name,
                                        order.shipping_information.middle_name,
                                        order.shipping_information.last_name
                                    ].filter(Boolean).join(' ')}
                                </div>

                                {order.shipping_information.company && (
                                    <div className="text-gray-700">{order.shipping_information.company}</div>
                                )}

                                <div className="text-gray-700">
                                    {order.shipping_information.street1}
                                    {order.shipping_information.street2 && (
                                        <><br />{order.shipping_information.street2}</>
                                    )}
                                </div>

                                <div className="text-gray-700">
                                    {[
                                        order.shipping_information.city,
                                        order.shipping_information.state,
                                        order.shipping_information.zip
                                    ].filter(Boolean).join(', ')}
                                </div>

                                {order.shipping_information.country && (
                                    <div className="text-gray-700">{order.shipping_information.country}</div>
                                )}

                                {order.shipping_information.phone && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="text-xs font-medium text-gray-500">Phone</p>
                                        <p className="text-sm text-gray-900">{order.shipping_information.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}



                    {/* Payment Information */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900">Payment Plan</h2>
                            </div>
                            <Button
                                onClick={handleEditPaymentPlan}
                                variant="outline"
                                size="sm"
                                className="flex items-center space-x-2"
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Button>
                        </div>

                        <div className="space-y-3 text-sm">
                            {order.payment_plan ? (
                                <>
                                    {order.payment_plan.initial_payment_amount && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Initial Payment</p>
                                            <p className="text-sm text-gray-900">
                                                {formatCurrency(order.payment_plan.initial_payment_amount)}
                                                {order.payment_plan.initial_payment_date && (
                                                    <span className="text-gray-500 ml-2">
                                                        on {formatDate(order.payment_plan.initial_payment_date)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {order.payment_plan.number_of_payments && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Payment Plan</p>
                                            <p className="text-sm text-gray-900">
                                                {order.payment_plan.number_of_payments} payments
                                                {order.payment_plan.days_between_payments && (
                                                    <span className="text-gray-500">
                                                        , every {order.payment_plan.days_between_payments} days
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-4">
                                        <div className={`px-2 py-1 text-xs rounded ${order.payment_plan.auto_charge
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.payment_plan.auto_charge ? 'Auto Charge' : 'Manual'}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">No payment plan configured</p>
                            )}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                            <h2 className="text-lg font-medium text-gray-900">Additional Info</h2>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order Type:</span>
                                <span className="text-gray-900">{order.order_type || 'N/A'}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Source:</span>
                                <span className="text-gray-900">{order.source_type || 'N/A'}</span>
                            </div>

                            {order.recurring !== undefined && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Recurring:</span>
                                    <span className={`px-2 py-1 text-xs rounded ${order.recurring
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.recurring ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            )}

                            {order.job_status && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Job Status:</span>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                        order.job_status === 'In Fulfillment' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.job_status}
                                    </span>
                                </div>
                            )}

                            {order.product_sold && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Product Sold:</span>
                                    <span className="text-gray-900">{order.product_sold}</span>
                                </div>
                            )}

                            {(order.lead_affiliate_id || order.sales_affiliate_id) && (
                                <div className="pt-2 border-t border-gray-200">
                                    {order.lead_affiliate_id && (
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500">Lead Affiliate:</span>
                                            <span className="text-gray-900">{order.lead_affiliate_id}</span>
                                        </div>
                                    )}
                                    {order.sales_affiliate_id && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Sales Affiliate:</span>
                                            <span className="text-gray-900">{order.sales_affiliate_id}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Order Item Modal */}
            {showAddItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddItem(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Order Item</h3>
                                    <p className="text-sm text-gray-500">Add a new item to this order (XML-RPC limitation: Not supported)</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={newItem.product_id}
                                                onChange={(e) => setNewItem(prev => ({ ...prev, product_id: e.target.value }))}
                                                required
                                                min="1"
                                                disabled
                                                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => setShowProductSelector(true)}
                                                variant="outline"
                                                size="sm"
                                                className="px-3"
                                                disabled
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                        <input
                                            type="number"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                            required
                                            min="1"
                                            disabled
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                                        <select
                                            value={newItem.item_type}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, item_type: e.target.value }))}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                            disabled
                                        >
                                            {itemTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price Override</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                                            placeholder="Leave empty for default price"
                                            disabled
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={newItem.description}
                                            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            placeholder="Item description"
                                            disabled
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    onClick={handleAddOrderItem}
                                    disabled={true}
                                    className="w-full sm:w-auto sm:ml-3 bg-gray-400"
                                >
                                    Not Supported in XML-RPC
                                </Button>
                                <Button
                                    onClick={() => setShowAddItem(false)}
                                    variant="outline"
                                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Selector Modal */}
            <ProductSelector
                isOpen={showProductSelector}
                onClose={() => setShowProductSelector(false)}
                onSelect={handleProductSelect}
                selectedProductId={newItem.product_id}
            />

            {/* Delete Order Confirmation Modal */}
            {showDeleteOrderConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteOrderConfirm(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Delete Order (Not Supported)
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Order deletion is not supported in XML-RPC mode. This functionality is only available in REST API mode.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    onClick={confirmDeleteOrder}
                                    disabled={true}
                                    className="w-full sm:w-auto sm:ml-3 bg-gray-400"
                                >
                                    Not Supported
                                </Button>
                                <Button
                                    onClick={() => setShowDeleteOrderConfirm(false)}
                                    variant="outline"
                                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Payment Plan Modal */}
            {showEditPaymentPlan && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditPaymentPlan(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Payment Plan</h3>
                                    <p className="text-sm text-gray-500">Payment plan editing is not supported in XML-RPC mode</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Payment Amount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={paymentPlan.initial_payment_amount}
                                                onChange={(e) => setPaymentPlan(prev => ({ ...prev, initial_payment_amount: e.target.value }))}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                                placeholder="0.00"
                                                disabled
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Payment Date</label>
                                            <input
                                                type="date"
                                                value={paymentPlan.initial_payment_date}
                                                onChange={(e) => setPaymentPlan(prev => ({ ...prev, initial_payment_date: e.target.value }))}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    onClick={handleUpdatePaymentPlan}
                                    disabled={true}
                                    className="w-full sm:w-auto sm:ml-3 bg-gray-400"
                                >
                                    Not Supported in XML-RPC
                                </Button>
                                <Button
                                    onClick={() => setShowEditPaymentPlan(false)}
                                    variant="outline"
                                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Item Confirmation Modal */}
            {showDeleteItemConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteItemConfirm(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <Trash2 className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Delete Order Item (Not Supported)
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Deleting individual order items is not supported in XML-RPC mode.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    onClick={confirmDeleteOrderItem}
                                    className="w-full sm:w-auto sm:ml-3 bg-gray-400"
                                    disabled
                                >
                                    Not Supported
                                </Button>
                                <Button
                                    onClick={() => setShowDeleteItemConfirm(false)}
                                    variant="outline"
                                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}