
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
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
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We'd love to hear from you. Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="name" name="name" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" id="email" name="email" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea id="message" name="message" rows="4" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div>
                  <button type="submit" className="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-shadow">
                    <Send className="h-5 w-5" />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">General Inquiries</h4>
                      <p className="text-gray-600">contact@hotgigs.ai</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Sales & Support</h4>
                      <p className="text-gray-600">(+1) 123-456-7890</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Offices</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">San Francisco (HQ)</h4>
                      <p className="text-gray-600">123 AI Avenue, Silicon Valley, CA 94107</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">New York</h4>
                      <p className="text-gray-600">456 Innovation Drive, Tech Hub, NY 10012</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

