
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Rss, ArrowRight } from 'lucide-react';

export default function Blog() {
  const posts = [
    {
      title: "The Rise of AI in Recruitment: A Game-Changer for Hiring",
      description: "Artificial intelligence is no longer a futuristic concept; it's a present-day reality that is transforming the recruitment landscape. Discover how AI is helping companies find better talent, faster.",
      author: "Jane Doe",
      date: "October 10, 2025",
      image: "/blog/ai-recruitment.jpg",
    },
    {
      title: "5 Ways to Reduce Bias in Your Hiring Process",
      description: "Unconscious bias can creep into the hiring process, preventing you from building a truly diverse team. Learn five practical strategies to promote fairness and inclusivity in your recruitment efforts.",
      author: "John Smith",
      date: "September 28, 2025",
      image: "/blog/reduce-bias.jpg",
    },
    {
      title: "How to Write a Job Description That Attracts Top Talent",
      description: "A well-crafted job description is your secret weapon in the war for talent. Find out how to write compelling job descriptions that resonate with your ideal candidates and make them want to apply.",
      author: "Emily White",
      date: "September 15, 2025",
      image: "/blog/job-description.jpg",
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
      <section className="py-20 px-4 text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto">
          <Rss className="h-24 w-24 mx-auto mb-6 opacity-80" />
          <h1 className="text-5xl font-bold mb-6">
            HotGigs.ai Blog
          </h1>
          <p className="text-xl leading-relaxed max-w-3xl mx-auto">
            Insights and analysis on the future of work, recruitment, and artificial intelligence.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-1 gap-12">
            {posts.map((post, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow transform hover:-translate-y-1">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <img className="h-48 w-full object-cover md:w-48" src={post.image} alt={post.title} />
                  </div>
                  <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">Recruitment & AI</div>
                    <Link to="#" className="block mt-1 text-2xl leading-tight font-bold text-black hover:underline">{post.title}</Link>
                    <p className="mt-2 text-gray-600">{post.description}</p>
                    <div className="mt-4 flex items-center">
                      <p className="text-sm text-gray-500">
                        By {post.author} on {post.date}
                      </p>
                      <Link to="#" className="ml-auto flex items-center text-blue-600 hover:text-blue-800">
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

