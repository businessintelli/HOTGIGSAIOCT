import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, Plus, Users, Briefcase, Eye, Mail, MessageSquare,
  ChevronDown, User, Settings, LogOut, Calendar, Clock, DollarSign,
  MapPin, TrendingUp, Filter, Search, MoreVertical, CheckCircle,
  XCircle, AlertCircle, Send, UserCheck, UserX, ArrowRight
} from 'lucide-react'
import OrionChat from '../components/OrionChat'
import { useAuth } from '../contexts/AuthContext'
import { localJobsService } from '../lib/localJobsService'

// Application status configuration
const APPLICATION_STATUSES = {
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Send },
  invited: { label: 'Invited', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: Mail },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Eye },
  interview_scheduled: { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Calendar },
  selected: { label: 'Selected', color: 'bg-green-100 text-green-800 border-green-300', icon: UserCheck },
  offered: { label: 'Offered', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
  not_selected: { label: 'Not Selected', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: UserX },
  candidate_backed_out: { label: 'Candidate Backed Out', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: AlertCircle }
}

export default function CompanyDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showOrionChat, setShowOrionChat] = useState(false)
  const [minimizeOrionChat, setMinimizeOrionChat] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview, applications, jobs, analytics
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState([])
  const [jobsFilter, setJobsFilter] = useState('all') // 'all' or 'my'
  
  // Initialize sample data and load jobs
  useEffect(() => {
    localJobsService.initializeSampleData()
    setJobs(localJobsService.getAllJobs())
  }, [])
  
  // Filter jobs based on selection
  const filteredJobs = jobsFilter === 'my' 
    ? jobs.filter(job => job.posted_by === user?.id)
    : jobs

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Mock data - replace with API calls
  const stats = {
    activeJobs: 12,
    totalApplications: 156,
    inReview: 45,
    interviewsScheduled: 8,
    offersExtended: 3
  }

  const applications = [
    {
      id: 1,
      candidate: {
        name: 'Sarah Johnson',
        title: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        avatar: null
      },
      job: {
        title: 'Senior Full Stack Developer',
        id: 'job-1'
      },
      status: 'interview_scheduled',
      appliedDate: '2025-01-10',
      lastUpdated: '2025-01-12',
      skillMatch: 92,
      experience: '8 years',
      expectedSalary: '$150k - $180k',
      workModel: 'Remote',
      availability: '2 weeks',
      interviewDate: '2025-01-15 10:00 AM'
    },
    {
      id: 2,
      candidate: {
        name: 'Michael Chen',
        title: 'DevOps Engineer',
        location: 'Austin, TX',
        avatar: null
      },
      job: {
        title: 'DevOps Lead',
        id: 'job-2'
      },
      status: 'in_review',
      appliedDate: '2025-01-11',
      lastUpdated: '2025-01-11',
      skillMatch: 88,
      experience: '6 years',
      expectedSalary: '$130k - $160k',
      workModel: 'Hybrid',
      availability: '1 month'
    },
    {
      id: 3,
      candidate: {
        name: 'Emily Rodriguez',
        title: 'Product Manager',
        location: 'New York, NY',
        avatar: null
      },
      job: {
        title: 'Senior Product Manager',
        id: 'job-3'
      },
      status: 'offered',
      appliedDate: '2025-01-05',
      lastUpdated: '2025-01-14',
      skillMatch: 95,
      experience: '10 years',
      expectedSalary: '$160k - $200k',
      workModel: 'Hybrid',
      availability: 'Immediate',
      offerAmount: '$180k'
    },
    {
      id: 4,
      candidate: {
        name: 'David Kim',
        title: 'UX Designer',
        location: 'Seattle, WA',
        avatar: null
      },
      job: {
        title: 'Senior UX Designer',
        id: 'job-4'
      },
      status: 'submitted',
      appliedDate: '2025-01-14',
      lastUpdated: '2025-01-14',
      skillMatch: 85,
      experience: '5 years',
      expectedSalary: '$110k - $140k',
      workModel: 'Remote',
      availability: '3 weeks'
    },
    {
      id: 5,
      candidate: {
        name: 'Jessica Martinez',
        title: 'Data Scientist',
        location: 'Boston, MA',
        avatar: null
      },
      job: {
        title: 'Lead Data Scientist',
        id: 'job-5'
      },
      status: 'not_selected',
      appliedDate: '2025-01-08',
      lastUpdated: '2025-01-13',
      skillMatch: 78,
      experience: '4 years',
      expectedSalary: '$120k - $150k',
      workModel: 'Onsite',
      availability: '2 weeks'
    }
  ]

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus
    const matchesSearch = searchQuery === '' || 
      app.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusConfig = (status) => APPLICATION_STATUSES[status] || APPLICATION_STATUSES.submitted

  const updateApplicationStatus = (appId, newStatus) => {
    console.log(`Updating application ${appId} to status: ${newStatus}`)
    // TODO: API call to update status
  }

  const statusCounts = {
    all: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    in_review: applications.filter(a => a.status === 'in_review').length,
    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected' || a.status === 'not_selected').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/company-dashboard" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HotGigs.ai
              </span>
              <Badge variant="secondary" className="ml-2">Recruiter</Badge>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/create-job')} className="bg-gradient-to-r from-blue-600 to-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {user?.full_name || 'Company'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => {
                        navigate('/company-profile')
                        setShowProfileMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Company Profile
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
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your job postings and candidate applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeJobs}</p>
              </div>
              <Briefcase className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
              </div>
              <Users className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inReview}</p>
              </div>
              <Eye className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.interviewsScheduled}</p>
              </div>
              <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offers Extended</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.offersExtended}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', count: null },
                { id: 'applications', label: 'Applications', count: stats.totalApplications },
                { id: 'jobs', label: 'My Jobs', count: stats.activeJobs },
                { id: 'analytics', label: 'Analytics', count: null }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 py-0.5 px-2 rounded-full bg-gray-100 text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Applications Tab Content */}
          {activeTab === 'applications' && (
            <div className="p-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidates or jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('all')}
                  >
                    All ({statusCounts.all})
                  </Button>
                  <Button
                    variant={selectedStatus === 'submitted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('submitted')}
                  >
                    New ({statusCounts.submitted})
                  </Button>
                  <Button
                    variant={selectedStatus === 'in_review' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('in_review')}
                  >
                    Review ({statusCounts.in_review})
                  </Button>
                  <Button
                    variant={selectedStatus === 'interview_scheduled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('interview_scheduled')}
                  >
                    Interviews ({statusCounts.interview_scheduled})
                  </Button>
                  <Button
                    variant={selectedStatus === 'offered' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus('offered')}
                  >
                    Offered ({statusCounts.offered})
                  </Button>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.map(application => {
                  const statusConfig = getStatusConfig(application.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <div
                      key={application.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {application.candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>

                          {/* Candidate Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {application.candidate.name}
                                </h3>
                                <p className="text-sm text-gray-600">{application.candidate.title}</p>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="flex items-center gap-2">
                                <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig.label}
                                </Badge>
                                
                                {/* Skill Match Score */}
                                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                  <span className="text-xs font-semibold text-green-700">
                                    {application.skillMatch}% Match
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Job Applied For */}
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Applied for:</p>
                              <p className="text-sm font-medium text-gray-900">{application.job.title}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Experience</p>
                                <p className="text-sm font-medium text-gray-900">{application.experience}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Expected Salary</p>
                                <p className="text-sm font-medium text-gray-900">{application.expectedSalary}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Work Model</p>
                                <p className="text-sm font-medium text-gray-900">{application.workModel}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Availability</p>
                                <p className="text-sm font-medium text-gray-900">{application.availability}</p>
                              </div>
                            </div>

                            {/* Interview/Offer Info */}
                            {application.interviewDate && (
                              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-purple-900">
                                  <strong>Interview:</strong> {application.interviewDate}
                                </span>
                              </div>
                            )}

                            {application.offerAmount && (
                              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-900">
                                  <strong>Offer Extended:</strong> {application.offerAmount}
                                </span>
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Applied: {application.appliedDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.candidate.location}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                              <Button
                                size="sm"
                                onClick={() => navigate(`/candidate/${application.id}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/messages/${application.id}`)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>

                              {/* Status Update Dropdown */}
                              <div className="relative ml-auto">
                                <select
                                  value={application.status}
                                  onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Update Status</option>
                                  <option value="submitted">Submitted</option>
                                  <option value="in_review">In Review</option>
                                  <option value="interview_scheduled">Schedule Interview</option>
                                  <option value="selected">Mark as Selected</option>
                                  <option value="offered">Extend Offer</option>
                                  <option value="rejected">Reject</option>
                                  <option value="not_selected">Not Selected</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredApplications.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No applications found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overview Tab - Placeholder */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <p className="text-gray-600">Overview content coming soon...</p>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Job Postings</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant={jobsFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJobsFilter('all')}
                    >
                      All Jobs ({jobs.length})
                    </Button>
                    <Button 
                      variant={jobsFilter === 'my' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJobsFilter('my')}
                    >
                      My Jobs ({jobs.filter(j => j.posted_by === user?.id).length})
                    </Button>
                  </div>
                </div>
                <Button onClick={() => navigate('/create-job')} className="bg-gradient-to-r from-blue-600 to-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-6">Create your first job posting to start receiving applications</p>
                  <Button onClick={() => navigate('/create-job')} className="bg-gradient-to-r from-blue-600 to-green-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {job.status === 'active' ? '✓ Active' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{job.company}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.workModel?.charAt(0).toUpperCase() + job.workModel?.slice(1) || 'N/A'}
                            </span>
                            {job.salaryMin && job.salaryMax && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Job Stats */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{job.applications_count || 0}</p>
                          <p className="text-xs text-gray-600">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{job.views || 0}</p>
                          <p className="text-xs text-gray-600">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                          </p>
                          <p className="text-xs text-gray-600">Days Active</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/jobs/${job.id}/applications`)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Applications ({job.applications_count || 0})
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Job
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Close Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab - Placeholder */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          )}
        </div>

        {/* Orion AI Copilot Card */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Orion AI Recruiting Copilot</h3>
              <p className="text-blue-100">Get AI-powered insights on candidates and hiring strategies</p>
            </div>
            <Button
              onClick={() => setShowOrionChat(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Chat with Orion
            </Button>
          </div>
        </div>
      </div>

      {/* Orion Chat Component */}
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

