import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
]

const LAST_USED_OPTIONS = [
  'Currently using',
  'Less than 6 months ago',
  '6-12 months ago',
  '1-2 years ago',
  'More than 2 years ago'
]

export default function JobApplicationModal({ job, onClose, onSuccess }) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [skillRequirements, setSkillRequirements] = useState([])
  const [screeningQuestions, setScreeningQuestions] = useState([])

  // Application data
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    resume_url: ''
  })

  // Skill assessments
  const [skillAssessments, setSkillAssessments] = useState({})

  // Screening responses
  const [screeningResponses, setScreeningResponses] = useState({})

  // Load job requirements and questions
  useEffect(() => {
    loadJobRequirements()
    loadScreeningQuestions()
  }, [job.id])

  const loadJobRequirements = async () => {
    try {
      const skills = await api.get(`/api/assessment/jobs/${job.id}/skills`)
      setSkillRequirements(skills)
      
      // Initialize skill assessments
      const initialAssessments = {}
      skills.forEach(skill => {
        initialAssessments[skill.id] = {
          skill_requirement_id: skill.id,
          self_rating: 5,
          proficiency_level: 'intermediate',
          years_of_experience: 0,
          last_used: 'Currently using',
          description: ''
        }
      })
      setSkillAssessments(initialAssessments)
    } catch (error) {
      console.error('Error loading skill requirements:', error)
    }
  }

  const loadScreeningQuestions = async () => {
    try {
      const questions = await api.get(`/api/assessment/jobs/${job.id}/questions`)
      setScreeningQuestions(questions)
      
      // Initialize responses
      const initialResponses = {}
      questions.forEach(question => {
        initialResponses[question.id] = {
          question_id: question.id,
          response_text: '',
          response_rating: 5
        }
      })
      setScreeningResponses(initialResponses)
    } catch (error) {
      console.error('Error loading screening questions:', error)
    }
  }

  const updateSkillAssessment = (skillId, field, value) => {
    setSkillAssessments(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        [field]: value
      }
    }))
  }

  const updateScreeningResponse = (questionId, field, value) => {
    setScreeningResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Step 1: Create application
      const appResponse = await api.post('/api/applications/', {
        job_id: job.id,
        candidate_id: user.id,
        ...applicationData
      })
      
      const applicationId = appResponse.id

      // Step 2: Submit skill assessments
      if (skillRequirements.length > 0) {
        await api.post(`/api/assessment/applications/${applicationId}/skills`,
          Object.values(skillAssessments)
        )
      }

      // Step 3: Submit screening responses
      if (screeningQuestions.length > 0) {
        await api.post(`/api/assessment/applications/${applicationId}/responses`,
          Object.values(screeningResponses)
        )
      }

      onSuccess()
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTotalSteps = () => {
    let steps = 2 // Basic info + Review
    if (skillRequirements.length > 0) steps++
    if (screeningQuestions.length > 0) steps++
    return steps
  }

  const renderStepIndicator = () => {
    const totalSteps = getTotalSteps()
    return (
      <div className="flex items-center justify-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === step 
                ? 'bg-blue-600 text-white' 
                : currentStep > step 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
            </div>
            {step < totalSteps && (
              <div className={`w-16 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Application Information</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Cover Letter (Optional)</label>
        <textarea
          value={applicationData.cover_letter}
          onChange={(e) => setApplicationData({ ...applicationData, cover_letter: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us why you're a great fit for this role..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Resume</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Upload your resume</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              // TODO: Handle file upload
              console.log('File selected:', e.target.files[0])
            }}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload">
            <Button asChild>
              <span>Choose File</span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-2">PDF, DOC, or DOCX (Max 5MB)</p>
        </div>
      </div>
    </div>
  )

  const renderSkillAssessment = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Skill Assessment</h3>
        <p className="text-sm text-gray-600">
          Rate your proficiency for each required skill
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {skillRequirements.map((skill) => (
          <div key={skill.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold">{skill.skill_name}</h4>
                <p className="text-xs text-gray-600">
                  Required: {skill.required_proficiency} • Min {skill.min_years_experience} years
                  {skill.is_mandatory && <span className="ml-2 text-red-600">*Required</span>}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Self Rating (1-10)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={skillAssessments[skill.id]?.self_rating || 5}
                    onChange={(e) => updateSkillAssessment(skill.id, 'self_rating', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-semibold text-blue-600 w-6">
                    {skillAssessments[skill.id]?.self_rating || 5}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Proficiency Level</label>
                <select
                  value={skillAssessments[skill.id]?.proficiency_level || 'intermediate'}
                  onChange={(e) => updateSkillAssessment(skill.id, 'proficiency_level', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROFICIENCY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Years of Experience</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={skillAssessments[skill.id]?.years_of_experience || 0}
                  onChange={(e) => updateSkillAssessment(skill.id, 'years_of_experience', parseFloat(e.target.value))}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Last Used</label>
                <select
                  value={skillAssessments[skill.id]?.last_used || 'Currently using'}
                  onChange={(e) => updateSkillAssessment(skill.id, 'last_used', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LAST_USED_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1">
                How have you used this skill? (Optional)
              </label>
              <textarea
                value={skillAssessments[skill.id]?.description || ''}
                onChange={(e) => updateSkillAssessment(skill.id, 'description', e.target.value)}
                rows={2}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe projects or experience..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderScreeningQuestions = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Screening Questions</h3>
        <p className="text-sm text-gray-600">
          Please answer the following questions
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {screeningQuestions.map((question, index) => (
          <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-start gap-2 mb-3">
              <span className="font-semibold text-blue-600">Q{index + 1}.</span>
              <div className="flex-1">
                <p className="font-medium">{question.question_text}</p>
                {question.is_required && (
                  <span className="text-xs text-red-600">*Required</span>
                )}
              </div>
            </div>

            {question.question_type === 'text' && (
              <textarea
                value={screeningResponses[question.id]?.response_text || ''}
                onChange={(e) => updateScreeningResponse(question.id, 'response_text', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your answer..."
                required={question.is_required}
              />
            )}

            {question.question_type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options?.map((option, i) => (
                  <label key={i} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={screeningResponses[question.id]?.response_text === option}
                      onChange={(e) => updateScreeningResponse(question.id, 'response_text', e.target.value)}
                      required={question.is_required}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'yes_no' && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="Yes"
                    checked={screeningResponses[question.id]?.response_text === 'Yes'}
                    onChange={(e) => updateScreeningResponse(question.id, 'response_text', e.target.value)}
                    required={question.is_required}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="No"
                    checked={screeningResponses[question.id]?.response_text === 'No'}
                    onChange={(e) => updateScreeningResponse(question.id, 'response_text', e.target.value)}
                    required={question.is_required}
                  />
                  <span>No</span>
                </label>
              </div>
            )}

            {question.question_type === 'rating' && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={screeningResponses[question.id]?.response_rating || 5}
                  onChange={(e) => updateScreeningResponse(question.id, 'response_rating', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="font-semibold text-blue-600 w-8">
                  {screeningResponses[question.id]?.response_rating || 5}/10
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderReview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review Your Application</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Application Summary</h4>
        <p className="text-sm text-blue-700">
          Cover letter: {applicationData.cover_letter ? 'Provided' : 'Not provided'}
        </p>
        <p className="text-sm text-blue-700">
          Resume: {applicationData.resume_url ? 'Uploaded' : 'Not uploaded'}
        </p>
      </div>

      {skillRequirements.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Skill Assessments</h4>
          <p className="text-sm text-green-700">
            {skillRequirements.length} skills assessed
          </p>
        </div>
      )}

      {screeningQuestions.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Screening Questions</h4>
          <p className="text-sm text-purple-700">
            {screeningQuestions.length} questions answered
          </p>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          By submitting this application, you confirm that all information provided is accurate and complete.
        </p>
      </div>
    </div>
  )

  const getStepContent = () => {
    let stepNumber = 1
    
    if (currentStep === stepNumber) return renderBasicInfo()
    stepNumber++
    
    if (skillRequirements.length > 0) {
      if (currentStep === stepNumber) return renderSkillAssessment()
      stepNumber++
    }
    
    if (screeningQuestions.length > 0) {
      if (currentStep === stepNumber) return renderScreeningQuestions()
      stepNumber++
    }
    
    return renderReview()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Apply for {job.title}</h2>
            <p className="text-sm text-gray-600">{job.company_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepIndicator()}
          {getStepContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < getTotalSteps() ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
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
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

