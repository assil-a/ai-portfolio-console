import React, { useState, useEffect } from 'react';
import { Search, Star, GitBranch, GitPullRequest, Users, Filter, MoreHorizontal, Plus } from 'lucide-react';
import { Project, ProjectsResponse, ProjectDetail as ProjectDetailType } from '../types';
import { projectsApi } from '../services/api';
import ProjectDetail from './ProjectDetail';
import AddProjectModal from './AddProjectModal';
import MetricCard from './MetricCard';
import AreaChart from './charts/AreaChart';
import LineChart from './charts/LineChart';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Layout from './Layout';

const DashboardWrapper: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectDetailType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('last_activity_at_desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const pageSize = 20;

  // Mock data for charts and metrics
  const commitActivityData = [
    { month: 'Jan', value: 120 },
    { month: 'Feb', value: 150 },
    { month: 'Mar', value: 140 },
    { month: 'Apr', value: 180 },
    { month: 'May', value: 170 },
    { month: 'Jun', value: 200 }
  ];

  const pullRequestTrendsData = [
    { month: 'Jan', value: 18 },
    { month: 'Feb', value: 22 },
    { month: 'Mar', value: 20 },
    { month: 'Apr', value: 16 },
    { month: 'May', value: 28 },
    { month: 'Jun', value: 32 }
  ];

  const loadProjects = async (page = 0, searchTerm = search, order = sortOrder) => {
    try {
      setLoading(true);
      setError('');
      
      const response: ProjectsResponse = await projectsApi.list({
        limit: pageSize,
        offset: page * pageSize,
        order,
        search: searchTerm || undefined,
      });
      
      setProjects(response.projects);
      setTotalProjects(response.total);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load projects');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    setCurrentPage(0);
    loadProjects(0, query, sortOrder);
  };

  const handleProjectClick = async (project: Project) => {
    try {
      const detail = await projectsApi.get(project.id);
      setSelectedProject(detail);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load project details');
    }
  };

  const handleAddProject = async (repoUrl: string) => {
    setAddingProject(true);
    try {
      const newProject = await projectsApi.create({ repo_url: repoUrl });
      await loadProjects(currentPage, search, sortOrder);
      setSelectedProject(newProject);
    } catch (err: any) {
      throw err;
    } finally {
      setAddingProject(false);
    }
  };

  const handleRefreshProject = async (projectId: string) => {
    setRefreshingIds(prev => new Set(prev).add(projectId));
    try {
      await projectsApi.refresh(projectId);
      await loadProjects(currentPage, search, sortOrder);
      
      if (selectedProject && selectedProject.id === projectId) {
        const updatedProject = await projectsApi.get(projectId);
        setSelectedProject(updatedProject);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh project');
    } finally {
      setRefreshingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  // Calculate metrics from projects data
  const totalStars = projects.reduce((sum, project) => sum + (project.active_contributors_90d || 0), 0);
  const activeRepos = projects.filter(p => p.last_commit_at && 
    new Date(p.last_commit_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
  const totalContributors = projects.reduce((sum, project) => sum + project.active_contributors_90d, 0);

  const getLanguageFromName = (name: string): string => {
    // Simple heuristic based on common patterns
    if (name.includes('react') || name.includes('js') || name.includes('frontend')) return 'TypeScript';
    if (name.includes('api') || name.includes('backend') || name.includes('server')) return 'Go';
    if (name.includes('design') || name.includes('ui')) return 'TypeScript';
    return 'JavaScript';
  };

  const getStatusBadge = (project: Project) => {
    const daysSinceUpdate = project.last_commit_at ? 
      Math.floor((Date.now() - new Date(project.last_commit_at).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceUpdate < 7) {
      return <Badge variant="success">active</Badge>;
    } else if (daysSinceUpdate < 30) {
      return <Badge variant="warning">moderate</Badge>;
    } else {
      return <Badge variant="secondary">archived</Badge>;
    }
  };

  return (
    <Layout
      onAddRepository={() => setShowAddModal(true)}
      onSearch={handleSearch}
      searchValue={search}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-3xl hero-title animate-slide-down">Repository Analytics</h1>
            <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">Monitor your GitHub repositories performance and activity</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative lg:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-quaternary h-4 w-4" />
              <Input
                type="text"
                placeholder="Search repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch((e.target as HTMLInputElement).value)}
                className="pl-10 w-80 bg-bg border-border-hairline"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="animate-scale-in animate-stagger-1 hover-lift">
              <MetricCard
                title="Total Stars"
                value="2.9k"
                change="+12.5%"
                changeType="positive"
                icon={<Star className="h-6 w-6" />}
                iconColor="text-accent"
              />
            </div>
            <div className="animate-scale-in animate-stagger-2 hover-lift">
              <MetricCard
                title="Active Repositories"
                value={activeRepos}
                change="+2 this month"
                changeType="positive"
                icon={<GitBranch className="h-6 w-6" />}
                iconColor="text-accent"
              />
            </div>
            <div className="animate-scale-in animate-stagger-3 hover-lift">
              <MetricCard
                title="Pull Requests"
                value="147"
                change="+18 open"
                changeType="positive"
                icon={<GitPullRequest className="h-6 w-6" />}
                iconColor="text-accent"
              />
            </div>
            <div className="animate-scale-in animate-stagger-4 hover-lift">
              <MetricCard
                title="Contributors"
                value={totalContributors}
                change="+7 this quarter"
                changeType="positive"
                icon={<Users className="h-6 w-6" />}
                iconColor="text-accent"
              />
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commit Activity Chart */}
            <Card className="luxe-panel animate-fade-in-left hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-text-primary">Commit Activity</CardTitle>
                <p className="text-sm text-text-tertiary">Monthly commit trends across all repositories</p>
              </CardHeader>
              <CardContent>
                <AreaChart data={commitActivityData} height={250} color="#10b981" />
              </CardContent>
            </Card>

            {/* Pull Request Trends Chart */}
            <Card className="luxe-panel animate-fade-in-right hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-text-primary">Pull Request Trends</CardTitle>
                <p className="text-sm text-text-tertiary">Monthly PR activity and review cycles</p>
              </CardHeader>
              <CardContent>
                <LineChart data={pullRequestTrendsData} height={250} color="#10b981" />
              </CardContent>
            </Card>
        </div>

        {/* Repository Overview Table */}
        <Card className="luxe-panel animate-fade-in-up hover-lift">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-text-primary">Repository Overview</CardTitle>
              <p className="text-sm text-text-tertiary">Detailed stats for all your repositories</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-gray-500">Loading repositories...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-hairline">
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">Repository</th>
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">Language</th>
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">⭐ Stars</th>
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">🍴 Forks</th>
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">👀 Watchers</th>
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">Issues</th>
                        <th className="text-left py-3 px-4 font-medium text-text-tertiary">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr 
                          key={project.id} 
                          className="border-b border-border-hairline hover:bg-panel-elev cursor-pointer"
                          onClick={() => handleProjectClick(project)}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium text-text-primary">{project.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-text-secondary">{getLanguageFromName(project.name)}</span>
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            {Math.floor(Math.random() * 1000) + 100}
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            {Math.floor(Math.random() * 200) + 20}
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            {Math.floor(Math.random() * 100) + 10}
                          </td>
                          <td className="py-3 px-4 text-text-primary">
                            {Math.floor(Math.random() * 20)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(project)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
        </Card>

        {/* Project Detail Modal */}
        {selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onRefresh={handleRefreshProject}
            refreshing={refreshingIds.has(selectedProject.id)}
          />
        )}

        {/* Add Project Modal */}
        <AddProjectModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProject}
          loading={addingProject}
        />
      </div>
    </Layout>
  );
};

export default DashboardWrapper;
