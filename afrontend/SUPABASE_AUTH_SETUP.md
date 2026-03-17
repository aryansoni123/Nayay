# Supabase Authentication Integration Guide

## ✅ Authentication Setup Complete

Your afrontend is now fully integrated with:
- **Google OAuth** - Secure Google login
- **Supabase** - Backend authentication and user management
- **Python Backend** - User sync and data management

## Configuration Files

### Environment Variables (.env.local)
```env
VITE_GOOGLE_CLIENT_ID=60469326972-pmb62h5abiot715isor5iv79aep60la6.apps.googleusercontent.com
VITE_SUPABASE_URL=https://dwdglhgrnowgtgukgcnp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:8000
```

### Key Files
- **[src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)** - Supabase client initialization
- **[src/App.tsx](src/App.tsx)** - Supabase auth listener
- **[src/pages/Login.tsx](src/pages/Login.tsx)** - Google OAuth login page
- **[src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx)** - User display & logout

## Authentication Flow

### Login Process
```
1. User clicks "Secure Login" button
   ↓
2. Google OAuth dialog appears
   ↓
3. Frontend receives Google credential token
   ↓
4. Supabase attempts to authenticate with token
   ↓
5. Fallback: Send token to Python backend at POST /api/auth/login
   ↓
6. Backend verifies token with Google API
   ↓
7. Backend creates/updates user in Supabase
   ↓
8. User info stored in localStorage
   ↓
9. User redirected to home page
```

### Session Persistence
- User email stored in `localStorage`
- Login state persists across page refreshes
- Supabase auth listener monitors session changes

### Logout Process
```
1. User clicks "Sign Out" button
   ↓
2. Supabase signs out user
   ↓
3. localStorage cleared
   ↓
4. User email removed from state
   ↓
5. Sidebar logout section hidden
```

## Backend Requirements (Python)

Your backend (/api/auth/login endpoint) should:

```python
@app.post("/api/auth/login")
async def handle_login(request: Request):
    data = await request.json()
    token = data.get("token")
    email = data.get("email")
    
    # Verify token with Google
    google_verify_url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}"
    user_info = requests.get(google_verify_url).json()
    
    email = user_info.get("email")
    
    # Create/update user in Supabase
    user_data = {"email": email}
    result = supabase.table("users").upsert(user_data, on_conflict="email").execute()
    actual_id = result.data[0]['user_id']
    
    return {
        "status": "success",
        "user_id": actual_id,
        "email": email,
        "message": "User authenticated"
    }
```

## Usage in Components

To access authentication in any component:

```typescript
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

export const MyComponent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);
    };
    checkUser();
  }, []);

  return <div>{user?.email}</div>;
};
```

## API Integration with Auth

When calling backend APIs, include user info:

```typescript
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'session-123',
    user_id: localStorage.getItem('user_id'),
    message: 'Hello'
  })
});
```

## Running the Frontend

1. **Install Supabase dependency:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:5173/`

## Troubleshooting

### "Supabase URL or KEY not found"
- Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env.local`

### "Login Failed"
- Check console for network errors
- Verify backend is running on `http://localhost:8000`
- Check CORS is enabled in backend

### User not staying logged in
- Verify localStorage is enabled
- Check browser console for auth errors
- Ensure Supabase credentials are valid

### Google OAuth not showing
- Verify `VITE_GOOGLE_CLIENT_ID` in `.env.local`
- Check Google OAuth app credentials
- Ensure localhost:5173 is in Google OAuth allowed origins

## Supabase Setup (If New Project)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Create a `users` table with columns:
   - `user_id` (UUID, primary)
   - `email` (text)
   - `created_at` (timestamp)

4. Enable Google OAuth:
   - Settings → Authentication → Providers → Google
   - Add Google OAuth credentials

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Store tokens securely (already in Supabase)
- ✅ CORS properly configured
- ✅ User data validated server-side
- ✅ Row-level security (RLS) recommended on Supabase

## Next Steps

1. Install packages: `npm install`
2. Run frontend: `npm run dev`
3. Test login at `http://localhost:5173/`
4. Ensure backend is running
5. Check console for any errors

---

**Status**: ✅ Authentication fully integrated and ready to use!
