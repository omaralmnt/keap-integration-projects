import { useState } from 'react';
import { Button } from '../ui/Button';
import { Plus, Eye, Code, Type, Mail, Settings, Edit } from 'lucide-react';
import { Input, Textarea, Select } from './EmailCompose';

// Content Type Info Component
const ContentTypeInfo = ({ contentType }) => {
  const info = {
    HTML: {
      description: "HTML only - Rich formatting with images, links, and styling",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    Text: {
      description: "Plain text only - No formatting, compatible with all email clients",
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    Multipart: {
      description: "Both HTML and text versions - Best compatibility and fallback support",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  };

  const current = info[contentType] || info.HTML;

  return (
    <div className={`p-3 rounded-lg border ${current.bgColor}`}>
      <div className={`text-sm font-medium ${current.color}`}>
        {contentType} Format
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {current.description}
      </div>
    </div>
  );
};

// Merge Context Info Component  
const MergeContextInfo = ({ mergeContext }) => {
  const contexts = {
    Contact: {
      description: "Use contact merge fields like ~Contact.FirstName~, ~Contact.Email~",
      examples: ["~Contact.FirstName~", "~Contact.LastName~", "~Contact.Email~", "~Contact.Phone1~"],
      color: "text-blue-600"
    },
    Opportunity: {
      description: "Use opportunity merge fields for sales-related templates",
      examples: ["~Opportunity.OpportunityTitle~", "~Opportunity.OpportunityStage~", "~Opportunity.ProjectedCloseDate~"],
      color: "text-green-600"
    },
    Invoice: {
      description: "Use invoice merge fields for billing-related templates",
      examples: ["~Invoice.InvoiceTotal~", "~Invoice.DateCreated~", "~Invoice.PayStatus~"],
      color: "text-orange-600"
    },
    CreditCard: {
      description: "Use credit card merge fields for payment-related templates",
      examples: ["~CreditCard.Last4~", "~CreditCard.ExpirationMonth~"],
      color: "text-red-600"
    }
  };

  const current = contexts[mergeContext] || contexts.Contact;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className={`text-sm font-medium ${current.color} mb-2`}>
        {mergeContext} Merge Fields
      </div>
      <div className="text-xs text-gray-600 mb-2">
        {current.description}
      </div>
      <div className="flex flex-wrap gap-1">
        {current.examples.map((example, index) => (
          <span
            key={index}
            className="inline-block bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono text-gray-700"
          >
            {example}
          </span>
        ))}
      </div>
    </div>
  );
};

// Template Preview Component
const TemplatePreview = ({ data }) => {
  const [previewType, setPreviewType] = useState('rendered');

  if (!data.subject && !data.htmlBody && !data.textBody) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Mail className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500 text-sm">Fill in template details to see preview</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Template Preview
          </h3>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => setPreviewType('rendered')}
              className={`px-3 py-1 text-xs rounded ${
                previewType === 'rendered'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Rendered
            </button>
            <button
              type="button"
              onClick={() => setPreviewType('source')}
              className={`px-3 py-1 text-xs rounded ${
                previewType === 'source'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Source
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Email Headers Preview */}
        <div className="space-y-2 text-xs border-b border-gray-200 pb-3 mb-4">
          <div className="flex">
            <span className="font-medium text-gray-600 w-16">From:</span>
            <span className="text-gray-900">{data.fromAddress || 'from@example.com'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-gray-600 w-16">To:</span>
            <span className="text-gray-900">{data.toAddress || '~Contact.Email~'}</span>
          </div>
          {data.ccAddresses && (
            <div className="flex">
              <span className="font-medium text-gray-600 w-16">CC:</span>
              <span className="text-gray-900">{data.ccAddresses}</span>
            </div>
          )}
          {data.bccAddresses && (
            <div className="flex">
              <span className="font-medium text-gray-600 w-16">BCC:</span>
              <span className="text-gray-900">{data.bccAddresses}</span>
            </div>
          )}
          <div className="flex">
            <span className="font-medium text-gray-600 w-16">Subject:</span>
            <span className="text-gray-900">{data.subject || 'Email Subject'}</span>
          </div>
        </div>

        {/* Content Preview */}
        {previewType === 'rendered' ? (
          <div className="space-y-4">
            {data.contentType === 'HTML' || data.contentType === 'Multipart' ? (
              data.htmlBody ? (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                    <Code className="h-3 w-3 mr-1" />
                    HTML Content
                  </div>
                  <div className="border border-gray-300 rounded bg-white">
                    <iframe
                      srcDoc={data.htmlBody}
                      className="w-full h-64"
                      title="HTML Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Code className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">No HTML content yet</p>
                </div>
              )
            ) : null}

            {(data.contentType === 'Text' || data.contentType === 'Multipart') && data.textBody && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                  <Type className="h-3 w-3 mr-1" />
                  Text Content
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded p-3 text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {data.textBody}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Source view
          <div className="space-y-4">
            {data.htmlBody && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">HTML Source</div>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {data.htmlBody}
                </div>
              </div>
            )}
            {data.textBody && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">Text Source</div>
                <div className="bg-gray-50 border border-gray-300 rounded p-3 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {data.textBody}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main CreateTemplateTab Component
export default function CreateTemplateTab({ data, onChange, onSubmit, loading, mode = 'create' }) {
  const isUpdateMode = mode === 'update';

  // Handle input changes
  const handleInputChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Form validation
  const isFormValid = () => {
    const basicValidation = (
      data.title?.trim() &&
      data.subject?.trim() &&
      data.fromAddress?.trim() &&
      data.toAddress?.trim() &&
      (data.htmlBody?.trim() || data.textBody?.trim())
    );

    // For update mode, also require templateId
    if (isUpdateMode) {
      return basicValidation && data.templateId?.trim();
    }

    return basicValidation;
  };

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          Template Information
        </h3>
        
        {/* Template ID field for update mode */}
        {isUpdateMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-blue-900 mb-1">
              Template ID *
            </label>
            <Input
              placeholder="Enter template ID to update"
              value={data.templateId}
              onChange={(e) => handleInputChange('templateId', e.target.value)}
              required
              className="bg-white"
            />
            <p className="text-xs text-blue-700 mt-1">
              The ID of the template you want to update
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Title *
            </label>
            <Input
              placeholder="Enter template title"
              value={data.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <Input
              placeholder="e.g., Marketing, Sales, Support"
              value={data.categories}
              onChange={(e) => handleInputChange('categories', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type *
            </label>
            <Select
              value={data.contentType}
              onChange={(e) => handleInputChange('contentType', e.target.value)}
            >
              <option value="HTML">HTML</option>
              <option value="Text">Text</option>
              <option value="Multipart">Multipart</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merge Context *
            </label>
            <Select
              value={data.mergeContext}
              onChange={(e) => handleInputChange('mergeContext', e.target.value)}
            >
              <option value="Contact">Contact</option>
              <option value="Opportunity">Opportunity</option>
              <option value="Invoice">Invoice</option>
              <option value="CreditCard">CreditCard</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ContentTypeInfo contentType={data.contentType} />
          <MergeContextInfo mergeContext={data.mergeContext} />
        </div>
      </div>

      {/* Email Headers */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-blue-600" />
          Email Headers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Address *
            </label>
            <Input
              type="email"
              placeholder="from@yourcompany.com"
              value={data.fromAddress}
              onChange={(e) => handleInputChange('fromAddress', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Address *
            </label>
            <Input
              placeholder="~Contact.Email~"
              value={data.toAddress}
              onChange={(e) => handleInputChange('toAddress', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CC Addresses
            </label>
            <Input
              placeholder="cc@yourcompany.com, another@yourcompany.com"
              value={data.ccAddresses}
              onChange={(e) => handleInputChange('ccAddresses', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BCC Addresses
            </label>
            <Input
              placeholder="bcc@yourcompany.com"
              value={data.bccAddresses}
              onChange={(e) => handleInputChange('bccAddresses', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject Line *
          </label>
          <Input
            placeholder="Welcome to our service, ~Contact.FirstName~!"
            value={data.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Email Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Type className="h-5 w-5 mr-2 text-blue-600" />
          Email Content
        </h3>

        {(data.contentType === 'HTML' || data.contentType === 'Multipart') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTML Body {data.contentType === 'HTML' ? '*' : ''}
            </label>
            <Textarea
              placeholder="<h1>Hello ~Contact.FirstName~!</h1><p>Welcome to our service...</p>"
              value={data.htmlBody}
              onChange={(e) => handleInputChange('htmlBody', e.target.value)}
              rows={8}
              className="font-mono text-sm"
              required={data.contentType === 'HTML'}
            />
          </div>
        )}

        {(data.contentType === 'Text' || data.contentType === 'Multipart') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Body {data.contentType === 'Text' ? '*' : ''}
            </label>
            <Textarea
              placeholder="Hello ~Contact.FirstName~!&#10;&#10;Welcome to our service..."
              value={data.textBody}
              onChange={(e) => handleInputChange('textBody', e.target.value)}
              rows={6}
              required={data.contentType === 'Text'}
            />
          </div>
        )}
      </div>

      {/* Template Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Preview</h3>
        <TemplatePreview data={data} />
      </div>

      {/* API Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">API Call Preview</h3>
        <div className="text-xs text-blue-800 font-mono bg-white p-2 rounded border overflow-x-auto">
          {isUpdateMode ? (
            <>
              APIEmailService.updateEmailTemplate(
              <br />
              &nbsp;&nbsp;privateKey,
              <br />
              &nbsp;&nbsp;"{data.templateId || 'templateId'}",
              <br />
              &nbsp;&nbsp;"{data.title || 'templateName'}",
              <br />
              &nbsp;&nbsp;"{data.categories || 'categories'}",
              <br />
              &nbsp;&nbsp;"{data.fromAddress || 'fromAddress'}",
              <br />
              &nbsp;&nbsp;"{data.toAddress || 'toAddress'}",
              <br />
              &nbsp;&nbsp;"{data.ccAddresses || 'ccAddresses'}",
              <br />
              &nbsp;&nbsp;"{data.bccAddresses || 'bccAddresses'}",
              <br />
              &nbsp;&nbsp;"{data.subject || 'subject'}",
              <br />
              &nbsp;&nbsp;"{data.textBody ? 'textBody...' : 'textBody'}",
              <br />
              &nbsp;&nbsp;"{data.htmlBody ? 'htmlBody...' : 'htmlBody'}",
              <br />
              &nbsp;&nbsp;"{data.contentType}",
              <br />
              &nbsp;&nbsp;"{data.mergeContext}"
              <br />
              )
            </>
          ) : (
            <>
              APIEmailService.addEmailTemplate(
              <br />
              &nbsp;&nbsp;privateKey,
              <br />
              &nbsp;&nbsp;"{data.title || 'title'}",
              <br />
              &nbsp;&nbsp;"{data.categories || 'categories'}",
              <br />
              &nbsp;&nbsp;"{data.fromAddress || 'fromAddress'}",
              <br />
              &nbsp;&nbsp;"{data.toAddress || 'toAddress'}",
              <br />
              &nbsp;&nbsp;"{data.ccAddresses || 'ccAddresses'}",
              <br />
              &nbsp;&nbsp;"{data.bccAddresses || 'bccAddresses'}",
              <br />
              &nbsp;&nbsp;"{data.subject || 'subject'}",
              <br />
              &nbsp;&nbsp;"{data.textBody ? 'textBody...' : 'textBody'}",
              <br />
              &nbsp;&nbsp;"{data.htmlBody ? 'htmlBody...' : 'htmlBody'}",
              <br />
              &nbsp;&nbsp;"{data.contentType}",
              <br />
              &nbsp;&nbsp;"{data.mergeContext}"
              <br />
              )
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={loading || !isFormValid()}
          className={`${
            isUpdateMode 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white disabled:opacity-50`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{isUpdateMode ? 'Updating...' : 'Creating...'}</span>
            </div>
          ) : (
            <>
              {isUpdateMode ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Template
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Form validation message */}
      {!isFormValid() && (
        <div className="text-sm text-gray-600 text-center space-y-1">
          <div>Please ensure all required fields are filled:</div>
          <ul className="text-xs text-left inline-block">
            {isUpdateMode && !data.templateId?.trim() && <li>• Template ID</li>}
            {!data.title?.trim() && <li>• Template title</li>}
            {!data.subject?.trim() && <li>• Subject line</li>}
            {!data.fromAddress?.trim() && <li>• From address</li>}
            {!data.toAddress?.trim() && <li>• To address</li>}
            {!data.htmlBody?.trim() && !data.textBody?.trim() && <li>• Email content (HTML or text)</li>}
          </ul>
        </div>
      )}
    </form>
  );
}