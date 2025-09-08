import React from 'react';
import { X, ExternalLink, GitBranch, Users, Eye, EyeOff, RefreshCw, Calendar } from 'lucide-react';
import { ProjectDetail as ProjectDetailType } from '../types';
import { formatRelativeTime, formatExactTime, formatShortDate } from '../utils/date';
import clsx from 'clsx';

interface ProjectDetailProps {
  project: ProjectDetailType;
  onClose: () => void;
  onRefresh: (projectId: string) => void;
  refreshing?: boolean;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
  onRefresh,
  refreshing = false,
}) => {
  const getInstallStatusBadge = (status: string) => {
    switch (status) {
      case 'app':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            GitHub App
          </span>
        );
      case 'oauth':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            OAuth
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            No Access
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {project.owner}/{project.name}
            </h2>
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
            {getInstallStatusBadge(project.install_status)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRefresh(project.id)}
              disabled={refreshing}
              className={clsx(
                'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md',
                refreshing
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
              )}
            >
              <RefreshCw
                className={clsx('mr-2 h-4 w-4', refreshing && 'animate-spin')}
              />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Repository Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Repository Info</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-gray-400" />
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View on GitHub
                  </a>
                </div>
                <div className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">
                    Default branch: {project.default_branch || 'main'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">
                    Added: {formatShortDate(project.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Last Activity</h3>
              <div className="space-y-2">
                {project.last_commit_at ? (
                  <>
                    <div className="text-gray-700">
                      <span className="font-medium">Last commit:</span>{' '}
                      <span title={formatExactTime(project.last_commit_at)}>
                        {formatRelativeTime(project.last_commit_at)}
                      </span>
                    </div>
                    {project.last_actor && (
                      <div className="text-gray-700">
                        <span className="font-medium">By:</span> {project.last_actor}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500">No recent commits</div>
                )}
              </div>
            </div>

            {project.last_open_pr && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Latest Open PR</h3>
                <div className="space-y-2">
                  <div className="text-gray-700">
                    <span className="font-medium">PR #{project.last_open_pr.number}</span>
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Updated:</span>{' '}
                    {formatRelativeTime(project.last_open_pr.updated_at)}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium">Author:</span> {project.last_open_pr.author}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contributors */}
        <div>
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 mr-2 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              Contributors (Last 90 Days)
            </h3>
            <span className="ml-2 text-sm text-gray-500">
              {project.contributors_90d.length} total
            </span>
          </div>

          {project.contributors_90d.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.contributors_90d.map((contributor) => (
                  <div
                    key={contributor.login}
                    className="bg-white rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">
                        {contributor.login}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contributor.commits} commits
                      </div>
                    </div>
                    {contributor.last_commit_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Last: {formatRelativeTime(contributor.last_commit_at)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-500">No contributors in the last 90 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;