import React from 'react';
import Layout from './Layout';

// Simple test component to verify layout works
const LayoutTest: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-4">Layout Test</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-panel p-4 rounded-lg border border-border-hairline">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Test Card 1</h2>
            <p className="text-text-secondary">This is a test card to verify the layout is working correctly.</p>
          </div>
          <div className="bg-panel p-4 rounded-lg border border-border-hairline">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Test Card 2</h2>
            <p className="text-text-secondary">The sidebar should be visible on desktop and collapsible on mobile.</p>
          </div>
          <div className="bg-panel p-4 rounded-lg border border-border-hairline">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Test Card 3</h2>
            <p className="text-text-secondary">All navigation and theming should work properly.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LayoutTest;
