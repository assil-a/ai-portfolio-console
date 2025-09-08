-- AI Portfolio Console Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    html_url TEXT NOT NULL,
    default_branch TEXT,
    visibility TEXT CHECK (visibility IN ('public','private')),
    last_commit_at TIMESTAMPTZ,
    last_actor TEXT,
    install_status TEXT CHECK (install_status IN ('app','oauth','none')) DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (owner, name)
);

-- Project contributors table
CREATE TABLE project_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    login TEXT NOT NULL,
    commits_90d INT NOT NULL DEFAULT 0,
    last_commit_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, login)
);

-- Project refresh queue table (for webhook dedupe/scheduling)
CREATE TABLE project_refresh_queue (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_projects_owner_name ON projects(owner, name);
CREATE INDEX idx_projects_last_commit_at ON projects(last_commit_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_project_contributors_project_id ON project_contributors(project_id);
CREATE INDEX idx_project_contributors_login ON project_contributors(login);
CREATE INDEX idx_project_refresh_queue_project_id ON project_refresh_queue(project_id);
CREATE INDEX idx_project_refresh_queue_queued_at ON project_refresh_queue(queued_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_contributors_updated_at BEFORE UPDATE ON project_contributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();