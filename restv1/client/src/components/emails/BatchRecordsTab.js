import { useState } from 'react';
import { Button } from '../ui/Button';
import { Plus, Trash2, Upload, Download } from 'lucide-react';
import { Input, Textarea, Select } from './EmailCompose';

// Email Record Component for Batch
const EmailRecordInput = ({ email, index, onChange, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-medium text-gray-700">Email Record {index + 1}</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Basic Fields - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To Address *</label>
          <Input
            type="email"
            placeholder="recipient@example.com"
            value={email.sent_to_address}
            onChange={(e) => onChange(index, 'sent_to_address', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <Input
            placeholder="Email subject"
            value={email.subject}
            onChange={(e) => onChange(index, 'subject', e.target.value)}
          />
        </div>
      </div>

      {/* Expanded Fields */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          {/* Email Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From Address</label>
              <Input
                type="email"
                placeholder="sender@example.com"
                value={email.sent_from_address}
                onChange={(e) => onChange(index, 'sent_from_address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reply To Address</label>
              <Input
                type="email"
                placeholder="reply@example.com"
                value={email.sent_from_reply_address}
                onChange={(e) => onChange(index, 'sent_from_reply_address', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CC Addresses</label>
              <Input
                placeholder="cc1@example.com, cc2@example.com"
                value={email.sent_to_cc_addresses}
                onChange={(e) => onChange(index, 'sent_to_cc_addresses', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">BCC Addresses</label>
              <Input
                placeholder="bcc1@example.com, bcc2@example.com"
                value={email.sent_to_bcc_addresses}
                onChange={(e) => onChange(index, 'sent_to_bcc_addresses', e.target.value)}
              />
            </div>
          </div>

          {/* Content Fields */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">HTML Content</label>
            <Textarea
              placeholder="<h1>Email HTML content...</h1>"
              value={email.html_content}
              onChange={(e) => onChange(index, 'html_content', e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Plain Text Content</label>
            <Textarea
              placeholder="Plain text content..."
              value={email.plain_content}
              onChange={(e) => onChange(index, 'plain_content', e.target.value)}
              rows={3}
            />
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact ID</label>
              <Input
                type="number"
                placeholder="12345"
                value={email.contact_id}
                onChange={(e) => onChange(index, 'contact_id', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
              <Select
                value={email.original_provider}
                onChange={(e) => onChange(index, 'original_provider', e.target.value)}
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="INFUSIONSOFT">INFUSIONSOFT</option>
                <option value="MICROSOFT">MICROSOFT</option>
                <option value="GOOGLE">GOOGLE</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider ID</label>
              <Input
                placeholder="provider-unique-id"
                value={email.original_provider_id}
                onChange={(e) => onChange(index, 'original_provider_id', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider Source ID</label>
              <Input
                placeholder="source@example.com"
                value={email.provider_source_id}
                onChange={(e) => onChange(index, 'provider_source_id', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sent Date</label>
              <Input
                type="datetime-local"
                value={email.sent_date ? email.sent_date.slice(0, 16) : ''}
                onChange={(e) => onChange(index, 'sent_date', e.target.value)}
              />
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Received Date</label>
              <Input
                type="datetime-local"
                value={email.received_date ? email.received_date.slice(0, 16) : ''}
                onChange={(e) => onChange(index, 'received_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Opened Date</label>
              <Input
                type="datetime-local"
                value={email.opened_date ? email.opened_date.slice(0, 16) : ''}
                onChange={(e) => onChange(index, 'opened_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Clicked Date</label>
              <Input
                type="datetime-local"
                value={email.clicked_date ? email.clicked_date.slice(0, 16) : ''}
                onChange={(e) => onChange(index, 'clicked_date', e.target.value)}
              />
            </div>
          </div>

          {/* Headers Field */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Headers</label>
            <Textarea
              placeholder="X-Custom-Header: value&#10;X-Another-Header: another-value"
              value={email.headers}
              onChange={(e) => onChange(index, 'headers', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function BatchRecordsTab({ data, onChange, onSubmit, loading }) {
  // Handle email changes
  const handleBatchEmailChange = (index, field, value) => {
    onChange(prev => ({
      ...prev,
      emails: prev.emails.map((email, idx) => 
        idx === index ? { ...email, [field]: value } : email
      )
    }));
  };

  const addBatchEmail = () => {
    onChange(prev => ({
      ...prev,
      emails: [...prev.emails, {
        sent_to_address: '',
        subject: '',
        sent_from_address: '',
        sent_from_reply_address: '',
        sent_to_cc_addresses: '',
        sent_to_bcc_addresses: '',
        html_content: '',
        plain_content: '',
        contact_id: '',
        original_provider: 'UNKNOWN',
        original_provider_id: '',
        provider_source_id: '',
        headers: '',
        sent_date: new Date().toISOString(),
        received_date: '',
        opened_date: '',
        clicked_date: ''
      }]
    }));
  };

  const removeBatchEmail = (index) => {
    if (data.emails.length > 1) {
      onChange(prev => ({
        ...prev,
        emails: prev.emails.filter((_, idx) => idx !== index)
      }));
    }
  };

  // Global content application functions
  const applyGlobalField = (fieldName, value) => {
    if (!value) return;
    
    onChange(prev => ({
      ...prev,
      emails: prev.emails.map(email => ({
        ...email,
        [fieldName]: value
      }))
    }));
  };

  const applyAllGlobalFields = () => {
    const {
      globalSubject,
      globalHtmlContent, 
      globalPlainContent,
      globalFromAddress,
      globalProvider
    } = data;

    onChange(prev => ({
      ...prev,
      emails: prev.emails.map(email => ({
        ...email,
        ...(globalSubject && { subject: globalSubject }),
        ...(globalHtmlContent && { html_content: globalHtmlContent }),
        ...(globalPlainContent && { plain_content: globalPlainContent }),
        ...(globalFromAddress && { sent_from_address: globalFromAddress }),
        ...(globalProvider && { original_provider: globalProvider })
      }))
    }));

    // Show confirmation
    alert(`Applied global settings to ${data.emails.length} email records!`);
  };

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Email Records ({data.emails.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          onClick={addBatchEmail}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Email Record
        </Button>
      </div>

      {/* Global Content Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-blue-900">Global Content Settings</h4>
          <div className="text-xs text-blue-700">Apply same content to all records</div>
        </div>

        <div className="space-y-4">
          {/* Global Subject */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-blue-800">Global Subject</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyGlobalField('subject', data.globalSubject)}
                disabled={!data.globalSubject}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
              >
                Apply to All
              </Button>
            </div>
            <Input
              placeholder="Subject for all emails"
              value={data.globalSubject || ''}
              onChange={(e) => onChange(prev => ({...prev, globalSubject: e.target.value}))}
            />
          </div>

          {/* Global HTML Content */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-blue-800">Global HTML Content</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyGlobalField('html_content', data.globalHtmlContent)}
                disabled={!data.globalHtmlContent}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
              >
                Apply to All
              </Button>
            </div>
            <Textarea
              placeholder="<h1>HTML content for all emails...</h1>"
              value={data.globalHtmlContent || ''}
              onChange={(e) => onChange(prev => ({...prev, globalHtmlContent: e.target.value}))}
              rows={4}
            />
          </div>

          {/* Global Plain Content */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-blue-800">Global Plain Text Content</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyGlobalField('plain_content', data.globalPlainContent)}
                disabled={!data.globalPlainContent}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
              >
                Apply to All
              </Button>
            </div>
            <Textarea
              placeholder="Plain text content for all emails..."
              value={data.globalPlainContent || ''}
              onChange={(e) => onChange(prev => ({...prev, globalPlainContent: e.target.value}))}
              rows={3}
            />
          </div>

          {/* Global From Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-blue-800">Global From Address</label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyGlobalField('sent_from_address', data.globalFromAddress)}
                  disabled={!data.globalFromAddress}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
                >
                  Apply
                </Button>
              </div>
              <Input
                type="email"
                placeholder="sender@example.com"
                value={data.globalFromAddress || ''}
                onChange={(e) => onChange(prev => ({...prev, globalFromAddress: e.target.value}))}
              />
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="block text-sm font-medium text-blue-800">Global Provider</label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => applyGlobalField('original_provider', data.globalProvider)}
                  disabled={!data.globalProvider}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
                >
                  Apply
                </Button>
              </div>
              <Select
                value={data.globalProvider || 'UNKNOWN'}
                onChange={(e) => onChange(prev => ({...prev, globalProvider: e.target.value}))}
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="INFUSIONSOFT">INFUSIONSOFT</option>
                <option value="MICROSOFT">MICROSOFT</option>
                <option value="GOOGLE">GOOGLE</option>
              </Select>
            </div>
          </div>

          {/* Apply All Button */}
          <div className="flex justify-center pt-2 border-t border-blue-200">
            <Button
              type="button"
              onClick={applyAllGlobalFields}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Apply All Global Settings to Records
            </Button>
          </div>
        </div>
      </div>

      {/* Individual Email Records */}
      <div className="space-y-4">
        {data.emails.map((email, index) => (
          <EmailRecordInput
            key={index}
            email={email}
            index={index}
            onChange={handleBatchEmailChange}
            onRemove={removeBatchEmail}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Create Batch Records
            </>
          )}
        </Button>
      </div>
    </form>
  );
}