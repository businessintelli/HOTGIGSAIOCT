import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, MapPin, Briefcase, Clock, DollarSign, Users, Building, ChevronDown, LogOut, User, Settings, ArrowLeft, BookmarkPlus, Share2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Mock job data - in real app, fetch from API
  const job = {
    id: id,
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    type: 'Full-time',
    workModel: 'Hybrid',
    salary: '$150k - $200k',
    posted: '2 hours ago',
    match: 97,
    description: `We are looking for a talented Senior Software Engineer to join our team. You will be responsible for designing, developing, and maintaining high-quality software solutions.

Key Responsibilities:
• Design and implement scalable software solutions
• Collaborate with cross-functional teams
• Mentor junior developers
• Participate in code reviews and technical discussions
• Stay up-to-date with emerging technologies

Requirements:
• 5+ years of software development experience
• Strong proficiency in JavaScript, Python, or Java
• Experience with cloud platforms (AWS, GCP, or Azure)
• Excellent problem-solving skills
• Strong communication and teamwork abilities

Benefits:
• Competitive salary and equity
• Health, dental, and vision insurance
• 401(k) matching
• Flexible work arrangements
• Professional development opportunities
• Unlimited PTO`,
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker'],
    applicants: 45,
  }

  const handleApply = () => {
    setShowApplyModal(true)
  }

  const handleSubmitApplication = () => {
    // TODO: Implement application submission
    console.log('Submitting application for job:', id)
    setShowApplyModal(false)
    alert('Application submitted successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
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
              
              {/* Profile Dropdown */}
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

      {/* Job Details Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-gray-600">
                    <Building className="h-5 w-5" />
                    {job.company}
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  job.match >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {job.match}% Match
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {job.type}
                </div>
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {job.workModel}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salary}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {job.posted}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {job.applicants} applicants
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleApply}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Apply Now
                </Button>
                <Button variant="outline">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">About {job.company}</h3>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg mb-4"></div>
              <p className="text-sm text-gray-600 mb-4">
                A leading technology company focused on innovation and excellence.
              </p>
              <Button variant="outline" className="w-full">
                View Company Profile
              </Button>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/jobs/${i + 10}`)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <h4 className="font-medium text-sm text-gray-900">Software Engineer</h4>
                    <p className="text-xs text-gray-600 mt-1">Tech Company</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Remote</span>
                      <span className="text-xs font-medium text-green-600">95% Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for {job.title}</h2>
            <p className="text-gray-600 mb-6">
              Your profile and resume will be sent to {job.company}. Make sure your information is up to date.
            </p>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Resume</p>
                <p className="text-sm text-gray-600">Current resume on file</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Cover Letter (Optional)</p>
                <textarea
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Write a brief cover letter..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowApplyModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitApplication}
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

