import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, X } from 'lucide-react';
import keapAPI from '../../services/keapAPI';

const Input = ({ type = 'text', placeholder, value, onChange, ...props }) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value || ''} 
    onChange={onChange}
    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
    {...props} 
  />
);

const Select = ({ value, onChange, children, ...props }) => (
  <select value={value || ''} onChange={onChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" {...props}>
    {children}
  </select>
);

const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = variant === 'secondary' 
    ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500' 
    : 'text-white bg-blue-600 border border-transparent hover:bg-blue-700 focus:ring-blue-500';
  const sizeClasses = size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
  
  return (
    <button className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2" />{title}
    </h3>
    {children}
  </div>
);

// Credit Card Type Detection
const detectCardType = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6(?:011|5)/.test(number)) return 'Discover';
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(number)) return 'JCB';
  
  return '';
};

// Format card number with spaces
const formatCardNumber = (value) => {
  const number = value.replace(/\s/g, '');
  const match = number.match(/\d{1,4}/g);
  return match ? match.join(' ') : '';
};

// Mask card number for display (ya no se usa pero mantengo por si acaso)
const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const number = cardNumber.replace(/\s/g, '');
  if (number.length < 4) return cardNumber;
  const lastFour = number.slice(-4);
  const masked = '*'.repeat(Math.max(0, number.length - 4));
  return formatCardNumber(masked + lastFour);
};

// Add Credit Card Modal
const AddCreditCardModal = ({ isOpen, onClose, onAdd, contactId }) => {
  const [formData, setFormData] = useState({
    card_number: '',
    card_type: '',
    name_on_card: '',
    expiration_month: '',
    expiration_year: '',
    verification_code: '',
    email_address: '',
    consent_type: 'EXPLICIT_CONSENT',
    maestro_issue_number: '',
    maestro_start_date_month: '',
    maestro_start_date_year: '',
    address: {
      line1: '',
      line2: '',
      locality: '',
      region: '',
      postal_code: '',
      country_code: 'US'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        card_number: '',
        card_type: '',
        name_on_card: '',
        expiration_month: '',
        expiration_year: '',
        verification_code: '',
        email_address: '',
        consent_type: 'EXPLICIT_CONSENT',
        maestro_issue_number: '',
        maestro_start_date_month: '',
        maestro_start_date_year: '',
        address: {
          line1: '',
          line2: '',
          locality: '',
          region: '',
          postal_code: '',
          country_code: 'US'
        }
      });
      setError('');
    }
  }, [isOpen]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleCardNumberChange = (value) => {
    const formattedNumber = formatCardNumber(value);
    const detectedType = detectCardType(value);
    
    updateField('card_number', formattedNumber);
    updateField('card_type', detectedType);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Clean up card number (remove spaces for API)
    const cardData = {
      ...formData,
      card_number: formData.card_number.replace(/\s/g, '')
    };

    const result = await keapAPI.createCreditCard(contactId, cardData);
    
    // Verificar si la operación fue exitosa
    if (result.success === false) {
      // Manejar error de la API
      console.error('Error adding credit card:', result.error);
      
      let errorMessage = 'Failed to add credit card';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 400) {
        errorMessage = 'Invalid card information. Please check all fields and try again.';
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to add credit cards.';
      } else if (result.error?.status === 404) {
        errorMessage = 'Contact not found.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }
    
    // Éxito
    console.log('Credit card created successfully:', result);
    onAdd(); // Refresh the parent component
    onClose(); // Close modal
    setLoading(false);
  };

  if (!isOpen) return null;

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Add Credit Card</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Card Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={formData.card_number}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    maxLength={19}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Type
                  </label>
                  <Select 
                    value={formData.card_type} 
                    onChange={(e) => updateField('card_type', e.target.value)}
                  >
                    <option value="">Auto-detected</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="Discover">Discover</option>
                    <option value="JCB">JCB</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name on Card *
                </label>
                <Input
                  placeholder="John Doe"
                  value={formData.name_on_card}
                  onChange={(e) => updateField('name_on_card', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Month *
                  </label>
                  <Select 
                    value={formData.expiration_month} 
                    onChange={(e) => updateField('expiration_month', e.target.value)}
                    required
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Year *
                  </label>
                  <Select 
                    value={formData.expiration_year} 
                    onChange={(e) => updateField('expiration_year', e.target.value)}
                    required
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV *
                  </label>
                  <Input
                    placeholder="123"
                    value={formData.verification_code}
                    onChange={(e) => updateField('verification_code', e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Contact Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email_address}
                    onChange={(e) => updateField('email_address', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consent Type
                  </label>
                  <Select 
                    value={formData.consent_type} 
                    onChange={(e) => updateField('consent_type', e.target.value)}
                  >
                    <option value="EXPLICIT_CONSENT">Explicit Consent</option>
                    <option value="IMPLICIT_CONSENT">Implicit Consent</option>
                    <option value="RECURRING_CONSENT">Recurring Consent</option>
                    <option value="NO_CONSENT">No Consent</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Billing Address</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <Input
                    placeholder="123 Main St"
                    value={formData.address.line1}
                    onChange={(e) => updateAddressField('line1', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <Input
                    placeholder="Apt 4B"
                    value={formData.address.line2}
                    onChange={(e) => updateAddressField('line2', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    placeholder="New York"
                    value={formData.address.locality}
                    onChange={(e) => updateAddressField('locality', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    placeholder="NY"
                    value={formData.address.region}
                    onChange={(e) => updateAddressField('region', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <Input
                    placeholder="10001"
                    value={formData.address.postal_code}
                    onChange={(e) => updateAddressField('postal_code', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  placeholder="US"
                  value={formData.address.country_code}
                  onChange={(e) => updateAddressField('country_code', e.target.value)}
                />
              </div>
            </div>

            {/* Maestro Fields (conditional) */}
            {formData.card_type === 'Maestro' && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Maestro Information</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Number
                    </label>
                    <Input
                      placeholder="01"
                      value={formData.maestro_issue_number}
                      onChange={(e) => updateField('maestro_issue_number', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Month
                    </label>
                    <Select 
                      value={formData.maestro_start_date_month} 
                      onChange={(e) => updateField('maestro_start_date_month', e.target.value)}
                    >
                      <option value="">Month</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Year
                    </label>
                    <Select 
                      value={formData.maestro_start_date_year} 
                      onChange={(e) => updateField('maestro_start_date_year', e.target.value)}
                    >
                      <option value="">Year</option>
                      {years.map(year => (
                        <option key={year} value={year.toString()}>{year}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 justify-end pt-6 border-t">
              <Button 
                type="button"
                variant="secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Card
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};



export function CreditCardSection({ 
  contactId
}) {
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCreditCards = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const result = await keapAPI.getCreditCardsByContactId(contactId);
    
    // Verificar si la operación fue exitosa
    if (result.success === false) {
      console.error('Error loading credit cards:', result.error);
      
      let errorMessage = 'Failed to load credit cards';
      
      if (result.error?.message) {
        errorMessage = result.error.message;
      } else if (result.error?.status === 404) {
        // Si es 404, probablemente no hay tarjetas, no mostrar error
        setCreditCards([]);
        setLoading(false);
        return;
      } else if (result.error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (result.error?.status === 403) {
        errorMessage = 'Permission denied. You may not have access to view credit cards.';
      } else if (result.error?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      setCreditCards([]);
      setLoading(false);
      return;
    }
    
    // Éxito
    setCreditCards(result || []);
    setLoading(false);
  }, [contactId]);

  useEffect(() => {
    if (contactId) {
      fetchCreditCards();
    }
  }, [contactId, fetchCreditCards]);

  const handleAddCard = () => {
    fetchCreditCards(); // Refresh the list
    setShowAddModal(false);
  };

  const getCardTypeColor = (cardType) => {
    const colors = {
      'Visa': 'bg-blue-100 text-blue-800',
      'Mastercard': 'bg-red-100 text-red-800',
      'American Express': 'bg-green-100 text-green-800',
      'Discover': 'bg-orange-100 text-orange-800',
      'JCB': 'bg-purple-100 text-purple-800'
    };
    return colors[cardType] || 'bg-gray-100 text-gray-800';
  };

  const getValidationStatusColor = (status) => {
    const colors = {
      'Good': 'bg-green-100 text-green-800',
      'Valid': 'bg-green-100 text-green-800',
      'Invalid': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Expired': 'bg-gray-100 text-gray-800',
      'Failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Section icon={CreditCard} title="Credit Cards">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading credit cards...</span>
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section icon={CreditCard} title="Credit Cards">
        {/* Header with actions */}
        <div className="flex justify-end items-center mb-4">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Credit Card
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Credit Cards List */}
        <div className="space-y-3">
          {creditCards.map((card, index) => (
            <div key={card.id || index} className="flex items-center p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-4 flex-1">
                <CreditCard className="h-8 w-8 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-sm">
                      {card.card_number}
                    </span>
                    {card.card_type && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCardTypeColor(card.card_type)}`}>
                        {card.card_type}
                      </span>
                    )}
                    {card.validation_status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getValidationStatusColor(card.validation_status)}`}>
                        {card.validation_status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {card.name_on_card && <span>{card.name_on_card}</span>}
                    {card.expiration_month && card.expiration_year && (
                      <span>• Expires {card.expiration_month}/{card.expiration_year}</span>
                    )}
                    {card.email_address && (
                      <span>• {card.email_address}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {creditCards.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">No credit cards on file</p>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Credit Card
              </Button>
            </div>
          )}
        </div>
      </Section>

      {/* Add Credit Card Modal */}
      <AddCreditCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCard}
        contactId={contactId}
      />
    </>
  );
}