import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, User, Mail, Phone, MapPin, Briefcase, Upload, ChevronDown, LogOut, Settings, CheckCircle, XCircle, Video, Play } from 'lucide-react'
import VideoRecordingStudio from '../components/VideoRecordingStudio'
import VideoProfilePlayer from '../components/VideoProfilePlayer'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // 'uploading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showVideoStudio, setShowVideoStudio] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [videoProfile, setVideoProfile] = useState(null)
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    title: '',
    bio: '',
  })

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
    // TODO: Implement API call to save profile
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error')
      setUploadMessage('File size must be less than 5MB')
      setTimeout(() => setUploadStatus(null), 5000)
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error')
      setUploadMessage('Please upload a PDF, DOC, or DOCX file')
      setTimeout(() => setUploadStatus(null), 5000)
      return
    }

    setSelectedFile(file)
    setUploadStatus('uploading')
    setUploadMessage('Uploading resume...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/api/ai/resume/upload-analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadStatus('success')
      setUploadMessage(`Resume uploaded successfully! File: ${file.name}`)
      
      // Show analysis results if available
      if (response.data.analysis) {
        console.log('Resume Analysis:', response.data.analysis)
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setUploadStatus(null)
        setSelectedFile(null)
      }, 5000)

    } catch (error) {
      console.error('Error uploading resume:', error)
      setUploadStatus('error')
      setUploadMessage(error.response?.data?.detail || 'Failed to upload resume. Please try again.')
      setTimeout(() => setUploadStatus(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
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

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Button 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "default" : "outline"}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            {/* Profile Form */}
            <div className="space-y-6">
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
                    type="tel"
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
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-green-600">
                    Save Changes
                  </Button>
                </div>
              )}

              {/* Resume Section */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
                
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

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload your resume to improve job matching</p>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={uploadStatus === 'uploading'}
                  />
                  <label htmlFor="resume-upload">
                    <Button asChild disabled={uploadStatus === 'uploading'}>
                      <span>
                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
                      </span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PDF, DOC, or DOCX (Max 5MB)</p>
                  {selectedFile && uploadStatus !== 'uploading' && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Video Profile Section */}
              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Profile
                </h2>
                <p className="text-gray-600 mb-4">
                  Record a 10-15 minute video introduction to showcase your skills, experience, and personality to potential employers.
                </p>
                
                {videoProfile ? (
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Your Video Profile</h3>
                        <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowVideoPlayer(true)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Watch
                        </Button>
                        <Button
                          onClick={() => setShowVideoStudio(true)}
                          variant="outline"
                        >
                          Re-record
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">87</p>
                        <p className="text-xs text-gray-600">AI Score</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">45</p>
                        <p className="text-xs text-gray-600">Views</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">12</p>
                        <p className="text-xs text-gray-600">Recruiter Views</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">3</p>
                        <p className="text-xs text-gray-600">Shortlisted</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Stand out with an AI-powered video introduction</p>
                    <Button
                      onClick={() => setShowVideoStudio(true)}
                      className="bg-gradient-to-r from-blue-600 to-green-600"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Record Video Profile
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">Recommended: 10-15 minutes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Recording Studio Modal */}
      {showVideoStudio && (
        <VideoRecordingStudio
          onComplete={(videoData) => {
            console.log('Video completed:', videoData)
            setVideoProfile(videoData)
            setShowVideoStudio(false)
          }}
          onCancel={() => setShowVideoStudio(false)}
        />
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && videoProfile && (
        <VideoProfilePlayer
          videoData={videoProfile}
          candidate={user}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  )
}

