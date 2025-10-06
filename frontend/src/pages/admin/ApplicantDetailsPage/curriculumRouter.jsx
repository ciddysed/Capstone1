import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CurriculumManagement from './curriculumManagement';

const CurriculumRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<CurriculumManagement />} />
      <Route path="/management" element={<CurriculumManagement />} />
    </Routes>
  );
};

export default CurriculumRouter;
