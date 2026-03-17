import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { supabase } from './lib/supabaseClient';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { NearbyHelp } from './pages/NearbyHelp';
import './styles/index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const AppContent: React.FC = () => {
  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log("✅ User authenticated with Supabase. Syncing with Python Backend...");

        try {
          // Send user info to Python backend
          const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              user_id: session.user.id,
              metadata: session.user.user_metadata,
              token: session.access_token
            })
          });

          const result = await response.json();
          console.log("🐍 Python Backend Response:", result.message);
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
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="nearby" element={<NearbyHelp />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
