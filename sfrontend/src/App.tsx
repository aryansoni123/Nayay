import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { LegalMeter } from './pages/LegalMeter';
import { LawsUsed } from './pages/LawsUsed';
import { UploadedDocuments } from './pages/UploadedDocuments';
import { ChatHistory } from './pages/ChatHistory';
import { NearbyHelp } from './pages/NearbyHelp';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="laws" element={<LawsUsed />} />
          <Route path="documents" element={<UploadedDocuments />} />
          <Route path="nearby" element={<NearbyHelp />} />
          <Route path="meter" element={<LegalMeter />} />
          <Route path="history" element={<ChatHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;