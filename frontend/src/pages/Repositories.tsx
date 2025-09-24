import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Star, 
  GitFork, 
  Eye, 
  AlertCircle, 
  Calendar,
  Code,
  Users,
  Activity,
  Plus,
  RefreshCw,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Settings
} from 'lucide-react';
import { Project, ProjectsResponse, ProjectDetail as ProjectDetailType } from '../types';
import { projectsApi } from '../services/api';
import ProjectDetail from '../components/ProjectDetail';
import AddProjectModal from '../components/AddProjectModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';

interface SortOption {
  key: string;
  label: string;
  field: keyof Project | 'stars' | 'forks' | 'issues';
}

const sortOptions: SortOption[] = [
  { key: 'name_asc', label: 'Name A-Z', field: 'name' },
  { key: 'name_desc', label: 'Name Z-A', field: 'name' },
  { key: 'updated_desc', label: 'Recently Updated', field: 'last_commit_at' },
  { key: 'updated_asc', label: 'Oldest Updated', field: 'last_commit_at' },
  { key: 'stars_desc', label: 'Most Stars', field: 'stars' },
  { key: 'stars_asc', label: 'Least Stars', field: 'stars' },
  { key: 'forks_desc', label: 'Most Forks', field: 'forks' },
  { key: 'activity_desc', label: 'Most Active', field: 'last_commit_at' },
];

const Repositories: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectDetailType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('updated_desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const pageSize = 12;

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
      setError(err.response?.data?.detail || 'Failed to load repositories');
      console.error('Error loading repositories:', err);
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

  const handleSortChange = (newSort: string) => {
    setSortOrder(newSort);
    setCurrentPage(0);
    loadProjects(0, search, newSort);
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

  const getLanguageFromName = (name: string): string => {
    if (name.includes('react') || name.includes('js') || name.includes('frontend')) return 'TypeScript';
    if (name.includes('api') || name.includes('backend') || name.includes('server')) return 'Go';
    if (name.includes('design') || name.includes('ui')) return 'TypeScript';
    return 'JavaScript';
  };

  const getStatusBadge = (project: Project) => {
    const daysSinceUpdate = project.last_commit_at ? 
      Math.floor((Date.now() - new Date(project.last_commit_at).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceUpdate < 7) {
      return <Badge variant="success" className="animate-pulse-soft">Active</Badge>;
    } else if (daysSinceUpdate < 30) {
      return <Badge variant="warning">Moderate</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'all') return true;
    
    const daysSinceUpdate = project.last_commit_at ? 
      Math.floor((Date.now() - new Date(project.last_commit_at).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    
    if (statusFilter === 'active') return daysSinceUpdate < 30;
    if (statusFilter === 'inactive') return daysSinceUpdate >= 30;
    
    return true;
  });

  const totalPages = Math.ceil(totalProjects / pageSize);

  return (
    <Layout
      onAddRepository={() => setShowAddModal(true)}
      onSearch={handleSearch}
      searchValue={search}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl hero-title animate-slide-down">Repositories</h1>
              <p className="mt-2 text-text-tertiary animate-fade-in-up animate-stagger-1">
                Manage and monitor all your GitHub repositories
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-accent hover:bg-accent/90 text-accent-fg hover-glow"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Repository
              </Button>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-panel p-4 rounded-lg border border-border-hairline animate-fade-in-up animate-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All Repositories</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-secondary">Sort by:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-bg border border-border-hairline rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {sortOptions.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-bg border border-border-hairline rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent text-accent-fg' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent text-accent-fg' : 'text-text-tertiary hover:text-text-primary'}`}
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                    <div className="bg-current h-0.5 rounded-sm"></div>
                  </div>
                </button>
              </div>

              <span className="text-sm text-text-tertiary">
                {filteredProjects.length} of {totalProjects} repositories
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="animate-fade-in-up">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Repository Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-text-tertiary">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading repositories...</span>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
              <Code className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No repositories found</h3>
            <p className="text-text-tertiary mb-4">
              {search ? `No repositories match "${search}"` : 'Get started by adding your first repository'}
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-accent hover:bg-accent/90 text-accent-fg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Repository
            </Button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredProjects.map((project, index) => (
              <Card 
                key={project.id} 
                className={`luxe-panel hover-lift cursor-pointer animate-scale-in ${
                  viewMode === 'grid' ? '' : 'animate-fade-in-up'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleProjectClick(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-text-primary truncate">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-text-secondary">
                          {getLanguageFromName(project.name)}
                        </span>
                        <span className="text-text-quaternary">•</span>
                        {getStatusBadge(project)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefreshProject(project.id);
                        }}
                        disabled={refreshingIds.has(project.id)}
                        className="h-8 w-8 p-0"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingIds.has(project.id) ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Repository Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-text-tertiary">
                          <Star className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 1000) + 100}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-text-tertiary">
                          <GitFork className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 200) + 20}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-text-tertiary">
                          <AlertCircle className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 20)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center space-x-2 text-sm text-text-tertiary">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {formatDate(project.last_commit_at)}</span>
                    </div>

                    {/* Contributors */}
                    <div className="flex items-center space-x-2 text-sm text-text-tertiary">
                      <Users className="h-4 w-4" />
                      <span>{project.active_contributors_90d} contributors</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6 animate-fade-in-up">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProjects(currentPage - 1, search, sortOrder)}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                if (pageNum >= totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => loadProjects(pageNum, search, sortOrder)}
                    className={pageNum === currentPage ? "bg-accent text-accent-fg" : ""}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProjects(currentPage + 1, search, sortOrder)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}

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

export default Repositories;
