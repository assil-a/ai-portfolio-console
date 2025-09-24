import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  GitBranch, 
  Users, 
  GitPullRequest, 
  Activity, 
  Settings, 
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string | number;
}

interface SideNavProps {
  currentPath: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    path: '/',
  },
  {
    id: 'repositories',
    label: 'Repositories',
    icon: GitBranch,
    path: '/repositories',
  },
  {
    id: 'contributors',
    label: 'Contributors',
    icon: Users,
    path: '/contributors',
  },
  {
    id: 'pull-requests',
    label: 'Pull Requests',
    icon: GitPullRequest,
    path: '/pull-requests',
    badge: '12',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    path: '/activity',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    path: '/help',
  },
];

const SideNav: React.FC<SideNavProps> = ({ 
  currentPath, 
  collapsed = false, 
  onNavigate 
}) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <nav className="h-full py-6" role="navigation" aria-label="Primary">
      <div className="px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive 
                      ? 'bg-accent text-accent-fg shadow-sm' 
                      : 'text-text-secondary hover:bg-nav-item-hover hover:text-text-primary'
                    }
                    ${collapsed ? 'justify-center' : 'justify-between'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  
                  {!collapsed && (
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${isActive 
                            ? 'bg-accent-fg/20 text-accent-fg' 
                            : 'bg-accent text-accent-fg'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
    </nav>
  );
};

export default SideNav;
