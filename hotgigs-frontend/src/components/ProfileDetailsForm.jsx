import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, Briefcase, GraduationCap, Shield, Phone, Mail, 
  MapPin, Calendar, Globe, Building, FileText, CheckCircle, AlertCircle
} from 'lucide-react'

const WORK_AUTHORIZATION_OPTIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card Holder' },
  { value: 'h1b', label: 'H1B Visa' },
  { value: 'l1', label: 'L1 Visa' },
  { value: 'opt', label: 'OPT (F1)' },
  { value: 'cpt', label: 'CPT (F1)' },
  { value: 'ead', label: 'EAD' },
  { value: 'tn', label: 'TN Visa' },
  { value: 'need_sponsorship', label: 'Need Sponsorship' },
  { value: 'other', label: 'Other' }
]

const VISA_STATUS_OPTIONS = [
  { value: 'not_applicable', label: 'Not Applicable' },
  { value: 'valid', label: 'Valid' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_renewal', label: 'Pending Renewal' },
  { value: 'pending_transfer', label: 'Pending Transfer' }
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-Binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
]

const EDUCATION_LEVEL_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Associate Degree' },
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'master', label: 'Master\'s Degree' },
  { value: 'doctorate', label: 'Doctorate (PhD)' },
  { value: 'professional', label: 'Professional Degree' },
  { value: 'certificate', label: 'Certificate' }
]

const WORK_MODEL_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'flexible', label: 'Flexible' }
]

const RATE_TYPE_OPTIONS = [
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'salary', label: 'Annual Salary' }
]

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'w2', label: 'W2 Employee' },
  { value: 'c2c', label: 'Corp-to-Corp (C2C)' },
  { value: '1099', label: '1099 Contractor' }
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function ProfileDetailsForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    // Personal Information
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || '',
    nationality: initialData?.nationality || '',
    current_zip_code: initialData?.current_zip_code || '',
    
    // Contact Information
    phone_number: initialData?.phone_number || '',
    linkedin_url: initialData?.linkedin_url || '',
    
    // Work Authorization
    work_authorization: initialData?.work_authorization || '',
    work_authorization_end_date: initialData?.work_authorization_end_date || '',
    visa_status: initialData?.visa_status || 'not_applicable',
    w2_employer_name: initialData?.w2_employer_name || '',
    
    // Education
    highest_education: initialData?.highest_education || '',
    education_specialization: initialData?.education_specialization || '',
    degree_start_date: initialData?.degree_start_date || '',
    degree_end_date: initialData?.degree_end_date || '',
    university_name: initialData?.university_name || '',
    
    // Identification
    passport_number: initialData?.passport_number || '',
    ssn_last_4: initialData?.ssn_last_4 || '',
    
    // Location & Work Preferences
    preferred_city: initialData?.preferred_city || '',
    preferred_state: initialData?.preferred_state || '',
    work_model_preference: initialData?.work_model_preference || '',
    willing_to_relocate: initialData?.willing_to_relocate || false,
    
    // Availability
    availability_date: initialData?.availability_date || '',
    notice_period_days: initialData?.notice_period_days || '',
    
    // Compensation
    rate_type: initialData?.rate_type || '',
    expected_rate_min: initialData?.expected_rate_min || '',
    expected_rate_max: initialData?.expected_rate_max || '',
    employment_type: initialData?.employment_type || '',
    
    // Professional Highlights
    professional_summary: initialData?.professional_summary || '',
    strength_1: initialData?.key_strengths?.[0] || '',
    strength_2: initialData?.key_strengths?.[1] || '',
    strength_3: initialData?.key_strengths?.[2] || ''
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Required fields
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required'
    if (!formData.work_authorization) newErrors.work_authorization = 'Work authorization is required'
    if (!formData.highest_education) newErrors.highest_education = 'Education level is required'
    
    // SSN validation (must be 4 digits)
    if (formData.ssn_last_4 && !/^\d{4}$/.test(formData.ssn_last_4)) {
      newErrors.ssn_last_4 = 'Must be exactly 4 digits'
    }
    
    // Work authorization end date required for non-citizens
    if (formData.work_authorization && 
        formData.work_authorization !== 'us_citizen' && 
        formData.work_authorization !== 'green_card' &&
        !formData.work_authorization_end_date) {
      newErrors.work_authorization_end_date = 'End date is required for this authorization type'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculateCompletion = () => {
    const totalFields = 16
    const completedFields = Object.values(formData).filter(v => v && v !== '').length
    return Math.round((completedFields / totalFields) * 100)
  }

  const completion = calculateCompletion()

  const needsWorkAuthEndDate = formData.work_authorization && 
    formData.work_authorization !== 'us_citizen' && 
    formData.work_authorization !== 'green_card'

  const needsW2Employer = formData.work_authorization === 'h1b' || formData.work_authorization === 'l1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Profile Completion Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Profile Completion</span>
          <span className="text-sm font-bold text-blue-900">{completion}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="text-xs text-blue-700 mt-2">
            Complete your profile to increase your visibility to recruiters
          </p>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Nationality
            </label>
            <Input
              value={formData.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="e.g., United States"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Current Zip Code
            </label>
            <Input
              value={formData.current_zip_code}
              onChange={(e) => handleChange('current_zip_code', e.target.value)}
              placeholder="e.g., 94105"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-600" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={errors.phone_number ? 'border-red-500' : ''}
            />
            {errors.phone_number && (
              <p className="text-xs text-red-600 mt-1">{errors.phone_number}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              LinkedIn Profile URL
            </label>
            <Input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>
      </div>

      {/* Work Authorization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Work Authorization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Work Authorization Status *
            </label>
            <select
              value={formData.work_authorization}
              onChange={(e) => handleChange('work_authorization', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.work_authorization ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select work authorization</option>
              {WORK_AUTHORIZATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.work_authorization && (
              <p className="text-xs text-red-600 mt-1">{errors.work_authorization}</p>
            )}
          </div>
          
          {needsWorkAuthEndDate && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Work Authorization End Date *
                </label>
                <Input
                  type="date"
                  value={formData.work_authorization_end_date}
                  onChange={(e) => handleChange('work_authorization_end_date', e.target.value)}
                  className={errors.work_authorization_end_date ? 'border-red-500' : ''}
                />
                {errors.work_authorization_end_date && (
                  <p className="text-xs text-red-600 mt-1">{errors.work_authorization_end_date}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Visa Status
                </label>
                <select
                  value={formData.visa_status}
                  onChange={(e) => handleChange('visa_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {VISA_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          
          {needsW2Employer && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                <Building className="h-4 w-4 inline mr-1" />
                Current W2 Employer Name
              </label>
              <Input
                value={formData.w2_employer_name}
                onChange={(e) => handleChange('w2_employer_name', e.target.value)}
                placeholder="Company name on your W2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          Education
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Highest Education Level *
            </label>
            <select
              value={formData.highest_education}
              onChange={(e) => handleChange('highest_education', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.highest_education ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.highest_education && (
              <p className="text-xs text-red-600 mt-1">{errors.highest_education}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Specialization / Major
            </label>
            <Input
              value={formData.education_specialization}
              onChange={(e) => handleChange('education_specialization', e.target.value)}
              placeholder="e.g., Computer Science"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              University / Institution Name
            </label>
            <Input
              value={formData.university_name}
              onChange={(e) => handleChange('university_name', e.target.value)}
              placeholder="e.g., Stanford University"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Degree Start Date
            </label>
            <Input
              type="date"
              value={formData.degree_start_date}
              onChange={(e) => handleChange('degree_start_date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Degree End Date
            </label>
            <Input
              type="date"
              value={formData.degree_end_date}
              onChange={(e) => handleChange('degree_end_date', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Identification (Secure) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-600" />
          Identification (Secure)
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            This information is encrypted and only shared with recruiters when you apply for jobs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Passport Number (Optional)
            </label>
            <Input
              value={formData.passport_number}
              onChange={(e) => handleChange('passport_number', e.target.value)}
              placeholder="Passport number"
              type="password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Last 4 digits of SSN
            </label>
            <Input
              value={formData.ssn_last_4}
              onChange={(e) => handleChange('ssn_last_4', e.target.value)}
              placeholder="1234"
              maxLength={4}
              type="password"
              className={errors.ssn_last_4 ? 'border-red-500' : ''}
            />
            {errors.ssn_last_4 && (
              <p className="text-xs text-red-600 mt-1">{errors.ssn_last_4}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location & Work Preferences */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-teal-600" />
          Location & Work Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred City
            </label>
            <Input
              value={formData.preferred_city}
              onChange={(e) => handleChange('preferred_city', e.target.value)}
              placeholder="e.g., San Francisco"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred State
            </label>
            <select
              value={formData.preferred_state}
              onChange={(e) => handleChange('preferred_state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select state</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Work Model Preference
            </label>
            <select
              value={formData.work_model_preference}
              onChange={(e) => handleChange('work_model_preference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select work model</option>
              {WORK_MODEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.willing_to_relocate}
                onChange={(e) => handleChange('willing_to_relocate', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium">Willing to Relocate</span>
            </label>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          Availability
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Available to Start
            </label>
            <Input
              type="date"
              value={formData.availability_date}
              onChange={(e) => handleChange('availability_date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Notice Period (Days)
            </label>
            <Input
              type="number"
              value={formData.notice_period_days}
              onChange={(e) => handleChange('notice_period_days', e.target.value)}
              placeholder="e.g., 14"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Compensation Expectations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rate Type
            </label>
            <select
              value={formData.rate_type}
              onChange={(e) => handleChange('rate_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select rate type</option>
              {RATE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => handleChange('employment_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select employment type</option>
              {EMPLOYMENT_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Expected Rate/Salary (Min)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                type="number"
                value={formData.expected_rate_min}
                onChange={(e) => handleChange('expected_rate_min', e.target.value)}
                placeholder={formData.rate_type === 'hourly' ? '50' : '100000'}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.rate_type === 'hourly' ? 'Per hour' : 'Per year'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Expected Rate/Salary (Max)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <Input
                type="number"
                value={formData.expected_rate_max}
                onChange={(e) => handleChange('expected_rate_max', e.target.value)}
                placeholder={formData.rate_type === 'hourly' ? '75' : '150000'}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.rate_type === 'hourly' ? 'Per hour' : 'Per year'}
            </p>
          </div>
          
          {formData.rate_type && formData.employment_type && formData.expected_rate_min && (
            <div className="md:col-span-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Rate Description:</strong> ${formData.expected_rate_min}
                  {formData.expected_rate_max && ` - $${formData.expected_rate_max}`}
                  {formData.rate_type === 'hourly' ? '/hr' : '/year'} {formData.employment_type.toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Highlights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-yellow-600" />
          Professional Highlights
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Professional Summary
            </label>
            <textarea
              value={formData.professional_summary}
              onChange={(e) => handleChange('professional_summary', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of your professional background and expertise..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Key Strengths / Impact Points
            </label>
            <p className="text-xs text-gray-600 mb-2">Highlight your top achievements or strengths</p>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-2">•</span>
                <Input
                  value={formData.strength_1}
                  onChange={(e) => handleChange('strength_1', e.target.value)}
                  placeholder="e.g., Led team of 10 engineers to deliver $2M project ahead of schedule"
                />
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-2">•</span>
                <Input
                  value={formData.strength_2}
                  onChange={(e) => handleChange('strength_2', e.target.value)}
                  placeholder="e.g., Reduced system latency by 40% through architecture optimization"
                />
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-2">•</span>
                <Input
                  value={formData.strength_3}
                  onChange={(e) => handleChange('strength_3', e.target.value)}
                  placeholder="e.g., Expert in React, Node.js, and cloud architecture (AWS, Azure)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-green-600"
        >
          {saving ? 'Saving...' : 'Save Profile Details'}
        </Button>
      </div>
    </form>
  )
}

