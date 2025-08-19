// components/layout/Header.js
import { Button } from '../ui/Button';

export function Header({ onLogout }) {
  // Obtener info de tokens del localStorage
  const getConnectionInfo = () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('keap_tokens') || '{}');
      if (tokens.scope) {
        const subdomain = tokens.scope.split('|')[1];
        return `Connected • ${subdomain}`;
      }
      return 'Not Connected';
    } catch {
      return 'Not Connected';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y titulo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Keap Integration (XML-RPC)</h1>
          </div>
          
          {/* Info de conexión y logout */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {getConnectionInfo()}
            </span>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={onLogout}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}