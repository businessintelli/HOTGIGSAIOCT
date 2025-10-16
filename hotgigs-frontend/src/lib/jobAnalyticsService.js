/**
 * Job-Specific Analytics Service
 * Provides analytics data for individual job postings
 */

// Generate job-specific analytics data
export const getJobAnalytics = (jobId) => {
  // In production, this would fetch from API
  // For now, generate realistic sample data based on jobId
  
  const seed = jobId ? parseInt(jobId.replace(/\D/g, '')) || 1 : 1;
  
  return {
    // Overview metrics
    overview: {
      totalViews: 450 + (seed * 50),
      totalApplications: 24 + (seed * 3),
      conversionRate: (5.2 + (seed * 0.3)).toFixed(1),
      avgTimeToApply: (2.3 + (seed * 0.2)).toFixed(1), // days
      activeApplications: 18 + (seed * 2),
      rejectedApplications: 6 + seed,
      avgApplicationQuality: (78 + (seed * 2)).toFixed(0),
      daysActive: 7 + seed
    },
    
    // Applications over time (last 14 days)
    applicationsTimeline: generateTimeline(14, seed),
    
    // Views vs Applications (last 14 days)
    viewsVsApplications: generateViewsVsApplications(14, seed),
    
    // Application sources
    sources: [
      { name: 'Direct Apply', applications: 8 + seed, percentage: 35, color: '#3b82f6' },
      { name: 'LinkedIn', applications: 6 + seed, percentage: 28, color: '#0077b5' },
      { name: 'Indeed', applications: 5 + seed, percentage: 20, color: '#2164f3' },
      { name: 'Referral', applications: 3 + seed, percentage: 12, color: '#10b981' },
      { name: 'Career Page', applications: 2 + seed, percentage: 5, color: '#8b5cf6' }
    ],
    
    // Candidate quality distribution
    qualityDistribution: [
      { range: '90-100', count: 3 + Math.floor(seed / 2), color: '#10b981' },
      { range: '80-89', count: 6 + seed, color: '#3b82f6' },
      { range: '70-79', count: 8 + seed, color: '#f59e0b' },
      { range: '60-69', count: 5 + seed, color: '#ef4444' },
      { range: '<60', count: 2 + Math.floor(seed / 3), color: '#6b7280' }
    ],
    
    // Top skills from applicants
    topSkills: [
      { name: 'React', count: 18 + seed, percentage: 75 },
      { name: 'Node.js', count: 16 + seed, percentage: 67 },
      { name: 'TypeScript', count: 14 + seed, percentage: 58 },
      { name: 'Python', count: 12 + seed, percentage: 50 },
      { name: 'AWS', count: 10 + seed, percentage: 42 },
      { name: 'PostgreSQL', count: 9 + seed, percentage: 38 },
      { name: 'Docker', count: 8 + seed, percentage: 33 },
      { name: 'GraphQL', count: 6 + seed, percentage: 25 }
    ],
    
    // Experience distribution
    experienceDistribution: [
      { range: '0-2 years', count: 4 + seed, percentage: 17 },
      { range: '3-5 years', count: 10 + seed, percentage: 42 },
      { range: '6-8 years', count: 7 + seed, percentage: 29 },
      { range: '9+ years', count: 3 + seed, percentage: 12 }
    ],
    
    // Location distribution
    locationDistribution: [
      { location: 'San Francisco, CA', count: 8 + seed },
      { location: 'New York, NY', count: 6 + seed },
      { location: 'Seattle, WA', count: 5 + seed },
      { location: 'Austin, TX', count: 3 + seed },
      { location: 'Remote', count: 2 + seed }
    ],
    
    // Salary expectations
    salaryDistribution: [
      { range: '$80k-$100k', count: 3 + seed },
      { range: '$100k-$120k', count: 7 + seed },
      { range: '$120k-$140k', count: 9 + seed },
      { range: '$140k-$160k', count: 4 + seed },
      { range: '$160k+', count: 1 + seed }
    ],
    
    // Application funnel
    funnel: [
      { stage: 'Job Views', count: 450 + (seed * 50), percentage: 100 },
      { stage: 'Started Application', count: 89 + (seed * 8), percentage: 20 },
      { stage: 'Completed Application', count: 24 + (seed * 3), percentage: 5.3 },
      { stage: 'Screening', count: 12 + seed, percentage: 2.7 },
      { stage: 'Interview', count: 5 + seed, percentage: 1.1 },
      { stage: 'Offer', count: 1 + Math.floor(seed / 2), percentage: 0.2 }
    ],
    
    // Time to hire stages
    timeToHire: [
      { stage: 'Applied to Reviewed', avgDays: 1.5 + (seed * 0.1) },
      { stage: 'Reviewed to Interview', avgDays: 3.2 + (seed * 0.2) },
      { stage: 'Interview to Decision', avgDays: 2.8 + (seed * 0.15) },
      { stage: 'Decision to Offer', avgDays: 1.2 + (seed * 0.1) }
    ],
    
    // Device breakdown
    deviceBreakdown: [
      { device: 'Desktop', count: 14 + seed, percentage: 58 },
      { device: 'Mobile', count: 8 + seed, percentage: 33 },
      { device: 'Tablet', count: 2 + seed, percentage: 9 }
    ],
    
    // Peak application times
    peakTimes: [
      { hour: '9-10 AM', applications: 4 + seed },
      { hour: '10-11 AM', applications: 6 + seed },
      { hour: '2-3 PM', applications: 5 + seed },
      { hour: '8-9 PM', applications: 3 + seed }
    ]
  };
};

// Helper function to generate timeline data
function generateTimeline(days, seed) {
  const timeline = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic application counts with some randomness
    const baseCount = 1 + Math.floor(seed / 2);
    const variance = Math.floor(Math.random() * 3);
    const count = Math.max(0, baseCount + variance - 1);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      applications: count,
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return timeline;
}

// Helper function to generate views vs applications data
function generateViewsVsApplications(days, seed) {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const views = 20 + Math.floor(Math.random() * 30) + (seed * 2);
    const applications = Math.floor(views * (0.04 + Math.random() * 0.06));
    
    data.push({
      date: date.toISOString().split('T')[0],
      views,
      applications,
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return data;
}

// Get comparison with similar jobs
export const getJobComparison = (jobId) => {
  return {
    thisJob: {
      conversionRate: 5.3,
      avgTimeToHire: 18,
      qualityScore: 82
    },
    similarJobs: {
      conversionRate: 4.8,
      avgTimeToHire: 24,
      qualityScore: 78
    },
    industry: {
      conversionRate: 4.2,
      avgTimeToHire: 28,
      qualityScore: 75
    }
  };
};

// Get recommendations for improving job performance
export const getJobRecommendations = (analytics) => {
  const recommendations = [];
  
  // Check conversion rate
  if (analytics.overview.conversionRate < 4) {
    recommendations.push({
      type: 'warning',
      title: 'Low Conversion Rate',
      message: 'Your conversion rate is below average. Consider improving job description clarity and requirements.',
      action: 'Edit Job Description'
    });
  }
  
  // Check application quality
  if (analytics.overview.avgApplicationQuality < 70) {
    recommendations.push({
      type: 'warning',
      title: 'Low Application Quality',
      message: 'Average candidate quality is below target. Consider refining job requirements or adjusting salary range.',
      action: 'Update Requirements'
    });
  }
  
  // Check time to apply
  if (analytics.overview.avgTimeToApply > 3) {
    recommendations.push({
      type: 'info',
      title: 'Slow Application Process',
      message: 'Candidates are taking longer than average to apply. Simplify the application process.',
      action: 'Review Application Form'
    });
  }
  
  // Positive feedback
  if (analytics.overview.conversionRate > 5 && analytics.overview.avgApplicationQuality > 80) {
    recommendations.push({
      type: 'success',
      title: 'Great Performance!',
      message: 'This job posting is performing well with high conversion and quality scores.',
      action: 'Share Best Practices'
    });
  }
  
  return recommendations;
};

export default {
  getJobAnalytics,
  getJobComparison,
  getJobRecommendations
};

