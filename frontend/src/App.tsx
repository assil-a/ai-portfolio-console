import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardWrapper from './components/DashboardWrapper';
import Repositories from './pages/Repositories';
import Contributors from './pages/Contributors';
import PullRequests from './pages/PullRequests';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Help from './pages/Help';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardWrapper />} />
      <Route path="/repositories" element={<Repositories />} />
      <Route path="/contributors" element={<Contributors />} />
      <Route path="/pull-requests" element={<PullRequests />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
    </Routes>
  );
}

export default App;
