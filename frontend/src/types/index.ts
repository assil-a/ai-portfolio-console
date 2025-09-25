export interface Project {
  id: string;
  owner: string;
  name: string;
  html_url: string;
  default_branch?: string;
  visibility?: 'public' | 'private';
  last_commit_at?: string;
  last_actor?: string;
  active_contributors_90d: number;
  stargazer_count?: number;
  fork_count?: number;
  watchers_count?: number;
  open_issues_count?: number;
  open_prs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  contributors_90d: Contributor[];
  last_open_pr?: {
    number: number;
    updated_at: string;
    author: string;
  };
  default_branch_ref?: string;
  install_status: 'app' | 'oauth' | 'none';
}

export interface Contributor {
  login: string;
  commits: number;
  last_commit_at?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProjectSubmission {
  repo_url: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface OverviewMetrics {
  total_stars: number;
  active_repos: number;
  total_prs: number;
  total_contributors: number;
  commit_activity: ChartDataPoint[];
  pr_trends: ChartDataPoint[];
}
