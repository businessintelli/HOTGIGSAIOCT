import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Download, Edit, XCircle, Users, Eye, Calendar, Award,
  CheckCircle, UserPlus, X, ArrowLeftCircle, Briefcase, Search, Filter,
  Mail, Trash2, CheckSquare, Square, ChevronDown, SlidersHorizontal
} from 'lucide-react'
import KanbanBoard from '../components/KanbanBoard'
import { localJobsService } from '../lib/localJobsService'
import api from '../lib/apiService'

const JobDetailEnhanced = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  
  // State
  const [activeTab, setActiveTab] = useState('pipeline')
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)
  
  // Bulk actions state
  const [selectedApplications, setSelectedApplications] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    skillMatchMin: 0,
    skillMatchMax: 100,
    experienceMin: 0,
    experienceMax: 20,
    salaryMin: 0,
    salaryMax: 500000,
    location: '',
    skills: []
  })
  
  // Sorting state
  const [sortBy, setSortBy] = useState('applied_date')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Workflow stages
  const WORKFLOW_STAGES = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: UserPlus },
    { id: 'reviewed', label: 'Reviewed', color: 'bg-purple-100 text-purple-700', icon: Eye },
    { id: 'interview_scheduled', label: 'Interview', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
    { id: 'selected', label: 'Selected', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { id: 'offered', label: 'Offered', color: 'bg-teal-100 text-teal-700', icon: Award },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700', icon: X },
    { id: 'backed_out', label: 'Backed Out', color: 'bg-gray-100 text-gray-700', icon: ArrowLeftCircle }
  ]
  
  useEffect(() => {
    checkAPIAvailability()
    loadJobData()
  }, [jobId])
  
  const checkAPIAvailability = async () => {
    const isAvailable = await api.checkHealth()
    setApiAvailable(isAvailable)
  }
  
  const loadJobData = async () => {
    setLoading(true)
    
    try {
      // Try to load from backend API first
      if (apiAvailable) {
        try {
          const jobData = await api.jobs.getById(jobId)
          setJob(jobData)
          
          const applicationsData = await api.jobs.getApplications(jobId)
          setApplications(applicationsData)
        } catch (error) {
          console.error('API error, falling back to local data:', error)
          loadLocalData()
        }
      } else {
        loadLocalData()
      }
    } catch (error) {
      console.error('Error loading job data:', error)
      loadLocalData()
    } finally {
      setLoading(false)
    }
  }
  
  const loadLocalData = () => {
    // Fallback to local data
    const jobData = localJobsService.getJobById(jobId)
    if (!jobData) {
      navigate('/company-dashboard')
      return
    }
    setJob(jobData)

    // Generate sample applications for this job
    const sampleApplications = [
      {
        id: 1,
        jobId: jobId,
        candidate: {
          name: 'Sarah Johnson',
          title: 'Senior Full Stack Developer',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          linkedin: 'linkedin.com/in/sarahjohnson'
        },
        status: 'applied',
        appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        skillMatch: 92,
        experience: '6 years',
        education: 'BS Computer Science',
        expectedSalary: '$130k - $160k',
        availability: '2 weeks',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        resumeUrl: '#',
        aiScore: 94,
        videoInterviewUrl: '#'
      },
      {
        id: 2,
        jobId: jobId,
        candidate: {
          name: 'Michael Chen',
          title: 'Full Stack Engineer',
          email: 'michael.chen@email.com',
          phone: '+1 (555) 234-5678',
          location: 'Seattle, WA',
          linkedin: 'linkedin.com/in/michaelchen'
        },
        status: 'reviewed',
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        skillMatch: 88,
        experience: '5 years',
        education: 'MS Software Engineering',
        expectedSalary: '$120k - $150k',
        availability: '3 weeks',
        skills: ['React', 'Python', 'PostgreSQL', 'Docker'],
        resumeUrl: '#',
        aiScore: 89,
        videoInterviewUrl: '#'
      },
      {
        id: 3,
        jobId: jobId,
        candidate: {
          name: 'Emily Rodriguez',
          title: 'Software Engineer',
          email: 'emily.rodriguez@email.com',
          phone: '+1 (555) 345-6789',
          location: 'Austin, TX',
          linkedin: 'linkedin.com/in/emilyrodriguez'
        },
        status: 'interview_scheduled',
        appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        skillMatch: 85,
        experience: '4 years',
        education: 'BS Computer Engineering',
        expectedSalary: '$110k - $140k',
        availability: '1 month',
        skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
        resumeUrl: '#',
        aiScore: 87,
        videoInterviewUrl: '#',
        interviewDate: '2025-10-18',
        interviewTime: '2:00 PM'
      },
      {
        id: 4,
        jobId: jobId,
        candidate: {
          name: 'David Kim',
          title: 'Senior Software Developer',
          email: 'david.kim@email.com',
          phone: '+1 (555) 456-7890',
          location: 'New York, NY',
          linkedin: 'linkedin.com/in/davidkim'
        },
        status: 'selected',
        appliedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        skillMatch: 95,
        experience: '7 years',
        education: 'MS Computer Science',
        expectedSalary: '$140k - $170k',
        availability: 'Immediate',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Kubernetes', 'Python'],
        resumeUrl: '#',
        aiScore: 96,
        videoInterviewUrl: '#'
      },
      {
        id: 5,
        jobId: jobId,
        candidate: {
          name: 'Jessica Martinez',
          title: 'Full Stack Developer',
          email: 'jessica.martinez@email.com',
          phone: '+1 (555) 567-8901',
          location: 'Los Angeles, CA',
          linkedin: 'linkedin.com/in/jessicamartinez'
        },
        status: 'offered',
        appliedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        skillMatch: 93,
        experience: '6 years',
        education: 'BS Software Engineering',
        expectedSalary: '$135k - $165k',
        availability: '2 weeks',
        skills: ['React', 'Python', 'Django', 'PostgreSQL', 'Redis'],
        resumeUrl: '#',
        aiScore: 95,
        videoInterviewUrl: '#',
        offerAmount: '$145,000'
      },
      {
        id: 6,
        jobId: jobId,
        candidate: {
          name: 'Robert Taylor',
          title: 'Junior Full Stack Developer',
          email: 'robert.taylor@email.com',
          phone: '+1 (555) 678-9012',
          location: 'Chicago, IL',
          linkedin: 'linkedin.com/in/roberttaylor'
        },
        status: 'rejected',
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        skillMatch: 65,
        experience: '2 years',
        education: 'BS Computer Science',
        expectedSalary: '$80k - $100k',
        availability: 'Immediate',
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        resumeUrl: '#',
        aiScore: 68,
        videoInterviewUrl: '#',
        rejectionReason: 'Insufficient experience with required technologies'
      }
    ]
    
    setApplications(sampleApplications)
  }
  
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      if (apiAvailable) {
        await api.applications.updateStatus(applicationId, newStatus)
      }
      
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))
    } catch (error) {
      console.error('Error updating status:', error)
      // Still update locally even if API fails
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ))
    }
  }
  
  // Bulk actions
  const toggleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }
  
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredAndSortedApplications.map(app => app.id))
    }
    setSelectAll(!selectAll)
  }
  
  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      if (apiAvailable) {
        await api.applications.bulkUpdateStatus(selectedApplications, newStatus)
      }
      
      setApplications(applications.map(app => 
        selectedApplications.includes(app.id) ? { ...app, status: newStatus } : app
      ))
      
      setSelectedApplications([])
      setSelectAll(false)
    } catch (error) {
      console.error('Error bulk updating status:', error)
    }
  }
  
  const handleBulkEmail = () => {
    const selectedEmails = applications
      .filter(app => selectedApplications.includes(app.id))
      .map(app => app.candidate.email)
    
    alert(`Opening email client for: ${selectedEmails.join(', ')}`)
    // In production, this would open email client or show compose modal
  }
  
  const handleBulkReject = async () => {
    if (confirm(`Are you sure you want to reject ${selectedApplications.length} candidates?`)) {
      await handleBulkStatusUpdate('rejected')
    }
  }
  
  // Filtering and search
  const filteredAndSortedApplications = applications
    .filter(app => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = app.candidate.name.toLowerCase().includes(query)
        const matchesEmail = app.candidate.email.toLowerCase().includes(query)
        const matchesSkills = app.skills.some(skill => skill.toLowerCase().includes(query))
        
        if (!matchesName && !matchesEmail && !matchesSkills) return false
      }
      
      // Skill match filter
      if (app.skillMatch < filters.skillMatchMin || app.skillMatch > filters.skillMatchMax) {
        return false
      }
      
      // Experience filter (extract years from "X years" string)
      const expYears = parseInt(app.experience)
      if (expYears < filters.experienceMin || expYears > filters.experienceMax) {
        return false
      }
      
      // Location filter
      if (filters.location && !app.candidate.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
      
      // Skills filter
      if (filters.skills.length > 0) {
        const hasRequiredSkills = filters.skills.every(requiredSkill =>
          app.skills.some(skill => skill.toLowerCase() === requiredSkill.toLowerCase())
        )
        if (!hasRequiredSkills) return false
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'applied_date':
          comparison = new Date(a.appliedDate) - new Date(b.appliedDate)
          break
        case 'skill_match':
          comparison = a.skillMatch - b.skillMatch
          break
        case 'ai_score':
          comparison = a.aiScore - b.aiScore
          break
        case 'name':
          comparison = a.candidate.name.localeCompare(b.candidate.name)
          break
        case 'experience':
          comparison = parseInt(a.experience) - parseInt(b.experience)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  
  const resetFilters = () => {
    setFilters({
      skillMatchMin: 0,
      skillMatchMax: 100,
      experienceMin: 0,
      experienceMax: 20,
      salaryMin: 0,
      salaryMax: 500000,
      location: '',
      skills: []
    })
    setSearchQuery('')
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }
  
  if (!job) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/company-dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  const stats = {
    total: applications.length,
    inPipeline: applications.filter(a => !['rejected', 'backed_out'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview_scheduled').length,
    offers: applications.filter(a => a.status === 'offered').length
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/company-dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Close Job
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-lg text-gray-600">{job.company}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>📍 {job.location}</span>
              <span>💰 ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
              <span>💼 {job.employmentType}</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Posted</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Pipeline</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inPipeline}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.offers}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'pipeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pipeline
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                {stats.inPipeline}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Applications
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                {stats.total}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Pipeline</h2>
              <p className="text-gray-600">Drag and drop candidates between stages to update their status</p>
            </div>
            
            <KanbanBoard
              stages={WORKFLOW_STAGES}
              applications={filteredAndSortedApplications}
              onStatusChange={updateApplicationStatus}
            />
          </div>
        )}
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Overview</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{job.description || 'No description available.'}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills?.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Work Model</p>
                    <p className="font-medium text-gray-900 capitalize">{job.workModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium text-gray-900 capitalize">{job.experienceLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium text-gray-900 capitalize">{job.employmentType?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-green-600 capitalize">{job.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* All Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                    showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="applied_date">Sort by Date</option>
                  <option value="skill_match">Sort by Skill Match</option>
                  <option value="ai_score">Sort by AI Score</option>
                  <option value="name">Sort by Name</option>
                  <option value="experience">Sort by Experience</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skill Match Range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={filters.skillMatchMin}
                          onChange={(e) => setFilters({...filters, skillMatchMin: parseInt(e.target.value)})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={filters.skillMatchMax}
                          onChange={(e) => setFilters({...filters, skillMatchMax: parseInt(e.target.value)})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={filters.experienceMin}
                          onChange={(e) => setFilters({...filters, experienceMin: parseInt(e.target.value)})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={filters.experienceMax}
                          onChange={(e) => setFilters({...filters, experienceMax: parseInt(e.target.value)})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-500">years</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., San Francisco"
                        value={filters.location}
                        onChange={(e) => setFilters({...filters, location: e.target.value})}
                        className="w-full px-3 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bulk Actions Bar */}
            {selectedApplications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {selectedApplications.length} candidate{selectedApplications.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate('reviewed')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Move to Review
                    </button>
                    
                    <button
                      onClick={() => handleBulkStatusUpdate('interview_scheduled')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Interview
                    </button>
                    
                    <button
                      onClick={handleBulkEmail}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </button>
                    
                    <button
                      onClick={handleBulkReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedApplications([])
                        setSelectAll(false)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Applications List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {selectAll ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {filteredAndSortedApplications.length} Applications
                </span>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredAndSortedApplications.map(app => (
                  <div
                    key={app.id}
                    className={`px-6 py-4 hover:bg-gray-50 ${
                      selectedApplications.includes(app.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleSelectApplication(app.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {selectedApplications.includes(app.id) ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.candidate.name}</h3>
                            <p className="text-sm text-gray-600">{app.candidate.title}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Skill Match</p>
                              <p className="font-semibold text-gray-900">{app.skillMatch}%</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-gray-500">AI Score</p>
                              <p className="font-semibold text-gray-900">{app.aiScore}/100</p>
                            </div>
                            
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              {WORKFLOW_STAGES.map(stage => (
                                <option key={stage.id} value={stage.id}>
                                  {stage.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>📍 {app.candidate.location}</span>
                          <span>💼 {app.experience}</span>
                          <span>💰 {app.expectedSalary}</span>
                          <span>📅 Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAndSortedApplications.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No applications match your filters
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Analytics</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetailEnhanced

