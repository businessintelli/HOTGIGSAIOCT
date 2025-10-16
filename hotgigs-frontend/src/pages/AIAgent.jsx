
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Bot, BrainCircuit, Zap, BarChart, FileText, MessageSquare } from 'lucide-react';

export default function AIAgent() {
  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-blue-600" />,
      title: "Intelligent Candidate Sourcing",
      description: "Orion proactively searches and identifies top candidates from a vast talent pool, matching their skills and experience to your job requirements with unparalleled accuracy.",
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: "Automated Resume Screening",
      description: "Save countless hours with AI-powered resume screening. Orion analyzes and scores resumes based on your criteria, highlighting the most promising candidates instantly.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      title: "AI-Powered Interviewing",
      description: "Conduct consistent and unbiased initial interviews with our AI agent. Orion asks role-specific questions, assesses responses, and provides detailed performance reports.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Predictive Performance Analytics",
      description: "Leverage predictive analytics to identify candidates with the highest potential for success. Orion analyzes data points to forecast future job performance and cultural fit.",
    },
    {
      icon: <BarChart className="h-8 w-8 text-red-600" />,
      title: "Data-Driven Hiring Insights",
      description: "Gain a competitive edge with actionable insights. Orion provides real-time data on your hiring pipeline, market trends, and talent analytics to inform your strategy.",
    },
    {
      icon: <Bot className="h-8 w-8 text-indigo-600" />,
      title: "24/7 Recruitment Assistance",
      description: "Your AI copilot works around the clock, engaging candidates, answering queries, and scheduling interviews, ensuring a seamless experience for everyone.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto">
          <Bot className="h-24 w-24 mx-auto mb-6 opacity-80" />
          <h1 className="text-5xl font-bold mb-6">
            Meet Orion, Your AI Recruitment Copilot
          </h1>
          <p className="text-xl leading-relaxed max-w-3xl mx-auto">
            Orion is the intelligent heart of HotGigs.ai, an advanced AI agent designed to automate, optimize, and elevate your entire recruitment process from start to finish.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">How Orion Transforms Your Hiring</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Experience the Future of Recruitment</h2>
          <p className="text-xl text-gray-600 mb-8">
            Let Orion find your next great hire. Get started with HotGigs.ai today and see the power of AI in action.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              Start Your Free Trial
            </Link>
            <Link
              to="/features"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Explore All Features
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

