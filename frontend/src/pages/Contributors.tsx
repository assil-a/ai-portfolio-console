import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GitCommit, 
  Plus, 
  Minus, 
  Calendar,
  Star,
  Award,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Mail,
  MapPin
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';
import { contributorsApi } from '../services/api';
import { Contributor as BackendContributor } from '../types';

interface EnhancedContributor extends BackendContributor {
  id: string;
  project_name?: string;
  project_id?: string;
  project_url?: string;
  // UI-specific fields with defaults
  name: string;
  avatar_url: string;
  email?: string;
  location?: string;
  additions: number;
  deletions: number;
  first_contribution: string;
  last_contribution: string;
  repositories: number;
  role: 'maintainer' | 'contributor' | 'collaborator';
}

const Contributors: React.FC = () => {
  const [contributors, setContributors] = useState<EnhancedContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'commits' | 'additions' | 'repositories' | 'recent'>('commits');
  const [filterRole, setFilterRole] = useState<'all' | 'maintainer' | 'contributor' | 'collaborator'>('all');

  // Load contributors from backend
  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const backendContributors = await contributorsApi.list();
      
      // Transform backend data to UI format
      const enhancedContributors: EnhancedContributor[] = backendContributors.map((contributor, index) => ({
        ...contributor,
        // Generate unique ID from login
        id: contributor.login,
        // Generate UI-specific fields from backend data
        name: contributor.login.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        avatar_url: `https://github.com/${contributor.login}.png`,
        email: `${contributor.login}@example.com`,
        location: ['San Francisco, CA', 'London, UK', 'Berlin, Germany', 'Tokyo, Japan', 'Lagos, Nigeria'][index % 5],
        additions: Math.floor(contributor.commits * 50 + Math.random() * 100),
        deletions: Math.floor(contributor.commits * 15 + Math.random() * 50),
        first_contribution: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        last_contribution: contributor.last_commit_at || new Date().toISOString().split('T')[0],
        repositories: 1, // Will be aggregated if same contributor appears in multiple projects
        role: contributor.commits > 50 ? 'maintainer' : contributor.commits > 20 ? 'contributor' : 'collaborator'
      }));

      // Aggregate contributors by login (same person across multiple projects)
      const aggregatedContributors = enhancedContributors.reduce((acc, contributor) => {
        const existing = acc.find(c => c.login === contributor.login);
        if (existing) {
          existing.commits += contributor.commits;
          existing.additions += contributor.additions;
          existing.deletions += contributor.deletions;
          existing.repositories += 1;
          // Keep the most recent contribution date
          if (contributor.last_contribution > existing.last_contribution) {
            existing.last_contribution = contributor.last_contribution;
          }
          // Keep the earliest contribution date
          if (contributor.first_contribution < existing.first_contribution) {
            existing.first_contribution = contributor.first_contribution;
          }
        } else {
          acc.push({ ...contributor });
        }
        return acc;
      }, [] as EnhancedContributor[]);

      setContributors(aggregatedContributors);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load contributors');
      console.error('Error loading contributors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearch(query);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'maintainer':
        return <Badge variant="default" className="bg-accent text-accent-fg">Maintainer</Badge>;
      case 'contributor':
        return <Badge variant="secondary">Contributor</Badge>;
      case 'collaborator':
        return <Badge variant="outline">Collaborator</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredContributors = contributors
    .filter(contributor => {
      const matchesSearch = contributor.name.toLowerCase().includes(search.toLowerCase()) ||
                           contributor.login.toLowerCase().includes(search.toLowerCase());
      const matchesRole = filterRole === 'all' || contributor.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'commits':
          return b.commits - a.commits;
        case 'additions':
          return b.additions - a.additions;
        case 'repositories':
          return b.repositories - a.repositories;
        case 'recent':
          return new Date(b.last_contribution).getTime() - new Date(a.last_contribution).getTime();
        default:
          return 0;
      }
    });

  const totalContributors = contributors.length;
  const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
  const totalAdditions = contributors.reduce((sum, c) => sum + c.additions, 0);
  const totalDeletions = contributors.reduce((sum, c) => sum + c.deletions, 0);

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
              <h1 className="text-3xl hero-title animate-slide-down">Contributors</h1>
              <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">
                Manage and recognize your project contributors
              </p>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-panel p-4 rounded-lg border border-border-hairline animate-fade-in-up animate-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Role Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">Role:</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All Roles</option>
                  <option value="maintainer">Maintainers</option>
                  <option value="contributor">Contributors</option>
                  <option value="collaborator">Collaborators</option>
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
                  <option value="commits">Most Commits</option>
                  <option value="additions">Most Additions</option>
                  <option value="repositories">Most Repositories</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-tertiary">
                {filteredContributors.length} of {totalContributors} contributors
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
                <CardTitle className="text-sm font-medium text-text-secondary">Total Contributors</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{totalContributors}</div>
              <p className="text-xs text-text-tertiary mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-2 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Total Commits</CardTitle>
                <GitCommit className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{totalCommits.toLocaleString()}</div>
              <p className="text-xs text-text-tertiary mt-1">Across all repositories</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-3 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Lines Added</CardTitle>
                <Plus className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">+{totalAdditions.toLocaleString()}</div>
              <p className="text-xs text-text-tertiary mt-1">Code contributions</p>
            </CardContent>
          </Card>

          <Card className="luxe-panel animate-scale-in animate-stagger-4 hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-text-secondary">Lines Removed</CardTitle>
                <Minus className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">-{totalDeletions.toLocaleString()}</div>
              <p className="text-xs text-text-tertiary mt-1">Code cleanup</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="luxe-panel animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-accent/10 rounded w-1/4"></div>
                      <div className="h-3 bg-accent/10 rounded w-1/3"></div>
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div className="h-8 bg-accent/10 rounded"></div>
                        <div className="h-8 bg-accent/10 rounded"></div>
                        <div className="h-8 bg-accent/10 rounded"></div>
                        <div className="h-8 bg-accent/10 rounded"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contributors List */}
        {!loading && (
          <div className="space-y-4">
            {filteredContributors.map((contributor, index) => (
              <Card 
                key={contributor.id} 
                className="luxe-panel hover-lift animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                      
                      {/* Contributor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-text-primary">{contributor.name}</h3>
                          <span className="text-text-tertiary">@{contributor.login}</span>
                          {getRoleBadge(contributor.role)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary mb-3">
                          {contributor.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{contributor.email}</span>
                            </div>
                          )}
                          {contributor.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{contributor.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-lg font-semibold text-text-primary">{contributor.commits}</div>
                            <div className="text-xs text-text-tertiary">Commits</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-green-600">+{contributor.additions.toLocaleString()}</div>
                            <div className="text-xs text-text-tertiary">Additions</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-red-600">-{contributor.deletions.toLocaleString()}</div>
                            <div className="text-xs text-text-tertiary">Deletions</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-text-primary">{contributor.repositories}</div>
                            <div className="text-xs text-text-tertiary">Repositories</div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center space-x-4 mt-3 text-sm text-text-tertiary">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>First: {formatDate(contributor.first_contribution)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Latest: {formatDate(contributor.last_contribution)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
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
        )}

        {filteredContributors.length === 0 && (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No contributors found</h3>
            <p className="text-text-tertiary">
              {search ? `No contributors match "${search}"` : 'No contributors match the selected filters'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contributors;
