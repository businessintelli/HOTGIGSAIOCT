import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Connections from './pages/Connections'
import CompanyDashboard from './pages/CompanyDashboard'
import PostJob from './pages/PostJob'
import AIFeatures from './pages/AIFeatures'
import JobApplications from './pages/JobApplications'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/ai-features" element={<AIFeatures />} />
          <Route path="/jobs/:jobId/applications" element={<JobApplications />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

