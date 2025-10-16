
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

      <main className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
            <Shield className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-lg text-gray-600 mt-2">Last updated: October 16, 2025</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
            <p className='text-red-500 font-bold'>Disclaimer: This is a template privacy policy and not legal advice. You should consult with a legal professional to ensure your privacy policy is compliant with all applicable laws and regulations.</p>
            
            <p>Welcome to HotGigs.ai. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>

            <h2>1. Information We Collect</h2>
            <p>We may collect personal information from you in a variety of ways, including, but not limited to, when you register on the site, create a profile, apply for a job, or fill out a form. The information we may collect includes:</p>
            <ul>
                <li><strong>Personal Data:</strong> Name, email address, phone number, and other contact details.</li>
                <li><strong>Professional Data:</strong> Resume, work history, skills, education, and other information you provide in your profile.</li>
                <li><strong>Usage Data:</strong> Information about how you use the platform, such as your search queries, job applications, and browsing history.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Provide, operate, and maintain our platform.</li>
                <li>Improve, personalize, and expand our platform.</li>
                <li>Understand and analyze how you use our platform.</li>
                <li>Develop new products, services, features, and functionality.</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the platform, and for marketing and promotional purposes.</li>
                <li>Process your transactions.</li>
                <li>Find and prevent fraud.</li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>We may share your information with third parties in the following situations:</p>
            <ul>
                <li><strong>With Employers:</strong> When you apply for a job, your profile and application information will be shared with the employer.</li>
                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors and service providers that perform services for us or on our behalf.</li>
                <li><strong>For Legal Reasons:</strong> We may share your information when we believe it is necessary to comply with a legal obligation, protect our rights or property, or prevent fraud or illegal activity.</li>
            </ul>

            <h2>4. Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul>
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, you can contact us at <a href="mailto:privacy@hotgigs.ai">privacy@hotgigs.ai</a>.</p>
        </div>
      </main>
    </div>
  );
}

