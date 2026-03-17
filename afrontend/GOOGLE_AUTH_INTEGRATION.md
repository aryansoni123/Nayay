# Google OAuth Login Integration Guide

## Overview
Google login has been successfully integrated into the **afrontend** with full authentication flow, protected routes, and API integration.

## Files Created/Modified

### New Files Created:
1. **`src/pages/Login.tsx`** - Beautiful Google login page with authentication flow
2. **`src/hooks/useAuth.tsx`** - Authentication context and hook for managing user state
3. **`src/services/authService.ts`** - API service functions for auth operations
4. **`.env.local`** - Environment configuration with API endpoint and Google Client ID

### Files Modified:
1. **`src/App.tsx`** - Updated with AuthProvider, protected routes, and login page routing
2. **`src/layouts/MainLayout.tsx`** - Added logout functionality and updated imports

## How It Works

### 1. Login Flow
- User visits the app and is redirected to `/login`
- Google OAuth login component appears
- User clicks "Sign in with Google"
- Frontend sends the Google credential token to backend
- Backend (`/api/auth/login`) verifies token with Google
- Backend creates/updates user in database (Supabase)
- Backend returns numeric `user_id`
- Frontend stores `userId` and `isAuthenticated` in localStorage
- User is redirected to home page

### 2. Protected Routes
- Home page (/) is protected - redirects to login if not authenticated
- Sidebar's new "Sign Out" button logs out the user
- Auth state persists across page refreshes via localStorage

### 3. API Integration
The `authService.ts` provides hooks and functions for:
- `useAuthAPI()` - Hook for authenticated API calls to backend
  - `sendMessage()` - Send chat messages with session_id and user_id
  - `uploadEvidence()` - Upload evidence files with authentication
- `loginWithGoogle()` - Standalone function for login

## Setup Instructions

### Backend Requirements
Ensure your backend (`sbackend` or `backend`) has:
1. `/api/auth/login` endpoint that:
   - Accepts POST request with Google token
   - Verifies token with Google API
   - Creates/updates user in database
   - Returns `user_id` and `status`

2. `/api/chat` endpoint that accepts:
   - `session_id`, `user_id`, `message`

3. `/api/upload-evidence` endpoint for file uploads

4. CORS enabled to allow requests from frontend

Example from auth.txt:
```python
@app.post("/api/auth/login")
async def handle_login(request: Request):
    data = await request.json()
    token = data.get("token")
    
    google_verify_url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}"
    user_info = requests.get(google_verify_url).json()
    
    email = user_info.get("email")
    # ... database operations ...
    return {"status": "success", "user_id": actual_id}
```

### Frontend Configuration
The frontend is already configured with:
- Google Client ID: `60469326972-pmb62h5abiot715isor5iv79aep60la6.apps.googleusercontent.com`
- Backend API URL: `http://localhost:8000`

To customize, edit `.env.local`:
```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-client-id-here
```

## Running the Frontend

```bash
cd afrontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` - you'll be redirected to the login page.

## Using the Auth Hook in Components

Example usage in a component:

```typescript
import { useAuth } from '../hooks/useAuth';
import { useAuthAPI } from '../services/authService';

export const MyComponent: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const { sendMessage } = useAuthAPI();

  const handleSendMessage = async () => {
    try {
      const response = await sendMessage('Hello', 'session-123');
      console.log('Response:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {isAuthenticated && <p>User ID: {userId}</p>}
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
};
```

## API Endpoints to Implement

### 1. POST /api/auth/login
**Request:**
```json
{
  "token": "google-credential-token"
}
```

**Response:**
```json
{
  "status": "success",
  "user_id": "123456",
  "message": "Backend received the data!"
}
```

### 2. POST /api/chat
**Request:**
```json
{
  "session_id": "session-123",
  "user_id": "123456",
  "message": "User query here"
}
```

**Response:**
```json
{
  "reply": "AI response here"
}
```

### 3. POST /api/upload-evidence
**Request:** (multipart form data)
- `file`: File object
- `session_id`: Session ID
- `user_id`: User ID

**Response:**
```json
{
  "status": "success",
  "path": "/path/to/uploaded/file"
}
```

## Key Features Implemented

✅ **Google OAuth Integration** - Secure login with Google  
✅ **Protected Routes** - Only authenticated users can access chat  
✅ **Session Persistence** - User stays logged in across page refreshes  
✅ **Beautiful Login Page** - Themed to match app design  
✅ **Logout Functionality** - Secure sign-out from sidebar  
✅ **API Service Layer** - Reusable functions for backend calls  
✅ **Auth Context** - Global state management for authentication  
✅ **CORS Ready** - Frontend is configured for backend communication  

## Troubleshooting

### "Login Failed" Error
- Check browser console for network errors
- Verify backend is running on `http://localhost:8000`
- Check CORS headers in backend

### User stays on login page after successful Google login
- Check browser console for errors
- Verify backend `/api/auth/login` returns correct response format
- Check localStorage is enabled

### Session not persisting on refresh
- Check browser's localStorage is not disabled
- Verify `isAuthenticated` and `userId` are being saved

## Next Steps

1. Ensure backend is running with all three endpoints implemented
2. Test login flow by starting the frontend dev server
3. Integrate chat API calls using the `useAuthAPI()` hook
4. Add file upload functionality using the provided `uploadEvidence()` function
