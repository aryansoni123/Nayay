import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabaseClient.ts';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { LegalMeter } from './pages/LegalMeter';
import { LawsUsed } from './pages/LawsUsed';
import { UploadedDocuments } from './pages/UploadedDocuments';
import { ChatHistory } from './pages/ChatHistory';
import { NearbyHelp } from './pages/NearbyHelp';

const App: React.FC = () => {

  useEffect(() => {
    // This listener waits for the user to log in via Google/Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {
        console.log("✅ User authenticated. Syncing with Python Backend...");

        try {
          // Sending the email and ID to your Python terminal
          const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              user_id: session.user.id,
              metadata: session.user.user_metadata
            })
          });

          const result = await response.json();
          console.log("🐍 Python Says:", result.message);
        } catch (error) {
          console.error("❌ Backend Error: Is your Python server running on port 8000?");
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log("👋 User logged out.");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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