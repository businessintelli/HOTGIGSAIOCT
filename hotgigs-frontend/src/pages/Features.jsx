
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Users, BarChart, Filter, Video, Bot, Award } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-white" />,
      title: "AI-Powered Matching",
      description: "Our advanced AI algorithm goes beyond keywords to match candidates with jobs based on skills, experience, and cultural fit, reducing screening time by up to 80%.",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: <Users className="h-10 w-10 text-white" />,
      title: "Comprehensive ATS",
      description: "Manage your entire hiring workflow in one place. Track applicants, schedule interviews, and collaborate with your team seamlessly.",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: <BarChart className="h-10 w-10 text-white" />,
      title: "Real-Time Analytics",
      description: "Gain valuable insights into your recruitment process with our powerful analytics dashboard. Monitor key metrics and make data-driven decisions.",
      color: "from-green-500 to-green-700",
    },
    {
      icon: <Filter className="h-10 w-10 text-white" />,
      title: "Advanced Search",
      description: "Find the perfect candidate with our advanced search and filtering options. Search by location, skills, experience, and more.",
      color: "from-yellow-500 to-yellow-700",
    },
    {
      icon: <Video className="h-10 w-10 text-white" />,
      title: "Video Profiles",
      description: "Get a better sense of a candidate's personality and communication skills with our video profile feature.",
      color: "from-red-500 to-red-700",
    },
    {
      icon: <Bot className="h-10 w-10 text-white" />,
      title: "Orion AI Copilot",
      description: "Our AI assistant, Orion, helps you with everything from writing job descriptions to preparing for interviews.",
      color: "from-indigo-500 to-indigo-700",
    },
     {
      icon: <Award className="h-10 w-10 text-white" />,
      title: "Candidate Assessments",
      description: "Create custom assessments to test candidates' skills and knowledge, ensuring you hire the best person for the job.",
      color: "from-pink-500 to-pink-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HotGigs.ai
              </span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Future of Recruitment is Here
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Discover the powerful features that make HotGigs.ai the most effective recruitment platform on the market.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow transform hover:-translate-y-1">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Supercharge Your Hiring?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Sign up for a free trial and experience the power of AI-driven recruitment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

