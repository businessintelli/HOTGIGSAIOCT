import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, MapPin, DollarSign, Briefcase, Clock, Users, 
  Eye, Calendar, Edit, X, CheckCircle, UserPlus, Download,
  Mail, Phone, Linkedin, FileText, Video, Award, TrendingUp
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { localJobsService } from '../lib/localJobsService'
import KanbanBoard from '../components/KanbanBoard'

const JobDetail = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pipeline')
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  // Application status workflow
  const WORKFLOW_STAGES = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: UserPlus },
    { id: 'reviewed', label: 'Reviewed', color: 'bg-purple-100 text-purple-700', icon: Eye },
    { id: 'interview_scheduled', label: 'Interview', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
    { id: 'selected', label: 'Selected', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { id: 'offered', label: 'Offered', color: 'bg-teal-100 text-teal-700', icon: Award },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700', icon: X },
    { id: 'backed_out', label: 'Backed Out', color: 'bg-gray-100 text-gray-700', icon: ArrowLeft }
  ]

  useEffect(() => {
    loadJobData()
  }, [jobId])

  const loadJobData = () => {
    setLoading(true)
    
    // Get job details
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
          linkedin: 'linkedin.com/in/sarahjohnson',
          avatar: 'SJ',
          location: 'San Francisco, CA'
        },
        status: 'applied',
        appliedDate: '2025-10-14',
        skillMatch: 92,
        experience: '6 years',
        expectedSalary: '$130k - $160k',
        resumeUrl: '#',
        coverLetter: 'I am excited to apply for this position...',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
        education: 'BS Computer Science, Stanford University',
        currentCompany: 'Tech Innovations Inc',
        availability: '2 weeks',
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
          linkedin: 'linkedin.com/in/michaelchen',
          avatar: 'MC',
          location: 'Seattle, WA'
        },
        status: 'reviewed',
        appliedDate: '2025-10-13',
        skillMatch: 88,
        experience: '5 years',
        expectedSalary: '$120k - $150k',
        resumeUrl: '#',
        coverLetter: 'With 5 years of experience...',
        skills: ['React', 'Python', 'PostgreSQL', 'Kubernetes'],
        education: 'MS Software Engineering, MIT',
        currentCompany: 'Cloud Solutions Ltd',
        availability: '3 weeks',
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
          linkedin: 'linkedin.com/in/emilyrodriguez',
          avatar: 'ER',
          location: 'Austin, TX'
        },
        status: 'interview_scheduled',
        appliedDate: '2025-10-12',
        interviewDate: '2025-10-18',
        interviewTime: '2:00 PM',
        skillMatch: 85,
        experience: '4 years',
        expectedSalary: '$110k - $140k',
        resumeUrl: '#',
        coverLetter: 'I would love to join your team...',
        skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
        education: 'BS Computer Science, UT Austin',
        currentCompany: 'Startup Ventures',
        availability: '1 month',
        aiScore: 87,
        videoInterviewUrl: '#'
      },
      {
        id: 4,
        jobId: jobId,
        candidate: {
          name: 'David Kim',
          title: 'Senior Software Developer',
          email: 'david.kim@email.com',
          phone: '+1 (555) 456-7890',
          linkedin: 'linkedin.com/in/davidkim',
          avatar: 'DK',
          location: 'New York, NY'
        },
        status: 'selected',
        appliedDate: '2025-10-10',
        skillMatch: 95,
        experience: '7 years',
        expectedSalary: '$140k - $170k',
        resumeUrl: '#',
        coverLetter: 'I am passionate about building scalable applications...',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
        education: 'MS Computer Science, Columbia University',
        currentCompany: 'Enterprise Tech Corp',
        availability: 'Immediate',
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
          linkedin: 'linkedin.com/in/jessicamartinez',
          avatar: 'JM',
          location: 'Los Angeles, CA'
        },
        status: 'offered',
        appliedDate: '2025-10-08',
        offerDate: '2025-10-15',
        offerAmount: '$145,000',
        skillMatch: 93,
        experience: '6 years',
        expectedSalary: '$135k - $165k',
        resumeUrl: '#',
        coverLetter: 'Your company mission aligns perfectly with my values...',
        skills: ['React', 'Python', 'Django', 'PostgreSQL', 'AWS'],
        education: 'BS Computer Science, UCLA',
        currentCompany: 'Digital Agency Pro',
        availability: '2 weeks',
        aiScore: 95,
        videoInterviewUrl: '#'
      },
      {
        id: 6,
        jobId: jobId,
        candidate: {
          name: 'Robert Taylor',
          title: 'Junior Full Stack Developer',
          email: 'robert.taylor@email.com',
          phone: '+1 (555) 678-9012',
          linkedin: 'linkedin.com/in/roberttaylor',
          avatar: 'RT',
          location: 'Chicago, IL'
        },
        status: 'rejected',
        appliedDate: '2025-10-11',
        rejectedDate: '2025-10-14',
        rejectionReason: 'Insufficient experience with required technologies',
        skillMatch: 65,
        experience: '2 years',
        expectedSalary: '$80k - $100k',
        resumeUrl: '#',
        coverLetter: 'I am eager to learn and grow...',
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        education: 'BS Computer Science, University of Illinois',
        currentCompany: 'Web Design Studio',
        availability: 'Immediate',
        aiScore: 68,
        videoInterviewUrl: null
      }
    ]

    setApplications(sampleApplications)
    setLoading(false)
  }

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status)
  }

  const updateApplicationStatus = (applicationId, newStatus) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ))
  }

  if (loading || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'pipeline', label: 'Pipeline', count: applications.length },
    { id: 'overview', label: 'Overview', count: null },
    { id: 'applications', label: 'All Applications', count: applications.length },
    { id: 'analytics', label: 'Analytics', count: null }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/company-dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/edit-job/${jobId}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Button>
              <Button variant="destructive" size="sm">
                <X className="h-4 w-4 mr-2" />
                Close Job
              </Button>
            </div>
          </div>

          {/* Job Title and Key Info */}
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{job.company}</p>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {job.type}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Posted {job.postedDate}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Pipeline</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(a => !['rejected', 'backed_out'].includes(a.status)).length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Interviews</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {getApplicationsByStatus('interview_scheduled').length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Offers</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {getApplicationsByStatus('offered').length}
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pipeline' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Candidate Pipeline</h2>
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop candidates between stages to update their status
              </p>
            </div>
            
            {/* Kanban Board */}
            <KanbanBoard
              stages={WORKFLOW_STAGES}
              applications={applications}
              onStatusChange={updateApplicationStatus}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700">{job.description}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {job.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                )) || [
                  '5+ years of experience in full-stack development',
                  'Strong proficiency in React and Node.js',
                  'Experience with cloud platforms (AWS/Azure/GCP)',
                  'Excellent problem-solving and communication skills'
                ]}
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">All Applications</h2>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all candidate applications for this position
              </p>
            </div>
            
            <div className="space-y-4">
              {applications.map(application => {
                const stage = WORKFLOW_STAGES.find(s => s.status === application.status)
                const StageIcon = stage?.icon || UserPlus
                
                return (
                  <div key={application.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {application.candidate.avatar}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {application.candidate.name}
                              </h3>
                              <p className="text-sm text-gray-600">{application.candidate.title}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${stage?.color || 'bg-gray-100 text-gray-700'}`}>
                              {stage?.label || application.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-500">Skill Match</p>
                              <p className="font-medium text-gray-900">{application.skillMatch}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Experience</p>
                              <p className="font-medium text-gray-900">{application.experience}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Expected Salary</p>
                              <p className="font-medium text-gray-900">{application.expectedSalary}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Applied</p>
                              <p className="font-medium text-gray-900">{application.appliedDate}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Update Status</option>
                              {WORKFLOW_STAGES.map(stage => (
                                <option key={stage.id} value={stage.id}>{stage.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Analytics</h2>
            <p className="text-gray-500">Job-specific analytics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetail

