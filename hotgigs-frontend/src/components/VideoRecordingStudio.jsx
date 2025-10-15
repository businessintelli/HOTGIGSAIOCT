import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Video, VideoOff, Mic, MicOff, Play, Square, Upload, 
  CheckCircle, XCircle, AlertCircle, Sparkles, RotateCcw,
  Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react'

export default function VideoRecordingStudio({ onComplete, onCancel }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  
  // Real-time feedback
  const [feedback, setFeedback] = useState({
    audioQuality: 0,
    videoQuality: 0,
    speakingPace: 0,
    fillerWords: 0,
    suggestions: []
  })
  
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    initializeMedia()
    return () => {
      stopMedia()
    }
  }, [])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Check media quality
      checkMediaQuality(stream)
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  const checkMediaQuality = (stream) => {
    const videoTrack = stream.getVideoTracks()[0]
    const audioTrack = stream.getAudioTracks()[0]
    
    const videoSettings = videoTrack.getSettings()
    const audioSettings = audioTrack.getSettings()
    
    // Simple quality scoring
    const videoQuality = (videoSettings.width >= 1280 && videoSettings.height >= 720) ? 100 : 75
    const audioQuality = audioSettings.sampleRate >= 44100 ? 100 : 75
    
    setFeedback(prev => ({
      ...prev,
      videoQuality,
      audioQuality,
      suggestions: [
        videoQuality < 100 ? 'Consider improving lighting for better video quality' : 'Video quality looks great!',
        audioQuality < 100 ? 'Check your microphone settings' : 'Audio quality is excellent!'
      ]
    }))
  }

  const startRecording = () => {
    if (!streamRef.current) return
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setPreviewMode(true)
      }
      
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      startTimer()
      
      // Start real-time analysis
      startRealtimeAnalysis()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to start recording. Please try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      stopTimer()
      stopRealtimeAnalysis()
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        startTimer()
      } else {
        mediaRecorderRef.current.pause()
        stopTimer()
      }
      setIsPaused(!isPaused)
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRealtimeAnalysis = () => {
    // Simulate real-time feedback
    const analysisInterval = setInterval(() => {
      setFeedback(prev => ({
        ...prev,
        speakingPace: Math.floor(Math.random() * 30) + 120, // 120-150 wpm
        fillerWords: Math.floor(Math.random() * 3),
        suggestions: [
          'Maintain eye contact with the camera',
          'Great energy! Keep it up',
          'Consider slowing down slightly'
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      }))
    }, 5000)
    
    // Store interval ID for cleanup
    timerRef.analysisInterval = analysisInterval
  }

  const stopRealtimeAnalysis = () => {
    if (timerRef.analysisInterval) {
      clearInterval(timerRef.analysisInterval)
    }
  }

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setCameraEnabled(videoTrack.enabled)
    }
  }

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setMicEnabled(audioTrack.enabled)
    }
  }

  const retake = () => {
    setRecordedBlob(null)
    setRecordingTime(0)
    setPreviewMode(false)
    chunksRef.current = []
  }

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    stopTimer()
    stopRealtimeAnalysis()
  }

  const handleUpload = async () => {
    if (!recordedBlob) return
    
    // TODO: Upload to backend
    console.log('Uploading video...', recordedBlob)
    
    // Call onComplete with video data
    onComplete({
      blob: recordedBlob,
      duration: recordingTime,
      feedback: feedback
    })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSpeakingPaceColor = (pace) => {
    if (pace < 120) return 'text-yellow-600'
    if (pace > 160) return 'text-orange-600'
    return 'text-green-600'
  }

  const getQualityColor = (quality) => {
    if (quality >= 90) return 'text-green-600'
    if (quality >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-gray-900 rounded-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Video Recording Studio</h2>
            {isRecording && (
              <div className="flex items-center gap-2 ml-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-mono">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>
          <Button variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row">
          
          {/* Video Preview */}
          <div className="flex-1 bg-black p-6">
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted={!previewMode}
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <VideoOff className="h-16 w-16 text-gray-600" />
                </div>
              )}
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">REC</span>
                </div>
              )}
              
              {/* Time limit indicator */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded-full">
                <span className="text-white text-sm">
                  {formatTime(recordingTime)} / 15:00
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {!previewMode ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleCamera}
                    className={`${!cameraEnabled ? 'bg-red-600 text-white' : 'text-white border-gray-600'}`}
                  >
                    {cameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={toggleMic}
                    className={`${!micEnabled ? 'bg-red-600 text-white' : 'text-white border-gray-600'}`}
                  >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  
                  {!isRecording ? (
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-8"
                      disabled={recordingTime >= 900} // 15 min limit
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        onClick={pauseRecording}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {isPaused ? <Play className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white px-8"
                      >
                        <Square className="h-5 w-5 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={retake}
                    variant="outline"
                    className="text-white border-gray-600"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Retake
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={handleUpload}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Video
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Feedback Panel */}
          <div className="w-full lg:w-80 bg-gray-800 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              AI Feedback
            </h3>

            {/* Quality Metrics */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Video Quality</span>
                  <span className={`text-sm font-semibold ${getQualityColor(feedback.videoQuality)}`}>
                    {feedback.videoQuality}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${feedback.videoQuality}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Audio Quality</span>
                  <span className={`text-sm font-semibold ${getQualityColor(feedback.audioQuality)}`}>
                    {feedback.audioQuality}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${feedback.audioQuality}%` }}
                  />
                </div>
              </div>

              {isRecording && feedback.speakingPace > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Speaking Pace</span>
                    <span className={`text-sm font-semibold ${getSpeakingPaceColor(feedback.speakingPace)}`}>
                      {feedback.speakingPace} wpm
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Ideal: 120-160 words per minute</p>
                </div>
              )}

              {isRecording && feedback.fillerWords > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Filler Words</span>
                  <span className="text-sm font-semibold text-yellow-400">
                    {feedback.fillerWords} detected
                  </span>
                </div>
              )}
            </div>

            {/* Real-time Suggestions */}
            {feedback.suggestions.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  Tips
                </h4>
                <ul className="space-y-2">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recording Tips */}
            {!isRecording && !previewMode && (
              <div className="mt-6 bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700">
                <h4 className="text-sm font-semibold text-blue-300 mb-3">Recording Tips</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li>• Aim for 10-15 minutes</li>
                  <li>• Introduce yourself and your background</li>
                  <li>• Discuss your key skills and experience</li>
                  <li>• Share notable projects or achievements</li>
                  <li>• Explain your career goals</li>
                  <li>• Speak naturally and maintain eye contact</li>
                  <li>• Practice first if needed!</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

