import React from 'react';
import { Search, Filter, MoreHorizontal, Plus, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
  menuOpen?: boolean;
  mobile?: boolean;
  onAddRepository?: () => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  className = '', 
  onMenuClick, 
  menuOpen = false, 
  mobile = false,
  onAddRepository,
  onSearch,
  searchValue = ''
}) => {
  return (
    <header 
      className={`bg-panel border-b border-border-hairline px-6 py-3 flex items-center justify-between ${
        mobile ? 'fixed top-0 left-0 right-0 z-30 h-16' : 'h-16'
      } ${className}`}
      role="banner"
    >
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        {mobile && (
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-nav-item-hover rounded-md lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-border-strong rounded-md flex items-center justify-center">
            <span className="text-text-primary font-bold text-sm">GA</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">GitHub Analytics</h1>
            <p className="text-xs text-text-tertiary hidden sm:block">Enterprise</p>
          </div>
        </div>
      </div>

      {/* Center - Search (Desktop only) */}
      {!mobile && (
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary h-4 w-4" />
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch?.(searchValue)}
              className="pl-10 bg-bg border-border-hairline"
            />
          </div>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Environment Selector */}
        <select className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent">
          <option>Production</option>
          <option>Staging</option>
          <option>Development</option>
        </select>

        {/* Time Range Selector */}
        <select className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>

        {/* Action Buttons */}
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>

        <Button variant="outline" size="sm" className="hidden sm:flex">
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        <Button 
          size="sm" 
          className="bg-accent hover:bg-accent/90 text-accent-fg"
          onClick={onAddRepository}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Repository</span>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
