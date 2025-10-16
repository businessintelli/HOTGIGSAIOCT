
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Sparkles } from 'lucide-react';

export default function TermsOfService() {
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
            <FileText className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-lg text-gray-600 mt-2">Last updated: October 16, 2025</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
            <p className='text-red-500 font-bold'>Disclaimer: This is a template terms of service and not legal advice. You should consult with a legal professional to ensure your terms of service are compliant with all applicable laws and regulations.</p>

            <p>Please read these Terms of Service ('Terms', 'Terms of Service') carefully before using the HotGigs.ai website (the 'Service') operated by HotGigs.ai ('us', 'we', or 'our').</p>

            <h2>1. Accounts</h2>
            <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

            <h2>2. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of HotGigs.ai and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>

            <h2>3. Links To Other Web Sites</h2>
            <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by HotGigs.ai. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.</p>

            <h2>4. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

            <h2>5. Limitation Of Liability</h2>
            <p>In no event shall HotGigs.ai, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h2>6. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.</p>

            <h2>7. Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:legal@hotgigs.ai">legal@hotgigs.ai</a>.</p>
        </div>
      </main>
    </div>
  );
}

