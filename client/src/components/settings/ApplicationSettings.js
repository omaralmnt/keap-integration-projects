import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';

// Input component
const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${disabled ? 'bg-gray-100 text-gray-500' : ''} ${className}`}
      {...props}
    />
  );
};

// Card component for sections
const SettingsCard = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-xl mr-3">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Toggle component
const Toggle = ({ checked, onChange, disabled = false, label }) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && (
        <span className={`ml-3 text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </div>
  );
};

// Main Application Settings Component
export function ApplicationSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchApplicationStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await keapAPI.getSettings();
      setSettings(data);
      console.log('Settings data:', data);
    } catch (error) {
      console.log('Error fetching settings:', error);
      setError('Failed to load application settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStatus = async () => {
    try {
      setStatusLoading(true);
      const statusData = await keapAPI.getApplicationStatus();
      setApplicationStatus(statusData);
      console.log('Application status:', statusData);
    } catch (error) {
      console.log('Error fetching application status:', error);
      setApplicationStatus({ error: 'Failed to load status' });
    } finally {
      setStatusLoading(false);
    }
  };

  const formatCurrency = (currency) => {
    const currencyMap = {
      'USD': 'US Dollar ($)',
      'EUR': 'Euro (€)',
      'GBP': 'British Pound (£)',
      'CAD': 'Canadian Dollar (C$)',
      'AUD': 'Australian Dollar (A$)'
    };
    return currencyMap[currency] || currency;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'suspended': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-blue-100 text-blue-800',
      'trial': 'bg-purple-100 text-purple-800'
    };
    
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const normalizedStatus = status.toLowerCase();
    return statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800';
  };

  const refreshAll = async () => {
    await Promise.all([fetchSettings(), fetchApplicationStatus()]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading application settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Settings</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={refreshAll} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">No settings data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
              <p className="text-gray-600 mt-2">Configure your application preferences and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Application Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                {statusLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : applicationStatus?.error ? (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Error
                  </span>
                ) : applicationStatus?.value ? (
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(applicationStatus.value)}`}>
                    {applicationStatus.value}
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Unknown
                  </span>
                )}
              </div>
              
              <Button onClick={refreshAll} variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh All
              </Button>
            </div>
          </div>
        </div>

        {/* Company Information */}
        {settings.application?.company && (
          <SettingsCard title="Company Information" icon="🏢">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <Input value={settings.application.company.name || ''} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input value={settings.application.company.email || ''} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex space-x-2">
                    <Input value={settings.application.company.phone || ''} disabled className="flex-1" />
                    {settings.application.company.phone_ext && (
                      <Input value={`Ext: ${settings.application.company.phone_ext}`} disabled className="w-24" />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <Input value={settings.application.company.website || ''} disabled />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <Input value={settings.application.company.street_address_1 || ''} disabled className="mb-2" />
                  {settings.application.company.street_address_2 && (
                    <Input value={settings.application.company.street_address_2} disabled />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <Input value={settings.application.company.city || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <Input value={settings.application.company.state || ''} disabled />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <Input value={settings.application.company.zip || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <Input value={settings.application.company.country || ''} disabled />
                  </div>
                </div>
              </div>
            </div>
          </SettingsCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Settings */}
          <SettingsCard title="Application Settings" icon="⚙️">
            <div className="space-y-4">
              {settings.application?.time_zone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <Input value={settings.application.time_zone} disabled />
                </div>
              )}
              {settings.application?.default_view_locale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Locale</label>
                  <Input value={settings.application.default_view_locale} disabled />
                </div>
              )}
              {settings.application?.features_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features Enabled</label>
                  <div className="space-y-2">
                    <Toggle 
                      checked={settings.application.features_enabled.marketing} 
                      disabled 
                      label="Marketing Features" 
                    />
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>

          {/* E-commerce Settings */}
          {settings.ecommerce && (
            <SettingsCard title="E-commerce Settings" icon="💳">
              <div className="space-y-4">
                {settings.ecommerce.currency && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <Input value={formatCurrency(settings.ecommerce.currency)} disabled />
                  </div>
                )}
                {settings.ecommerce.default_country && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Country</label>
                    <Input value={settings.ecommerce.default_country} disabled />
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">E-commerce Features</h4>
                  <Toggle 
                    checked={settings.ecommerce.default_to_auto_charge} 
                    disabled 
                    label="Default to Auto Charge" 
                  />
                  <Toggle 
                    checked={settings.ecommerce.track_inventory} 
                    disabled 
                    label="Track Inventory" 
                  />
                  <Toggle 
                    checked={settings.ecommerce.track_cost_per_unit} 
                    disabled 
                    label="Track Cost Per Unit" 
                  />
                </div>
              </div>
            </SettingsCard>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Settings */}
          {settings.email && (
            <SettingsCard title="Email Settings" icon="📧">
              <div className="space-y-4">
                {settings.email.default_opt_in_link && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Opt-in Link</label>
                    <Input value={settings.email.default_opt_in_link} disabled />
                  </div>
                )}
                {settings.email.default_opt_out_link && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Opt-out Link</label>
                    <Input value={settings.email.default_opt_out_link} disabled />
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Email Features</h4>
                  <Toggle 
                    checked={settings.email.append_contact_key_to_links} 
                    disabled 
                    label="Append Contact Key to Links" 
                  />
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Contact Settings */}
          {settings.contact && (
            <SettingsCard title="Contact Settings" icon="👥">
              <div className="space-y-4">
                {settings.contact.default_new_contact_form && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default New Contact Form</label>
                    <Input value={settings.contact.default_new_contact_form} disabled />
                  </div>
                )}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Contact Features</h4>
                  <Toggle 
                    checked={settings.contact.disable_contact_edit_in_client_login} 
                    disabled 
                    label="Disable Contact Edit in Client Login" 
                  />
                </div>
              </div>
            </SettingsCard>
          )}
        </div>

        {/* Opportunity Settings */}
        {settings.opportunity && (
          <SettingsCard title="Opportunity Settings" icon="🎯">
            <div className="space-y-4">
              {settings.opportunity.default_stage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Stage</label>
                  <Input value={settings.opportunity.default_stage} disabled />
                </div>
              )}
              {settings.opportunity.states && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {settings.opportunity.states.active && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Active Stages</label>
                      <Input value={settings.opportunity.states.active.stages || 'N/A'} disabled />
                    </div>
                  )}
                  {settings.opportunity.states.win && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Win Stage</label>
                      <Input value={settings.opportunity.states.win.stage || 'N/A'} disabled className="mb-2" />
                      <Input value={`Reasons: ${settings.opportunity.states.win.reasons || 'N/A'}`} disabled />
                    </div>
                  )}
                  {settings.opportunity.states.loss && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loss Stage</label>
                      <Input value={settings.opportunity.states.loss.stage || 'N/A'} disabled className="mb-2" />
                      <Input value={`Reasons: ${settings.opportunity.states.loss.reasons || 'N/A'}`} disabled />
                    </div>
                  )}
                </div>
              )}
            </div>
          </SettingsCard>
        )}
      </div>
    </div>
  );
}