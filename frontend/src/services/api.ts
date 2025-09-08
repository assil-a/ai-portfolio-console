import axios from 'axios';
import { Project, ProjectDetail, ProjectsResponse, ProjectSubmission } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:40256';

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

export const healthApi = {
  check: async () => {
    const response = await api.get('/healthz');
    return response.data;
  },
};

export default api;