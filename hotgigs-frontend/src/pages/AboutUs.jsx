import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, Users, Award, TrendingUp, Heart } from 'lucide-react';

export default function AboutUs() {
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
            Revolutionizing Recruitment with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            HotGigs.ai is transforming the way companies find talent and candidates discover opportunities. 
            We're building the future of recruitment, powered by cutting-edge AI technology.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <Target className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To democratize access to top talent by leveraging artificial intelligence to eliminate bias, 
                reduce time-to-hire, and create meaningful connections between exceptional candidates and 
                forward-thinking companies. We believe every person deserves a fair chance, and every company 
                deserves to find the perfect fit.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
              <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                To become the world's most trusted AI-powered recruitment platform, where technology and 
                human insight work in perfect harmony. We envision a future where hiring is faster, fairer, 
                and more effective—where the right opportunities find the right people, every single time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              HotGigs.ai was born from a simple observation: traditional recruitment is broken. Hiring managers 
              spend countless hours sifting through resumes, candidates struggle to get noticed, and unconscious 
              bias affects decisions at every stage. We knew there had to be a better way.
            </p>
            <p className="mb-6">
              Founded in 2023 by a team of AI researchers, recruitment veterans, and software engineers, 
              HotGigs.ai set out to build the recruitment platform we wished existed. We combined decades 
              of hiring expertise with state-of-the-art machine learning to create an ATS that doesn't just 
              store resumes—it understands them.
            </p>
            <p className="mb-6">
              Today, we're proud to serve thousands of companies and millions of job seekers worldwide. 
              Our AI-powered matching engine has facilitated over 100,000 successful hires, reduced 
              time-to-hire by an average of 40%, and helped create more diverse, high-performing teams.
            </p>
            <p>
              But we're just getting started. Every day, we're pushing the boundaries of what's possible 
              in recruitment technology, always with one goal in mind: connecting great people with great opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">People First</h3>
              <p className="text-gray-600">
                Technology should serve people, not the other way around. Every feature we build starts 
                with understanding human needs and creating genuine value.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Award className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                We're obsessed with quality. From our AI algorithms to our customer support, we strive 
                for excellence in everything we do.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                The recruitment industry is ripe for disruption. We're not afraid to challenge the status 
                quo and pioneer new approaches to age-old problems.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Heart className="h-10 w-10 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fairness</h3>
              <p className="text-gray-600">
                We're committed to reducing bias in hiring. Our AI is designed to focus on skills and 
                potential, not demographics or pedigree.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="h-10 w-10 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparency</h3>
              <p className="text-gray-600">
                We believe in open communication and honest relationships. Our AI's decisions are explainable, 
                and our pricing is straightforward.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Target className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impact</h3>
              <p className="text-gray-600">
                We measure success by the positive impact we create—better hires, happier employees, 
                and more successful companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Our Team</h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            We're a diverse team of technologists, recruiters, and dreamers united by a shared passion 
            for making hiring better for everyone.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'Sarah Chen', role: 'CEO & Co-Founder', bg: 'from-blue-400 to-blue-600' },
              { name: 'Michael Rodriguez', role: 'CTO & Co-Founder', bg: 'from-purple-400 to-purple-600' },
              { name: 'Emily Thompson', role: 'Head of AI', bg: 'from-pink-400 to-pink-600' },
              { name: 'David Kim', role: 'Head of Product', bg: 'from-green-400 to-green-600' },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.bg} flex items-center justify-center text-white text-3xl font-bold`}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Companies</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">5M+</div>
              <div className="text-blue-100">Job Seekers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100K+</div>
              <div className="text-blue-100">Successful Hires</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">40%</div>
              <div className="text-blue-100">Faster Hiring</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Join Us on Our Journey</h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you're hiring or looking for your next opportunity, we'd love to have you as part 
            of the HotGigs.ai community.
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
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

