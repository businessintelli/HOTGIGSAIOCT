import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack,
  Star, TrendingUp, Sparkles, Eye, Clock, Award, Bookmark
} from 'lucide-react'

export default function VideoProfilePlayer({ videoData, candidate, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChapter, setSelectedChapter] = useState(null)
  
  const videoRef = useRef(null)

  // Mock data - replace with actual API data
  const mockVideoData = {
    id: '1',
    title: 'Video Introduction',
    video_url: videoData?.video_url || '',
    duration_seconds: 600,
    overall_score: 87,
    communication_score: 85,
    confidence_score: 90,
    professionalism_score: 88,
    ai_summary: 'Experienced full-stack developer with 5+ years in React and Node.js. Strong communication skills and passion for building scalable applications.',
    skills_mentioned: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    chapters: [
      { id: '1', title: 'Introduction', start_time: 0, end_time: 45, chapter_type: 'intro', skills_discussed: [] },
      { id: '2', title: 'Technical Skills', start_time: 45, end_time: 180, chapter_type: 'skills', skills_discussed: ['React', 'Node.js', 'TypeScript'] },
      { id: '3', title: 'Work Experience', start_time: 180, end_time: 360, chapter_type: 'experience', skills_discussed: ['AWS', 'MongoDB'] },
      { id: '4', title: 'Notable Projects', start_time: 360, end_time: 480, chapter_type: 'projects', skills_discussed: ['React', 'AWS'] },
      { id: '5', title: 'Career Goals', start_time: 480, end_time: 600, chapter_type: 'goals', skills_discussed: [] }
    ],
    highlights: [
      { id: '1', title: 'React Expertise Demo', start_time: 90, end_time: 120, highlight_type: 'skill_demo', related_skill: 'React' },
      { id: '2', title: 'AWS Architecture Discussion', start_time: 240, end_time: 270, highlight_type: 'achievement', related_skill: 'AWS' },
      { id: '3', title: 'Leadership Example', start_time: 400, end_time: 430, highlight_type: 'leadership', related_skill: null }
    ],
    analytics: {
      total_views: 45,
      recruiter_views: 12,
      shortlisted_count: 3
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
  }

  const jumpToChapter = (chapter) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = chapter.start_time
    setSelectedChapter(chapter)
    if (!isPlaying) {
      video.play()
      setIsPlaying(true)
    }
  }

  const jumpToHighlight = (highlight) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = highlight.start_time
    if (!isPlaying) {
      video.play()
      setIsPlaying(true)
    }
  }

  const skip = (seconds) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getChapterIcon = (type) => {
    switch (type) {
      case 'intro': return '👋'
      case 'skills': return '💻'
      case 'experience': return '💼'
      case 'projects': return '🚀'
      case 'goals': return '🎯'
      default: return '📝'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{candidate?.name || 'Candidate'}'s Video Profile</h2>
            <p className="text-gray-400">{mockVideoData.title}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            Close
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Video Player */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              
              {/* Video */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={mockVideoData.video_url}
                  className="w-full h-full"
                  onClick={togglePlay}
                />
                
                {/* Play overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Button
                      size="lg"
                      onClick={togglePlay}
                      className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="h-10 w-10" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="bg-gray-800 p-4">
                
                {/* Progress bar */}
                <div 
                  className="w-full h-2 bg-gray-700 rounded-full cursor-pointer mb-4"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(-10)}
                      className="text-white"
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skip(10)}
                      className="text-white"
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>

                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="mt-6 bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
              </div>
              
              <p className="text-gray-300 mb-4">{mockVideoData.ai_summary}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Overall</p>
                  <p className={`text-2xl font-bold ${getScoreColor(mockVideoData.overall_score)}`}>
                    {mockVideoData.overall_score}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Communication</p>
                  <p className={`text-2xl font-bold ${getScoreColor(mockVideoData.communication_score)}`}>
                    {mockVideoData.communication_score}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Confidence</p>
                  <p className={`text-2xl font-bold ${getScoreColor(mockVideoData.confidence_score)}`}>
                    {mockVideoData.confidence_score}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Professionalism</p>
                  <p className={`text-2xl font-bold ${getScoreColor(mockVideoData.professionalism_score)}`}>
                    {mockVideoData.professionalism_score}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-96 bg-gray-900 rounded-lg p-6">
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-700">
              {['overview', 'chapters', 'highlights'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Skills Mentioned */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Skills Mentioned</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockVideoData.skills_mentioned.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-blue-900 text-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Analytics */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Video Analytics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Total Views
                      </span>
                      <span className="text-white font-semibold">{mockVideoData.analytics.total_views}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Recruiter Views
                      </span>
                      <span className="text-white font-semibold">{mockVideoData.analytics.recruiter_views}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Shortlisted
                      </span>
                      <span className="text-white font-semibold">{mockVideoData.analytics.shortlisted_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chapters Tab */}
            {activeTab === 'chapters' && (
              <div className="space-y-2">
                {mockVideoData.chapters.map(chapter => (
                  <div
                    key={chapter.id}
                    onClick={() => jumpToChapter(chapter)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChapter?.id === chapter.id
                        ? 'bg-blue-900 bg-opacity-50 border border-blue-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getChapterIcon(chapter.chapter_type)}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{chapter.title}</p>
                        <p className="text-xs text-gray-400">
                          {formatTime(chapter.start_time)} - {formatTime(chapter.end_time)}
                        </p>
                      </div>
                    </div>
                    {chapter.skills_discussed.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {chapter.skills_discussed.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Highlights Tab */}
            {activeTab === 'highlights' && (
              <div className="space-y-2">
                {mockVideoData.highlights.map(highlight => (
                  <div
                    key={highlight.id}
                    onClick={() => jumpToHighlight(highlight)}
                    className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <p className="text-white font-medium">{highlight.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {formatTime(highlight.start_time)} - {formatTime(highlight.end_time)}
                    </p>
                    {highlight.related_skill && (
                      <Badge variant="secondary" className="bg-purple-900 text-purple-200 text-xs">
                        {highlight.related_skill}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

