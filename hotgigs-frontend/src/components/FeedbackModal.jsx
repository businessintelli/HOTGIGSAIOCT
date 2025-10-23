import React, { useState } from 'react';
import { X, Check, AlertCircle, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';

/**
 * FeedbackModal Component
 * 
 * Allows recruiters to provide feedback on resume parsing accuracy
 * and correct any errors in the extracted data.
 */
const FeedbackModal = ({ isOpen, onClose, candidate, onSubmit }) => {
  const [feedback, setFeedback] = useState({
    overall_rating: null, // 'accurate' | 'needs_correction'
    corrections: {},
    comments: ''
  });

  const [editMode, setEditMode] = useState({});
  const [editedValues, setEditedValues] = useState({});

  if (!isOpen || !candidate) return null;

  // Fields that can be corrected
  const correctableFields = [
    { key: 'full_name', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'title', label: 'Current Title', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'years_of_experience', label: 'Years of Experience', type: 'number' },
    { key: 'professional_summary', label: 'Professional Summary', type: 'textarea' },
  ];

  const handleFieldEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
    setEditedValues({ ...editedValues, [field]: candidate[field] || '' });
  };

  const handleFieldSave = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setFeedback({
      ...feedback,
      corrections: {
        ...feedback.corrections,
        [field]: {
          original: candidate[field],
          corrected: editedValues[field]
        }
      }
    });
  };

  const handleFieldCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setEditedValues({ ...editedValues, [field]: candidate[field] || '' });
  };

  const handleSubmit = () => {
    const hasCorrections = Object.keys(feedback.corrections).length > 0;
    
    const feedbackData = {
      resume_id: candidate.resume_id,
      candidate_id: candidate.candidate_id,
      overall_rating: feedback.overall_rating,
      corrections: feedback.corrections,
      comments: feedback.comments,
      accuracy_score: calculateAccuracyScore()
    };

    onSubmit(feedbackData);
    onClose();
  };

  const calculateAccuracyScore = () => {
    const totalFields = correctableFields.length;
    const incorrectFields = Object.keys(feedback.corrections).length;
    return Math.round(((totalFields - incorrectFields) / totalFields) * 100);
  };

  const getFieldValue = (field) => {
    if (feedback.corrections[field]) {
      return feedback.corrections[field].corrected;
    }
    return candidate[field] || 'Not provided';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Review Resume Parsing
                </h3>
                <p className="text-sm text-blue-100 mt-1">
                  Help us improve by correcting any errors
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Overall Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How accurate is the parsing overall?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFeedback({ ...feedback, overall_rating: 'accurate' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    feedback.overall_rating === 'accurate'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">Accurate</span>
                </button>
                <button
                  onClick={() => setFeedback({ ...feedback, overall_rating: 'needs_correction' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    feedback.overall_rating === 'needs_correction'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span className="font-medium">Needs Correction</span>
                </button>
              </div>
            </div>

            {/* Correctable Fields */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Review Extracted Information
              </h4>
              <div className="space-y-4">
                {correctableFields.map((field) => (
                  <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      {!editMode[field.key] && (
                        <button
                          onClick={() => handleFieldEdit(field.key)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    {editMode[field.key] ? (
                      <div>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={editedValues[field.key] || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={editedValues[field.key] || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleFieldSave(field.key)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => handleFieldCancel(field.key)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm ${
                        feedback.corrections[field.key] 
                          ? 'bg-yellow-50 border border-yellow-200 rounded p-2' 
                          : ''
                      }`}>
                        <p className="text-gray-900">{getFieldValue(field.key)}</p>
                        {feedback.corrections[field.key] && (
                          <div className="mt-2 pt-2 border-t border-yellow-300">
                            <p className="text-xs text-gray-500 line-through">
                              Original: {feedback.corrections[field.key].original}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                placeholder="Any other feedback about the parsing quality..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Accuracy Score Preview */}
            {Object.keys(feedback.corrections).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Estimated Accuracy: {calculateAccuracyScore()}%
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {Object.keys(feedback.corrections).length} field(s) corrected
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!feedback.overall_rating}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                feedback.overall_rating
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

