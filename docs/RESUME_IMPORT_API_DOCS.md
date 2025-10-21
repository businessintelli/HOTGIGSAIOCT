# Resume Import System - API Documentation

## Overview

This document provides comprehensive API documentation for the HotGigs.ai resume import system, including endpoints for resume upload, candidate management, Google Drive integration, and AI-powered matching.

## Base URL

```
https://api.hotgigs.ai
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Resume Upload

#### 1. Upload Single Resume

**Endpoint:** `POST /api/resumes/upload`

**Description:** Upload a single resume for AI-powered parsing and processing.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file` (required): Resume file (PDF, DOCX, DOC)
  - `source` (optional): Import source (default: "candidate_upload")

**Response:**
```json
{
  "resume_id": "uuid",
  "filename": "resume.pdf",
  "status": "uploaded",
  "message": "Resume uploaded successfully and queued for processing",
  "processing_job_id": "celery_task_id"
}
```

**Example:**
```bash
curl -X POST "https://api.hotgigs.ai/api/resumes/upload" \
  -H "Authorization: Bearer <token>" \
  -F "file=@resume.pdf" \
  -F "source=candidate_upload"
```

---

#### 2. Bulk Upload Resumes

**Endpoint:** `POST /api/resumes/bulk-upload`

**Description:** Upload multiple resumes for bulk processing. Only available to recruiters and admins.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `files` (required): Array of resume files

**Response:**
```json
{
  "batch_id": "uuid",
  "total_files": 10,
  "status": "queued",
  "message": "Bulk upload queued: 10 resumes"
}
```

**Example:**
```bash
curl -X POST "https://api.hotgigs.ai/api/resumes/bulk-upload" \
  -H "Authorization: Bearer <token>" \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.pdf" \
  -F "files=@resume3.pdf"
```

---

#### 3. Get Resume Processing Status

**Endpoint:** `GET /api/resumes/{resume_id}/status`

**Description:** Get the current processing status of a resume.

**Response:**
```json
{
  "resume_id": "uuid",
  "status": "processing",
  "progress_percentage": 75,
  "current_step": "Running AI analysis",
  "error_message": null,
  "processing_started_at": "2025-10-20T10:00:00Z",
  "processing_completed_at": null
}
```

**Status Values:**
- `uploaded`: Resume uploaded, waiting for processing
- `processing`: Currently being processed
- `completed`: Processing completed successfully
- `failed`: Processing failed

---

#### 4. Get Parsed Resume Data

**Endpoint:** `GET /api/resumes/{resume_id}/data`

**Description:** Get the AI-parsed structured data from a resume.

**Response:**
```json
{
  "resume_id": "uuid",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-234-567-8900",
  "location": "San Francisco, CA",
  "summary": "Experienced software engineer...",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "start_date": "2020-01",
      "end_date": "2023-05",
      "current": false,
      "description": "Led development of...",
      "achievements": ["Increased performance by 40%"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University of California",
      "location": "Berkeley, CA",
      "graduation_date": "2020-05",
      "gpa": "3.8"
    }
  ],
  "skills": [
    {
      "name": "Python",
      "category": "programming",
      "proficiency": "expert"
    }
  ],
  "top_skills": ["Python", "React", "PostgreSQL", "AWS", "Docker"],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "issue_date": "2022-03",
      "expiry_date": "2025-03"
    }
  ],
  "total_experience_years": 5.5,
  "ai_summary": "Highly skilled software engineer with..."
}
```

---

#### 5. Download Resume File

**Endpoint:** `GET /api/resumes/{resume_id}/download`

**Description:** Download the original resume file.

**Response:** Binary file download

**Access Control:**
- Resume owner can always download
- Recruiters can download if they have access to the candidate
- Shared candidates: Download allowed only if `can_download_resume` permission is granted

---

### Candidate Management (Recruiter)

#### 6. List Recruiter's Candidates

**Endpoint:** `GET /api/resumes/candidates`

**Description:** List all candidates in the recruiter's database (privacy-isolated).

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Number of records to return (default: 50, max: 100)
- `source` (optional): Filter by source (application, resume_import, bulk_upload, google_drive, admin_share)
- `search` (optional): Search by name or email
- `tags` (optional): Filter by tags (array)

**Response:**
```json
[
  {
    "candidate_id": "uuid",
    "user_id": "uuid",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "title": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "years_of_experience": 5,
    "top_skills": ["Python", "React", "AWS"],
    "added_at": "2025-10-20T10:00:00Z",
    "last_viewed_at": "2025-10-20T15:30:00Z",
    "source": "resume_import",
    "tags": ["frontend", "senior"]
  }
]
```

---

#### 7. Get Candidate Details

**Endpoint:** `GET /api/resumes/candidates/{candidate_id}`

**Description:** Get detailed information about a candidate.

**Response:**
```json
{
  "candidate_id": "uuid",
  "user_id": "uuid",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-234-567-8900",
  "title": "Senior Software Engineer",
  "location": "San Francisco, CA",
  "bio": "Passionate software engineer...",
  "years_of_experience": 5,
  "current_company": "Tech Corp",
  "current_position": "Senior Engineer",
  "professional_summary": "Experienced in...",
  "skills": [
    {
      "name": "Python",
      "category": "Technical",
      "proficiency": "Expert",
      "years": 5
    }
  ],
  "experience": [...],
  "education": [...],
  "resume_url": "https://...",
  "added_at": "2025-10-20T10:00:00Z",
  "source": "resume_import",
  "tags": ["frontend", "senior"],
  "notes": [
    {
      "id": "uuid",
      "title": "Interview Notes",
      "content": "Great technical skills...",
      "is_important": true,
      "created_at": "2025-10-20T14:00:00Z"
    }
  ]
}
```

**Side Effects:**
- Updates `last_viewed_at` timestamp
- Logs activity in candidate activity log

---

#### 8. Add Note to Candidate

**Endpoint:** `POST /api/resumes/candidates/{candidate_id}/notes`

**Description:** Add a note to a candidate's profile.

**Request Body:**
```json
{
  "title": "Interview Notes",
  "content": "Great technical skills and communication...",
  "is_private": false,
  "is_important": true
}
```

**Response:**
```json
{
  "message": "Note added successfully",
  "note_id": "uuid"
}
```

---

#### 9. Add Tags to Candidate

**Endpoint:** `POST /api/resumes/candidates/{candidate_id}/tags`

**Description:** Add tags to a candidate for categorization.

**Request Body:**
```json
{
  "tags": ["frontend", "senior", "react-expert"]
}
```

**Response:**
```json
{
  "message": "Tags added successfully",
  "tags": ["frontend", "senior", "react-expert", "python"]
}
```

---

### Admin Endpoints

#### 10. List All Candidates (Admin Master Database)

**Endpoint:** `GET /api/resumes/admin/candidates`

**Description:** List all candidates across all recruiters. Only available to admins.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Number of records to return (default: 50, max: 100)
- `search` (optional): Search by name or email

**Response:** Same format as recruiter candidate list

---

#### 11. Share Candidates with Recruiters

**Endpoint:** `POST /api/resumes/admin/candidates/share`

**Description:** Share candidate(s) with recruiter(s). Only available to admins.

**Request Body:**
```json
{
  "candidate_ids": ["uuid1", "uuid2"],
  "recruiter_ids": ["uuid3", "uuid4"],
  "share_reason": "Good fit for client requirements",
  "share_notes": "Focus on Python and AWS experience",
  "can_view_contact_info": true,
  "can_download_resume": true,
  "can_submit_to_jobs": true
}
```

**Response:**
```json
{
  "message": "Candidates shared successfully",
  "shares_created": 4,
  "total_shares": 4
}
```

**Side Effects:**
- Creates share records
- Adds candidates to recipient recruiters' databases
- Logs sharing activity

---

### Google Drive Integration

#### 12. Setup Google Drive Sync

**Endpoint:** `POST /api/google-drive/setup`

**Description:** Configure automatic resume import from a Google Drive folder.

**Request Body:**
```json
{
  "folder_id": "google_drive_folder_id",
  "folder_name": "Resumes 2025",
  "sync_frequency": "daily",
  "access_token": "google_access_token",
  "refresh_token": "google_refresh_token"
}
```

**Sync Frequency Options:**
- `daily`: Sync once per day
- `weekly`: Sync once per week
- `manual`: Only sync when manually triggered

**Response:**
```json
{
  "id": "uuid",
  "folder_id": "google_drive_folder_id",
  "folder_name": "Resumes 2025",
  "is_active": true,
  "sync_frequency": "daily",
  "last_sync_at": null,
  "next_sync_at": "2025-10-21T10:00:00Z",
  "total_files_synced": 0,
  "total_files_processed": 0,
  "total_files_failed": 0,
  "created_at": "2025-10-20T10:00:00Z"
}
```

---

#### 13. List Google Drive Syncs

**Endpoint:** `GET /api/google-drive/syncs`

**Description:** List all Google Drive sync configurations for the current user.

**Response:** Array of sync configurations (same format as setup response)

---

#### 14. Get Google Drive Sync Details

**Endpoint:** `GET /api/google-drive/syncs/{sync_id}`

**Description:** Get details of a specific sync configuration.

**Response:** Same format as setup response

---

#### 15. Update Google Drive Sync

**Endpoint:** `PUT /api/google-drive/syncs/{sync_id}`

**Description:** Update a Google Drive sync configuration.

**Request Body:**
```json
{
  "folder_name": "Updated Folder Name",
  "sync_frequency": "weekly",
  "is_active": true
}
```

**Response:** Updated sync configuration

---

#### 16. Trigger Manual Sync

**Endpoint:** `POST /api/google-drive/syncs/{sync_id}/sync`

**Description:** Manually trigger a Google Drive folder sync.

**Response:**
```json
{
  "message": "Sync triggered successfully",
  "sync_id": "uuid",
  "task_id": "celery_task_id"
}
```

---

#### 17. Delete Google Drive Sync

**Endpoint:** `DELETE /api/google-drive/syncs/{sync_id}`

**Description:** Delete a Google Drive sync configuration.

**Response:**
```json
{
  "message": "Sync configuration deleted successfully"
}
```

---

### Candidate-Job Matching

#### 18. Get Candidate Matches

**Endpoint:** `GET /api/matching/candidates/{candidate_id}/matches`

**Description:** Get job matches for a candidate, sorted by match score.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Number of records to return (default: 20, max: 100)
- `min_score` (optional): Minimum match score (0-100, default: 0)

**Response:**
```json
{
  "candidate_id": "uuid",
  "candidate_name": "John Doe",
  "total_matches": 25,
  "top_match_score": 92.5,
  "matches": [
    {
      "match_id": "uuid",
      "candidate_id": "uuid",
      "candidate_name": "John Doe",
      "candidate_title": "Senior Software Engineer",
      "candidate_location": "San Francisco, CA",
      "job_id": "uuid",
      "job_title": "Senior Backend Engineer",
      "company_name": "Tech Startup Inc",
      "match_score": 92.5,
      "skill_match_score": 95.0,
      "experience_match_score": 90.0,
      "education_match_score": 85.0,
      "location_match_score": 100.0,
      "match_explanation": "Excellent match based on Python expertise and AWS experience...",
      "matching_skills": ["Python", "AWS", "PostgreSQL", "Docker"],
      "missing_skills": ["Kubernetes", "GraphQL"],
      "viewed_by_recruiter": false,
      "created_at": "2025-10-20T10:00:00Z"
    }
  ]
}
```

---

#### 19. Trigger Candidate Re-matching

**Endpoint:** `POST /api/matching/candidates/{candidate_id}/rematch`

**Description:** Trigger re-matching for a candidate against all active jobs.

**Request Body:**
```json
{
  "force": false
}
```

**Response:**
```json
{
  "message": "Re-matching triggered successfully",
  "task_id": "celery_task_id",
  "estimated_matches": 150
}
```

---

#### 20. Get Job Matches

**Endpoint:** `GET /api/matching/jobs/{job_id}/matches`

**Description:** Get candidate matches for a job, sorted by match score.

**Query Parameters:** Same as candidate matches

**Response:**
```json
{
  "job_id": "uuid",
  "job_title": "Senior Backend Engineer",
  "total_matches": 45,
  "top_match_score": 95.0,
  "matches": [...]
}
```

**Access Control:**
- Job owner can see all matches
- Recruiters can only see candidates in their database
- Admins can see all matches

---

#### 21. Trigger Job Re-matching

**Endpoint:** `POST /api/matching/jobs/{job_id}/rematch`

**Description:** Trigger re-matching for a job against all candidates.

**Request Body:**
```json
{
  "force": false
}
```

**Response:**
```json
{
  "message": "Re-matching triggered successfully",
  "task_id": "celery_task_id",
  "estimated_matches": 200
}
```

---

#### 22. Mark Match as Viewed

**Endpoint:** `PUT /api/matching/matches/{match_id}/viewed`

**Description:** Mark a match as viewed by recruiter.

**Response:**
```json
{
  "message": "Match marked as viewed"
}
```

---

#### 23. Get Candidate Match Statistics

**Endpoint:** `GET /api/matching/stats/candidate/{candidate_id}`

**Description:** Get match statistics for a candidate.

**Response:**
```json
{
  "candidate_id": "uuid",
  "total_matches": 25,
  "high_matches": 8,
  "medium_matches": 12,
  "low_matches": 5,
  "match_rate": 32.0
}
```

**Match Tiers:**
- **High**: Match score >= 80
- **Medium**: Match score 60-79
- **Low**: Match score < 60

---

#### 24. Get Job Match Statistics

**Endpoint:** `GET /api/matching/stats/job/{job_id}`

**Description:** Get match statistics for a job.

**Response:**
```json
{
  "job_id": "uuid",
  "total_matches": 45,
  "high_matches": 15,
  "medium_matches": 20,
  "low_matches": 10,
  "viewed_matches": 30,
  "view_rate": 66.7
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

### Success Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully

### Client Error Codes
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found

### Server Error Codes
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Resume Upload**: 10 requests per minute per user
- **Bulk Upload**: 2 requests per minute per user
- **Other Endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

---

## Webhooks

The system can send webhooks for important events:

### Event Types
- `resume.processing.completed`: Resume processing completed
- `resume.processing.failed`: Resume processing failed
- `candidate.added`: New candidate added to database
- `candidate.shared`: Candidate shared with recruiter
- `match.created`: New match created

### Webhook Payload
```json
{
  "event": "resume.processing.completed",
  "timestamp": "2025-10-20T10:00:00Z",
  "data": {
    "resume_id": "uuid",
    "candidate_id": "uuid",
    "status": "completed"
  }
}
```

---

## Best Practices

### 1. Polling for Status
When uploading resumes, poll the status endpoint every 2-3 seconds:

```javascript
async function waitForProcessing(resumeId) {
  while (true) {
    const status = await fetch(`/api/resumes/${resumeId}/status`);
    const data = await status.json();
    
    if (data.status === 'completed' || data.status === 'failed') {
      return data;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

### 2. Bulk Operations
For bulk uploads, use the batch endpoint instead of uploading files individually.

### 3. Caching
Cache candidate lists and match results for 5-10 minutes to reduce API calls.

### 4. Error Handling
Always implement retry logic with exponential backoff for failed requests.

---

## SDK Examples

### Python
```python
import requests

class HotGigsClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.hotgigs.ai"
    
    def upload_resume(self, file_path):
        with open(file_path, 'rb') as f:
            response = requests.post(
                f"{self.base_url}/api/resumes/upload",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files={"file": f}
            )
        return response.json()
    
    def get_candidate_matches(self, candidate_id):
        response = requests.get(
            f"{self.base_url}/api/matching/candidates/{candidate_id}/matches",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()
```

### JavaScript
```javascript
class HotGigsClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.hotgigs.ai';
  }
  
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/api/resumes/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });
    
    return response.json();
  }
  
  async getCandidateMatches(candidateId) {
    const response = await fetch(
      `${this.baseUrl}/api/matching/candidates/${candidateId}/matches`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    
    return response.json();
  }
}
```

---

## Support

For API support, contact:
- **Email**: api-support@hotgigs.ai
- **Documentation**: https://docs.hotgigs.ai
- **Status Page**: https://status.hotgigs.ai

---

**Last Updated:** 2025-10-20  
**API Version:** 1.0.0

