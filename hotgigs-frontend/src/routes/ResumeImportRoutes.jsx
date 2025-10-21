import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import CandidateDatabase from '../components/CandidateDatabase';
import CandidateDetail from '../components/CandidateDetail';
import GoogleDriveSetup from '../components/GoogleDriveSetup';
import MatchingDashboard from '../components/MatchingDashboard';

/**
 * Resume Import Routes
 * 
 * These routes handle all resume import and candidate management functionality:
 * - Resume upload (single and bulk)
 * - Candidate database views
 * - Candidate detail pages
 * - Google Drive integration
 * - AI-powered matching
 */

const ResumeImportRoutes = () => {
  return (
    <Routes>
      {/* Resume Upload */}
      <Route path="/import" element={<ResumeUploadPage />} />
      <Route path="/import/bulk" element={<BulkUploadPage />} />

      {/* Candidate Database */}
      <Route path="/candidates" element={<CandidateDatabase isAdmin={false} />} />
      <Route path="/candidates/:id" element={<CandidateDetail />} />
      
      {/* Admin Master Database */}
      <Route path="/admin/candidates" element={<CandidateDatabase isAdmin={true} />} />

      {/* Google Drive Integration */}
      <Route path="/google-drive" element={<GoogleDriveSetup />} />

      {/* Matching */}
      <Route path="/candidates/:id/matches" element={<MatchingDashboard type="candidate" />} />
      <Route path="/jobs/:id/matches" element={<MatchingDashboard type="job" />} />

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/candidates" replace />} />
    </Routes>
  );
};

/**
 * Resume Upload Page
 * Single resume upload for candidates and recruiters
 */
const ResumeUploadPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h1>
          <p className="text-gray-600">
            Upload your resume for AI-powered parsing and job matching
          </p>
        </div>
        <ResumeUpload mode="single" />
      </div>
    </div>
  );
};

/**
 * Bulk Upload Page
 * Bulk resume upload for recruiters and admins
 */
const BulkUploadPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Resume Upload</h1>
          <p className="text-gray-600">
            Upload multiple resumes at once for batch processing
          </p>
        </div>
        <ResumeUpload mode="bulk" />
      </div>
    </div>
  );
};

export default ResumeImportRoutes;

