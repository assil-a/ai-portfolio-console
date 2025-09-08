import React, { useState, useEffect } from 'react';
import { Search, Plus, SortAsc, SortDesc } from 'lucide-react';
import { Project, ProjectDetail, ProjectsResponse } from '../types';
import { projectsApi } from '../services/api';
import ProjectTable from '../components/ProjectTable';
import ProjectDetail from '../components/ProjectDetail';
import AddProjectModal from '../components/AddProjectModal';
import clsx from 'clsx';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  
  // Filters and pagination
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('last_activity_at_desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const pageSize = 20;

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

  const handleSortChange = (newOrder: string) => {
    setSortOrder(newOrder);
    setCurrentPage(0);
    loadProjects(0, search, newOrder);
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
      await loadProjects(currentPage, search, sortOrder); // Refresh the list
      setSelectedProject(newProject); // Show the new project details
    } catch (err: any) {
      throw err; // Let the modal handle the error
    } finally {
      setAddingProject(false);
    }
  };

  const handleRefreshProject = async (projectId: string) => {
    setRefreshingIds(prev => new Set(prev).add(projectId));
    try {
      await projectsApi.refresh(projectId);
      await loadProjects(currentPage, search, sortOrder); // Refresh the list
      
      // If this project is currently selected, refresh its details too
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

  const totalPages = Math.ceil(totalProjects / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Portfolio Console</h1>
          <p className="mt-2 text-gray-600">
            Monitor and manage your GitHub repository portfolio
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="last_activity_at_desc">Last Activity (Newest)</option>
                <option value="last_activity_at_asc">Last Activity (Oldest)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="created_at_desc">Date Added (Newest)</option>
              </select>
            </div>

            {/* Add Project Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Repository
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Projects Table */}
        <ProjectTable
          projects={projects}
          loading={loading}
          onProjectClick={handleProjectClick}
          onRefresh={handleRefreshProject}
          refreshingIds={refreshingIds}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {currentPage * pageSize + 1} to{' '}
              {Math.min((currentPage + 1) * pageSize, totalProjects)} of {totalProjects} repositories
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadProjects(currentPage - 1, search, sortOrder)}
                disabled={currentPage === 0}
                className={clsx(
                  'px-3 py-2 text-sm font-medium rounded-md',
                  currentPage === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => loadProjects(currentPage + 1, search, sortOrder)}
                disabled={currentPage >= totalPages - 1}
                className={clsx(
                  'px-3 py-2 text-sm font-medium rounded-md',
                  currentPage >= totalPages - 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
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