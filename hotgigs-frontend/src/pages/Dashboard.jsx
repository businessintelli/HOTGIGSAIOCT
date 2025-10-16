import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, Briefcase, FileText, Users, TrendingUp, ChevronDown, LogOut, User, Settings,
  Eye, Calendar, Mail, CheckCircle, XCircle, Clock, Building, MapPin, DollarSign,
  MessageSquare, Bell, Video, Phone, ArrowRight, TrendingDown, Award
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import OrionChat from '../components/OrionChat'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showOrionChat, setShowOrionChat] = useState(false)
  const [minimizeOrionChat, setMinimizeOrionChat] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - replace with API calls
  const stats = {
    profile_views: 156,
    profile_views_this_week: 23,
    applications_submitted: 12,
    applications_in_review: 5,
    interviews_scheduled: 2,
    offers_received: 1,
    invitations_pending: 3
  }

  const profileViewers = [
    { id: '1', recruiter_name: 'Sarah Johnson', company: 'TechCorp Inc.', viewed_at: '2 hours ago', profile_pic: null },
    { id: '2', recruiter_name: 'Michael Chen', company: 'StartupXYZ', viewed_at: '5 hours ago', profile_pic: null },
    { id: '3', recruiter_name: 'Emily Rodriguez', company: 'Global Solutions', viewed_at: '1 day ago', profile_pic: null },
    { id: '4', recruiter_name: 'David Kim', company: 'Innovation Labs', viewed_at: '2 days ago', profile_pic: null }
  ]

  const recruiterInvitations = [
    { 
      id: '1', 
      job_title: 'Senior Full Stack Developer', 
      company: 'TechCorp Inc.', 
      recruiter_name: 'Sarah Johnson',
      location: 'San Francisco, CA',
      salary_range: '$120k - $180k',
      invited_at: '1 day ago',
      status: 'pending'
    },
    { 
      id: '2', 
      job_title: 'React Native Developer', 
      company: 'Mobile First', 
      recruiter_name: 'James Wilson',
      location: 'Remote',
      salary_range: '$100k - $150k',
      invited_at: '3 days ago',
      status: 'pending'
    }
  ]

  const upcomingInterviews = [
    {
      id: '1',
      job_title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      interview_type: 'video',
      scheduled_at: '2025-01-18 10:00 AM',
      duration: '60 min',
      interviewer: 'Sarah Johnson',
      meeting_link: 'https://zoom.us/j/123456789'
    },
    {
      id: '2',
      job_title: 'Frontend Developer',
      company: 'StartupXYZ',
      interview_type: 'phone',
      scheduled_at: '2025-01-20 2:00 PM',
      duration: '30 min',
      interviewer: 'Michael Chen',
      phone: '+1 (555) 123-4567'
    }
  ]

  const applicationStatuses = [
    {
      id: '1',
      job_title: 'Senior Full Stack Developer',
      company: 'TechCorp Inc.',
      applied_at: '2025-01-10',
      status: 'interview_scheduled',
      last_updated: '2025-01-15',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      job_title: 'React Developer',
      company: 'StartupXYZ',
      applied_at: '2025-01-08',
      status: 'in_review',
      last_updated: '2025-01-14',
      location: 'Remote'
    },
    {
      id: '3',
      job_title: 'Frontend Engineer',
      company: 'Innovation Labs',
      applied_at: '2025-01-05',
      status: 'offered',
      last_updated: '2025-01-13',
      location: 'New York, NY',
      offer_amount: '$140,000'
    },
    {
      id: '4',
      job_title: 'UI/UX Developer',
      company: 'Design Studio',
      applied_at: '2025-01-03',
      status: 'rejected',
      last_updated: '2025-01-12',
      location: 'Austin, TX'
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800', icon: Eye },
      interview_scheduled: { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800', icon: Calendar },
      offered: { label: 'Offer Received', color: 'bg-green-100 text-green-800', icon: Award },
      rejected: { label: 'Not Selected', color: 'bg-red-100 text-red-800', icon: XCircle },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getInterviewIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5 text-blue-600" />
      case 'phone': return <Phone className="h-5 w-5 text-green-600" />
      case 'in_person': return <Users className="h-5 w-5 text-purple-600" />
      default: return <Calendar className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HotGigs.ai
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/jobs">
                <Button variant="ghost">Browse Jobs</Button>
              </Link>
              
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowProfileMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings')
                        setShowProfileMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name || 'Candidate'}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your job search</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.profile_views}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.profile_views_this_week} this week
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.applications_submitted}</p>
                <p className="text-xs text-blue-600 mt-1">{stats.applications_in_review} in review</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.interviews_scheduled}</p>
                <p className="text-xs text-purple-600 mt-1">Upcoming</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Job Invitations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.invitations_pending}</p>
                <p className="text-xs text-orange-600 mt-1">Pending response</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {['overview', 'applications', 'interviews', 'invitations', 'profile_views'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upcoming Interviews */}
            {(activeTab === 'overview' || activeTab === 'interviews') && upcomingInterviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Upcoming Interviews
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-4">
                  {upcomingInterviews.map(interview => (
                    <div key={interview.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          {getInterviewIcon(interview.interview_type)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{interview.job_title}</h3>
                            <p className="text-sm text-gray-600">{interview.company}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {interview.scheduled_at}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {interview.duration}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              with {interview.interviewer}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600">
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiter Invitations */}
            {(activeTab === 'overview' || activeTab === 'invitations') && recruiterInvitations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-orange-600" />
                    Job Invitations from Recruiters
                  </h2>
                </div>
                <div className="space-y-4">
                  {recruiterInvitations.map(invitation => (
                    <div key={invitation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{invitation.job_title}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Building className="h-4 w-4" />
                            {invitation.company}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">Invited</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {invitation.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {invitation.salary_range}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        Invited by {invitation.recruiter_name} • {invitation.invited_at}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-green-600">
                          View & Apply
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Status */}
            {(activeTab === 'overview' || activeTab === 'applications') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Application Status
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-3">
                  {applicationStatuses.map(app => (
                    <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{app.job_title}</h3>
                          <p className="text-sm text-gray-600">{app.company}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Applied: {app.applied_at}</span>
                        <span>•</span>
                        <span>Updated: {app.last_updated}</span>
                      </div>
                      {app.offer_amount && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800 font-semibold">
                            Offer: {app.offer_amount}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Profile Views */}
            {(activeTab === 'overview' || activeTab === 'profile_views') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Who Viewed Your Profile
                </h2>
                <div className="space-y-3">
                  {profileViewers.map(viewer => (
                    <div key={viewer.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{viewer.recruiter_name}</p>
                        <p className="text-xs text-gray-600">{viewer.company}</p>
                        <p className="text-xs text-gray-500">{viewer.viewed_at}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  View All Viewers
                </Button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/jobs')}
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button
                  onClick={() => setShowOrionChat(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Chat with Orion AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orion Chat */}
      {showOrionChat && (
        <OrionChat
          isOpen={showOrionChat}
          onClose={() => setShowOrionChat(false)}
          minimized={minimizeOrionChat}
          onToggleMinimize={() => setMinimizeOrionChat(!minimizeOrionChat)}
        />
      )}
    </div>
  )
}

