import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Plus, X, Wand2, Save, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '../lib/api'

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
]

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Answer' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'yes_no', label: 'Yes/No' },
  { value: 'rating', label: 'Rating (1-10)' }
]

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' }
]

export default function PostJob() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)

  // Basic job information
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'mid',
    salary_min: '',
    salary_max: '',
    required_skills: [],
    preferred_skills: [],
    responsibilities: [],
    benefits: [],
    remote_policy: 'hybrid'
  })

  // Skill matrix
  const [skillRequirements, setSkillRequirements] = useState([])
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    required_proficiency: 'intermediate',
    min_years_experience: 0,
    is_mandatory: true,
    weight: 1.0
  })

  // Screening questions
  const [screeningQuestions, setScreeningQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'text',
    options: [],
    is_required: true,
    order: 0
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setJobData(prev => ({ ...prev, [name]: value }))
  }

  const addSkillRequirement = () => {
    if (!newSkill.skill_name) return
    
    setSkillRequirements([...skillRequirements, { ...newSkill, id: Date.now() }])
    setNewSkill({
      skill_name: '',
      required_proficiency: 'intermediate',
      min_years_experience: 0,
      is_mandatory: true,
      weight: 1.0
    })
  }

  const removeSkillRequirement = (id) => {
    setSkillRequirements(skillRequirements.filter(skill => skill.id !== id))
  }

  const addScreeningQuestion = () => {
    if (!newQuestion.question_text) return
    
    setScreeningQuestions([
      ...screeningQuestions, 
      { ...newQuestion, id: Date.now(), order: screeningQuestions.length, ai_generated: false }
    ])
    setNewQuestion({
      question_text: '',
      question_type: 'text',
      options: [],
      is_required: true,
      order: 0
    })
  }

  const removeScreeningQuestion = (id) => {
    setScreeningQuestions(screeningQuestions.filter(q => q.id !== id))
  }

  const generateQuestionsWithAI = async () => {
    if (skillRequirements.length === 0) {
      alert('Please add at least one skill requirement first')
      return
    }

    setGeneratingQuestions(true)
    try {
      const response = await api.post('/api/assessment/jobs/generate-questions', {
        skills: skillRequirements.map(s => s.skill_name),
        job_domain: jobData.title || 'General',
        experience_level: jobData.experience_level
      })

      setScreeningQuestions(response.map((q, index) => ({
        ...q,
        id: Date.now() + index
      })))
    } catch (error) {
      console.error('Error generating questions:', error)
      alert('Failed to generate questions. Please try again.')
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Step 1: Create the job
      const jobResponse = await api.post('/api/jobs/', jobData)
      const jobId = jobResponse.id

      // Step 2: Add skill requirements
      if (skillRequirements.length > 0) {
        await api.post(`/api/assessment/jobs/${jobId}/skills`, 
          skillRequirements.map(({ id, ...skill }) => skill)
        )
      }

      // Step 3: Add screening questions
      if (screeningQuestions.length > 0) {
        await api.post(`/api/assessment/jobs/${jobId}/questions`,
          screeningQuestions.map(({ id, ...question }) => question)
        )
      }

      alert('Job posted successfully!')
      navigate('/company-dashboard')
    } catch (error) {
      console.error('Error posting job:', error)
      alert('Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            currentStep === step 
              ? 'bg-blue-600 text-white' 
              : currentStep > step 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-20 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Job Information</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">Job Title *</label>
        <Input
          name="title"
          value={jobData.title}
          onChange={handleInputChange}
          placeholder="e.g., Senior Software Engineer"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Job Description *</label>
        <textarea
          name="description"
          value={jobData.description}
          onChange={handleInputChange}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Location *</label>
          <Input
            name="location"
            value={jobData.location}
            onChange={handleInputChange}
            placeholder="e.g., San Francisco, CA"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Job Type *</label>
          <select
            name="job_type"
            value={jobData.job_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Experience Level *</label>
          <select
            name="experience_level"
            value={jobData.experience_level}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Remote Policy *</label>
          <select
            name="remote_policy"
            value={jobData.remote_policy}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="remote">Fully Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Salary</label>
          <Input
            name="salary_min"
            type="number"
            value={jobData.salary_min}
            onChange={handleInputChange}
            placeholder="e.g., 100000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Maximum Salary</label>
          <Input
            name="salary_max"
            type="number"
            value={jobData.salary_max}
            onChange={handleInputChange}
            placeholder="e.g., 150000"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skill Requirements Matrix</h2>
        <span className="text-sm text-gray-600">
          Define the skills and proficiency levels required for this role
        </span>
      </div>

      {/* Add new skill */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="font-semibold mb-4">Add Skill Requirement</h3>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <Input
              placeholder="Skill name (e.g., Python)"
              value={newSkill.skill_name}
              onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
            />
          </div>

          <select
            value={newSkill.required_proficiency}
            onChange={(e) => setNewSkill({ ...newSkill, required_proficiency: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROFICIENCY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Min years"
            value={newSkill.min_years_experience}
            onChange={(e) => setNewSkill({ ...newSkill, min_years_experience: parseInt(e.target.value) || 0 })}
          />

          <Button onClick={addSkillRequirement} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newSkill.is_mandatory}
              onChange={(e) => setNewSkill({ ...newSkill, is_mandatory: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Mandatory</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm">Importance:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.5"
              value={newSkill.weight}
              onChange={(e) => setNewSkill({ ...newSkill, weight: parseFloat(e.target.value) })}
              className="w-24"
            />
            <span className="text-sm font-medium">{newSkill.weight}x</span>
          </div>
        </div>
      </div>

      {/* Skills list */}
      <div className="space-y-3">
        {skillRequirements.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No skills added yet. Add your first skill requirement above.</p>
        ) : (
          skillRequirements.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Skill</span>
                  <p className="font-semibold">{skill.skill_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Proficiency</span>
                  <p className="font-semibold capitalize">{skill.required_proficiency}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Min Experience</span>
                  <p className="font-semibold">{skill.min_years_experience} years</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex items-center gap-2">
                    {skill.is_mandatory && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Required</span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{skill.weight}x weight</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSkillRequirement(skill.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Screening Questions</h2>
        <Button
          onClick={generateQuestionsWithAI}
          disabled={generatingQuestions || skillRequirements.length === 0}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {generatingQuestions ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      {/* Add new question */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="font-semibold mb-4">Add Custom Question</h3>
        <div className="space-y-3">
          <Input
            placeholder="Question text"
            value={newQuestion.question_text}
            onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={newQuestion.question_type}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newQuestion.is_required}
                onChange={(e) => setNewQuestion({ ...newQuestion, is_required: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Required</span>
            </label>
          </div>

          <Button onClick={addScreeningQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {screeningQuestions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No questions added yet. Generate questions with AI or add custom questions above.
          </p>
        ) : (
          screeningQuestions.map((question, index) => (
            <div key={question.id} className="p-4 bg-white border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-600">Q{index + 1}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                      {question.question_type.replace('_', ' ')}
                    </span>
                    {question.is_required && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Required</span>
                    )}
                    {question.ai_generated && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Generated
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900">{question.question_text}</p>
                  {question.options && question.options.length > 0 && (
                    <div className="mt-2 ml-4">
                      <p className="text-sm text-gray-600">Options:</p>
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {question.options.map((option, i) => (
                          <li key={i}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeScreeningQuestion(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review & Publish</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Job Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Title:</span>
            <span className="ml-2 font-semibold">{jobData.title || 'Not set'}</span>
          </div>
          <div>
            <span className="text-blue-700">Location:</span>
            <span className="ml-2 font-semibold">{jobData.location || 'Not set'}</span>
          </div>
          <div>
            <span className="text-blue-700">Experience Level:</span>
            <span className="ml-2 font-semibold capitalize">{jobData.experience_level}</span>
          </div>
          <div>
            <span className="text-blue-700">Job Type:</span>
            <span className="ml-2 font-semibold capitalize">{jobData.job_type}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Skill Requirements</h3>
        <p className="text-sm text-green-700">
          {skillRequirements.length} skills defined
          {skillRequirements.length > 0 && (
            <span className="ml-2">
              ({skillRequirements.filter(s => s.is_mandatory).length} mandatory)
            </span>
          )}
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Screening Questions</h3>
        <p className="text-sm text-purple-700">
          {screeningQuestions.length} questions configured
          {screeningQuestions.length > 0 && (
            <span className="ml-2">
              ({screeningQuestions.filter(q => q.is_required).length} required)
            </span>
          )}
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Application Process</h3>
        <p className="text-sm text-yellow-700">
          Candidates will complete a {skillRequirements.length > 0 ? '4' : '2'}-step application process:
        </p>
        <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
          <li>Submit basic application information</li>
          {skillRequirements.length > 0 && <li>Complete skill matrix self-assessment</li>}
          {screeningQuestions.length > 0 && <li>Answer screening questions</li>}
          <li>Review and submit application</li>
        </ol>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                HotGigs.ai
              </span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/company-dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="bg-gradient-to-r from-blue-600 to-green-600"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-green-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish Job'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

