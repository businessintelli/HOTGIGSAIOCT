# HotGigs.ai - Complete Login & Logout Guide

## 📋 Table of Contents
1. [Login Process](#login-process)
2. [Logout Process](#logout-process)
3. [Session Management](#session-management)
4. [Security Features](#security-features)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 Login Process

### **Entry Points to Login**

Candidates can access the login page from multiple locations:

1. **Homepage** → Click "Sign In" button (top right)
2. **Any protected page** → Automatic redirect to `/signin`
3. **Direct URL** → Navigate to `https://hotgigs.ai/signin`

### **Login Page Layout**

```
┌────────────────────────────────────────┐
│         HotGigs.ai Logo                │
│                                        │
│         Welcome Back                   │
│  Sign in to continue your job search  │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  G  Continue with Google         │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │  in Continue with LinkedIn       │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │  ⊞  Continue with Microsoft      │ │
│  └──────────────────────────────────┘ │
│                                        │
│     Or continue with email             │
│                                        │
│  Email                                 │
│  ┌──────────────────────────────────┐ │
│  │ you@example.com                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Password                              │
│  ┌──────────────────────────────────┐ │
│  │ ••••••••                         │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ☐ Remember me    Forgot password?    │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │        Sign In                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Don't have an account? Sign up now   │
└────────────────────────────────────────┘
```

---

## 🌐 Login Methods

### **Method 1: Social Login (OAuth)**

#### **Google Login**

**User Flow:**
1. Click "Continue with Google" button
2. Redirected to Google OAuth consent screen
3. Select Google account
4. Grant permissions (email, profile)
5. Redirected back to HotGigs.ai
6. Automatically logged in

**Technical Flow:**
```javascript
// Frontend initiates OAuth
window.location.href = '/api/auth/social-login/google';

// Backend redirects to Google
@app.get("/api/auth/social-login/google")
async def google_login():
    return RedirectResponse(
        url=f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={GOOGLE_CLIENT_ID}&"
            f"redirect_uri={REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=email profile"
    )

// Google redirects back with code
@app.get("/api/auth/callback/google")
async def google_callback(code: str):
    # Exchange code for access token
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code"
        }
    )
    
    # Get user info from Google
    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        headers={"Authorization": f"Bearer {token_response['access_token']}"}
    ).json()
    
    # Create or update user in database
    user = get_or_create_user(
        email=user_info['email'],
        full_name=user_info['name'],
        provider='google'
    )
    
    # Generate JWT token
    jwt_token = create_access_token(data={"sub": user.email})
    
    # Redirect to dashboard with token
    return RedirectResponse(
        url=f"/dashboard?token={jwt_token}"
    )
```

**Advantages:**
✅ No password to remember
✅ Faster login (one click)
✅ Secure (Google handles authentication)
✅ Auto-import profile data (name, email, photo)

#### **LinkedIn Login**

**User Flow:**
1. Click "Continue with LinkedIn" button
2. Redirected to LinkedIn OAuth
3. Authorize HotGigs.ai
4. Automatically logged in
5. **Bonus:** Profile data imported (work experience, skills, education)

**Technical Flow:**
Similar to Google, but uses LinkedIn API:
```
https://www.linkedin.com/oauth/v2/authorization
```

**Advantages:**
✅ Professional network integration
✅ Auto-import work experience
✅ Auto-import skills and endorsements
✅ Auto-import education
✅ Industry-standard for job platforms

#### **Microsoft Login**

**User Flow:**
1. Click "Continue with Microsoft" button
2. Redirected to Microsoft OAuth
3. Sign in with work/school account
4. Automatically logged in

**Advantages:**
✅ Enterprise-friendly
✅ Azure AD integration
✅ Common for corporate users
✅ Single Sign-On (SSO) support

---

### **Method 2: Email/Password Login**

#### **Step-by-Step Process**

**Step 1: Enter Email**
```
Input: sarah.johnson@testmail.com
Validation: Must be valid email format
```

**Step 2: Enter Password**
```
Input: ••••••••••••
Validation: Minimum 8 characters
Security: Masked with bullets
```

**Step 3: Optional - Remember Me**
```
☑ Remember me
Effect: Extends session to 30 days (default: 7 days)
```

**Step 4: Click "Sign In"**
```
Button: Sign In (gradient blue to green)
Action: Submit credentials to backend
```

#### **Technical Implementation**

**Frontend Code (React):**
```javascript
// SignIn.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login API
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Store token and user data
      const { access_token, user } = response.data;
      
      // Use AuthContext to manage state
      login(access_token, user, rememberMe);

      // Redirect based on role
      if (user.role === 'candidate') {
        navigate('/dashboard');
      } else if (user.role === 'employer') {
        navigate('/company-dashboard');
      }

    } catch (err) {
      // Handle errors
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 404) {
        setError('Account not found. Please sign up first.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

**Backend Code (FastAPI):**
```python
# auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/auth/login")
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(
        User.email == credentials.email
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )
    
    # Verify password
    if not pwd_context.verify(
        credentials.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is disabled"
        )
    
    # Generate JWT token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role,
            "user_id": user.id
        },
        expires_delta=timedelta(days=30 if remember_me else 7)
    )
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Return token and user data
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "profile_complete": user.profile_complete
        }
    }

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return encoded_jwt
```

**API Request/Response:**

**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: hotgigs.ai
Content-Type: application/json

{
  "email": "sarah.johnson@testmail.com",
  "password": "TestPassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYXJhaC5qb2huc29uQHRlc3RtYWlsLmNvbSIsInJvbGUiOiJjYW5kaWRhdGUiLCJ1c2VyX2lkIjoxMjMsImV4cCI6MTczMTYyMzQ1NiwiaWF0IjoxNzI4OTk4ODU2fQ.xyz123abc456...",
  "token_type": "bearer",
  "user": {
    "id": 123,
    "email": "sarah.johnson@testmail.com",
    "full_name": "Sarah Johnson",
    "role": "candidate",
    "profile_complete": true
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid email or password"
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "Account not found"
}
```

---

## 🎯 Post-Login Actions

### **1. Store Authentication Data**

**LocalStorage (Client-side):**
```javascript
// Store JWT token
localStorage.setItem('token', access_token);

// Store user data
localStorage.setItem('user', JSON.stringify(user));

// Store login timestamp
localStorage.setItem('loginTime', Date.now());
```

**Why LocalStorage?**
✅ Persists across browser sessions
✅ Survives page refreshes
✅ Accessible from all pages
✅ Simple to implement

**Security Note:**
- JWT tokens are signed and verified
- Tokens expire after 7-30 days
- HTTPS prevents token interception
- HttpOnly cookies are more secure but harder to implement in SPAs

### **2. Update AuthContext**

**AuthContext manages global authentication state:**
```javascript
// AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = (newToken, newUser, rememberMe) => {
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### **3. Redirect to Dashboard**

**Role-based Routing:**
```javascript
// After successful login
if (user.role === 'candidate') {
  navigate('/dashboard');
} else if (user.role === 'employer') {
  navigate('/company-dashboard');
} else if (user.role === 'admin') {
  navigate('/admin');
}
```

### **4. Update Navigation**

**Navigation changes based on auth state:**

**Logged Out:**
```jsx
<nav>
  <Link to="/">Home</Link>
  <Link to="/jobs">Jobs</Link>
  <Link to="/for-employers">For Employers</Link>
  <Link to="/signin">Sign In</Link>
  <Link to="/signup">Join Now</Link>
</nav>
```

**Logged In (Candidate):**
```jsx
<nav>
  <Link to="/dashboard">Dashboard</Link>
  <Link to="/jobs">Browse Jobs</Link>
  <Link to="/applications">My Applications</Link>
  <Link to="/profile">Profile</Link>
  <button onClick={handleLogout}>Logout</button>
</nav>
```

**Logged In (Employer):**
```jsx
<nav>
  <Link to="/company-dashboard">Dashboard</Link>
  <Link to="/post-job">Post Job</Link>
  <Link to="/candidates">Candidates</Link>
  <Link to="/company-profile">Company Profile</Link>
  <button onClick={handleLogout}>Logout</button>
</nav>
```

---

## 🚪 Logout Process

### **How to Logout**

**Option 1: Profile Dropdown**
1. Click "Profile" button (top right)
2. Dropdown menu appears
3. Click "Logout" option

**Option 2: Settings Page**
1. Navigate to Settings
2. Click "Logout" button at bottom

**Option 3: Automatic Logout**
- Token expires after 7-30 days
- User is automatically logged out
- Redirected to login page

---

### **Logout Implementation**

**Frontend Code:**
```javascript
// Logout function
const handleLogout = () => {
  // Call logout from AuthContext
  logout();
  
  // Optional: Call backend to invalidate token
  api.post('/auth/logout').catch(() => {
    // Ignore errors, logout locally anyway
  });
  
  // Redirect to homepage
  navigate('/');
  
  // Show success message
  toast.success('You have been logged out successfully');
};

// Logout button
<button
  onClick={handleLogout}
  className="logout-button"
>
  <LogOutIcon />
  Logout
</button>
```

**Backend Code (Optional):**
```python
# auth.py
@router.post("/auth/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    # Optional: Add token to blacklist
    # (Requires Redis or database table)
    add_to_token_blacklist(current_user.token)
    
    # Update last logout timestamp
    current_user.last_logout = datetime.utcnow()
    db.commit()
    
    return {"message": "Logged out successfully"}
```

**What Happens During Logout:**

**1. Clear LocalStorage**
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('rememberMe');
localStorage.removeItem('loginTime');
```

**2. Clear AuthContext State**
```javascript
setToken(null);
setUser(null);
setIsAuthenticated(false);
```

**3. Redirect to Homepage**
```javascript
navigate('/');
```

**4. Show Confirmation**
```javascript
toast.success('You have been logged out successfully');
```

---

## 🔒 Session Management

### **JWT Token Structure**

**Token Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzYXJhaC5qb2huc29uQHRlc3RtYWlsLmNvbSIsInJvbGUiOiJjYW5kaWRhdGUiLCJ1c2VyX2lkIjoxMjMsImV4cCI6MTczMTYyMzQ1NiwiaWF0IjoxNzI4OTk4ODU2fQ.xyz123abc456...

[Header].[Payload].[Signature]
```

**Decoded Token:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "sarah.johnson@testmail.com",
    "role": "candidate",
    "user_id": 123,
    "exp": 1731623456,
    "iat": 1728998856
  },
  "signature": "xyz123abc456..."
}
```

### **Token Validation**

**Every API Request:**
```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

**Backend Validation:**
```python
# security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    
    try:
        # Decode and verify token
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )
        
        email: str = payload.get("sub")
        
        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )
    
    # Get user from database
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Inactive user"
        )
    
    return user
```

### **Protected Routes**

**Frontend (React Router):**
```javascript
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage in App.jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute requiredRole="candidate">
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/company-dashboard"
  element={
    <ProtectedRoute requiredRole="employer">
      <CompanyDashboard />
    </ProtectedRoute>
  }
/>
```

**Backend (FastAPI):**
```python
# Protected endpoint example
@router.get("/candidates/profile")
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    # User is automatically authenticated
    # current_user contains user data
    
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == current_user.id
    ).first()
    
    return profile
```

### **Token Expiration Handling**

**Automatic Refresh (Optional):**
```javascript
// Check token expiration before each request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Decode token to check expiration
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    
    // If token expires in less than 5 minutes, refresh it
    if (decoded.exp - now < 300) {
      try {
        const response = await axios.post('/auth/refresh', { token });
        const newToken = response.data.access_token;
        localStorage.setItem('token', newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
      } catch (error) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});
```

---

## 🔐 Security Features

### **Password Security**

**Hashing with Bcrypt:**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash password during registration
hashed_password = pwd_context.hash(plain_password)

# Verify password during login
is_valid = pwd_context.verify(plain_password, hashed_password)
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Frontend Validation:**
```javascript
const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
    errors: {
      minLength: !minLength,
      hasUppercase: !hasUppercase,
      hasLowercase: !hasLowercase,
      hasNumber: !hasNumber,
      hasSpecial: !hasSpecial
    }
  };
};
```

### **HTTPS Encryption**

**All communication encrypted:**
```
Client ←→ HTTPS ←→ Server
```

**Benefits:**
✅ Passwords encrypted in transit
✅ Tokens encrypted in transit
✅ Prevents man-in-the-middle attacks
✅ Required for OAuth providers

### **CSRF Protection**

**Cross-Site Request Forgery prevention:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://hotgigs.ai"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### **Rate Limiting**

**Prevent brute force attacks:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(request: Request, credentials: LoginRequest):
    # Login logic
    pass
```

### **Account Lockout**

**After failed login attempts:**
```python
# Track failed attempts
user.failed_login_attempts += 1

if user.failed_login_attempts >= 5:
    user.is_locked = True
    user.locked_until = datetime.utcnow() + timedelta(minutes=30)
    db.commit()
    
    raise HTTPException(
        status_code=403,
        detail="Account locked due to too many failed login attempts. Try again in 30 minutes."
    )

# Reset on successful login
user.failed_login_attempts = 0
user.is_locked = False
```

---

## 🔧 Troubleshooting

### **Common Login Issues**

#### **Issue 1: "Invalid email or password"**

**Causes:**
- Wrong email address
- Wrong password
- Typo in credentials
- Caps Lock is on

**Solutions:**
1. Double-check email spelling
2. Try "Forgot password?" link
3. Check Caps Lock
4. Try copying/pasting credentials

#### **Issue 2: "Account not found"**

**Causes:**
- Email not registered
- Typo in email
- Used different email to register

**Solutions:**
1. Click "Sign up now" to create account
2. Check if you used a different email
3. Try social login (Google, LinkedIn)

#### **Issue 3: "Token has expired"**

**Causes:**
- Session expired (7-30 days)
- Token manually deleted
- Browser cleared cache

**Solutions:**
1. Simply log in again
2. Check "Remember me" for longer sessions
3. Enable auto-login in settings

#### **Issue 4: "Account is disabled"**

**Causes:**
- Account suspended by admin
- Email not verified
- Terms of service violation

**Solutions:**
1. Check email for verification link
2. Contact support: support@hotgigs.ai
3. Review terms of service

#### **Issue 5: Social login not working**

**Causes:**
- Popup blocked
- Third-party cookies disabled
- OAuth provider down

**Solutions:**
1. Allow popups for hotgigs.ai
2. Enable third-party cookies
3. Try email/password login instead
4. Try different browser

---

## 📊 Login Analytics

### **Tracking Login Events**

**Backend logging:**
```python
@router.post("/auth/login")
async def login(credentials: LoginRequest, request: Request):
    # ... authentication logic ...
    
    # Log successful login
    log_event(
        event_type="login_success",
        user_id=user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        timestamp=datetime.utcnow()
    )
    
    return {"access_token": token, "user": user_data}
```

**Metrics tracked:**
- Total logins per day
- Login success rate
- Average login time
- Most used login method (email vs social)
- Failed login attempts
- Geographic distribution
- Device types (mobile, desktop, tablet)

---

## 📱 Mobile Considerations

### **Responsive Login Page**

**Mobile optimizations:**
- Larger touch targets (buttons)
- Simplified layout
- Auto-focus on email field
- Show/hide password toggle
- Remember device option
- Biometric authentication (future)

### **Mobile-specific Features**

**Planned features:**
- Face ID / Touch ID login
- SMS verification
- Push notifications for login alerts
- "Remember this device" option

---

## 🎯 Best Practices

### **For Users:**

1. **Use strong passwords**
   - At least 12 characters
   - Mix of letters, numbers, symbols
   - Unique for each site

2. **Enable "Remember me" on trusted devices**
   - Saves time on frequent logins
   - Only use on personal devices

3. **Use social login for convenience**
   - Faster than email/password
   - One less password to remember
   - Auto-import profile data

4. **Log out on shared computers**
   - Always log out on public/shared devices
   - Clear browser data after use

5. **Keep email secure**
   - Use 2FA on email account
   - Don't share email password
   - Monitor for suspicious activity

### **For Developers:**

1. **Never store passwords in plain text**
   - Always use bcrypt or similar
   - Use high cost factor (12+)

2. **Use HTTPS everywhere**
   - Encrypt all traffic
   - Get SSL certificate
   - Redirect HTTP to HTTPS

3. **Implement rate limiting**
   - Prevent brute force attacks
   - Limit login attempts
   - Add CAPTCHA after failures

4. **Log security events**
   - Track failed logins
   - Monitor suspicious activity
   - Alert on anomalies

5. **Keep dependencies updated**
   - Regular security patches
   - Monitor for vulnerabilities
   - Use automated tools (Dependabot)

---

## 📞 Support

**Need help with login?**

- 💬 Chat with Orion (24/7 AI support)
- 📧 Email: support@hotgigs.ai
- 📚 Help Center: hotgigs.ai/help
- 🎥 Video Tutorial: hotgigs.ai/tutorials/login

---

**Last Updated:** October 15, 2025
**Version:** 1.0
**Platform:** HotGigs.ai

