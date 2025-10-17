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
import JobCreationChoice from './pages/JobCreationChoice'
import AIJobGenerator from './pages/AIJobGenerator'
import AIFeatures from './pages/AIFeatures'
import JobApplications from './pages/JobApplications'
import JobDetail from './pages/JobDetailEnhanced'
import CompanyProfile from './pages/CompanyProfile'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import AIAgent from './pages/AIAgent'
import Blog from './pages/Blog'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import EmailPreferences from './pages/EmailPreferences'
import EmailAnalytics from './pages/EmailAnalytics'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOverview from './pages/admin/AdminOverview'
import EmailTemplates from './pages/admin/EmailTemplates'
import Configuration from './pages/admin/Configuration'
import APIKeys from './pages/admin/APIKeys'
import EmailLogs from './pages/admin/EmailLogs'
import SystemHealth from './pages/admin/SystemHealth'
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
          <Route path="/create-job" element={<JobCreationChoice />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/ai-job-generator" element={<AIJobGenerator />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          <Route path="/ai-features" element={<AIFeatures />} />
          <Route path="/jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="/job/:jobId" element={<JobDetail />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/ai-agent" element={<AIAgent />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/email-preferences" element={<EmailPreferences />} />
          <Route path="/email-analytics" element={<EmailAnalytics />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="config" element={<Configuration />} />
            <Route path="api-keys" element={<APIKeys />} />
            <Route path="email-logs" element={<EmailLogs />} />
            <Route path="system-health" element={<SystemHealth />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

