import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Mail, 
  Phone, 
  Linkedin, 
  Twitter,
  Save,
  Upload,
  ArrowLeft,
  Briefcase,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company profile state
  const [profile, setProfile] = useState({
    // Basic Information
    companyName: 'Tech Innovations Inc',
    industry: 'Technology',
    companySize: '51-200',
    founded: '2015',
    website: 'https://techinnovations.com',
    
    // Contact Information
    email: 'contact@techinnovations.com',
    phone: '+1 (555) 123-4567',
    
    // Location
    headquarters: 'San Francisco, CA',
    locations: ['San Francisco, CA', 'New York, NY', 'Austin, TX'],
    
    // Social Media
    linkedin: 'https://linkedin.com/company/tech-innovations',
    twitter: 'https://twitter.com/techinnovations',
    
    // Company Description
    description: `Tech Innovations Inc is a leading technology company specializing in AI-powered solutions for enterprise clients. We're committed to innovation, excellence, and creating products that make a difference.

Our team of talented engineers, designers, and product managers work together to build cutting-edge software solutions that help businesses transform digitally.`,
    
    // Company Culture
    culture: `We believe in:
• Innovation and continuous learning
• Work-life balance and flexible working
• Diversity and inclusion
• Collaborative team environment
• Employee growth and development`,
    
    // Benefits
    benefits: [
      'Competitive salary and equity',
      'Comprehensive health insurance',
      'Flexible work arrangements',
      '401(k) with company match',
      'Unlimited PTO',
      'Professional development budget',
      'Gym membership',
      'Catered lunches',
      'Latest tech equipment',
      'Team building events'
    ],
    
    // Company Stats
    stats: {
      employees: 150,
      openPositions: 12,
      averageTenure: '3.5 years',
      fundingRaised: '$25M Series B'
    },
    
    // Logo and Images
    logo: null,
    coverImage: null
  });

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addLocation = () => {
    setProfile(prev => ({
      ...prev,
      locations: [...prev.locations, '']
    }));
  };

  const removeLocation = (index) => {
    setProfile(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  const addBenefit = () => {
    setProfile(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const removeBenefit = (index) => {
    setProfile(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Call API to save profile
    // await apiService.updateCompanyProfile(profile);
    
    setIsSaving(false);
    setIsEditing(false);
    
    // Show success message
    alert('Company profile updated successfully!');
  };

  const handleImageUpload = (field) => {
    // TODO: Implement image upload
    alert('Image upload functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/company-dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                <p className="text-sm text-gray-500">Manage your company information</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              {isEditing && (
                <button
                  onClick={() => handleImageUpload('coverImage')}
                  className="absolute top-4 right-4 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Cover</span>
                </button>
              )}
            </div>
            
            {/* Logo and Basic Info */}
            <div className="px-6 pb-6">
              <div className="flex items-end -mt-16 mb-4">
                <div className="w-32 h-32 bg-white rounded-lg border-4 border-white shadow-lg flex items-center justify-center relative">
                  <Building2 className="w-16 h-16 text-blue-600" />
                  {isEditing && (
                    <button
                      onClick={() => handleImageUpload('logo')}
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="ml-6 flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="text-3xl font-bold text-gray-900 border-b-2 border-blue-600 focus:outline-none bg-transparent w-full"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold text-gray-900">{profile.companyName}</h2>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        />
                      ) : (
                        <span>{profile.industry}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      {isEditing ? (
                        <select
                          value={profile.companySize}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          className="border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        >
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501-1000">501-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      ) : (
                        <span>{profile.companySize} employees</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.founded}
                          onChange={(e) => handleInputChange('founded', e.target.value)}
                          className="border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent w-20"
                          placeholder="Year"
                        />
                      ) : (
                        <span>Founded {profile.founded}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.employees}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Open Positions</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.openPositions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Tenure</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.averageTenure}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Funding</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.fundingRaised}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Us</h3>
                {isEditing ? (
                  <textarea
                    value={profile.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-line">{profile.description}</p>
                )}
              </div>

              {/* Company Culture */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Culture</h3>
                {isEditing ? (
                  <textarea
                    value={profile.culture}
                    onChange={(e) => handleInputChange('culture', e.target.value)}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600 whitespace-pre-line">{profile.culture}</p>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Benefits & Perks</h3>
                  {isEditing && (
                    <button
                      onClick={addBenefit}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Benefit
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removeBenefit(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-600">{benefit}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Details */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm text-gray-500 mb-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm text-gray-500 mb-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm text-gray-500 mb-1">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
                  {isEditing && (
                    <button
                      onClick={addLocation}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {profile.locations.map((location, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => handleArrayChange('locations', index, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removeLocation(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-600">{location}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center text-sm text-gray-500 mb-1">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Profile
                      </a>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm text-gray-500 mb-1">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;

