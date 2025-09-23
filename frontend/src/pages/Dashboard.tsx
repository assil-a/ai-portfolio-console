import React, { useState, useEffect } from 'react';
import { Search, Star, GitBranch, GitPullRequest, Users, Filter, MoreHorizontal, Plus } from 'lucide-react';
import { Project, ProjectsResponse, ProjectDetail as ProjectDetailType } from '../types';
import { projectsApi } from '../services/api';
import ProjectDetail from '../components/ProjectDetail';
import AddProjectModal from '../components/AddProjectModal';
import MetricCard from '../components/MetricCard';
import AreaChart from '../components/charts/AreaChart';
import LineChart from '../components/charts/LineChart';
import { ThemeToggle } from '../components/theme-toggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Dashboard: React.FC = () => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadProjects(0, search, sortOrder);
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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">active</Badge>;
    } else if (daysSinceUpdate < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">moderate</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">archived</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-gray-600">GitHub Repository Insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="pl-10 w-80 bg-white border-gray-300"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Repository
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Stars"
            value="2.9k"
            change="+12.5%"
            changeType="positive"
            icon={<Star className="h-6 w-6" />}
            iconColor="text-green-500"
          />
          <MetricCard
            title="Active Repositories"
            value={activeRepos}
            change="+2 this month"
            changeType="positive"
            icon={<GitBranch className="h-6 w-6" />}
            iconColor="text-green-500"
          />
          <MetricCard
            title="Pull Requests"
            value="147"
            change="+18 open"
            changeType="positive"
            icon={<GitPullRequest className="h-6 w-6" />}
            iconColor="text-green-500"
          />
          <MetricCard
            title="Contributors"
            value={totalContributors}
            change="+7 this quarter"
            changeType="positive"
            icon={<Users className="h-6 w-6" />}
            iconColor="text-green-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Commit Activity Chart */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Commit Activity</CardTitle>
              <p className="text-sm text-gray-600">Monthly commit trends across all repositories</p>
            </CardHeader>
            <CardContent>
              <AreaChart data={commitActivityData} height={250} color="#10b981" />
            </CardContent>
          </Card>

          {/* Pull Request Trends Chart */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Pull Request Trends</CardTitle>
              <p className="text-sm text-gray-600">Monthly PR activity and review cycles</p>
            </CardHeader>
            <CardContent>
              <LineChart data={pullRequestTrendsData} height={250} color="#10b981" />
            </CardContent>
          </Card>
        </div>

        {/* Repository Overview Table */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Repository Overview</CardTitle>
            <p className="text-sm text-gray-600">Detailed stats for all your repositories</p>
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
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Repository</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Language</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">⭐ Stars</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">🍴 Forks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">👀 Watchers</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Issues</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr 
                        key={project.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{project.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-600">{getLanguageFromName(project.name)}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {Math.floor(Math.random() * 1000) + 100}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {Math.floor(Math.random() * 200) + 20}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {Math.floor(Math.random() * 100) + 10}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
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
      </div>

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
  );
};

export default Dashboard;
