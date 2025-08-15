import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { ModuleCard } from '../ui/ModuleCard';
import keapAPI from '../../services/keapAPI';
import { EditAccountModal } from './EditAccountModal';


// ===== COMPONENTES HELPER =====
const InfoCard = ({ label, value, isLink = false, colSpan = "" }) => (
  <div className={`bg-gray-50 p-4 rounded-lg ${colSpan}`}>
    <p className="text-sm text-gray-600 font-medium">{label}</p>
    <p className="text-gray-900">
      {isLink && value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {value}
        </a>
      ) : (
        value || 'N/A'
      )}
    </p>
  </div>
);

const AccountHeader = ({ accountInfo }) => (
  <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
    {accountInfo.logo_url && (
      <img 
        src={accountInfo.logo_url} 
        alt="Business Logo" 
        className="w-16 h-16 rounded-lg object-cover border"
      />
    )}
    <div>
      <h3 className="text-xl font-semibold text-gray-900">{accountInfo.name}</h3>
      <p className="text-gray-600">{accountInfo.email}</p>
      <p className="text-sm text-gray-500">
        {accountInfo.time_zone} • {accountInfo.currency_code}
      </p>
    </div>
  </div>
);

const AccountInfoGrid = ({ accountInfo }) => {
  const formatPhone = (phone, ext) => {
    if (!phone) return null;
    return `${phone}${ext ? ` ext. ${ext}` : ''}`;
  };



 

  const fields = [
    { label: 'Business Name', value: accountInfo.name },
    { label: 'Email', value: accountInfo.email },
    { label: 'Phone', value: formatPhone(accountInfo.phone, accountInfo.phone_ext) },
    { label: 'Website', value: accountInfo.website, isLink: true },
    { label: 'Time Zone', value: accountInfo.time_zone },
    { label: 'Currency', value: accountInfo.currency_code },
    { label: 'Language', value: accountInfo.language_tag },
    { label: 'Business Type', value: accountInfo.business_type }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map((field, index) => (
        <InfoCard 
          key={index}
          label={field.label}
          value={field.value}
          isLink={field.isLink}
        />
      ))}
    </div>
  );
};

const AccountAddress = ({ address }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-600 font-medium">Address</p>
    <div className="text-gray-900 text-sm">
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>{address.locality}, {address.region} {address.postal_code}</p>
      <p>{address.country_code}</p>
    </div>
  </div>
);

const AccountBadges = ({ title, items, color = "blue" }) => (
  <div className={`bg-${color}-50 p-4 rounded-lg`}>
    <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span 
          key={index}
          className={`px-3 py-1 bg-${color}-100 text-${color}-800 text-sm rounded-full`}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const ColorPreview = ({ label, color }) => (
  <div className="flex items-center space-x-2">
    <div 
      className="w-6 h-6 rounded border"
      style={{ backgroundColor: color }}
    />
    <span className="text-sm text-gray-600">{label}: {color}</span>
  </div>
);

const BrandColors = ({ accountInfo }) => {
  const colors = [
    { label: 'Primary', color: accountInfo.business_primary_color },
    { label: 'Secondary', color: accountInfo.business_secondary_color }
  ].filter(item => item.color);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-600 font-medium mb-3">Brand Colors</p>
      <div className="flex space-x-4">
        {colors.map((colorItem, index) => (
          <ColorPreview 
            key={index}
            label={colorItem.label}
            color={colorItem.color}
          />
        ))}
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
function Dashboard() {
  const navigate = useNavigate();
  
  // Estados para UI
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);    
  const [accountInfo, setAccountInfo] = useState(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  useEffect(() => {
    // Cargar tokens del localStorage
    const savedTokens = localStorage.getItem('keap_tokens');
    if (!savedTokens) {
      navigate('/');
    }
  }, [navigate]);


  const handleSaveAccount = async (formData) => {//SAVE ACCT CHANGES------------------
  setIsSaving(true);
  try {

    console.log('saving',formData)

    const response = await keapAPI.updateAccountProfile(formData)
    console.log('saved')
    console.log(response)
  } catch (error) {
    console.error('Error:', error);
  }
  setIsSaving(false);
  };

  const handleGetAccountInfo = async () => {
    setIsLoadingAccount(true);
    try {
      const accountProfile = await keapAPI.getAccountProfile();
      console.log('✅ Account profile:', accountProfile);
      setAccountInfo(accountProfile);
    } catch (error) {
      console.error('❌ Error:', error);
    }
    setIsLoadingAccount(false);
  };

  // Función para navegar a secciones específicas
  const navigateToSection = (section) => {
    navigate(`/${section}`);
  };

  // Módulos de Keap con sus iconos
  const keapModules = [
    //     {
    //   id: 'affiliates',
    //   title: 'Affiliates',
    //   description: 'Manage your affiliates.',
    //   color: 'blue',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    //     </svg>
    //   )
    // },
    {
      id: 'contacts',
      title: 'Contacts',
      description: 'Manage your contacts, create new ones, and organize your customer database.',
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'companies',
      title: 'Companies',
      description: 'View and manage company information, relationships, and business details.',
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    // {
    //   id: 'opportunities',
    //   title: 'Opportunities',
    //   description: 'Track deals, sales pipeline, and revenue opportunities.',
    //   color: 'green',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    //     </svg>
    //   )
    // },
    // {
    //   id: 'products',
    //   title: 'Products',
    //   description: 'Manage your product catalog, pricing, and inventory.',
    //   color: 'orange',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    //     </svg>
    //   )
    // },

    // {
    //   id: 'campaigns',
    //   title: 'Campaigns',
    //   description: 'Create and manage marketing campaigns, automation sequences.',
    //   color: 'indigo',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    //     </svg>
    //   )
    // }
  ];


  return (
    <>
      {/* Account Info Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Account Information</CardTitle>
            <Button
              onClick={handleGetAccountInfo}
              loading={isLoadingAccount}
              size="sm"
            >
              Load Account Info
            </Button>

            
          </div>
        </CardHeader>
        <CardContent>
          {accountInfo ? (
            
            <div className="space-y-6">
            <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            disabled={!accountInfo}
            >
            Edit Account
            </Button>
              {/* Logo y info principal */}
              <AccountHeader accountInfo={accountInfo} />

              {/* Grid de información básica */}
              <AccountInfoGrid accountInfo={accountInfo} />

              {/* Dirección */}
              {accountInfo.address && <AccountAddress address={accountInfo.address} />}

              {/* Business Goals */}
              {accountInfo.business_goals?.length > 0 && (
                <AccountBadges 
                  title="Business Goals" 
                  items={accountInfo.business_goals}
                  color="blue"
                />
              )}

              {/* Brand Colors */}
              {(accountInfo.business_primary_color || accountInfo.business_secondary_color) && (
                <BrandColors accountInfo={accountInfo} />
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500 mb-2">Account information not loaded</p>
              <p className="text-sm text-gray-400">Click "Load Account Info" to fetch your account details</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keap Modules Navigation */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {keapModules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              color={module.color}
              icon={module.icon}
              onClick={() => navigateToSection(module.id)}
            />
          ))}
        </div>
      </div>

      
      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        accountInfo={accountInfo}
        onSave={handleSaveAccount}
        isLoading={isSaving}
        />
    </>
  );
}

export default Dashboard;