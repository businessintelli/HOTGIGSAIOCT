import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, User, Mail, Phone, MapPin, Briefcase, Upload, ChevronDown, 
  LogOut, Settings, CheckCircle, XCircle, Video, Play, FileText, Trash2,
  Eye, FileUser, Film, ClipboardList
} from 'lucide-react'
import VideoRecordingStudio from '../components/VideoRecordingStudio'
import VideoProfilePlayer from '../components/VideoProfilePlayer'
import ProfileDetailsForm from '../components/ProfileDetailsForm'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [showVideoStudio, setShowVideoStudio] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [profileDetails, setProfileDetails] = useState(null)
  const [activeTab, setActiveTab] = useState('profile') // profile, video, comprehensive
  
  // Documents state
  const [savedResumes, setSavedResumes] = useState([])
  const [savedVideos, setSavedVideos] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(null)
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    title: '',
    bio: '',
  })

  useEffect(() => {
    loadSavedDocuments()
  }, [])

  const loadSavedDocuments = async () => {
    try {
      // TODO: Load from API
      // Mock data for now
      setSavedResumes([
        { id: '1', name: 'Software_Engineer_Resume.pdf', uploaded_at: '2025-01-10', size: '245 KB', is_default: true },
        { id: '2', name: 'Full_Stack_Developer_Resume.pdf', uploaded_at: '2025-01-05', size: '198 KB', is_default: false }
      ])
      
      setSavedVideos([
        { id: '1', title: 'Video Introduction', duration: 720, uploaded_at: '2025-01-08', ai_score: 87, is_default: true }
      ])
      
      // Set default selections
      setSelectedResumeId('1')
      setSelectedVideoId('1')
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleSaveProfileDetails = async (detailsData) => {
    try {
      // TODO: Save to API
      console.log('Saving profile details:', detailsData)
      setProfileDetails(detailsData)
      setUploadStatus('success')
      setUploadMessage('Profile details saved successfully!')
      setTimeout(() => setUploadStatus(null), 5000)
    } catch (error) {
      console.error('Error saving profile details:', error)
      setUploadStatus('error')
      setUploadMessage('Failed to save profile details')
      setTimeout(() => setUploadStatus(null), 5000)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error')
      setUploadMessage('File size exceeds 5MB limit')
      setTimeout(() => setUploadStatus(null), 5000)
      return
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error')
      setUploadMessage('Invalid file type. Please upload PDF, DOC, or DOCX')
      setTimeout(() => setUploadStatus(null), 5000)
      return
    }

    setUploadStatus('uploading')
    setUploadMessage('Uploading and analyzing your resume...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/api/ai/resume/upload-analyze', formData)
      console.log('Resume uploaded successfully:', response)
      
      setUploadStatus('success')
      setUploadMessage('Resume uploaded and analyzed successfully!')
      setTimeout(() => setUploadStatus(null), 5000)
      
      // Reload documents
      loadSavedDocuments()
    } catch (error) {
      console.error('Error uploading resume:', error)
      setUploadStatus('error')
      setUploadMessage('Failed to upload resume. Please try again.')
      setTimeout(() => setUploadStatus(null), 5000)
    }
  }

  const handleVideoComplete = (videoData) => {
    console.log('Video recording completed:', videoData)
    setShowVideoStudio(false)
    // Reload videos
    loadSavedDocuments()
  }

  const setDefaultResume = (resumeId) => {
    console.log('Setting default resume:', resumeId)
    // TODO: API call
  }

  const deleteResume = (resumeId) => {
    console.log('Deleting resume:', resumeId)
    // TODO: API call
  }

  const deleteVideo = (videoId) => {
    console.log('Deleting video:', videoId)
    // TODO: API call
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
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

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 h-32"></div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{formData.full_name || 'Your Name'}</h1>
                  <p className="text-gray-600">{formData.title || 'Your Title'}</p>
                </div>
              </div>
            </div>

            {/* Upload Status Messages */}
            {uploadStatus && (
              <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                uploadStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                uploadStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {uploadStatus === 'success' && <CheckCircle className="h-5 w-5" />}
                {uploadStatus === 'error' && <XCircle className="h-5 w-5" />}
                {uploadStatus === 'uploading' && (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                )}
                <span>{uploadMessage}</span>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileUser className="h-4 w-4" />
                  Profile & Resume
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'video'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Film className="h-4 w-4" />
                  Video Profile
                  {savedVideos.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{savedVideos.length}</Badge>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('comprehensive')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'comprehensive'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Comprehensive Profile
                  {profileDetails && <CheckCircle className="h-4 w-4 text-green-600" />}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            
            {/* Profile & Resume Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                    <Button 
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "default" : "outline"}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Full Name
                      </label>
                      <Input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Location
                      </label>
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your location"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="h-4 w-4 inline mr-2" />
                        Professional Title
                      </label>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-green-600">
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                {/* Resume Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      My Resumes
                    </h2>
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={uploadStatus === 'uploading'}
                    />
                    <label htmlFor="resume-upload">
                      <Button size="sm" asChild disabled={uploadStatus === 'uploading'} className="bg-gradient-to-r from-blue-600 to-green-600">
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Resume'}
                        </span>
                      </Button>
                    </label>
                  </div>

                  {savedResumes.length > 0 ? (
                    <div className="space-y-3">
                      {savedResumes.map(resume => (
                        <div
                          key={resume.id}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            selectedResumeId === resume.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedResumeId(resume.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <p className="font-medium">{resume.name}</p>
                                {resume.is_default && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                                {selectedResumeId === resume.id && (
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {resume.size} • Uploaded {resume.uploaded_at}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDefaultResume(resume.id)
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteResume(resume.id)
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No resumes uploaded yet</p>
                      <p className="text-sm text-gray-500">Upload your resume to get started</p>
                    </div>
                  )}

                  {savedResumes.length > 0 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      💡 Selected resume will be used when applying for jobs
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Video Profile Tab */}
            {activeTab === 'video' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Video className="h-5 w-5 text-green-600" />
                      Video Profile Library
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Record and manage your video introductions
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowVideoStudio(true)}
                    className="bg-gradient-to-r from-blue-600 to-green-600"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Record New Video
                  </Button>
                </div>

                {savedVideos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedVideos.map(video => (
                      <div
                        key={video.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedVideoId === video.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedVideoId(video.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="h-5 w-5 text-gray-600" />
                              <p className="font-medium">{video.title}</p>
                              {video.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                              {selectedVideoId === video.id && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                Duration: {formatDuration(video.duration)}
                              </p>
                              <p className="text-sm text-gray-600">
                                AI Score: <span className="font-semibold text-green-600">{video.ai_score}/100</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Uploaded {video.uploaded_at}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowVideoPlayer(true)
                            }}
                            className="flex-1"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteVideo(video.id)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No video profiles yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Record a video introduction to stand out to recruiters
                    </p>
                    <Button
                      onClick={() => setShowVideoStudio(true)}
                      className="bg-gradient-to-r from-blue-600 to-green-600"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Record Your First Video
                    </Button>
                  </div>
                )}

                {savedVideos.length > 0 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    💡 Selected video will be shared with recruiters when you apply
                  </p>
                )}
              </div>
            )}

            {/* Comprehensive Profile Tab */}
            {activeTab === 'comprehensive' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
                  <p className="text-gray-600">
                    Add comprehensive information to improve your job matches and increase visibility to recruiters
                  </p>
                </div>

                <ProfileDetailsForm
                  initialData={profileDetails}
                  onSave={handleSaveProfileDetails}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Recording Studio Modal */}
      {showVideoStudio && (
        <VideoRecordingStudio
          onComplete={handleVideoComplete}
          onCancel={() => setShowVideoStudio(false)}
        />
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideoId && (
        <VideoProfilePlayer
          videoData={savedVideos.find(v => v.id === selectedVideoId)}
          candidate={user}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  )
}

