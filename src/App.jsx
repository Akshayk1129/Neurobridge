import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';

import Home from './pages/Home';
import Screening from './pages/Screening';
import Therapy from './pages/Therapy';
import Progress from './pages/Progress';
import Community from './pages/Community';
import Clinician from './pages/Clinician';
import Consent from './pages/Consent';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/therapy" element={<Therapy />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/community" element={<Community />} />
          <Route path="/clinician" element={<Clinician />} />
          <Route path="/consent" element={<Consent />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
