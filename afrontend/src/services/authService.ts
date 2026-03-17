import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = 'http://localhost:8000';

export const useAuthAPI = () => {
  const { userId } = useAuth();

  const sendMessage = async (message: string, sessionId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  };

  const uploadEvidence = async (file: File, sessionId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);
      formData.append('user_id', userId);

      const response = await fetch(`${API_BASE_URL}/api/upload-evidence`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Upload Error:', error);
      throw error;
    }
  };

  return { sendMessage, uploadEvidence };
};

/**
 * Standalone functions for authentication API calls
 */

export const loginWithGoogle = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Login error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Login API Error:', error);
    throw error;
  }
};
