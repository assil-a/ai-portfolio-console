import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardWrapper from './components/DashboardWrapper';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardWrapper />} />
    </Routes>
  );
}

export default App;
