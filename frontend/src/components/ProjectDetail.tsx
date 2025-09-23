import React from 'react';
import { X, ExternalLink, GitBranch, Users, Eye, EyeOff, RefreshCw, Calendar } from 'lucide-react';
import { ProjectDetail as ProjectDetailType } from '../types';
import { formatRelativeTime, formatExactTime, formatShortDate } from '../utils/date';
import clsx from 'clsx';
import { Badge } from './ui/badge';

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
        return <Badge variant="success">GitHub App</Badge>;
      case 'oauth':
        return <Badge>OAuth</Badge>;
      default:
        return <Badge variant="secondary">No Access</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border-hairline border-border-hairline w-11/12 max-w-4xl shadow-lg rounded-md bg-panel elev-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {project.owner}/{project.name}
            </h2>
            {project.visibility === 'public' ? (
              <Badge className="text-success border-success/30 bg-success/15">
                <Eye className="mr-1 h-3 w-3" />
                {project.visibility || 'public'}
              </Badge>
            ) : (
              <Badge className="text-warning border-warning/30 bg-warning/15">
                <EyeOff className="mr-1 h-3 w-3" />
                {project.visibility || 'private'}
              </Badge>
            )}
            {getInstallStatusBadge(project.install_status)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRefresh(project.id)}
              disabled={refreshing}
              className={clsx(
                'inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md border-hairline border-border-hairline bg-panel hover:bg-panel-elev',
                refreshing
                  ? 'text-text-tertiary cursor-not-allowed'
                  : 'text-accent'
              )}
            >
              <RefreshCw
                className={clsx('mr-2 h-4 w-4', refreshing && 'animate-spin')}
              />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Repository Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Repository Info</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2 text-text-tertiary" />
                  <a
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
                <div className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-2 text-text-tertiary" />
                  <span className="text-text-secondary">
                    Default branch: {project.default_branch || 'main'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-text-tertiary" />
                  <span className="text-text-secondary">
                    Added: {formatShortDate(project.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-3">Last Activity</h3>
              <div className="space-y-2">
                {project.last_commit_at ? (
                  <>
                    <div className="text-text-secondary">
                      <span className="font-medium">Last commit:</span>{' '}
                      <span title={formatExactTime(project.last_commit_at)}>
                        {formatRelativeTime(project.last_commit_at)}
                      </span>
                    </div>
                    {project.last_actor && (
                      <div className="text-text-secondary">
                        <span className="font-medium">By:</span> {project.last_actor}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-text-tertiary">No recent commits</div>
                )}
              </div>
            </div>

            {project.last_open_pr && (
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-3">Latest Open PR</h3>
                <div className="space-y-2">
                  <div className="text-text-secondary">
                    <span className="font-medium">PR #{project.last_open_pr.number}</span>
                  </div>
                    <div className="text-text-secondary">
                    <span className="font-medium">Updated:</span>{' '}
                    {formatRelativeTime(project.last_open_pr.updated_at)}
                  </div>
                    <div className="text-text-secondary">
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
              <Users className="h-5 w-5 mr-2 text-text-tertiary" />
              <h3 className="text-lg font-medium text-text-primary">
              Contributors (Last 90 Days)
            </h3>
            <span className="ml-2 text-sm text-text-tertiary">
              {project.contributors_90d.length} total
            </span>
          </div>

          {project.contributors_90d.length > 0 ? (
            <div className="bg-panel rounded-lg p-4 border border-border-hairline">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.contributors_90d.map((contributor) => (
                  <div
                    key={contributor.login}
                    className="bg-panel-elev rounded-lg p-3 elev-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-text-primary">
                        {contributor.login}
                      </div>
                      <div className="text-sm text-text-tertiary">
                        {contributor.commits} commits
                      </div>
                    </div>
                    {contributor.last_commit_at && (
                      <div className="text-xs text-text-tertiary mt-1">
                        Last: {formatRelativeTime(contributor.last_commit_at)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-panel rounded-lg p-8 text-center border border-border-hairline">
              <Users className="mx-auto h-8 w-8 text-text-tertiary mb-2" />
              <p className="text-text-tertiary">No contributors in the last 90 days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
