import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (repoUrl: string) => Promise<void>;
  loading?: boolean;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    // Basic URL validation
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    if (!githubUrlPattern.test(repoUrl.trim())) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
      return;
    }

    try {
      await onSubmit(repoUrl.trim());
      setRepoUrl('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to add repository');
    }
  };

  const handleClose = () => {
    setRepoUrl('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border-hairline border-border-hairline w-96 shadow-lg rounded-md bg-panel elev-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text-primary">Add Repository</h3>
          <button
            onClick={handleClose}
            className="text-text-tertiary hover:text-text-secondary"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="repo-url" className="block text-sm font-medium text-text-secondary mb-2">
              GitHub Repository URL
            </label>
            <Input
              type="url"
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className={clsx(error && 'border-danger focus-visible:ring-danger')}
              disabled={loading}
            />
            {error && (
              <div className="mt-2 flex items-start text-sm text-danger">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <div>
                  {error.includes('https://github.com/apps/') || error.includes('https://github.com/settings/installations') ? (
                    <div dangerouslySetInnerHTML={{
                      __html: error.replace(/(https:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline font-medium">$1</a>')
                    }} />
                  ) : (
                    error
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4 p-3 rounded-md border-hairline border-accent/30 bg-accent/10">
            <p className="text-sm text-accent">
              <strong>Note:</strong> Make sure the GitHub App is installed on the repository
              or that you have OAuth access to private repositories.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className={clsx('', loading && 'opacity-50 cursor-not-allowed')}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Repository
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
