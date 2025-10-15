import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';

const PostJob = () => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    workModel: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: '',
    salaryMax: '',
    requiredSkills: '',
    preferredSkills: '',
    benefits: ''
  });

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert comma-separated strings to arrays
    const formattedData = {
      ...jobData,
      requirements: jobData.requirements.split(',').map(r => r.trim()),
      responsibilities: jobData.responsibilities.split(',').map(r => r.trim()),
      requiredSkills: jobData.requiredSkills.split(',').map(s => s.trim()),
      preferredSkills: jobData.preferredSkills.split(',').map(s => s.trim()),
      benefits: jobData.benefits.split(',').map(b => b.trim()),
      salaryMin: parseInt(jobData.salaryMin) || null,
      salaryMax: parseInt(jobData.salaryMax) || null
    };

    console.log('Job data:', formattedData);
    // TODO: API call to create job
    alert('Job posted successfully!');
    navigate('/company-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-600">Fill in the details to create a new job posting</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Job Title *</label>
              <Input
                name="title"
                value={jobData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Job Description *</label>
              <Textarea
                name="description"
                value={jobData.description}
                onChange={handleChange}
                placeholder="Describe the role, team, and what makes this opportunity exciting..."
                rows={5}
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium mb-2">Requirements (comma-separated) *</label>
              <Textarea
                name="requirements"
                value={jobData.requirements}
                onChange={handleChange}
                placeholder="Bachelor's degree in Computer Science, 5+ years of experience, etc."
                rows={3}
                required
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium mb-2">Responsibilities (comma-separated) *</label>
              <Textarea
                name="responsibilities"
                value={jobData.responsibilities}
                onChange={handleChange}
                placeholder="Design and develop features, Lead technical discussions, etc."
                rows={3}
                required
              />
            </div>

            {/* Location & Work Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <Input
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Work Model *</label>
                <select
                  name="workModel"
                  value={jobData.workModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </select>
              </div>
            </div>

            {/* Employment Type & Experience Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employment Type *</label>
                <select
                  name="employmentType"
                  value={jobData.employmentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level *</label>
                <select
                  name="experienceLevel"
                  value={jobData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Salary (USD)</label>
                <Input
                  name="salaryMin"
                  type="number"
                  value={jobData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g., 100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maximum Salary (USD)</label>
                <Input
                  name="salaryMax"
                  type="number"
                  value={jobData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g., 150000"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Required Skills (comma-separated) *</label>
              <Input
                name="requiredSkills"
                value={jobData.requiredSkills}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, PostgreSQL"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Preferred Skills (comma-separated)</label>
              <Input
                name="preferredSkills"
                value={jobData.preferredSkills}
                onChange={handleChange}
                placeholder="e.g., AWS, Docker, Kubernetes"
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium mb-2">Benefits (comma-separated)</label>
              <Textarea
                name="benefits"
                value={jobData.benefits}
                onChange={handleChange}
                placeholder="Health insurance, 401k matching, Remote work, etc."
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                Post Job
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/company-dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* AI Generation Option */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">✨</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">AI-Powered Job Description</h3>
              <p className="text-gray-600 mb-4">
                Let our AI generate a compelling job description based on your requirements. 
                Just provide the key details and we'll create a professional posting for you.
              </p>
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Generate with AI
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;

