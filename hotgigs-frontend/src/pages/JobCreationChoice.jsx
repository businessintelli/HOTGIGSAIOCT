import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, FileText, Wand2, ArrowLeft } from 'lucide-react'

export default function JobCreationChoice() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/company-dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job Posting</h1>
          <p className="text-gray-600 mt-2">Choose how you'd like to create your job posting</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* AI-Generated Option */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all p-8 cursor-pointer group"
               onClick={() => navigate('/ai-job-generator')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="h-10 w-10 text-white" />
              </div>
              
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                ✨ Recommended
              </Badge>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                AI-Generated Job Post
              </h2>
              
              <p className="text-gray-600 mb-6">
                Let our AI create a comprehensive job posting for you in seconds. 
                Just provide basic details and we'll handle the rest.
              </p>
              
              <div className="space-y-3 mb-8 text-left w-full">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Auto-generate</strong> job description and requirements
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>AI-suggested</strong> skills and qualifications
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Automatically create</strong> screening questions
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Optimized</strong> for maximum candidate reach
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/ai-job-generator')
                }}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate with AI
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                ⚡ Takes less than 2 minutes
              </p>
            </div>
          </div>

          {/* Manual Option */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-gray-400 transition-all p-8 cursor-pointer group"
               onClick={() => navigate('/post-job?mode=manual')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-10 w-10 text-white" />
              </div>
              
              <Badge variant="secondary" className="mb-4">
                Full Control
              </Badge>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Manual Job Creation
              </h2>
              
              <p className="text-gray-600 mb-6">
                Create your job posting from scratch with complete control over 
                every detail and requirement.
              </p>
              
              <div className="space-y-3 mb-8 text-left w-full">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Full control</strong> over job description
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Customize</strong> skill requirements manually
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Create custom</strong> screening questions
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Perfect</strong> for unique or specialized roles
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full"
                variant="outline"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/post-job?mode=manual')
                }}
              >
                <FileText className="h-5 w-5 mr-2" />
                Create Manually
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                📝 Takes 5-10 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Not sure which to choose? Try <strong>AI-Generated</strong> first - you can always edit it later!
          </p>
        </div>
      </div>
    </div>
  )
}

