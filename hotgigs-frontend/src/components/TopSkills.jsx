import React from 'react';
import { Code, Target, TrendingUp } from 'lucide-react';

/**
 * TopSkills Component
 * 
 * Displays the top 5 technology skills and top 5 domain skills
 * with scores and visual indicators.
 * 
 * @param {Object} props
 * @param {Array} props.technologySkills - Top technology skills with scores
 * @param {Array} props.domainSkills - Top domain skills with scores
 * @param {boolean} props.showScores - Whether to show skill scores
 * @param {string} props.variant - Display variant: 'card' | 'compact' | 'list'
 */
const TopSkills = ({ 
  technologySkills = [], 
  domainSkills = [], 
  showScores = true,
  variant = 'card'
}) => {
  // Normalize skills to ensure they have score property
  const normalizeTechSkills = technologySkills.map(skill => 
    typeof skill === 'string' ? { skill, score: null } : skill
  );
  
  const normalizeDomainSkills = domainSkills.map(skill => 
    typeof skill === 'string' ? { skill, score: null } : skill
  );

  // Get score color based on value
  const getScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  // Get score bar width
  const getScoreWidth = (score) => {
    if (!score) return '0%';
    return `${Math.min(score, 100)}%`;
  };

  // Compact variant (for cards)
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {normalizeTechSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Top Tech Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {normalizeTechSkills.slice(0, 5).map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md"
                >
                  {item.skill}
                  {showScores && item.score && (
                    <span className="text-blue-500">({Math.round(item.score)})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {normalizeDomainSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Top Domain Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {normalizeDomainSkills.slice(0, 5).map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-md"
                >
                  {item.skill}
                  {showScores && item.score && (
                    <span className="text-purple-500">({Math.round(item.score)})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List variant (for detailed views)
  if (variant === 'list') {
    return (
      <div className="space-y-6">
        {normalizeTechSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top 5 Technology Skills</h3>
            </div>
            <div className="space-y-3">
              {normalizeTechSkills.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                      {showScores && item.score && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getScoreColor(item.score)}`}>
                          {Math.round(item.score)}
                        </span>
                      )}
                    </div>
                    {showScores && item.score && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: getScoreWidth(item.score) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {normalizeDomainSkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top 5 Domain Skills</h3>
            </div>
            <div className="space-y-3">
              {normalizeDomainSkills.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                      {showScores && item.score && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getScoreColor(item.score)}`}>
                          {Math.round(item.score)}
                        </span>
                      )}
                    </div>
                    {showScores && item.score && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: getScoreWidth(item.score) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Technology Skills Card */}
      {normalizeTechSkills.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Technology Skills</h3>
              <p className="text-sm text-gray-500">Most relevant technical expertise</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {normalizeTechSkills.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{item.skill}</span>
                    {showScores && item.score && (
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${getScoreColor(item.score)}`}>
                        {Math.round(item.score)}
                      </span>
                    )}
                  </div>
                  {showScores && item.score && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: getScoreWidth(item.score) }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {normalizeTechSkills.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                +{normalizeTechSkills.length - 5} more technology skills
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Domain Skills Card */}
      {normalizeDomainSkills.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Domain Skills</h3>
              <p className="text-sm text-gray-500">Key methodologies & expertise</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {normalizeDomainSkills.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-50 text-purple-700 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{item.skill}</span>
                    {showScores && item.score && (
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${getScoreColor(item.score)}`}>
                        {Math.round(item.score)}
                      </span>
                    )}
                  </div>
                  {showScores && item.score && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: getScoreWidth(item.score) }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {normalizeDomainSkills.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                +{normalizeDomainSkills.length - 5} more domain skills
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Empty state */}
      {normalizeTechSkills.length === 0 && normalizeDomainSkills.length === 0 && (
        <div className="col-span-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Top Skills Available</h3>
          <p className="text-sm text-gray-500">
            Top skills will be displayed once the resume is parsed
          </p>
        </div>
      )}
    </div>
  );
};

export default TopSkills;

