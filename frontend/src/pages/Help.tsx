import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info,
  Play,
  FileText,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How do I add a new repository to track?',
    answer: 'Click the "Add Repository" button in the header or on the repositories page. Enter your GitHub repository URL (e.g., https://github.com/username/repo-name) and click "Add Repository". The system will automatically fetch and analyze your repository data.',
    category: 'repositories'
  },
  {
    id: '2',
    question: 'Why is my repository data not updating?',
    answer: 'Repository data is automatically synced every 6 hours. You can manually refresh a repository by clicking the refresh button on the repository card. If data still doesn\'t update, check your GitHub API rate limits or contact support.',
    category: 'repositories'
  },
  {
    id: '3',
    question: 'How do I invite team members to view my dashboard?',
    answer: 'Go to Settings > Integrations and generate a shareable link or invite users by email. You can set different permission levels (view-only, contributor, admin) for each team member.',
    category: 'collaboration'
  },
  {
    id: '4',
    question: 'Can I export my analytics data?',
    answer: 'Yes! Go to Settings > Data & Storage and click "Export Data". You can download your data in JSON or CSV format. This includes all repository metrics, activity logs, and contributor statistics.',
    category: 'data'
  },
  {
    id: '5',
    question: 'How do I set up notifications?',
    answer: 'Navigate to Settings > Notifications to configure your notification preferences. You can enable email notifications, push notifications, and set up custom alerts for specific events like new pull requests or security issues.',
    category: 'notifications'
  },
  {
    id: '6',
    question: 'What GitHub permissions do I need?',
    answer: 'You need read access to repositories you want to track. For private repositories, you\'ll need to authenticate with GitHub and grant the necessary permissions. Public repositories can be tracked without authentication.',
    category: 'setup'
  },
  {
    id: '7',
    question: 'How do I customize the dashboard appearance?',
    answer: 'Go to Settings > Appearance to customize your dashboard. You can switch between light and dark themes, enable/disable animations, change language settings, and adjust the timezone for accurate timestamps.',
    category: 'customization'
  },
  {
    id: '8',
    question: 'Is my data secure and private?',
    answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We only access the minimum required GitHub data and never store sensitive information like passwords or private code content.',
    category: 'security'
  }
];

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using GitHub Analytics',
    icon: Play,
    items: [
      'Setting up your first repository',
      'Understanding the dashboard',
      'Navigating the interface',
      'Basic configuration'
    ]
  },
  {
    id: 'repositories',
    title: 'Repository Management',
    description: 'Managing and tracking your repositories',
    icon: Book,
    items: [
      'Adding repositories',
      'Repository settings',
      'Data synchronization',
      'Removing repositories'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Understanding your development metrics',
    icon: Zap,
    items: [
      'Reading charts and graphs',
      'Contributor analytics',
      'Activity tracking',
      'Performance metrics'
    ]
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Working with team members',
    icon: Users,
    items: [
      'Inviting team members',
      'Permission management',
      'Sharing dashboards',
      'Team notifications'
    ]
  }
];

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('faq');

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'repositories', label: 'Repositories' },
    { id: 'collaboration', label: 'Collaboration' },
    { id: 'data', label: 'Data & Export' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'setup', label: 'Setup' },
    { id: 'customization', label: 'Customization' },
    { id: 'security', label: 'Security' }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const renderFAQSection = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary h-4 w-4" />
          <Input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-border-hairline rounded-md bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((item, index) => (
          <Card 
            key={item.id} 
            className="luxe-panel animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-0">
              <button
                onClick={() => toggleFAQ(item.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-panel-elev transition-colors"
              >
                <h3 className="text-sm font-medium text-text-primary pr-4">
                  {item.question}
                </h3>
                {expandedFAQ === item.id ? (
                  <ChevronDown className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                )}
              </button>
              {expandedFAQ === item.id && (
                <div className="px-4 pb-4 border-t border-border-hairline">
                  <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
            <HelpCircle className="h-8 w-8 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No results found</h3>
          <p className="text-text-tertiary">
            {searchQuery ? `No help articles match "${searchQuery}"` : 'No articles in this category'}
          </p>
        </div>
      )}
    </div>
  );

  const renderGuidesSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card 
              key={section.id} 
              className="luxe-panel hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-text-primary">
                      {section.title}
                    </CardTitle>
                    <p className="text-sm text-text-tertiary mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary cursor-pointer">
                      <ChevronRight className="h-3 w-3" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="luxe-panel hover-lift animate-scale-in animate-stagger-1">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-text-primary">
                Live Chat
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-tertiary mb-4">
              Get instant help from our support team. Available 24/7 for urgent issues.
            </p>
            <Button variant="outline" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="luxe-panel hover-lift animate-scale-in animate-stagger-2">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-text-primary">
                Email Support
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-tertiary mb-4">
              Send us a detailed message and we'll get back to you within 24 hours.
            </p>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="luxe-panel hover-lift animate-scale-in animate-stagger-3">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <ExternalLink className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-text-primary">
                Community
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-tertiary mb-4">
              Join our community forum to connect with other users and share tips.
            </p>
            <Button variant="outline" className="w-full">
              Visit Forum
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="luxe-panel animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-text-primary flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-accent" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">Keyboard Shortcuts</h4>
                <p className="text-xs text-text-tertiary mt-1">
                  Press '?' to view all available keyboard shortcuts
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">Data Refresh</h4>
                <p className="text-xs text-text-tertiary mt-1">
                  Repository data updates automatically every 6 hours
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="h-3 w-3 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">Rate Limits</h4>
                <p className="text-xs text-text-tertiary mt-1">
                  GitHub API has rate limits - authenticate for higher limits
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="h-3 w-3 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">Export Data</h4>
                <p className="text-xs text-text-tertiary mt-1">
                  Export your analytics data anytime from Settings
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl hero-title animate-slide-down">Help & Support</h1>
              <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">
                Find answers to common questions and get help with GitHub Analytics
              </p>
            </div>
          </div>

          {/* Help Navigation */}
          <div className="flex space-x-1 bg-panel p-1 rounded-lg border border-border-hairline animate-fade-in-up animate-stagger-1">
            <button
              onClick={() => setActiveSection('faq')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'faq'
                  ? 'bg-accent text-accent-fg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-nav-item-hover'
              }`}
            >
              Frequently Asked Questions
            </button>
            <button
              onClick={() => setActiveSection('guides')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'guides'
                  ? 'bg-accent text-accent-fg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-nav-item-hover'
              }`}
            >
              Guides & Tutorials
            </button>
            <button
              onClick={() => setActiveSection('contact')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'contact'
                  ? 'bg-accent text-accent-fg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-nav-item-hover'
              }`}
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Help Content */}
        <div className="animate-fade-in-up">
          {activeSection === 'faq' && renderFAQSection()}
          {activeSection === 'guides' && renderGuidesSection()}
          {activeSection === 'contact' && renderContactSection()}
        </div>
      </div>
    </Layout>
  );
};

export default Help;
