import { useState } from 'react';
import { Bot, Search, FileText, Sparkles, MessageSquare } from 'lucide-react';
import OrionChat from '../components/OrionChat';
import AdvancedSearch from '../components/AdvancedSearch';

export default function AIFeatures() {
  const [showOrionChat, setShowOrionChat] = useState(false);
  const [orionMinimized, setOrionMinimized] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Orion AI Copilot",
      description: "Get 24/7 career guidance, interview prep, and personalized advice from our AI assistant.",
      color: "from-blue-500 to-purple-500",
      action: () => setShowOrionChat(true)
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "AI Job Matching",
      description: "Find your perfect job with our intelligent matching algorithm that scores job fit.",
      color: "from-green-500 to-teal-500",
      action: () => window.location.href = '/jobs'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Resume AI Analyzer",
      description: "Get instant feedback on your resume with ATS compatibility scoring and recommendations.",
      color: "from-orange-500 to-red-500",
      action: () => window.location.href = '/dashboard'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Job Description Generator",
      description: "Create professional, ATS-optimized job descriptions in seconds with AI.",
      color: "from-pink-500 to-purple-500",
      action: () => window.location.href = '/post-job'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HotGigs.ai
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/jobs" className="text-gray-600 hover:text-gray-900">Jobs</a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            AI-Powered Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of job search with our cutting-edge AI features designed to accelerate your career.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all cursor-pointer group"
              onClick={feature.action}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <button className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2">
                Try it now
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Advanced Search Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Advanced Job Search</h2>
            <p className="text-gray-600">
              Use our powerful search engine with AI-powered filters to find your perfect job.
            </p>
          </div>
          <AdvancedSearch onResultsUpdate={setSearchResults} />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Search Results ({searchResults.length})
            </h3>
            <div className="grid gap-4">
              {searchResults.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h4>
                      <p className="text-gray-600">{job.company?.name || 'Company Name'}</p>
                      <p className="text-sm text-gray-500">{job.location} • {job.work_model}</p>
                    </div>
                    {job.ai_match_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(job.ai_match_score)}%
                        </div>
                        <p className="text-xs text-gray-500">Match Score</p>
                      </div>
                    )}
                  </div>
                  
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.required_skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {job.employment_type} • {job.experience_level}
                      {job.salary_min && job.salary_max && (
                        <span> • ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orion CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-12 text-center text-white">
          <Bot className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Need Career Guidance?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Chat with Orion, your AI career copilot, available 24/7 to help you succeed.
          </p>
          <button
            onClick={() => setShowOrionChat(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center gap-2 mx-auto"
          >
            <MessageSquare className="w-6 h-6" />
            Start Chat with Orion
          </button>
        </div>
      </div>

      {/* Orion Chat Component */}
      <OrionChat
        isOpen={showOrionChat}
        onClose={() => setShowOrionChat(false)}
        minimized={orionMinimized}
        onToggleMinimize={() => setOrionMinimized(!orionMinimized)}
      />

      {/* Floating Orion Button */}
      {!showOrionChat && (
        <button
          onClick={() => setShowOrionChat(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-30"
        >
          <Bot className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}

