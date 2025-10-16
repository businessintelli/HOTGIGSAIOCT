
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';

export default function Pricing() {
  const tiers = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'For individuals and small teams getting started.',
      features: [
        '1 active job posting',
        '50 candidate applications per month',
        'Basic ATS features',
        'Email support',
      ],
      cta: 'Get Started',
      ctaLink: '/signup',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$99',
      priceSuffix: '/ month',
      description: 'For growing businesses that need more power and support.',
      features: [
        '10 active job postings',
        '500 candidate applications per month',
        'Advanced ATS features',
        'AI-powered candidate matching',
        'Priority email support',
      ],
      cta: 'Start Free Trial',
      ctaLink: '/signup',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with complex needs.',
      features: [
        'Unlimited job postings',
        'Unlimited candidate applications',
        'Full ATS and CRM suite',
        'Advanced AI and analytics',
        'Dedicated account manager',
        '24/7 premium support',
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      popular: false,
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Choose the plan that's right for you. All plans come with a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className={`bg-white rounded-2xl shadow-lg p-8 flex flex-col ${tier.popular ? 'border-4 border-blue-600' : ''}`}>
              {tier.popular && <div className="text-center mb-4"><span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span></div>}
              <h3 className="text-2xl font-bold text-center text-gray-900">{tier.name}</h3>
              <div className="mt-4 text-center text-gray-900">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.priceSuffix && <span className="text-lg font-medium">{tier.priceSuffix}</span>}
              </div>
              <p className="mt-4 text-center text-gray-600 h-16">{tier.description}</p>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="flex-shrink-0 h-6 w-6 text-green-500" />
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                 <Link to={tier.ctaLink} className={`w-full block text-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${tier.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

