import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SideNav from './SideNav';
import MobileNav from './MobileNav';
import Footer from './Footer';
import SkipLink from './SkipLink';

interface LayoutProps {
  children: React.ReactNode;
  onAddRepository?: () => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onAddRepository, onSearch, searchValue }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col">
      <SkipLink />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:flex-col lg:min-h-screen">
        <Header 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          menuOpen={sidebarCollapsed}
          onAddRepository={onAddRepository}
          onSearch={onSearch}
          searchValue={searchValue}
        />
        
        <div className="flex flex-1">
          <aside 
            className={`bg-nav-bg border-r border-border-hairline transition-all duration-200 ${
              sidebarCollapsed ? 'w-16' : 'w-[280px]'
            }`}
            aria-label="Primary navigation"
          >
            <SideNav 
              currentPath={location.pathname}
              collapsed={sidebarCollapsed}
            />
          </aside>
          
          <div className="flex-1 flex flex-col">
            <main 
              id="main" 
              role="main" 
              className="flex-1 overflow-auto bg-bg"
            >
              <div className="p-6 max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <Header 
          onMenuClick={() => setMobileNavOpen(true)}
          menuOpen={mobileNavOpen}
          mobile
          onAddRepository={onAddRepository}
          onSearch={onSearch}
          searchValue={searchValue}
        />
        
        <main 
          id="main" 
          role="main" 
          className="flex-1 pt-16 pb-20 px-4"
        >
          {children}
        </main>
        
        <Footer />
        <MobileNav currentPath={location.pathname} />
        
        {/* Mobile Sidebar Overlay */}
        {mobileNavOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <aside 
              className="fixed top-0 left-0 h-full w-80 bg-panel border-r border-border-hairline z-50 transform transition-transform duration-200"
              aria-label="Primary navigation"
            >
              <div className="p-4 border-b border-border-hairline">
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 hover:bg-nav-item-hover rounded-md"
                  aria-label="Close navigation"
                >
                  ×
                </button>
              </div>
              <SideNav 
                currentPath={location.pathname}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
