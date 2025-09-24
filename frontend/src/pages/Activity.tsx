import React, { useState, useEffect } from 'react';
import { 
  Activity as ActivityIcon, 
  GitCommit, 
  GitPullRequest, 
  GitMerge,
  Star,
  GitFork,
  MessageSquare,
  Calendar,
  User,
  Clock,
  Filter,
  TrendingUp,
  BarChart3,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';
import AreaChart from '../components/charts/AreaChart';
import LineChart from '../components/charts/LineChart';

interface ActivityEvent {
  id: string;
  type: 'commit' | 'pull_request' | 'merge' | 'star' | 'fork' | 'comment' | 'issue' | 'release';
  title: string;
  description: string;
  author: {
    login: string;
    name: string;
    avatar_url: string;
  };
  repository: string;
  timestamp: string;
  metadata?: {
    branch?: string;
    pr_number?: number;
    commit_sha?: string;
    additions?: number;
    deletions?: number;
    files_changed?: number;
  };
}

const mockActivityEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'commit',
    title: 'Add responsive navigation component',
    description: 'Implemented mobile-first navigation with collapsible sidebar and bottom tab bar for mobile devices.',
    author: {
      login: 'assil-assas',
      name: 'Assil Assas',
      avatar_url: 'https://github.com/assil-a.png'
    },
    repository: 'ai-portfolio-console',
    timestamp: '2024-09-24T14:30:00Z',
    metadata: {
      branch: 'feature/responsive-nav',
      commit_sha: 'a1b2c3d',
      additions: 245,
      deletions: 12,
      files_changed: 8
    }
  },
  {
    id: '2',
    type: 'pull_request',
    title: 'Fix authentication bug in login flow',
    description: 'Opened pull request to resolve email validation issues in the authentication system.',
    author: {
      login: 'john-dev',
      name: 'John Developer',
      avatar_url: 'https://github.com/github.png'
    },
    repository: 'ai-portfolio-console',
    timestamp: '2024-09-24T12:15:00Z',
    metadata: {
      pr_number: 246,
      branch: 'bugfix/auth-validation'
    }
  },
  {
    id: '3',
    type: 'merge',
    title: 'Merged: Update dependencies and security patches',
    description: 'Successfully merged dependency updates including security patches for npm packages.',
    author: {
      login: 'sarah-code',
      name: 'Sarah Coder',
      avatar_url: 'https://github.com/github.png'
    },
    repository: 'ai-portfolio-console',
    timestamp: '2024-09-24T10:45:00Z',
    metadata: {
      pr_number: 245,
      branch: 'chore/dependency-updates'
    }
  },
  {
    id: '4',
    type: 'star',
    title: 'Starred repository',
    description: 'Added a star to the ai-portfolio-console repository.',
    author: {
      login: 'new-contributor',
      name: 'New Contributor',
      avatar_url: 'https://github.com/github.png'
    },
    repository: 'ai-portfolio-console',
    timestamp: '2024-09-24T09:20:00Z'
  },
  {
    id: '5',
    type: 'comment',
    title: 'Commented on pull request #247',
    description: 'Added review comments on the dashboard redesign pull request with suggestions for improvement.',
    author: {
      login: 'mike-frontend',
      name: 'Mike Frontend',
      avatar_url: 'https://github.com/github.png'
    },
    repository: 'ai-portfolio-console',
    timestamp: '2024-09-24T08:30:00Z',
    metadata: {
      pr_number: 247
    }
  },
  {
    id: '6',
    type: 'fork',
    title: 'Forked repository',
    description: 'Created a fork of the ai-portfolio-console repository.',
    author: {
      login: 'external-dev',
      name: 'External Developer',
      avatar_url: 'https://github.com/github.png'
    },
    repository: 'ai-portfolio-console',
    timestamp: '2024-09-23T16:45:00Z'
  }
];

// Mock data for activity charts
const dailyActivityData = [
  { day: 'Mon', commits: 12, prs: 3, reviews: 5 },
  { day: 'Tue', commits: 18, prs: 5, reviews: 8 },
  { day: 'Wed', commits: 15, prs: 2, reviews: 6 },
  { day: 'Thu', commits: 22, prs: 7, reviews: 12 },
  { day: 'Fri', commits: 25, prs: 4, reviews: 9 },
  { day: 'Sat', commits: 8, prs: 1, reviews: 3 },
  { day: 'Sun', commits: 5, prs: 0, reviews: 2 }
];

const weeklyTrendsData = [
  { month: 'Week 1', value: 145 },
  { month: 'Week 2', value: 178 },
  { month: 'Week 3', value: 162 },
  { month: 'Week 4', value: 195 }
];

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>(mockActivityEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'commit' | 'pull_request' | 'merge' | 'star' | 'fork' | 'comment'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="h-4 w-4 text-blue-600" />;
      case 'pull_request':
        return <GitPullRequest className="h-4 w-4 text-green-600" />;
      case 'merge':
        return <GitMerge className="h-4 w-4 text-purple-600" />;
      case 'star':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'fork':
        return <GitFork className="h-4 w-4 text-accent" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-text-tertiary" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      commit: { label: 'Commit', variant: 'default' as const, className: 'bg-blue-600 text-white' },
      pull_request: { label: 'PR', variant: 'default' as const, className: 'bg-green-600 text-white' },
      merge: { label: 'Merge', variant: 'default' as const, className: 'bg-purple-600 text-white' },
      star: { label: 'Star', variant: 'default' as const, className: 'bg-yellow-500 text-white' },
      fork: { label: 'Fork', variant: 'default' as const, className: 'bg-accent text-accent-fg' },
      comment: { label: 'Comment', variant: 'default' as const, className: 'bg-blue-500 text-white' },
      issue: { label: 'Issue', variant: 'default' as const, className: 'bg-red-600 text-white' },
      release: { label: 'Release', variant: 'default' as const, className: 'bg-indigo-600 text-white' }
    };

    const badge = badges[type as keyof typeof badges] || { label: 'Activity', variant: 'secondary' as const, className: '' };
    return <Badge variant={badge.variant} className={badge.className}>{badge.label}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else if (diffInMinutes < 10080) {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const filteredActivities = activities
    .filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(search.toLowerCase()) ||
                           activity.description.toLowerCase().includes(search.toLowerCase()) ||
                           activity.author.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || activity.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalActivities = activities.length;
  const todayActivities = activities.filter(a => {
    const today = new Date();
    const activityDate = new Date(a.timestamp);
    return activityDate.toDateString() === today.toDateString();
  }).length;

  const weekActivities = activities.filter(a => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(a.timestamp) > weekAgo;
  }).length;

  const commitCount = activities.filter(a => a.type === 'commit').length;

  return (
    <Layout
      onSearch={handleSearch}
      searchValue={search}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl hero-title animate-slide-down">Activity</h1>
              <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">
                Track development activity and team collaboration
              </p>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-panel p-4 rounded-lg border border-border-hairline animate-fade-in-up animate-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All Activity</option>
                  <option value="commit">Commits</option>
                  <option value="pull_request">Pull Requests</option>
                  <option value="merge">Merges</option>
                  <option value="star">Stars</option>
                  <option value="fork">Forks</option>
                  <option value="comment">Comments</option>
                </select>
              </div>

              {/* Time Range */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">Time:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-tertiary">
                {filteredActivities.length} activities
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="animate-fade-in-up">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="luxe-panel animate-scale-in animate-stagger-1 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Today</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{todayActivities}</div>
              <p className="text-xs text-text-tertiary mt-1">Activities today</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-2 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{weekActivities}</div>
              <p className="text-xs text-text-tertiary mt-1">Activities this week</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-3 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Commits</CardTitle>
                <GitCommit className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{commitCount}</div>
              <p className="text-xs text-text-tertiary mt-1">Total commits</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-4 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Activity</CardTitle>
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{totalActivities}</div>
              <p className="text-xs text-text-tertiary mt-1">All activities</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="luxe-panel animate-fade-in-left hover-lift">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Daily Activity</CardTitle>
              <p className="text-sm text-text-tertiary">Activity breakdown by day of the week</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <div className="space-y-3">
                  {dailyActivityData.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary w-12">{day.day}</span>
                      <div className="flex-1 mx-4">
                        <div className="flex space-x-1">
                          <div 
                            className="bg-blue-600 h-2 rounded"
                            style={{ width: `${(day.commits / 25) * 100}%` }}
                          />
                          <div 
                            className="bg-green-600 h-2 rounded"
                            style={{ width: `${(day.prs / 7) * 100}%` }}
                          />
                          <div 
                            className="bg-purple-600 h-2 rounded"
                            style={{ width: `${(day.reviews / 12) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-text-tertiary w-8 text-right">
                        {day.commits + day.prs + day.reviews}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Commits</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span>PRs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span>Reviews</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-fade-in-right hover-lift">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Weekly Trends</CardTitle>
              <p className="text-sm text-text-tertiary">Activity trends over the past month</p>
            </CardHeader>
            <CardContent>
              <LineChart data={weeklyTrendsData} height={250} color="#10b981" />
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="luxe-panel animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-text-primary">Recent Activity</CardTitle>
            <p className="text-sm text-text-tertiary">Latest development activities across all repositories</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-panel-elev transition-colors animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Activity Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-semibold text-text-primary">{activity.title}</h4>
                        {getActivityBadge(activity.type)}
                      </div>
                      <span className="text-xs text-text-tertiary flex-shrink-0">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-text-tertiary mb-2">{activity.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-text-quaternary">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{activity.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>{activity.repository}</span>
                      </div>
                      {activity.metadata?.branch && (
                        <>
                          <span>•</span>
                          <span>{activity.metadata.branch}</span>
                        </>
                      )}
                      {activity.metadata?.additions && activity.metadata?.deletions && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">+{activity.metadata.additions}</span>
                          <span className="text-red-600">-{activity.metadata.deletions}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <ActivityIcon className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No activity found</h3>
            <p className="text-text-tertiary">
              {search ? `No activities match "${search}"` : 'No activities match the selected filters'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Activity;
