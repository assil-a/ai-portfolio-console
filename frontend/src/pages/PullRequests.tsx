import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitMerge,
  GitBranch,
  Calendar,
  User,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';

interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  author: {
    login: string;
    name: string;
    avatar_url: string;
  };
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
  repository: string;
  base_branch: string;
  head_branch: string;
  additions: number;
  deletions: number;
  changed_files: number;
  comments: number;
  reviews: number;
  labels: string[];
  draft: boolean;
  mergeable: boolean;
}

const mockPullRequests: PullRequest[] = [
  {
    id: '1',
    number: 247,
    title: 'Add new dashboard layout with responsive design',
    description: 'This PR introduces a new responsive dashboard layout with improved mobile support and better accessibility features.',
    author: {
      login: 'assil-assas',
      name: 'Assil Assas',
      avatar_url: 'https://github.com/assil-a.png'
    },
    state: 'open',
    created_at: '2024-09-20T10:30:00Z',
    updated_at: '2024-09-24T14:15:00Z',
    repository: 'ai-portfolio-console',
    base_branch: 'main',
    head_branch: 'feature/dashboard-redesign',
    additions: 1250,
    deletions: 340,
    changed_files: 12,
    comments: 8,
    reviews: 2,
    labels: ['enhancement', 'frontend', 'high-priority'],
    draft: false,
    mergeable: true
  },
  {
    id: '2',
    number: 246,
    title: 'Fix authentication bug in login flow',
    description: 'Resolves issue where users were unable to login with certain email formats.',
    author: {
      login: 'john-dev',
      name: 'John Developer',
      avatar_url: 'https://github.com/github.png'
    },
    state: 'merged',
    created_at: '2024-09-18T09:15:00Z',
    updated_at: '2024-09-19T16:45:00Z',
    merged_at: '2024-09-19T16:45:00Z',
    repository: 'ai-portfolio-console',
    base_branch: 'main',
    head_branch: 'bugfix/auth-email-validation',
    additions: 45,
    deletions: 12,
    changed_files: 3,
    comments: 4,
    reviews: 1,
    labels: ['bug', 'backend', 'critical'],
    draft: false,
    mergeable: true
  },
  {
    id: '3',
    number: 245,
    title: 'Update dependencies and security patches',
    description: 'Updates all npm dependencies to latest versions and applies security patches.',
    author: {
      login: 'sarah-code',
      name: 'Sarah Coder',
      avatar_url: 'https://github.com/github.png'
    },
    state: 'closed',
    created_at: '2024-09-15T14:20:00Z',
    updated_at: '2024-09-16T11:30:00Z',
    closed_at: '2024-09-16T11:30:00Z',
    repository: 'ai-portfolio-console',
    base_branch: 'main',
    head_branch: 'chore/dependency-updates',
    additions: 890,
    deletions: 650,
    changed_files: 8,
    comments: 2,
    reviews: 0,
    labels: ['maintenance', 'dependencies'],
    draft: false,
    mergeable: false
  },
  {
    id: '4',
    number: 244,
    title: 'WIP: Implement real-time notifications',
    description: 'Work in progress for adding real-time notification system using WebSockets.',
    author: {
      login: 'mike-frontend',
      name: 'Mike Frontend',
      avatar_url: 'https://github.com/github.png'
    },
    state: 'open',
    created_at: '2024-09-12T16:45:00Z',
    updated_at: '2024-09-23T09:20:00Z',
    repository: 'ai-portfolio-console',
    base_branch: 'main',
    head_branch: 'feature/realtime-notifications',
    additions: 2100,
    deletions: 150,
    changed_files: 18,
    comments: 12,
    reviews: 3,
    labels: ['feature', 'backend', 'frontend'],
    draft: true,
    mergeable: true
  }
];

const PullRequests: React.FC = () => {
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(mockPullRequests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed' | 'merged'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'comments' | 'changes'>('updated');

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const getStateBadge = (pr: PullRequest) => {
    if (pr.draft) {
      return <Badge variant="outline" className="text-text-tertiary">Draft</Badge>;
    }
    
    switch (pr.state) {
      case 'open':
        return <Badge variant="default" className="bg-green-600 text-white">Open</Badge>;
      case 'merged':
        return <Badge variant="default" className="bg-purple-600 text-white">Merged</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="bg-red-600 text-white">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStateIcon = (pr: PullRequest) => {
    if (pr.draft) {
      return <GitPullRequest className="h-4 w-4 text-text-tertiary" />;
    }
    
    switch (pr.state) {
      case 'open':
        return <GitPullRequest className="h-4 w-4 text-green-600" />;
      case 'merged':
        return <GitMerge className="h-4 w-4 text-purple-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <GitPullRequest className="h-4 w-4 text-text-tertiary" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const filteredPullRequests = pullRequests
    .filter(pr => {
      const matchesSearch = pr.title.toLowerCase().includes(search.toLowerCase()) ||
                           pr.author.name.toLowerCase().includes(search.toLowerCase()) ||
                           pr.description.toLowerCase().includes(search.toLowerCase());
      const matchesState = filterState === 'all' || pr.state === filterState;
      return matchesSearch && matchesState;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'comments':
          return b.comments - a.comments;
        case 'changes':
          return (b.additions + b.deletions) - (a.additions + a.deletions);
        default:
          return 0;
      }
    });

  const totalPRs = pullRequests.length;
  const openPRs = pullRequests.filter(pr => pr.state === 'open' && !pr.draft).length;
  const draftPRs = pullRequests.filter(pr => pr.draft).length;
  const mergedPRs = pullRequests.filter(pr => pr.state === 'merged').length;

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
              <h1 className="text-3xl hero-title animate-slide-down">Pull Requests</h1>
              <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">
                Review and manage code changes across your repositories
              </p>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-panel p-4 rounded-lg border border-border-hairline animate-fade-in-up animate-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              {/* State Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">State:</span>
                <select
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value as any)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All Pull Requests</option>
                  <option value="open">Open</option>
                  <option value="merged">Merged</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Recently Created</option>
                  <option value="comments">Most Comments</option>
                  <option value="changes">Most Changes</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-tertiary">
                {filteredPullRequests.length} of {totalPRs} pull requests
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
                <CardTitle className="text-sm font-medium text-text-secondary">Open PRs</CardTitle>
                <GitPullRequest className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{openPRs}</div>
              <p className="text-xs text-text-tertiary mt-1">Ready for review</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-2 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Draft PRs</CardTitle>
                <Clock className="h-4 w-4 text-text-tertiary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{draftPRs}</div>
              <p className="text-xs text-text-tertiary mt-1">Work in progress</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-3 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Merged PRs</CardTitle>
                <GitMerge className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{mergedPRs}</div>
              <p className="text-xs text-text-tertiary mt-1">Successfully merged</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-4 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Total PRs</CardTitle>
                <GitBranch className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{totalPRs}</div>
              <p className="text-xs text-text-tertiary mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Pull Requests List */}
        <div className="space-y-4">
          {filteredPullRequests.map((pr, index) => (
            <Card 
              key={pr.id} 
              className="luxe-panel hover-lift animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* State Icon */}
                    <div className="mt-1">
                      {getStateIcon(pr)}
                    </div>
                    
                    {/* PR Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-semibold text-text-primary hover:text-accent cursor-pointer">
                              {pr.title}
                            </h3>
                            <span className="text-text-tertiary">#{pr.number}</span>
                            {getStateBadge(pr)}
                          </div>
                          
                          <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
                            {pr.description}
                          </p>

                          {/* Labels */}
                          {pr.labels.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {pr.labels.map((label, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Branch Info */}
                          <div className="flex items-center space-x-4 text-sm text-text-tertiary mb-3">
                            <div className="flex items-center space-x-1">
                              <GitBranch className="h-4 w-4" />
                              <span>{pr.head_branch}</span>
                              <span>→</span>
                              <span>{pr.base_branch}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-green-600">+{pr.additions}</span>
                              <span className="text-red-600">-{pr.deletions}</span>
                              <span>{pr.changed_files} files</span>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{pr.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {pr.state === 'merged' && pr.merged_at ? 
                                  `Merged ${formatDate(pr.merged_at)}` :
                                  pr.state === 'closed' && pr.closed_at ?
                                  `Closed ${formatDate(pr.closed_at)}` :
                                  `Updated ${formatDate(pr.updated_at)}`
                                }
                              </span>
                            </div>
                            {pr.comments > 0 && (
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{pr.comments}</span>
                              </div>
                            )}
                            {pr.reviews > 0 && (
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{pr.reviews} reviews</span>
                              </div>
                            )}
                            {!pr.mergeable && pr.state === 'open' && (
                              <div className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span>Conflicts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPullRequests.length === 0 && (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <GitPullRequest className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No pull requests found</h3>
            <p className="text-text-tertiary">
              {search ? `No pull requests match "${search}"` : 'No pull requests match the selected filters'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PullRequests;
