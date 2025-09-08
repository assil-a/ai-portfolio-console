import React from 'react';
import { ExternalLink, Users, GitBranch, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Project } from '../types';
import { formatRelativeTime, formatExactTime } from '../utils/date';
import clsx from 'clsx';

interface ProjectTableProps {
  projects: Project[];
  loading?: boolean;
  onProjectClick: (project: Project) => void;
  onRefresh: (projectId: string) => void;
  refreshingIds: Set<string>;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading = false,
  onProjectClick,
  onRefresh,
  refreshingIds,
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <GitBranch className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium mb-2">No repositories found</h3>
          <p>Add your first repository to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Repository
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contributors (90d)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Branch
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Visibility
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onProjectClick(project)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.owner}/{project.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      <a
                        href={project.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on GitHub
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {project.last_commit_at ? (
                    <span title={formatExactTime(project.last_commit_at)}>
                      {formatRelativeTime(project.last_commit_at)}
                    </span>
                  ) : (
                    'No commits'
                  )}
                </div>
                {project.last_actor && (
                  <div className="text-sm text-gray-500">by {project.last_actor}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <Users className="mr-1 h-4 w-4" />
                  {project.active_contributors_90d}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <GitBranch className="mr-1 h-4 w-4" />
                  {project.default_branch || 'main'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    project.visibility === 'public'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {project.visibility === 'public' ? (
                    <Eye className="mr-1 h-3 w-3" />
                  ) : (
                    <EyeOff className="mr-1 h-3 w-3" />
                  )}
                  {project.visibility || 'public'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh(project.id);
                  }}
                  disabled={refreshingIds.has(project.id)}
                  className={clsx(
                    'inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md',
                    refreshingIds.has(project.id)
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                  )}
                >
                  <RefreshCw
                    className={clsx(
                      'mr-1 h-4 w-4',
                      refreshingIds.has(project.id) && 'animate-spin'
                    )}
                  />
                  Refresh
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;