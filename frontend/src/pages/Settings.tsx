import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Key,
  Globe,
  Monitor,
  Moon,
  Sun,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';
import { ThemeToggle } from '../components/theme-toggle';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your account information and preferences',
    icon: User
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure how you receive updates and alerts',
    icon: Bell
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the look and feel of your dashboard',
    icon: Palette
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage your security settings and API keys',
    icon: Shield
  },
  {
    id: 'data',
    title: 'Data & Storage',
    description: 'Control data synchronization and storage preferences',
    icon: Database
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with external services and tools',
    icon: Globe
  }
];

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Profile settings
  const [profile, setProfile] = useState({
    name: 'Assil Assas',
    email: 'assil@example.com',
    username: 'assil-assas',
    bio: 'Full-stack developer passionate about creating amazing user experiences.',
    location: 'Lagos, Nigeria',
    website: 'https://assil.dev',
    company: 'Tech Innovators Inc.'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    securityAlerts: true,
    repositoryUpdates: false,
    pullRequestReviews: true,
    mentions: true
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'system',
    compactMode: false,
    showAnimations: true,
    language: 'en',
    timezone: 'Africa/Lagos'
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '24',
    apiKeys: [
      { id: '1', name: 'GitHub API', created: '2024-01-15', lastUsed: '2024-09-24' },
      { id: '2', name: 'Analytics API', created: '2024-03-10', lastUsed: '2024-09-20' }
    ]
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
          <Input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
          <Input
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
          <Input
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            placeholder="Enter your location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Website</label>
          <Input
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            placeholder="Enter your website URL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Company</label>
          <Input
            value={profile.company}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            placeholder="Enter your company"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Tell us about yourself"
          rows={4}
          className="w-full px-3 py-2 border border-border-hairline rounded-md bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-border-hairline last:border-b-0">
          <div>
            <h4 className="text-sm font-medium text-text-primary capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-xs text-text-tertiary mt-1">
              {key === 'emailNotifications' && 'Receive notifications via email'}
              {key === 'pushNotifications' && 'Receive push notifications in your browser'}
              {key === 'weeklyDigest' && 'Get a weekly summary of your activity'}
              {key === 'securityAlerts' && 'Important security and account alerts'}
              {key === 'repositoryUpdates' && 'Updates about your repositories'}
              {key === 'pullRequestReviews' && 'Notifications for pull request reviews'}
              {key === 'mentions' && 'When someone mentions you in comments'}
            </p>
          </div>
          <button
            onClick={() => setNotifications({ ...notifications, [key]: !value })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">Theme</label>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <span className="text-sm text-text-tertiary">Toggle between light and dark mode</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-3 border-b border-border-hairline">
        <div>
          <h4 className="text-sm font-medium text-text-primary">Compact Mode</h4>
          <p className="text-xs text-text-tertiary mt-1">Reduce spacing and padding for more content</p>
        </div>
        <button
          onClick={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            appearance.compactMode ? 'bg-accent' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between py-3 border-b border-border-hairline">
        <div>
          <h4 className="text-sm font-medium text-text-primary">Show Animations</h4>
          <p className="text-xs text-text-tertiary mt-1">Enable smooth transitions and animations</p>
        </div>
        <button
          onClick={() => setAppearance({ ...appearance, showAnimations: !appearance.showAnimations })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            appearance.showAnimations ? 'bg-accent' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              appearance.showAnimations ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Language</label>
          <select
            value={appearance.language}
            onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
            className="w-full px-3 py-2 border border-border-hairline rounded-md bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Timezone</label>
          <select
            value={appearance.timezone}
            onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-border-hairline rounded-md bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-3 border-b border-border-hairline">
        <div>
          <h4 className="text-sm font-medium text-text-primary">Two-Factor Authentication</h4>
          <p className="text-xs text-text-tertiary mt-1">Add an extra layer of security to your account</p>
        </div>
        <div className="flex items-center space-x-3">
          {security.twoFactorEnabled ? (
            <Badge variant="default" className="bg-green-600 text-white">Enabled</Badge>
          ) : (
            <Badge variant="secondary">Disabled</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
          >
            {security.twoFactorEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Session Timeout (hours)</label>
        <select
          value={security.sessionTimeout}
          onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
          className="w-full md:w-48 px-3 py-2 border border-border-hairline rounded-md bg-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="1">1 hour</option>
          <option value="8">8 hours</option>
          <option value="24">24 hours</option>
          <option value="168">1 week</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-text-primary">API Keys</h4>
          <Button variant="outline" size="sm">
            <Key className="mr-2 h-4 w-4" />
            Generate New Key
          </Button>
        </div>
        <div className="space-y-3">
          {security.apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-3 border border-border-hairline rounded-md">
              <div>
                <h5 className="text-sm font-medium text-text-primary">{key.name}</h5>
                <p className="text-xs text-text-tertiary">
                  Created {key.created} • Last used {key.lastUsed}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Data Export</h4>
        <p className="text-xs text-text-tertiary mb-4">Download your data in JSON format</p>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Data Import</h4>
        <p className="text-xs text-text-tertiary mb-4">Import data from a backup file</p>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </div>

      <div className="border-t border-border-hairline pt-6">
        <h4 className="text-sm font-medium text-text-primary mb-3 text-red-600">Danger Zone</h4>
        <div className="space-y-4">
          <div className="p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-950 dark:border-red-800">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-red-800 dark:text-red-200">Delete Account</h5>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="outline" size="sm" className="mt-3 border-red-300 text-red-600 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="luxe-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">GitHub</CardTitle>
              <Badge variant="default" className="bg-green-600 text-white">Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-tertiary mb-3">
              Sync repositories and activity from your GitHub account
            </p>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </Button>
          </CardContent>
        </Card>

        <Card className="luxe-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Slack</CardTitle>
              <Badge variant="secondary">Not Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-tertiary mb-3">
              Receive notifications and updates in your Slack workspace
            </p>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </CardContent>
        </Card>

        <Card className="luxe-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Discord</CardTitle>
              <Badge variant="secondary">Not Connected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-tertiary mb-3">
              Get activity updates in your Discord server
            </p>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </CardContent>
        </Card>

        <Card className="luxe-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
              <Badge variant="outline">2 Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-tertiary mb-3">
              Send data to external services via HTTP webhooks
            </p>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'security':
        return renderSecuritySettings();
      case 'data':
        return renderDataSettings();
      case 'integrations':
        return renderIntegrationsSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl hero-title animate-slide-down">Settings</h1>
              <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">
                Manage your account preferences and application settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {saved && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Settings saved</span>
                </div>
              )}
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-accent hover:bg-accent/90 text-accent-fg"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="animate-fade-in-up">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Settings Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="luxe-panel animate-fade-in-left">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                          isActive 
                            ? 'bg-accent text-accent-fg' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-nav-item-hover'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{section.title}</div>
                          <div className="text-xs opacity-75 truncate">{section.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card className="luxe-panel animate-fade-in-right">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-text-primary">
                  {settingsSections.find(s => s.id === activeSection)?.title}
                </CardTitle>
                <p className="text-sm text-text-tertiary">
                  {settingsSections.find(s => s.id === activeSection)?.description}
                </p>
              </CardHeader>
              <CardContent>
                {renderSettingsContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
