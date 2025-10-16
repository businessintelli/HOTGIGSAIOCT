import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, ArrowLeft, ArrowRight, Check, Wand2, Edit, 
  Briefcase, MapPin, DollarSign, Users, Clock, Building
} from 'lucide-react'
import api from '../lib/api'

export default function AIJobGenerator() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Basic Info, 2: AI Generation, 3: Review & Edit, 4: Success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    company: '',
    location: '',
    workModel: 'hybrid',
    employmentType: 'full_time',
    experienceLevel: 'mid',
    salaryMin: '',
    salaryMax: '',
    department: ''
  })

  const [generatedJob, setGeneratedJob] = useState(null)

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }))
  }

  const generateJobWithAI = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Simulate AI generation for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generated = {
        ...basicInfo,
        description: `We are seeking a talented ${basicInfo.title} to join our ${basicInfo.department || 'team'} at ${basicInfo.company}. This is an exciting opportunity to work on cutting-edge projects and make a significant impact.\n\nIn this role, you will be responsible for leading key initiatives, collaborating with cross-functional teams, and driving innovation. The ideal candidate will have a strong background in their field and a passion for excellence.`,
        responsibilities: [
          `Lead and manage ${basicInfo.title} projects from conception to completion`,
          'Collaborate with cross-functional teams to define and implement solutions',
          'Mentor junior team members and contribute to team growth',
          'Stay current with industry trends and best practices',
          'Drive continuous improvement initiatives'
        ],
        qualifications: [
          `${basicInfo.experienceLevel === 'senior' ? '7+' : basicInfo.experienceLevel === 'mid' ? '3-7' : '0-3'} years of relevant experience`,
          'Strong problem-solving and analytical skills',
          'Excellent communication and collaboration abilities',
          'Bachelor\'s degree in related field or equivalent experience',
          'Proven track record of delivering results'
        ],
        skills: [
          { name: 'Leadership', required: true, min_years: 2 },
          { name: 'Communication', required: true, min_years: 3 },
          { name: 'Problem Solving', required: true, min_years: 2 },
          { name: 'Project Management', required: false, min_years: 1 },
          { name: 'Technical Skills', required: true, min_years: 3 }
        ],
        screeningQuestions: [
          {
            question: `How many years of experience do you have as a ${basicInfo.title}?`,
            type: 'text',
            required: true
          },
          {
            question: 'What is your expected salary range?',
            type: 'text',
            required: true
          },
          {
            question: 'When can you start?',
            type: 'text',
            required: true
          },
          {
            question: `Describe a challenging project you've worked on and how you overcame obstacles.`,
            type: 'long_text',
            required: true
          }
        ]
      }
      
      setGeneratedJob(generated)
      setStep(3)
    } catch (err) {
      console.error('Error generating job:', err)
      setError('Failed to generate job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (field, value) => {
    setGeneratedJob(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayEdit = (field, index, value) => {
    setGeneratedJob(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field, defaultValue) => {
    setGeneratedJob(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }))
  }

  const removeArrayItem = (field, index) => {
    setGeneratedJob(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const postJob = async () => {
    setLoading(true)
    setError('')
    
    try {
      // TODO: Call actual API
      console.log('Posting job:', generatedJob)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStep(4)
    } catch (err) {
      console.error('Error posting job:', err)
      setError('Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate('/create-job') : setStep(step - 1)}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              AI Job Generator
            </h1>
            <p className="text-gray-600 mt-2">Let AI create your perfect job posting</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'AI Generation' },
              { num: 3, label: 'Review & Edit' },
              { num: 4, label: 'Published' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step > s.num ? 'bg-green-600 text-white' :
                    step === s.num ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= s.num ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step > s.num ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about the position</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Job Title *
                  </label>
                  <Input
                    value={basicInfo.title}
                    onChange={(e) => handleBasicInfoChange('title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    Company Name *
                  </label>
                  <Input
                    value={basicInfo.company}
                    onChange={(e) => handleBasicInfoChange('company', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input
                    value={basicInfo.department}
                    onChange={(e) => handleBasicInfoChange('department', e.target.value)}
                    placeholder="e.g., Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location *
                  </label>
                  <Input
                    value={basicInfo.location}
                    onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Model *
                  </label>
                  <select
                    value={basicInfo.workModel}
                    onChange={(e) => handleBasicInfoChange('workModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    value={basicInfo.employmentType}
                    onChange={(e) => handleBasicInfoChange('employmentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-2" />
                    Experience Level *
                  </label>
                  <select
                    value={basicInfo.experienceLevel}
                    onChange={(e) => handleBasicInfoChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-7 years)</option>
                    <option value="senior">Senior Level (7+ years)</option>
                    <option value="lead">Lead/Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Salary Range (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={basicInfo.salaryMin}
                      onChange={(e) => handleBasicInfoChange('salaryMin', e.target.value)}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={basicInfo.salaryMax}
                      onChange={(e) => handleBasicInfoChange('salaryMax', e.target.value)}
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate('/create-job')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!basicInfo.title || !basicInfo.company || !basicInfo.location}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: AI Generation */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wand2 className="h-12 w-12 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to generate your job posting?
              </h2>
              
              <p className="text-gray-600 mb-8">
                Our AI will create a comprehensive job description, requirements, 
                skill matrix, and screening questions based on the information you provided.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm font-medium text-blue-900 mb-2">What we'll generate:</p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    Compelling job description
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    Key responsibilities and qualifications
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    Required skills with experience levels
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    Custom screening questions
                  </li>
                </ul>
              </div>

              <Button
                onClick={generateJobWithAI}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Job Posting
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Edit */}
        {step === 3 && generatedJob && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Job Posting Generated! ✨</h2>
              <p>Review and customize the details below, then publish when ready.</p>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <textarea
                value={generatedJob.description}
                onChange={(e) => handleEdit('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Key Responsibilities</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('responsibilities', '')}
                >
                  Add More
                </Button>
              </div>
              <div className="space-y-2">
                {generatedJob.responsibilities.map((resp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={resp}
                      onChange={(e) => handleArrayEdit('responsibilities', idx, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('responsibilities', idx)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Qualifications</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('qualifications', '')}
                >
                  Add More
                </Button>
              </div>
              <div className="space-y-2">
                {generatedJob.qualifications.map((qual, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={qual}
                      onChange={(e) => handleArrayEdit('qualifications', idx, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('qualifications', idx)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedJob.skills.map((skill, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <Input
                      value={skill.name}
                      onChange={(e) => handleArrayEdit('skills', idx, { ...skill, name: e.target.value })}
                      className="mb-2"
                      placeholder="Skill name"
                    />
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={skill.required}
                          onChange={(e) => handleArrayEdit('skills', idx, { ...skill, required: e.target.checked })}
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <Input
                        type="number"
                        value={skill.min_years}
                        onChange={(e) => handleArrayEdit('skills', idx, { ...skill, min_years: parseInt(e.target.value) })}
                        placeholder="Min years"
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screening Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Screening Questions</h3>
              <div className="space-y-4">
                {generatedJob.screeningQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <Input
                      value={q.question}
                      onChange={(e) => handleArrayEdit('screeningQuestions', idx, { ...q, question: e.target.value })}
                      className="mb-2"
                      placeholder="Question"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => handleArrayEdit('screeningQuestions', idx, { ...q, required: e.target.checked })}
                      />
                      Required
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Regenerate
              </Button>
              <Button
                onClick={postJob}
                disabled={loading}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600"
              >
                {loading ? 'Publishing...' : 'Publish Job'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Job Posted Successfully! 🎉
              </h2>
              
              <p className="text-gray-600 mb-8">
                Your job posting is now live and candidates can start applying.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/company-dashboard')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/create-job')}
                  size="lg"
                >
                  Post Another Job
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

