import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star, TrendingUp, User, MessageSquare, Check, X } from 'lucide-react'
import api from '../lib/api'

export default function JobApplications() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  useEffect(() => {
    loadJobAndApplications()
  }, [jobId])

  const loadJobAndApplications = async () => {
    setLoading(true)
    try {
      const [jobData, appsData] = await Promise.all([
        api.get(`/api/jobs/${jobId}`),
        api.get(`/api/assessment/jobs/${jobId}/applications`)
      ])
      setJob(jobData)
      setApplications(appsData)
    } catch (error) {
      console.error('Error loading job applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCandidate = async (app) => {
    try {
      const detailedApp = await api.get(`/api/assessment/applications/${app.id}/detailed`)
      setSelectedCandidate(detailedApp)
    } catch (error) {
      console.error('Error loading detailed application:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading applications...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-gray-600">{applications.length} candidates have applied</p>
        </div>

        <div className="flex gap-8">
          {/* Candidate List */}
          <div className="w-1/3">
            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
              {applications.map(app => (
                <div 
                  key={app.id} 
                  className={`p-3 rounded-lg cursor-pointer border-l-4 ${selectedCandidate?.id === app.id ? 'bg-blue-50 border-blue-600' : 'hover:bg-gray-50 border-transparent'}`}
                  onClick={() => handleSelectCandidate(app)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{app.candidate.name}</h3>
                    <Badge variant={app.status === 'shortlisted' ? 'success' : 'secondary'}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Match Score: {app.match_score}%</p>
                  <Progress value={app.match_score} className="h-2 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Details */}
          <div className="w-2/3">
            {selectedCandidate ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCandidate.candidate.name}</h2>
                    <p className="text-gray-600">{selectedCandidate.candidate.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">Match Score: {selectedCandidate.match_score}%</p>
                    <p className="text-sm text-gray-500">Applied on {new Date(selectedCandidate.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button><User className="h-4 w-4 mr-2" /> View Profile</Button>
                  <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Message</Button>
                  <Button variant="outline" className="text-green-600 border-green-600"><Check className="h-4 w-4 mr-2" /> Shortlist</Button>
                  <Button variant="outline" className="text-red-600 border-red-600"><X className="h-4 w-4 mr-2" /> Reject</Button>
                </div>

                {/* Skill Assessment */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Skill Assessment</h3>
                  <div className="space-y-3">
                    {selectedCandidate.skill_assessments.map(assessment => (
                      <div key={assessment.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{assessment.skill_requirement.skill_name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm">Self-rated: <span className="font-bold">{assessment.self_rating}/10</span></p>
                            <Star className="h-4 w-4 text-yellow-500" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Proficiency: {assessment.proficiency_level} | Experience: {assessment.years_of_experience} years</p>
                        {assessment.description && <p className="text-sm mt-2 p-2 bg-gray-50 rounded">{assessment.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screening Questions */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Screening Questions</h3>
                  <div className="space-y-3">
                    {selectedCandidate.screening_responses.map(response => (
                      <div key={response.id} className="p-3 border rounded-lg">
                        <p className="font-semibold mb-2">{response.question.question_text}</p>
                        <div className="p-2 bg-blue-50 rounded">
                          {response.question.question_type === 'rating' ? (
                            <p>Rating: <span className="font-bold">{response.response_rating}/10</span></p>
                          ) : (
                            <p>{response.response_text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold">Select a candidate to view details</h2>
                <p className="text-gray-600 mt-2">Click on a candidate from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

