import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);

  const handleLoginSuccess = useCallback(async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = credentialResponse.credential;
      
      // Sign in with Supabase using Google token
      const { data: { user, session }, error: authError } = await supabase.auth.signInWithIdToken({
        token,
        nonce: token, // Using token as nonce for this flow
        provider: 'google',
      });

      if (authError) {
        // Fallback: Try to use the token directly with our backend
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('userEmail', data.email);
          console.log('✅ Login successful! User ID:', data.user_id);
          navigate('/');
        } else {
          setError('Login failed. Please try again.');
        }
      } else if (user && session) {
        localStorage.setItem('supabaseUserId', user.id);
        localStorage.setItem('userEmail', user.email || '');
        console.log('✅ Supabase login successful!');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLoginError = () => {
    console.error('❌ Login Failed');
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--text-primary)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[var(--text-primary)]/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-auto px-6"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12 space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]"
          >
            <ShieldCheck size={32} className="text-[var(--text-primary)]" />
          </motion.div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
              Themis Enterprise
            </h1>
            <p className="text-[var(--text-secondary)] text-sm font-medium">
              Your AI-Powered Legal Assistant
            </p>
          </div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="p-8 rounded-2xl bg-[var(--glass-bg)]/40 backdrop-blur-md border border-[var(--glass-border)] space-y-6"
        >
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Welcome Back
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Sign in with your Google account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Google Login Button */}
          <div className="flex justify-center py-4">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              theme="filled_black"
              size="large"
              disabled={isLoading}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-2">
              <p className="text-sm text-[var(--text-secondary)]">Authenticating...</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-x-0 h-px bg-[var(--glass-border)]" />
            <span className="relative px-3 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--glass-bg)]">
              SECURE LOGIN
            </span>
          </div>

          {/* Info Text */}
          <p className="text-xs text-[var(--text-secondary)] text-center leading-relaxed">
            We protect your data with enterprise-grade security. Your legal consultations remain confidential.
          </p>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[var(--text-secondary)] mt-8 leading-relaxed"
        >
          By logging in, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
};
