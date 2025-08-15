import { 
  Building2, Calendar, FolderArchive, Users, ListTodo, 
  LocateFixed, Mail, Notebook, Package, RefreshCcw, 
  Settings, SquareStack, Store, Tag, User, 
  Wallet, ChevronDown, ChevronRight, Home, TrendingUp, 
  CreditCard, FileText, Share2,
  Webhook
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  // Grouped navigation items according to Keap API functionalities
  const navigationGroups = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      isStandalone: true
    },
    {
      name: 'Contacts & CRM',
      icon: <Users className="w-5 h-5" />,
      key: 'contacts',
      items: [
        {
          name: 'Contacts',
          href: '/contacts',
          icon: <Users className="w-4 h-4" />
        },
        {
          name: 'Companies',
          href: '/companies',
          icon: <Building2 className="w-4 h-4" />
        },
        {
          name: 'Opportunities',
          href: '/opportunities',
          icon: <LocateFixed className="w-4 h-4" />
        },
        {
          name: 'Notes',
          href: '/notes',
          icon: <Notebook className="w-4 h-4" />
        },
        {
          name: 'Tags',
          href: '/tags',
          icon: <Tag className="w-4 h-4" />
        }
      ]
    },
    {
      name: 'Sales & Orders',
      icon: <TrendingUp className="w-5 h-5" />,
      key: 'sales',
      items: [
        {
          name: 'Orders',
          href: '/orders',
          icon: <SquareStack className="w-4 h-4" />
        },
        {
          name: 'Products',
          href: '/products',
          icon: <Package className="w-4 h-4" />
        },
        {
          name: 'Subscriptions',
          href: '/subscriptions',
          icon: <RefreshCcw className="w-4 h-4" />
        },
        {
          name: 'Merchants',
          href: '/merchants',
          icon: <Wallet className="w-4 h-4" />
        }
      ]
    },
    {
      name: 'Marketing',
      icon: <Store className="w-5 h-5" />,
      key: 'marketing',
      items: [
        {
          name: 'Campaigns',
          href: '/campaigns',
          icon: <Store className="w-4 h-4" />
        },
        {
          name: 'Emails',
          href: '/emails',
          icon: <Mail className="w-4 h-4" />
        },
        {
          name: 'Affiliates',
          href: '/affiliates',
          icon: <Share2 className="w-4 h-4" />
        }
      ]
    },
    {
      name: 'Activities',
      icon: <Calendar className="w-5 h-5" />,
      key: 'activities',
      items: [
        {
          name: 'Appointments',
          href: '/appointments',
          icon: <Calendar className="w-4 h-4" />
        },
        {
          name: 'Tasks',
          href: '/tasks',
          icon: <ListTodo className="w-4 h-4" />
        }
      ]
    },
    {
      name: 'Administration',
      icon: <Settings className="w-5 h-5" />,
      key: 'admin',
      items: [
        {
          name: 'Users',
          href: '/users',
          icon: <User className="w-4 h-4" />
        },
        {
          name: 'Files',
          href: '/files',
          icon: <FolderArchive className="w-4 h-4" />
        },
        {
          name: 'RestHooks',
          href: '/hooks',
          icon: <Webhook className="w-4 h-4" />
        },
        {
          name: 'Settings',
          href: '/application/settings',
          icon: <Settings className="w-4 h-4" />
        }
      ]
    }
  ];

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  const isGroupActive = (items) => {
    return items?.some(item => isActiveRoute(item.href));
  };

  const renderMenuItem = (item, isSubItem = false) => (
    <Link
      key={item.name}
      to={item.href}
      className={`flex items-center px-3 py-2 mt-1 text-sm rounded-md transition-colors ${
        isSubItem ? 'ml-6' : ''
      } ${
        isActiveRoute(item.href)
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      title={isCollapsed ? item.name : ''}
    >
      <span className={`${isActiveRoute(item.href) ? 'text-blue-700' : 'text-gray-400'}`}>
        {item.icon}
      </span>
      {!isCollapsed && (
        <span className="ml-3 font-medium">{item.name}</span>
      )}
    </Link>
  );

  const renderGroupItem = (group) => {
    if (group.isStandalone) {
      return renderMenuItem(group);
    }

    const isOpen = openMenus[group.key];
    const hasActiveChild = isGroupActive(group.items);

    return (
      <div key={group.key}>
        <button
          onClick={() => !isCollapsed && toggleMenu(group.key)}
          className={`w-full flex items-center justify-between px-3 py-2 mt-1 text-sm rounded-md transition-colors ${
            hasActiveChild
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
          title={isCollapsed ? group.name : ''}
        >
          <div className="flex items-center">
            <span className={`${hasActiveChild ? 'text-blue-700' : 'text-gray-400'}`}>
              {group.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 font-medium">{group.name}</span>
            )}
          </div>
          {!isCollapsed && (
            <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </span>
          )}
        </button>
        
        {!isCollapsed && isOpen && (
          <div className="mt-1">
            {group.items.map(item => renderMenuItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">Keap CRM</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 pb-4">
        {navigationGroups.map(group => renderGroupItem(group))}
      </nav>
    </div>
  );
}