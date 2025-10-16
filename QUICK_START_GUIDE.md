# HotGigs.ai - Quick Start Guide

## Current System Status

### ✅ Services Running

**Frontend (Production Build)**
- **Port:** 5173
- **URL:** https://5173-ieax82bblh1eijfgixov5-97ad08b4.manusvm.computer
- **Process:** serve (PID: 41102)
- **Status:** Running and stable

**Backend (Flask API)**
- **Port:** 8000
- **Process:** uvicorn (PID: 37967)
- **Status:** Running with auto-reload
- **API Base:** http://localhost:8000

---

## Quick Commands

### Check Service Status
```bash
# Check frontend
curl -I http://localhost:5173/

# Check backend
curl http://localhost:8000/api/health

# View running processes
ps aux | grep -E "(serve|uvicorn)" | grep -v grep
```

### Restart Services

**Frontend:**
```bash
cd /home/ubuntu/hotgigs/hotgigs-frontend

# Kill existing serve process
pkill -f "serve -s dist"

# Rebuild (if code changed)
pnpm build

# Start serve
serve -s dist -l 5173 > /tmp/serve.log 2>&1 &

# Check logs
tail -f /tmp/serve.log
```

**Backend:**
```bash
cd /home/ubuntu/hotgigs/backend

# Kill existing uvicorn process
pkill -f uvicorn

# Start backend
python3.11 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &

# Check logs
tail -f /tmp/backend.log
```

---

## Development Workflow

### Making Frontend Changes

1. **Edit Files:**
   ```bash
   cd /home/ubuntu/hotgigs/hotgigs-frontend/src
   # Edit your files (pages, components, etc.)
   ```

2. **Rebuild:**
   ```bash
   cd /home/ubuntu/hotgigs/hotgigs-frontend
   pnpm build
   ```

3. **Restart Frontend (if needed):**
   ```bash
   pkill -f "serve -s dist"
   serve -s dist -l 5173 > /tmp/serve.log 2>&1 &
   ```

4. **Test:**
   - Open browser to: https://5173-ieax82bblh1eijfgixov5-97ad08b4.manusvm.computer
   - Hard refresh: Ctrl+Shift+R (to clear cache)

### Making Backend Changes

1. **Edit Files:**
   ```bash
   cd /home/ubuntu/hotgigs/backend/src
   # Edit your Python files
   ```

2. **Auto-reload:**
   - Backend has auto-reload enabled
   - Changes are automatically detected and reloaded
   - No manual restart needed

3. **Test API:**
   ```bash
   # Test endpoint
   curl http://localhost:8000/api/endpoint
   ```

---

## Test Accounts

### Company/Recruiter Account
- **Email:** company@test.com
- **Password:** password123
- **Role:** Company/Recruiter
- **Access:** Company Dashboard, Job Management, Applications

### Job Seeker Account
- **Email:** jobseeker@test.com
- **Password:** password123
- **Role:** Job Seeker
- **Access:** Job Search, Applications, Profile

---

## Project Structure

```
/home/ubuntu/hotgigs/
├── hotgigs-frontend/          # React frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   │   ├── CompanyDashboard.jsx
│   │   │   ├── JobSeekerDashboard.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── CreateJob.jsx
│   │   ├── components/        # Reusable components
│   │   │   ├── OrionChat.jsx
│   │   │   └── ui/            # shadcn components
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── lib/               # Utilities
│   │   │   └── localJobsService.js
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── dist/                  # Production build
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Flask backend
│   ├── src/
│   │   ├── main.py            # Main Flask app
│   │   ├── routes/            # API routes
│   │   ├── models/            # Data models
│   │   └── services/          # Business logic
│   └── requirements.txt
│
├── PROGRESS_REPORT.md         # Detailed progress report
└── QUICK_START_GUIDE.md       # This file
```

---

## Key Files to Know

### Frontend

**CompanyDashboard.jsx** - Main dashboard for recruiters
- Location: `src/pages/CompanyDashboard.jsx`
- Features: Job filtering, application management, analytics
- Recent changes: Added job filtering functionality

**AuthContext.jsx** - Authentication state management
- Location: `src/contexts/AuthContext.jsx`
- Manages: Login, logout, user state

**localJobsService.js** - Mock data service
- Location: `src/lib/localJobsService.js`
- Contains: Sample jobs and applications data

### Backend

**main.py** - Flask application entry point
- Location: `backend/src/main.py`
- Defines: API routes, CORS, middleware

---

## Common Tasks

### Add a New Page

1. Create component:
   ```bash
   cd /home/ubuntu/hotgigs/hotgigs-frontend/src/pages
   touch NewPage.jsx
   ```

2. Add route in `App.jsx`:
   ```javascript
   <Route path="/new-page" element={<NewPage />} />
   ```

3. Rebuild and test

### Add a New API Endpoint

1. Create route:
   ```bash
   cd /home/ubuntu/hotgigs/backend/src/routes
   # Edit or create route file
   ```

2. Register in `main.py`:
   ```python
   from routes.new_route import new_blueprint
   app.register_blueprint(new_blueprint)
   ```

3. Test endpoint:
   ```bash
   curl http://localhost:8000/api/new-endpoint
   ```

### Install New Package

**Frontend:**
```bash
cd /home/ubuntu/hotgigs/hotgigs-frontend
pnpm add package-name
pnpm build
```

**Backend:**
```bash
cd /home/ubuntu/hotgigs/backend
pip3 install package-name
# Add to requirements.txt
echo "package-name==version" >> requirements.txt
```

---

## Troubleshooting

### Frontend Not Loading

1. **Check if serve is running:**
   ```bash
   ps aux | grep serve | grep -v grep
   ```

2. **Check port 5173:**
   ```bash
   netstat -tulpn | grep 5173
   ```

3. **Restart serve:**
   ```bash
   pkill -f "serve -s dist"
   serve -s dist -l 5173 > /tmp/serve.log 2>&1 &
   ```

4. **Check logs:**
   ```bash
   tail -20 /tmp/serve.log
   ```

### Backend Not Responding

1. **Check if uvicorn is running:**
   ```bash
   ps aux | grep uvicorn | grep -v grep
   ```

2. **Check port 8000:**
   ```bash
   netstat -tulpn | grep 8000
   ```

3. **Restart backend:**
   ```bash
   pkill -f uvicorn
   cd /home/ubuntu/hotgigs/backend
   python3.11 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &
   ```

4. **Check logs:**
   ```bash
   tail -50 /tmp/backend.log
   ```

### Build Errors

1. **Check for syntax errors:**
   ```bash
   cd /home/ubuntu/hotgigs/hotgigs-frontend
   pnpm build
   # Read error messages carefully
   ```

2. **Common issues:**
   - Missing imports
   - Undefined variables
   - Component syntax errors

3. **Fix and rebuild:**
   ```bash
   # Fix the errors
   pnpm build
   ```

### CORS Errors

1. **Check backend CORS configuration:**
   ```python
   # In backend/src/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Or specific origins
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Restart backend after changes**

---

## Next Development Tasks

### Phase 3 - Company Portal (Continued)

#### 1. Analytics Dashboard 📊
**Priority:** High  
**Estimated Time:** 4-6 hours

**Tasks:**
- [ ] Install chart library (recharts or chart.js)
- [ ] Create analytics data service
- [ ] Build job performance charts
- [ ] Implement pipeline visualization
- [ ] Add date range filters
- [ ] Create export functionality

**Files to Create/Modify:**
- `src/components/AnalyticsDashboard.jsx`
- `src/components/charts/JobPerformanceChart.jsx`
- `src/components/charts/PipelineChart.jsx`
- `src/lib/analyticsService.js`

#### 2. Applicant Management 👥
**Priority:** High  
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Add bulk selection checkboxes
- [ ] Implement bulk actions (status update, email)
- [ ] Create advanced filter sidebar
- [ ] Build candidate comparison view
- [ ] Add search functionality
- [ ] Implement sorting options

**Files to Create/Modify:**
- `src/components/BulkActionsBar.jsx`
- `src/components/AdvancedFilters.jsx`
- `src/components/CandidateComparison.jsx`
- `src/pages/CompanyDashboard.jsx` (enhance Applications tab)

#### 3. Team Management 🤝
**Priority:** Medium  
**Estimated Time:** 4-5 hours

**Tasks:**
- [ ] Create team management page
- [ ] Build member invitation system
- [ ] Implement role-based permissions
- [ ] Add job assignment feature
- [ ] Create activity log
- [ ] Build team analytics

**Files to Create:**
- `src/pages/TeamManagement.jsx`
- `src/components/TeamMemberCard.jsx`
- `src/components/InviteMemberModal.jsx`
- `src/lib/teamService.js`

---

## Useful Commands Reference

### Git Operations
```bash
# Initialize git (if not already done)
cd /home/ubuntu/hotgigs
git init
git add .
git commit -m "Initial commit"

# Create .gitignore
cat > .gitignore << EOF
node_modules/
dist/
*.log
.env
__pycache__/
*.pyc
EOF
```

### Package Management
```bash
# Frontend
pnpm install          # Install dependencies
pnpm add <package>    # Add package
pnpm remove <package> # Remove package
pnpm build            # Build for production
pnpm dev              # Start dev server (currently not working)

# Backend
pip3 list             # List installed packages
pip3 install <package># Install package
pip3 freeze > requirements.txt  # Save dependencies
```

### Process Management
```bash
# List all node processes
ps aux | grep node

# List all python processes
ps aux | grep python

# Kill process by PID
kill -9 <PID>

# Kill process by name
pkill -f <process_name>

# Check ports in use
netstat -tulpn | grep LISTEN
```

### Logs
```bash
# Frontend logs
tail -f /tmp/serve.log
tail -f /tmp/frontend.log

# Backend logs
tail -f /tmp/backend.log

# System logs
journalctl -f
```

---

## Environment Variables

### Frontend (.env)
```bash
# Create .env file in frontend directory
cd /home/ubuntu/hotgigs/hotgigs-frontend
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=HotGigs.ai
EOF
```

### Backend (.env)
```bash
# Create .env file in backend directory
cd /home/ubuntu/hotgigs/backend
cat > .env << EOF
DATABASE_URL=sqlite:///./hotgigs.db
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
ENVIRONMENT=development
EOF
```

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out
- [ ] Role-based redirect

**Company Dashboard:**
- [ ] View statistics
- [ ] Switch between tabs
- [ ] Filter jobs (All vs My Jobs)
- [ ] View applications
- [ ] Update application status
- [ ] Search candidates

**Job Seeker Dashboard:**
- [ ] Browse jobs
- [ ] Apply to job
- [ ] View application status
- [ ] Update profile

### API Testing
```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"company@test.com","password":"password123"}'

# Get jobs
curl http://localhost:8000/api/jobs \
  -H "Authorization: Bearer <token>"
```

---

## Performance Optimization Tips

1. **Code Splitting:**
   ```javascript
   // Use React.lazy for route-based splitting
   const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'))
   ```

2. **Memoization:**
   ```javascript
   // Use useMemo for expensive calculations
   const filteredJobs = useMemo(() => {
     return jobs.filter(/* ... */)
   }, [jobs, filters])
   ```

3. **Debouncing:**
   ```javascript
   // Debounce search input
   const debouncedSearch = useDebounce(searchQuery, 300)
   ```

4. **Image Optimization:**
   - Use WebP format
   - Lazy load images
   - Compress images before upload

---

## Resources

### Documentation
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flask Docs](https://flask.palletsprojects.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)

### UI Components
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI](https://www.radix-ui.com/)

### Charts & Visualizations
- [Recharts](https://recharts.org/)
- [Chart.js](https://www.chartjs.org/)
- [D3.js](https://d3js.org/)

### State Management
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Query](https://tanstack.com/query/latest)

---

## Support & Help

### Common Questions

**Q: Why use production build instead of dev server?**
A: Vite dev server was experiencing hanging issues in the current environment. Production build with `serve` provides stable, reliable access for testing.

**Q: How do I add a new feature?**
A: 
1. Create/modify components in `src/`
2. Run `pnpm build`
3. Restart serve if needed
4. Test in browser

**Q: Where is the database?**
A: Currently using in-memory mock data. Database integration is planned for future phases.

**Q: How do I deploy to production?**
A: See PROGRESS_REPORT.md "Deployment Readiness" section for full checklist.

---

**Last Updated:** October 16, 2025  
**Version:** 1.0  
**Maintainer:** Development Team


