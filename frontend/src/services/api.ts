import axios from 'axios';
import { Project, ProjectDetail, ProjectsResponse, ProjectSubmission, Contributor, OverviewMetrics } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:40257';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const projectsApi = {
  // List projects with pagination and filtering
  list: async (params?: {
    limit?: number;
    offset?: number;
    order?: string;
    search?: string;
  }): Promise<ProjectsResponse> => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get project details
  get: async (id: string): Promise<ProjectDetail> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  create: async (submission: ProjectSubmission): Promise<ProjectDetail> => {
    const response = await api.post('/projects', submission);
    return response.data;
  },

  // Refresh project data
  refresh: async (id: string): Promise<ProjectDetail> => {
    const response = await api.post(`/projects/${id}/refresh`);
    return response.data;
  },
};

export const contributorsApi = {
  // Get all contributors across all projects
  list: async (): Promise<Contributor[]> => {
    const projectsResponse = await projectsApi.list({ limit: 100 });
    const allContributors: Contributor[] = [];
    
    // Get detailed data for each project to access contributors
    for (const project of projectsResponse.projects) {
      try {
        const projectDetail = await projectsApi.get(project.id);
        if (projectDetail.contributors_90d) {
          // Add project context to each contributor
          const contributorsWithProject = projectDetail.contributors_90d.map(contributor => ({
            ...contributor,
            project_name: project.name,
            project_id: project.id,
            project_url: project.html_url
          }));
          allContributors.push(...contributorsWithProject);
        }
      } catch (error) {
        console.warn(`Failed to fetch contributors for project ${project.name}:`, error);
      }
    }
    
    return allContributors;
  },

  // Get contributors for a specific project
  getByProject: async (projectId: string): Promise<Contributor[]> => {
    const projectDetail = await projectsApi.get(projectId);
    return projectDetail.contributors_90d || [];
  },
};

export const overviewApi = {
  // Get overview metrics for dashboard
  getMetrics: async (): Promise<OverviewMetrics> => {
    const response = await api.get('/projects/overview/metrics');
    return response.data;
  },
};

export const healthApi = {
  check: async () => {
    const response = await api.get('/healthz');
    return response.data;
  },
};

export default api;
