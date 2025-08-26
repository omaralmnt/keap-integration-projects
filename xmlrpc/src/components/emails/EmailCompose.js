import { useState } from 'react';
import { Button } from '../ui/Button';
import keapAPI from '../../services/keapAPI';
import { Mail, Send, ArrowLeft, Eye, FileText, BookImage, Plus, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
// Import subcomponents (these should be separate files in your project)
import SendEmailTab from './SendEmailTab';
import CreateRecordTab from './CreateRecordTab';
import CreateTemplateTab from './CreateTemplateTab'; // Updated to support both create and update
import SendTemplateTab from './SendTemplateTab';

// Shared Components
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

const Textarea = ({ 
  placeholder, 
  value, 
  onChange, 
  className = '',
  rows = 4,
  ...props 
}) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-vertical ${className}`}
      {...props}
    />
  );
};

const Select = ({ value, onChange, children, className = '', ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      active
        ? 'bg-blue-50 text-blue-700 border-blue-500'
        : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
  </button>
);

// Preview Modal Component
const PreviewModal = ({ isOpen, onClose, data, type }) => {
  const [activeTab, setActiveTab] = useState('preview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Preview - {type}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">×</button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="border-b">
            <nav className="flex space-x-8 px-4">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'preview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('json')}
                className={`py-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === 'json' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                }`}
              >
                JSON Payload
              </button>
            </nav>
          </div>

          {activeTab === 'preview' && (
            <div className="p-4">
              {type === 'Send Email' && (
                <div className="space-y-4">
                  <div><strong>Subject:</strong> {data.subject}</div>
                  <div><strong>User ID:</strong> {data.user_id}</div>
                  <div><strong>Contacts:</strong> {data.contacts?.join(', ')}</div>
                  <div><strong>Address Field:</strong> {data.address_field || 'Default'}</div>
                  {data.attachments?.length > 0 && (
                    <div><strong>Attachments:</strong> {data.attachments.length} file(s)</div>
                  )}
                  {data.html_content && (
                    <div className="border rounded">
                      <iframe
                        srcDoc={atob(data.html_content)}
                        className="w-full h-64"
                        title="HTML Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  )}
                </div>
              )}
              {type === 'Create Record' && (
                <div className="space-y-2 text-sm">
                  <div><strong>To:</strong> {data.sent_to_address}</div>
                  <div><strong>From:</strong> {data.sent_from_address}</div>
                  <div><strong>Subject:</strong> {data.subject}</div>
                  <div><strong>Provider:</strong> {data.original_provider}</div>
                </div>
              )}
              {(type === 'Create Template' || type === 'Update Template') && (
                <div className="space-y-2 text-sm">
                  {type === 'Update Template' && (
                    <div><strong>Template ID:</strong> {data.templateId}</div>
                  )}
                  <div><strong>Title:</strong> {data.title}</div>
                  <div><strong>Categories:</strong> {data.categories}</div>
                  <div><strong>From:</strong> {data.fromAddress}</div>
                  <div><strong>To:</strong> {data.toAddress}</div>
                  <div><strong>Subject:</strong> {data.subject}</div>
                  <div><strong>Content Type:</strong> {data.contentType}</div>
                  <div><strong>Merge Context:</strong> {data.mergeContext}</div>
                  {data.htmlBody && (
                    <div className="mt-4">
                      <strong>HTML Body Preview:</strong>
                      <div className="border rounded mt-2">
                        <iframe
                          srcDoc={data.htmlBody}
                          className="w-full h-32"
                          title="HTML Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </div>
                  )}
                  {data.textBody && (
                    <div className="mt-4">
                      <strong>Text Body:</strong>
                      <div className="bg-gray-50 p-2 rounded text-xs mt-1 max-h-24 overflow-y-auto">
                        {data.textBody}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {type === 'Send from Template' && (
                <div className="space-y-2 text-sm">
                  <div><strong>Template ID:</strong> {data.templateId}</div>
                  <div><strong>Template Name:</strong> {data.selectedTemplate?.pieceTitle}</div>
                  <div><strong>Subject:</strong> {data.selectedTemplate?.subject}</div>
                  <div><strong>Recipients:</strong> {data.contactList?.length} contact{data.contactList?.length !== 1 ? 's' : ''}</div>
                  <div><strong>Contact IDs:</strong> {data.contactList?.join(', ')}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="p-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export shared components and utilities
export { Input, Textarea, Select };

// Main EmailCompose Component
export function EmailCompose({ onBack, keapApi }) {
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Tab data states - passed to subcomponents
  const [sendEmailData, setSendEmailData] = useState({
    subject: '',
    html_content: '',
    plain_content: '',
    user_id: '',
    contacts: '',
    address_field: '',
    attachments: []
  });

  const [recordData, setRecordData] = useState({
    sent_to_address: '',
    subject: '',
    sent_from_address: '',
    sent_from_reply_address: '',
    sent_to_cc_addresses: '',
    sent_to_bcc_addresses: '',
    html_content: '',
    plain_content: '',
    original_provider: 'UNKNOWN',
    original_provider_id: '',
    provider_source_id: '',
    contact_id: '',
    headers: '',
    sent_date: new Date().toISOString(),
    received_date: '',
    opened_date: '',
    clicked_date: ''
  });

  const [templateData, setTemplateData] = useState({
    templateId: '', // Added for update mode
    title: '',
    categories: '',
    fromAddress: '',
    toAddress: '~Contact.Email~',
    ccAddresses: '',
    bccAddresses: '',
    subject: '',
    textBody: '',
    htmlBody: '',
    contentType: 'HTML',
    mergeContext: 'Contact'
  });

  const [sendTemplateData, setSendTemplateData] = useState({
    templateId: '',
    contactList: [],
    selectedTemplate: null
  });

  // Helper Functions
  const encodeToBase64 = (content) => {
    try {
      return btoa(content);
    } catch (error) {
      console.error('Error encoding to Base64:', error);
      return content;
    }
  };

  const formatDateForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return undefined;
    return dateTimeLocal.includes('T') ? dateTimeLocal + ':00.000Z' : dateTimeLocal;
  };

  // Preview Functions
  const handlePreview = () => {
    setShowPreview(true);
  };

  const getPreviewData = () => {
    switch (activeTab) {
      case 'send':
        return {
          ...sendEmailData,
          html_content: sendEmailData.html_content ? encodeToBase64(sendEmailData.html_content) : '',
          plain_content: sendEmailData.plain_content ? encodeToBase64(sendEmailData.plain_content) : '',
          contacts: sendEmailData.contacts.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)),
          user_id: parseInt(sendEmailData.user_id) || undefined
        };
      case 'record':
        return {
          ...recordData,
          html_content: recordData.html_content ? encodeToBase64(recordData.html_content) : '',
          plain_content: recordData.plain_content ? encodeToBase64(recordData.plain_content) : '',
          contact_id: recordData.contact_id ? parseInt(recordData.contact_id) : undefined
        };
      case 'create-template':
        return templateData;
      case 'update-template':
        return templateData;
      case 'send-template':
        return {
          ...sendTemplateData,
          contactList: Array.isArray(sendTemplateData.contactList) ? sendTemplateData.contactList : 
                       sendTemplateData.contactList.toString().split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        };
      default:
        return {};
    }
  };

  const getPreviewType = () => {
    switch (activeTab) {
      case 'send': return 'Send Email';
      case 'record': return 'Create Record';
      case 'create-template': return 'Create Template';
      case 'update-template': return 'Update Template';
      case 'send-template': return 'Send from Template';
      default: return '';
    }
  };

  // Submit Functions
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let result;
      
      switch (activeTab) {
        case 'send':
          const sendData = getPreviewData();
          if (!sendData.subject || !sendData.contacts.length) {
            toast.error('Subject, User ID, and Contacts are required for sending email');
            return;
          }
          result = await keapAPI.sendEmail(sendData);
          console.log(result);
          toast.success('Email sent successfully');
          break;
          
        case 'record':
          const recordDataForAPI = getPreviewData();
          if (!recordDataForAPI.sent_to_address) {
            toast.error('To address is required');
            return;
          }
          result = await keapAPI.emailCreateEmailRecord(recordData.contact_id, recordDataForAPI);
          toast.success('Email record created successfully!');
          break;

        case 'create-template':
          const createTemplateDataForAPI = getPreviewData();
          if (!createTemplateDataForAPI.title || !createTemplateDataForAPI.subject) {
            toast.error('Title and Subject are required for creating template');
            return;
          }
          result = await keapAPI.createEmailTemplate(createTemplateDataForAPI);
          toast.success(`Template created successfully! Template ID: ${result}`);
          break;

        case 'update-template':
          const updateTemplateDataForAPI = getPreviewData();
          if (!updateTemplateDataForAPI.templateId || !updateTemplateDataForAPI.title || !updateTemplateDataForAPI.subject) {
            toast.error('Template ID, Title, and Subject are required for updating template');
            return;
          }
          result = await keapAPI.updateEmailTemplate(updateTemplateDataForAPI);
          toast.success(`Template updated successfully! Template ID: ${result}`);
          break;

        case 'send-template':
          const sendTemplateDataForAPI = getPreviewData();
          if (!sendTemplateDataForAPI.templateId || !sendTemplateDataForAPI.contactList.length) {
            toast.error('Template ID and Contacts are required for sending template');
            return;
          }
          result = await keapAPI.sendEmailTemplate(sendTemplateDataForAPI.contactList, sendTemplateDataForAPI.templateId);
          toast.success('Template email sent successfully!');
          break;
          
        default: 
          break;
      }
      
      if (onBack) {
        onBack();
      }
      
    } catch (error) {
      console.error('Error:', error);
      const actionMap = {
        'send': 'send email',
        'record': 'create record',
        'create-template': 'create template',
        'update-template': 'update template',
        'send-template': 'send template'
      };
      toast.error(`Failed to ${actionMap[activeTab] || 'perform action'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'send', label: 'Send Email', icon: Send },
    { id: 'record', label: 'Create Record', icon: Mail },
    { id: 'create-template', label: 'Create Template', icon: Plus },
    { id: 'update-template', label: 'Update Template', icon: Edit },
    { id: 'send-template', label: 'Send Template', icon: BookImage },
  ];

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'send':
        return (
          <SendEmailTab 
            data={sendEmailData}
            onChange={setSendEmailData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
        
      case 'record':
        return (
          <CreateRecordTab 
            data={recordData}
            onChange={setRecordData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );

      case 'create-template':
        return (
          <CreateTemplateTab 
            data={templateData}
            onChange={setTemplateData}
            onSubmit={handleSubmit}
            loading={loading}
            mode="create"
          />
        );

      case 'update-template':
        return (
          <CreateTemplateTab 
            data={templateData}
            onChange={setTemplateData}
            onSubmit={handleSubmit}
            loading={loading}
            mode="update"
          />
        );

      case 'send-template':
        return (
          <SendTemplateTab 
            data={sendTemplateData}
            onChange={setSendTemplateData}
            onSubmit={handleSubmit}
            loading={loading}
            keapApi={keapApi}
          />
        );
        
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-4">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
              >
                {tab.label}
              </TabButton>
            ))}
          </nav>
        </div>

        {/* Tab Content - Rendered by subcomponents */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        data={getPreviewData()}
        type={getPreviewType()}
      />
    </div>
  );
}