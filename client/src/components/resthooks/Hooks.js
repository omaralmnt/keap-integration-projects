import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import WebhookLogs from './WebHookLogs'; // El nuevo componente que crearemos

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Large Modal Component for Logs
const LargeModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  required = false,
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Available event types from Keap API
const EVENT_TYPES = [
  "appointment.add",
  "appointment.delete", 
  "appointment.edit",
  "company.add",
  "company.delete",
  "company.edit",
  "contact.add",
  "contact.delete",
  "contact.edit",
  "contactGroup.add",
  "contactGroup.applied",
  "contactGroup.delete",
  "contactGroup.edit",
  "contactGroup.removed",
  "invoice.add",
  "invoice.delete",
  "invoice.edit",
  "invoice.payment.add",
  "invoice.payment.delete",
  "invoice.payment.edit",
  "leadsource.add",
  "leadsource.delete",
  "leadsource.edit",
  "note.add",
  "note.delete",
  "note.edit",
  "opportunity.add",
  "opportunity.delete",
  "opportunity.edit",
  "opportunity.stage_move",
  "order.add",
  "order.delete",
  "order.edit",
  "product.add",
  "product.delete",
  "product.edit",
  "subscription.add",
  "subscription.delete",
  "subscription.edit",
  "task.add",
  "task.complete",
  "task.delete",
  "task.edit",
  "task.incomplete",
  "user.activate",
  "user.add",
  "user.edit"
];

// Group event types by category for better UX
const EVENT_CATEGORIES = {
  'Appointments': EVENT_TYPES.filter(e => e.startsWith('appointment.')),
  'Companies': EVENT_TYPES.filter(e => e.startsWith('company.')),
  'Contacts': EVENT_TYPES.filter(e => e.startsWith('contact')),
  'Invoices': EVENT_TYPES.filter(e => e.startsWith('invoice.')),
  'Lead Sources': EVENT_TYPES.filter(e => e.startsWith('leadsource.')),
  'Notes': EVENT_TYPES.filter(e => e.startsWith('note.')),
  'Opportunities': EVENT_TYPES.filter(e => e.startsWith('opportunity.')),
  'Orders': EVENT_TYPES.filter(e => e.startsWith('order.')),
  'Products': EVENT_TYPES.filter(e => e.startsWith('product.')),
  'Subscriptions': EVENT_TYPES.filter(e => e.startsWith('subscription.')),
  'Tasks': EVENT_TYPES.filter(e => e.startsWith('task.')),
  'Users': EVENT_TYPES.filter(e => e.startsWith('user.'))
};

// Select component for event types
const EventTypeSelect = ({ value, onChange, className = '' }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
    >
      <option value="">Select an event type...</option>
      {Object.entries(EVENT_CATEGORIES).map(([category, events]) => (
        <optgroup key={category} label={category}>
          {events.map(eventType => (
            <option key={eventType} value={eventType}>
              {eventType}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

// Main Hooks Component
export function Hooks() {
  const [hooks, setHooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedHook, setSelectedHook] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    eventKey: '',
    hookUrl: ''
  });
  
  const [verifySecret, setVerifySecret] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Function to fetch hooks
  const handleLoadHooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await keapAPI.getHooks();
      console.log('Hooks data:', data);
      setHooks(data || []);
      
    } catch (error) {
      console.error('Error loading hooks:', error);
      setError('Failed to load hooks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to create hook
  const handleCreateHook = async (e) => {
    e.preventDefault();
    if (!formData.eventKey || !formData.hookUrl) {
      setError('Event Key and Hook URL are required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');
      
      await keapAPI.createHook({
        eventKey: formData.eventKey,
        hookUrl: formData.hookUrl
      });
      
      // Reset form and close modal
      setFormData({ eventKey: '', hookUrl: '' });
      setShowCreateModal(false);
      
      // Reload hooks
      handleLoadHooks();
      
    } catch (error) {
      console.error('Error creating hook:', error);
      setError('Failed to create hook. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Function to update hook
  const handleUpdateHook = async (e) => {
    e.preventDefault();
    if (!formData.eventKey || !formData.hookUrl || !selectedHook?.key) {
      setError('All fields are required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');
      
      await keapAPI.updateHook(selectedHook.key, {
        eventKey: formData.eventKey,
        hookUrl: formData.hookUrl
      });
      
      // Reset form and close modal
      setFormData({ eventKey: '', hookUrl: '' });
      setShowUpdateModal(false);
      setSelectedHook(null);
      
      // Reload hooks
      handleLoadHooks();
      
    } catch (error) {
      console.error('Error updating hook:', error);
      setError('Failed to update hook. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Function to verify hook (immediate)
  const handleVerifyHook = async (hookKey) => {
    try {
      setError('');
      await keapAPI.verifyHook(hookKey);
      
      // Reload hooks to get updated status
      handleLoadHooks();
      
    } catch (error) {
      console.error('Error verifying hook:', error);
      setError('Failed to verify hook. Please try again.');
    }
  };

  // Function to verify hook with secret (delayed)
  const handleVerifyHookDelayed = async (e) => {
    e.preventDefault();
    if (!verifySecret || !selectedHook?.key) {
      setError('X-Hook-Secret is required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');
      
      await keapAPI.verifyHookDelayed(selectedHook.key, verifySecret);
      
      // Reset form and close modal
      setVerifySecret('');
      setShowVerifyModal(false);
      setSelectedHook(null);
      
      // Reload hooks to get updated status
      handleLoadHooks();
      
    } catch (error) {
      console.error('Error verifying hook with secret:', error);
      setError('Failed to verify hook. Please check your secret and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Function to delete hook
  const handleDeleteHook = async (hookKey) => {
    if (!window.confirm('Are you sure you want to delete this hook subscription?')) {
      return;
    }

    try {
      setError('');
      await keapAPI.deleteHook(hookKey);
      
      // Remove hook from local state
      setHooks(hooks.filter(hook => hook.key !== hookKey));
      
    } catch (error) {
      console.error('Error deleting hook:', error);
      setError('Failed to delete hook. Please try again.');
    }
  };

  // Open update modal with hook data
  const openUpdateModal = (hook) => {
    setSelectedHook(hook);
    setFormData({
      eventKey: hook.eventKey || '',
      hookUrl: hook.hookUrl || ''
    });
    setShowUpdateModal(true);
  };

  // Open verify delayed modal
  const openVerifyModal = (hook) => {
    setSelectedHook(hook);
    setVerifySecret('');
    setShowVerifyModal(true);
  };

  // Open logs modal
  const openLogsModal = (hook) => {
    setSelectedHook(hook);
    setShowLogsModal(true);
  };

  // Close modals and reset form
  const closeModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setShowVerifyModal(false);
    setShowLogsModal(false);
    setSelectedHook(null);
    setFormData({ eventKey: '', hookUrl: '' });
    setVerifySecret('');
    setError('');
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'text-green-600 bg-green-100';
      case 'Unverified':
        return 'text-yellow-600 bg-yellow-100';
      case 'Inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hook Subscriptions</h1>
        <div className="flex space-x-3">
          <Button 
            variant="secondary" 
            onClick={() => setShowCreateModal(true)}
          >
            Create Hook
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowLogsModal(true)}
          >
            View Logs
          </Button>
          <Button onClick={handleLoadHooks} disabled={loading}>
            {loading ? 'Loading...' : 'Load Hooks'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Hook Subscriptions ({hooks.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading hooks...</p>
          </div>
        ) : hooks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No hooks found. Click "Load Hooks" to fetch your subscriptions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hook URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hooks.map((hook, index) => (
                  <tr key={hook.key || index}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {hook.key || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {hook.eventKey || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={hook.hookUrl}>
                        {hook.hookUrl || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hook.status)}`}>
                        {hook.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="flex space-x-2 flex-wrap gap-1">
                        {hook.status === 'Unverified' && (
                          <>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyHook(hook.key)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Verify
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => openVerifyModal(hook)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              Manual Verify
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => openLogsModal(hook)}
                        >
                           Logs
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateModal(hook)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHook(hook.key)}
                          className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Hook Status Legend */}
      {hooks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Hook Status Legend</h3>
              <div className="mt-2 text-sm text-blue-700">
                <div className="flex items-center space-x-4">
                  <span className="inline-flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Verified - Active and working
                  </span>
                  <span className="inline-flex items-center">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                    Unverified - Pending verification
                  </span>
                  <span className="inline-flex items-center">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Inactive - Not working
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-600">
                Note: You will not receive events until the subscription is verified. 
                Infusionsoft will make a POST request to your hookUrl with an X-Hook-Secret header for verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Hook Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModals}
        title="Create Hook Subscription"
      >
        <form onSubmit={handleCreateHook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Key *
            </label>
            <EventTypeSelect
              value={formData.eventKey}
              onChange={(e) => setFormData({...formData, eventKey: e.target.value})}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select the event you want to subscribe to
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hook URL *
            </label>
            <Input
              type="url"
              placeholder="https://your-domain.com/webhook"
              value={formData.hookUrl}
              onChange={(e) => setFormData({...formData, hookUrl: e.target.value})}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The URL where you want to receive webhook notifications
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-xs text-yellow-700">
              <strong>Verification Required:</strong> After creation, Infusionsoft will POST to your hookUrl 
              with an X-Hook-Secret header. Your endpoint must respond with status 200 and return the same header.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Hook'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Hook Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={closeModals}
        title="Update Hook Subscription"
      >
        <form onSubmit={handleUpdateHook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hook Key
            </label>
            <Input
              value={selectedHook?.key || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Key *
            </label>
            <EventTypeSelect
              value={formData.eventKey}
              onChange={(e) => setFormData({...formData, eventKey: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hook URL *
            </label>
            <Input
              type="url"
              placeholder="https://your-domain.com/webhook"
              value={formData.hookUrl}
              onChange={(e) => setFormData({...formData, hookUrl: e.target.value})}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-700">
              <strong>Re-verification:</strong> Updating a hook may require re-verification. 
              Make sure your endpoint is ready to handle the verification process.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Updating...' : 'Update Hook'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Verify Hook Modal (Delayed) */}
      <Modal
        isOpen={showVerifyModal}
        onClose={closeModals}
        title="Manual Hook Verification"
      >
        <form onSubmit={handleVerifyHookDelayed} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hook Key
            </label>
            <Input
              value={selectedHook?.key || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Status
            </label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedHook?.status)}`}>
              {selectedHook?.status || 'Unknown'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X-Hook-Secret *
            </label>
            <Input
              placeholder="Enter the secret from the verification request"
              value={verifySecret}
              onChange={(e) => setVerifySecret(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The secret value you received in the X-Hook-Secret header from Infusionsoft
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Delayed Verification Process:</h4>
            <ol className="text-xs text-purple-700 space-y-1">
              <li>1. Infusionsoft sent a POST request to your hookUrl with an X-Hook-Secret header</li>
              <li>2. Copy the secret value from that request</li>
              <li>3. Paste it here to manually verify your subscription</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Verifying...' : 'Verify Hook'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Webhook Logs Modal */}
      <LargeModal
        isOpen={showLogsModal}
        onClose={closeModals}
        title='Resthooks Logs'
      >
        <WebhookLogs 
          selectedHook={selectedHook} 
          onClose={closeModals}
        />
      </LargeModal>
    </div>
  );
}