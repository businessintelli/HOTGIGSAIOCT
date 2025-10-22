# Admin Dashboard Menu Structure

## Current Admin Dashboard Menu

The HotGigs.ai Admin Dashboard has **9 menu items** in the left sidebar:

### 1. 📊 Overview
- **Path:** `/admin/dashboard`
- **Icon:** LayoutDashboard
- **Description:** System statistics and recent activity
- **Component:** AdminOverview

### 2. 🗄️ Master Database ← **CANDIDATES MENU**
- **Path:** `/admin/candidates`
- **Icon:** Database
- **Description:** View all candidates across all recruiters
- **Component:** CandidateDatabase (with isAdmin={true})
- **Features:**
  - View all candidates (not privacy-isolated)
  - Share candidates with recruiters
  - Set permissions
  - Transfer ownership
  - Complete audit trail

### 3. ✉️ Email Templates
- **Path:** `/admin/email-templates`
- **Icon:** Mail
- **Description:** Create and edit email templates
- **Component:** EmailTemplates

### 4. 📄 Email Logs
- **Path:** `/admin/email-logs`
- **Icon:** FileText
- **Description:** Track email delivery and failures
- **Component:** EmailLogs

### 5. ⚠️ Error Logs
- **Path:** `/admin/error-logs`
- **Icon:** AlertTriangle
- **Description:** Monitor application errors
- **Component:** ErrorLogs

### 6. ⚙️ Configuration
- **Path:** `/admin/config`
- **Icon:** Settings
- **Description:** Manage environment variables
- **Component:** Configuration

### 7. 🔑 API Keys
- **Path:** `/admin/api-keys`
- **Icon:** Key
- **Description:** Generate and manage API keys
- **Component:** APIKeys

### 8. 🏥 System Health
- **Path:** `/admin/system-health`
- **Icon:** Activity
- **Description:** Monitor system services
- **Component:** SystemHealth

### 9. 📈 Analytics
- **Path:** `/admin/analytics`
- **Icon:** BarChart3
- **Description:** View system analytics
- **Component:** (To be implemented)

---

## Master Database (Candidates) Features

When you click on **"Master Database"** in the admin menu, you'll see:

### Header
- **Title:** "Master Candidate Database"
- **Subtitle:** "View and manage all candidates across all recruiters"
- **Actions:**
  - "Import Resumes" button
  - "Share Candidate" button

### Statistics Dashboard (4 cards)
1. **Total Candidates:** All candidates in system
2. **This Week:** New candidates this week
3. **Active Recruiters:** Number of recruiters with candidates
4. **Avg Match Score:** Average match score across all candidates

### Search & Filters
- **Search bar:** Search by name, email, title
- **Recruiter filter:** Filter by recruiter (dropdown with all recruiters)
- **Source filter:** Applications, Resume Import, Bulk Upload, Google Drive, Admin Share
- **Status filter:** Active, Archived, Shared
- **Date range:** Filter by date added
- **More Filters:** Advanced filtering options

### Candidate Table

**Columns:**
1. **Candidate** - Name, email, title
2. **Skills** - Top skills (badges)
3. **Experience** - Years of experience
4. **Added By** - Recruiter who added the candidate
5. **Source** - How candidate was added
6. **Added Date** - When candidate was added
7. **Matches** - Number of job matches
8. **Actions** - View, Share, Edit, Delete

### Candidate Actions

**For each candidate, admin can:**
1. **View Details** - See full candidate profile
2. **Share with Recruiter** - Give access to specific recruiter
3. **Set Permissions** - Read-only or full access
4. **Transfer Ownership** - Change candidate owner
5. **View Activity** - See all actions on candidate
6. **Edit Profile** - Update candidate information
7. **Delete** - Remove candidate (with confirmation)

### Sharing Workflow

**When admin clicks "Share":**
1. Modal opens with recruiter selection
2. Admin selects recruiter(s) to share with
3. Admin sets permission level:
   - **Read-only:** Can view but not edit
   - **Full access:** Can view and edit
   - **Owner:** Transfer full ownership
4. Admin adds optional note
5. Click "Share Candidate"
6. Recruiter receives notification
7. Candidate appears in recruiter's dashboard

### Privacy Controls

**Admin can see:**
- All candidates from all recruiters
- Who added each candidate
- Who has access to each candidate
- All activity on each candidate

**Recruiter can see:**
- Only their own candidates
- Candidates shared with them by admin
- Cannot see other recruiters' candidates

---

## How to Access Master Database

### Method 1: Direct URL
```
http://localhost:3000/admin/candidates
```

### Method 2: Via Admin Dashboard
1. Login to admin portal: `http://localhost:3000/admin/login`
2. Enter credentials (admin / admin123)
3. Click "Sign In to Admin Portal"
4. Look at left sidebar
5. Click on **"Master Database"** (2nd menu item)
6. You'll see all candidates

### Method 3: Via Demo
```
http://localhost:3000/admin-demo
```
(Demo doesn't show Master Database, only monitoring features)

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                    [Logout] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  Sidebar     │  Main Content Area                           │
│              │                                               │
│  📊 Overview │  ┌──────────────────────────────────────┐   │
│              │  │  Master Candidate Database           │   │
│  🗄️ Master   │  │  View and manage all candidates      │   │
│   Database   │  └──────────────────────────────────────┘   │
│  ← THIS!     │                                               │
│              │  ┌─────┬─────┬─────┬─────┐                  │
│  ✉️ Email    │  │Total│Week │Rcrt │Avg  │                  │
│   Templates  │  │ 247 │ 12  │ 8   │78%  │                  │
│              │  └─────┴─────┴─────┴─────┘                  │
│  📄 Email    │                                               │
│   Logs       │  [Search] [Recruiter▼] [Source▼] [Filters]  │
│              │                                               │
│  ⚠️ Error    │  ┌──────────────────────────────────────┐   │
│   Logs       │  │ Candidate | Skills | Exp | Added By  │   │
│              │  ├──────────────────────────────────────┤   │
│  ⚙️ Config   │  │ John Doe  | React  | 5yr | Alice     │   │
│              │  │ Jane Smith| Python | 3yr | Bob       │   │
│  🔑 API Keys │  │ ...                                   │   │
│              │  └──────────────────────────────────────┘   │
│  🏥 System   │                                               │
│   Health     │  [View] [Share] [Edit] [Delete]              │
│              │                                               │
│  📈 Analytics│                                               │
│              │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

---

## Code Implementation

### AdminDashboard.jsx (Menu Definition)

```jsx
const menuItems = [
  {
    title: 'Overview',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/admin/dashboard',
    exact: true
  },
  {
    title: 'Master Database',  // ← CANDIDATES MENU
    icon: <Database className="w-5 h-5" />,
    path: '/admin/candidates'
  },
  {
    title: 'Email Templates',
    icon: <Mail className="w-5 h-5" />,
    path: '/admin/email-templates'
  },
  // ... more menu items
];
```

### App.jsx (Route Definition)

```jsx
<Route path="/admin" element={<AdminDashboard />}>
  <Route index element={<AdminOverview />} />
  <Route path="dashboard" element={<AdminOverview />} />
  <Route path="email-templates" element={<EmailTemplates />} />
  <Route path="config" element={<Configuration />} />
  <Route path="api-keys" element={<APIKeys />} />
  <Route path="email-logs" element={<EmailLogs />} />
  <Route path="error-logs" element={<ErrorLogs />} />
  <Route path="system-health" element={<SystemHealth />} />
  <Route path="candidates" element={<CandidateDatabase isAdmin={true} />} />
  {/* ↑ MASTER DATABASE ROUTE */}
</Route>
```

### CandidateDatabase.jsx (Component)

```jsx
const CandidateDatabase = ({ isAdmin = false }) => {
  // If isAdmin={true}, show all candidates
  // If isAdmin={false}, show only recruiter's candidates
  
  const fetchCandidates = async () => {
    const endpoint = isAdmin 
      ? '/api/resumes/admin/candidates'  // All candidates
      : '/api/resumes/candidates';       // Only mine
    
    const response = await api.get(endpoint);
    setCandidates(response.data);
  };
  
  return (
    <div>
      <h1>{isAdmin ? 'Master Candidate Database' : 'My Candidates'}</h1>
      {/* ... rest of component */}
    </div>
  );
};
```

---

## Verification Steps

To verify the Master Database menu is working:

### Step 1: Check Menu Definition
```bash
grep -A 5 "Master Database" /home/ubuntu/hotgigs/hotgigs-frontend/src/pages/admin/AdminDashboard.jsx
```

**Expected output:**
```jsx
{
  title: 'Master Database',
  icon: <Database className="w-5 h-5" />,
  path: '/admin/candidates'
},
```

### Step 2: Check Route Registration
```bash
grep "candidates.*isAdmin" /home/ubuntu/hotgigs/hotgigs-frontend/src/App.jsx
```

**Expected output:**
```jsx
<Route path="candidates" element={<CandidateDatabase isAdmin={true} />} />
```

### Step 3: Access Admin Dashboard
1. Open: `http://localhost:3000/admin/login`
2. Login with: admin / admin123
3. Look at sidebar
4. You should see "Master Database" as 2nd menu item

### Step 4: Click Master Database
1. Click on "Master Database" menu item
2. URL should change to: `http://localhost:3000/admin/candidates`
3. You should see: "Master Candidate Database" page
4. With all candidates from all recruiters

---

## Troubleshooting

### If you don't see the menu:

**1. Check if sidebar is collapsed:**
- Look for hamburger menu icon
- Click to expand sidebar
- Menu items should appear

**2. Check if you're logged in as admin:**
- Admin login: `http://localhost:3000/admin/login`
- Regular user login: `http://localhost:3000/login`
- Make sure you're using admin login

**3. Clear browser cache:**
```bash
# In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

**4. Rebuild frontend:**
```bash
cd /home/ubuntu/hotgigs/hotgigs-frontend
npm run build
cd dist
serve -s . -l 3000
```

**5. Check browser console for errors:**
- Press F12
- Go to Console tab
- Look for React errors

---

## Summary

✅ **Master Database menu IS implemented**
- Menu item: "Master Database" (2nd position)
- Icon: Database
- Path: `/admin/candidates`
- Component: CandidateDatabase with isAdmin={true}

✅ **Route IS registered**
- In App.jsx under /admin routes
- Uses CandidateDatabase component
- Passes isAdmin={true} prop

✅ **Component IS created**
- CandidateDatabase.jsx exists
- Supports both admin and recruiter modes
- Shows all candidates when isAdmin={true}

**To access:**
1. Login to admin: `http://localhost:3000/admin/login`
2. Click "Master Database" in sidebar
3. View all candidates

The menu is there! If you're not seeing it, it might be a login issue or sidebar collapsed. Let me know what you see when you login to the admin dashboard.

