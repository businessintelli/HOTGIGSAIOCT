import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Search, MapPin, Briefcase, Clock, ChevronDown, LogOut, User, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Jobs() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'in', location)
    // TODO: Implement search API call
  }

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter)
    console.log('Filter changed to:', filter)
    // TODO: Implement filter logic
  }

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`)
  }

  const handleSaveJob = (jobId, e) => {
    e.stopPropagation()
    if (!user) {
      // Redirect to sign-in if not logged in
      navigate('/signin', { state: { from: `/jobs`, action: 'save', jobId } })
    } else {
      console.log('Saving job:', jobId)
      // TODO: Implement save job API call
    }
  }

  const handleApplyNow = (jobId, e) => {
    e.stopPropagation()
    if (!user) {
      // Redirect to sign-in if not logged in
      navigate('/signin', { state: { from: `/jobs/${jobId}`, action: 'apply' } })
    } else {
      navigate(`/jobs/${jobId}`)
    }
  }

  const jobs = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      type: 'Full-time',
      workModel: 'Hybrid',
      salary: '$150k - $200k',
      posted: '2 hours ago',
      match: 97
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'Full-time',
      workModel: 'Remote',
      salary: '$130k - $180k',
      posted: '5 hours ago',
      match: 92
    },
    {
      id: 3,
      title: 'Data Scientist',
      company: 'Amazon',
      location: 'San Francisco, CA',
      type: 'Full-time',
      workModel: 'On-site',
      salary: '$140k - $190k',
      posted: '1 day ago',
      match: 88
    },
    {
      id: 4,
      title: 'UX Designer',
      company: 'Apple',
      location: 'Cupertino, CA',
      type: 'Full-time',
      workModel: 'Hybrid',
      salary: '$120k - $160k',
      posted: '2 days ago',
      match: 85
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      type: 'Full-time',
      workModel: 'Remote',
      salary: '$145k - $195k',
      posted: '3 days ago',
      match: 90
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HotGigs.ai
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
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
                      <SettingsIcon className="h-4 w-4" />
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
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Location"
                className="pl-10 h-12"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant={selectedFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              All Jobs
            </Button>
            <Button 
              variant={selectedFilter === 'remote' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleFilterChange('remote')}
            >
              Remote
            </Button>
            <Button 
              variant={selectedFilter === 'fulltime' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleFilterChange('fulltime')}
            >
              Full-time
            </Button>
            <Button 
              variant={selectedFilter === 'parttime' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleFilterChange('parttime')}
            >
              Part-time
            </Button>
            <Button 
              variant={selectedFilter === 'contract' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleFilterChange('contract')}
            >
              Contract
            </Button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recommended Jobs</h1>
            <p className="text-gray-600 mt-1">{jobs.length} jobs found</p>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
            <option>Sort by: Relevance</option>
            <option>Sort by: Date</option>
            <option>Sort by: Salary</option>
          </select>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{job.company}</p>
                    </div>
                    <div className="ml-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.match >= 90 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {job.match}% Match
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {job.workModel}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.posted}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm font-medium text-gray-900">
                      {job.salary}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleSaveJob(job.id, e)}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        onClick={(e) => handleApplyNow(job.id, e)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => console.log('Loading more jobs...')}
          >
            Load More Jobs
          </Button>
        </div>
      </div>
    </div>
  )
}

