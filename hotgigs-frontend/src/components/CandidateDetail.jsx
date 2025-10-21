import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Award, Download, Plus, Tag, FileText, Calendar, ExternalLink,
  Star, TrendingUp, Building, Clock
} from 'lucide-react';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', is_important: false });
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const fetchCandidateDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resumes/candidates/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await fetch(`/api/resumes/candidates/${id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
      });

      if (response.ok) {
        setShowAddNote(false);
        setNewNote({ title: '', content: '', is_important: false });
        fetchCandidateDetails();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddTags = async () => {
    const tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    try {
      const response = await fetch(`/api/resumes/candidates/${id}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tags })
      });

      if (response.ok) {
        setShowAddTag(false);
        setNewTags('');
        fetchCandidateDetails();
      }
    } catch (error) {
      console.error('Error adding tags:', error);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${candidate.resume_id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${candidate.full_name}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate not found</h2>
          <button
            onClick={() => navigate('/candidates')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/candidates')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidates</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {candidate.full_name}
              </h1>
              {candidate.title && (
                <p className="text-xl text-gray-700 mb-4">{candidate.title}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {candidate.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.years_of_experience && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{candidate.years_of_experience} years experience</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {candidate.tags && candidate.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
                <button
                  onClick={() => setShowAddTag(true)}
                  className="px-3 py-1 border border-dashed border-gray-300 text-gray-600 text-sm rounded-full hover:border-gray-400 flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Tag</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-6">
              <button
                onClick={handleDownloadResume}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Submit to Job</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 border-b border-gray-200">
            {['overview', 'experience', 'matches', 'notes', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Professional Summary */}
                {candidate.professional_summary && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h2>
                    <p className="text-gray-700 leading-relaxed">{candidate.professional_summary}</p>
                  </div>
                )}

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidate.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{skill.name}</p>
                            <p className="text-sm text-gray-600">{skill.category}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {skill.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Position */}
                {candidate.current_company && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Position</h2>
                    <div className="flex items-start space-x-4">
                      <Building className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">{candidate.current_position}</p>
                        <p className="text-gray-600">{candidate.current_company}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'experience' && (
              <>
                {/* Work Experience */}
                {candidate.experience && candidate.experience.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Work Experience</h2>
                    <div className="space-y-6">
                      {candidate.experience.map((exp, index) => (
                        <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                          <div className="absolute left-0 top-0 w-4 h-4 bg-blue-600 rounded-full transform -translate-x-[9px]"></div>
                          <div className="mb-2">
                            <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                            <p className="text-gray-700">{exp.company}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{exp.start_date} - {exp.current ? 'Present' : exp.end_date}</span>
                              {exp.location && <span>• {exp.location}</span>}
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 mb-2">{exp.description}</p>
                          )}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                              {exp.achievements.map((achievement, i) => (
                                <li key={i}>{achievement}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {candidate.education && candidate.education.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Education</h2>
                    <div className="space-y-4">
                      {candidate.education.map((edu, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <GraduationCap className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                            <p className="text-gray-700">{edu.institution}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              {edu.graduation_date && <span>{edu.graduation_date}</span>}
                              {edu.gpa && <span>• GPA: {edu.gpa}</span>}
                              {edu.location && <span>• {edu.location}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'matches' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Matches</h2>
                <p className="text-gray-600">View AI-powered job matches for this candidate</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Matches
                </button>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>

                {showAddNote && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      placeholder="Note title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    <textarea
                      placeholder="Note content"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newNote.is_important}
                          onChange={(e) => setNewNote({ ...newNote, is_important: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Mark as important</span>
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowAddNote(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {candidate.notes && candidate.notes.length > 0 ? (
                  <div className="space-y-4">
                    {candidate.notes.map((note) => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{note.title}</h3>
                          {note.is_important && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{note.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No notes yet</p>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
                <p className="text-gray-600">Activity history will appear here</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Job Matches</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Viewed</span>
                  <span className="font-semibold text-gray-900">2 days ago</span>
                </div>
              </div>
            </div>

            {/* Source Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Source Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Added via</p>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                    {candidate.source}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Added on</p>
                  <p className="font-medium text-gray-900">
                    {new Date(candidate.added_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Tag Modal */}
      {showAddTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Tags</h3>
            <input
              type="text"
              placeholder="Enter tags separated by commas"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddTag(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTags}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Tags
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetail;

