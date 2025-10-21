import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Star, CheckCircle, XCircle, RefreshCw,
  Filter, ChevronDown, ExternalLink, Eye, BarChart3,
  Target, Zap, Award, ArrowRight
} from 'lucide-react';

const MatchingDashboard = ({ type = 'candidate' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMatches();
    fetchStats();
  }, [id, minScore]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'candidate'
        ? `/api/matching/candidates/${id}/matches?min_score=${minScore}`
        : `/api/matching/jobs/${id}/matches?min_score=${minScore}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const endpoint = type === 'candidate'
        ? `/api/matching/stats/candidate/${id}`
        : `/api/matching/stats/job/${id}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRematch = async () => {
    try {
      const endpoint = type === 'candidate'
        ? `/api/matching/candidates/${id}/rematch`
        : `/api/matching/jobs/${id}/rematch`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: false })
      });

      if (response.ok) {
        // Show success message and refresh
        setTimeout(fetchMatches, 3000);
      }
    } catch (error) {
      console.error('Error triggering rematch:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {type === 'candidate' ? 'Job Matches' : 'Candidate Matches'}
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered matching based on skills, experience, and requirements
              </p>
            </div>
            <button
              onClick={handleRematch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Re-match</span>
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Matches</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_matches}</p>
                  </div>
                  <Target className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">High Matches</p>
                    <p className="text-3xl font-bold text-green-600">{stats.high_matches}</p>
                    <p className="text-xs text-gray-500 mt-1">Score ≥ 80</p>
                  </div>
                  <Star className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Medium Matches</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.medium_matches}</p>
                    <p className="text-xs text-gray-500 mt-1">Score 60-79</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Match Rate</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.match_rate ? stats.match_rate.toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">High quality</p>
                  </div>
                  <Award className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Min Score:</label>
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={0}>All (0+)</option>
                    <option value={60}>Good (60+)</option>
                    <option value={80}>Excellent (80+)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="score">Match Score</option>
                    <option value="skills">Skills Match</option>
                    <option value="experience">Experience Match</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              {minScore > 0 
                ? 'Try lowering the minimum score filter' 
                : 'Try re-matching to find new opportunities'}
            </p>
            <button
              onClick={handleRematch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.match_id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {type === 'candidate' ? match.job_title : match.candidate_name}
                      </h3>
                      <span className={`px-3 py-1 ${getScoreBgColor(match.match_score)} ${getScoreColor(match.match_score)} text-sm font-medium rounded-full`}>
                        {match.match_score.toFixed(1)}% Match
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {type === 'candidate' ? match.company_name : match.candidate_title}
                    </p>

                    {match.candidate_location && (
                      <p className="text-sm text-gray-500 mb-3">{match.candidate_location}</p>
                    )}

                    {/* Match Explanation */}
                    {match.match_explanation && (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {match.match_explanation}
                      </p>
                    )}

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {match.skill_match_score !== null && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Skills</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${match.skill_match_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {match.skill_match_score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {match.experience_match_score !== null && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Experience</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${match.experience_match_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {match.experience_match_score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {match.education_match_score !== null && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Education</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${match.education_match_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {match.education_match_score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {match.location_match_score !== null && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Location</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-600 h-2 rounded-full"
                                style={{ width: `${match.location_match_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {match.location_match_score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.matching_skills && match.matching_skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{skill}</span>
                        </span>
                      ))}
                      {match.missing_skills && match.missing_skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full flex items-center space-x-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end space-y-2 ml-6">
                    <button
                      onClick={() => {
                        const url = type === 'candidate' 
                          ? `/jobs/${match.job_id}` 
                          : `/candidates/${match.candidate_id}`;
                        navigate(url);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {!match.viewed_by_recruiter && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <span>Matched on {new Date(match.created_at).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span>View Full Analysis</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <BarChart3 className="w-4 h-4" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingDashboard;

