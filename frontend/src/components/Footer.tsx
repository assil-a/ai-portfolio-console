import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart, 
  ExternalLink,
  Shield,
  Book,
  Users,
  Zap,
  Globe,
  MessageCircle
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-panel border-t border-border-hairline mt-auto">
      {/* Minimized Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Copyright and attribution */}
          <div className="flex items-center space-x-4 text-sm text-text-tertiary">
            <p>© {currentYear} GitHub Analytics. All rights reserved.</p>
            <div className="hidden md:flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by</span>
              <a 
                href="https://github.com/assil-a" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 font-medium"
              >
                Assil Assas
              </a>
            </div>
          </div>
          
          {/* Right side - Links and status */}
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/help" className="text-text-tertiary hover:text-text-primary transition-colors">
              Help
            </Link>
            <Link to="/settings" className="text-text-tertiary hover:text-text-primary transition-colors">
              Settings
            </Link>
            <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors">
              Terms
            </a>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-text-tertiary">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
