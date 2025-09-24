import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  GitBranch, 
  Users, 
  GitPullRequest, 
  Activity
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string | number;
}

interface MobileNavProps {
  currentPath: string;
}

const mobileNavItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    path: '/',
  },
  {
    id: 'repositories',
    label: 'Repos',
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
    label: 'PRs',
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
];

const MobileNav: React.FC<MobileNavProps> = ({ currentPath }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-panel border-t border-border-hairline lg:hidden z-20"
      role="navigation" 
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {mobileNavItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 px-1 relative
                ${isActive 
                  ? 'text-accent' 
                  : 'text-text-tertiary hover:text-text-primary'
                }
                transition-colors duration-200
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className="h-5 w-5 mb-1" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-fg text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full">
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
