# HotGigs.ai - Resume Import System Architecture

**Date:** October 17, 2025  
**Status:** ✅ **Design Complete**

---

## 🎯 Overview

This document outlines the architecture for HotGigs.ai's advanced resume import system, which supports:

- **Single and bulk resume uploads** by candidates and recruiters
- **Background processing** with no user wait time
- **AI-powered parsing** using NER and LLM
- **Google Drive integration** for automated imports
- **Intelligent candidate matching** to jobs

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Single Upload│  │  Bulk Upload │  │ Google Drive │      │
│  │   Component  │  │   Component  │  │  Integration │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Resume Upload API Endpoints                 │   │
│  │  • POST /api/resumes/upload (single)                 │   │
│  │  • POST /api/resumes/bulk-upload (multiple)          │   │
│  │  • POST /api/resumes/google-drive-sync               │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Resume Processing Service (Common)            │   │
│  │  • File validation and storage                        │   │
│  │  • Job queue creation                                 │   │
│  │  • Status tracking                                    │   │
│  └────────────────────┬─────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Background Job Queue (Celery + Redis)           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Task: process_resume(resume_id)                      │   │
│  │  Priority: High for single, Normal for bulk           │   │
│  └────────────────────┬─────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Resume Parser Service                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Step 1: Text Extraction                              │   │
│  │    • PDF/DOCX → Plain Text                            │   │
│  │    • OCR for scanned documents                        │   │
│  │    • Layout-aware extraction                          │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Step 2: Named Entity Recognition (NER)               │   │
│  │    • Extract: Name, Email, Phone                      │   │
│  │    • Extract: Experience, Education                   │   │
│  │    • Extract: Skills, Certifications                  │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Step 3: LLM Enhancement                              │   │
│  │    • Structured JSON output                           │   │
│  │    • Skill categorization                             │   │
│  │    • Experience summarization                         │   │
│  └────────────────────┬─────────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database (PostgreSQL)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                              │   │
│  │    • resumes (metadata, status, file_path)            │   │
│  │    • resume_data (parsed structured data)             │   │
│  │    • processing_jobs (queue status, progress)         │   │
│  │    • candidate_skills (normalized skills)             │   │
│  │    • candidate_matches (job matches)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### **Scenario 1: Single Resume Upload (Candidate)**

1. Candidate uploads resume via web interface
2. Backend validates file (format, size)
3. File stored in S3/local storage
4. Job created in Celery queue (high priority)
5. Background worker processes resume
6. AI parser extracts structured data
7. Data saved to database
8. Candidate profile auto-updated
9. WebSocket notification sent to frontend
10. Candidate sees "Resume processed successfully"

### **Scenario 2: Bulk Resume Upload (Recruiter)**

1. Recruiter uploads ZIP file or multiple files
2. Backend extracts and validates all files
3. Files stored in S3/local storage
4. Multiple jobs created in Celery queue (normal priority)
5. Background workers process resumes in parallel
6. Each resume parsed independently
7. Progress updates sent via WebSocket
8. Recruiter sees progress bar (e.g., "15/50 processed")
9. Email notification when all complete
10. Candidates auto-created in database

### **Scenario 3: Google Drive Integration (Recruiter)**

1. Recruiter connects Google Drive account (OAuth)
2. Selects folder to monitor
3. Backend scans folder for new resumes
4. New resumes detected and downloaded
5. Jobs created in Celery queue
6. Background processing (same as bulk upload)
7. Scheduled job runs daily to check for new files
8. Email digest sent with import summary

---

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend Framework** | FastAPI | REST API endpoints |
| **Task Queue** | Celery | Background job processing |
| **Message Broker** | Redis | Job queue and caching |
| **AI/ML** | OpenAI GPT-4 | LLM for parsing and extraction |
| **NER** | spaCy | Named Entity Recognition |
| **PDF Parsing** | PyMuPDF, pdfplumber | Text extraction |
| **DOCX Parsing** | python-docx | Word document parsing |
| **OCR** | Tesseract (via pytesseract) | Scanned document processing |
| **Storage** | S3 / Local Filesystem | Resume file storage |
| **Database** | PostgreSQL | Structured data storage |
| **Real-time Updates** | WebSockets | Progress notifications |
| **Google Drive API** | google-api-python-client | Drive integration |

---

## 📦 Core Modules

### **1. Resume Parser Module** (`services/resume_parser.py`)

**Common module used by all import scenarios.**

```python
class ResumeParser:
    def parse(self, file_path: str) -> dict:
        """
        Main parsing function - used by all import types.
        
        Returns:
            {
                "name": str,
                "email": str,
                "phone": str,
                "experience": [
                    {
                        "title": str,
                        "company": str,
                        "start_date": str,
                        "end_date": str,
                        "description": str
                    }
                ],
                "education": [
                    {
                        "degree": str,
                        "institution": str,
                        "graduation_date": str
                    }
                ],
                "skills": [str],  # Top 5+ skills
                "certifications": [str],
                "summary": str
            }
        """
```

### **2. Background Job Module** (`tasks/resume_tasks.py`)

```python
@celery_app.task
def process_resume(resume_id: int):
    """
    Celery task for processing a single resume.
    Used by all import scenarios.
    """
```

### **3. Google Drive Integration** (`services/google_drive_service.py`)

```python
class GoogleDriveService:
    def sync_folder(self, folder_id: str, recruiter_id: int):
        """
        Sync resumes from Google Drive folder.
        """
```

### **4. Candidate Matching** (`services/matching_service.py`)

```python
class CandidateMatchingService:
    def find_matches(self, candidate_id: int) -> list:
        """
        Find matching jobs for a candidate based on parsed resume data.
        """
```

---

## 🔒 Security & Privacy

- **Data Encryption:** All resumes encrypted at rest (S3 encryption)
- **Access Control:** Role-based access (candidates see own, recruiters see their imports)
- **PII Protection:** Sensitive data anonymized in logs
- **GDPR Compliance:** Data deletion on request
- **Secure Storage:** Temporary files deleted after processing

---

## 📈 Performance Optimization

- **Parallel Processing:** Multiple Celery workers process resumes concurrently
- **Priority Queue:** Single uploads get higher priority than bulk
- **Caching:** Parsed data cached in Redis
- **Rate Limiting:** API rate limits to prevent abuse
- **Batch Processing:** Bulk uploads processed in batches of 10
- **Progress Tracking:** Real-time progress updates via WebSocket

---

## 🧪 Testing Strategy

- **Unit Tests:** Test each parser component independently
- **Integration Tests:** Test end-to-end resume processing
- **Load Tests:** Test with 1000+ concurrent uploads
- **Accuracy Tests:** Validate parsing accuracy on diverse resume formats

---

## 📊 Monitoring & Analytics

- **Job Success Rate:** Track parsing success/failure rates
- **Processing Time:** Monitor average time per resume
- **Error Tracking:** Log and alert on parsing errors
- **Usage Analytics:** Track uploads per user/recruiter

---

## 🚀 Implementation Phases

1. ✅ **Architecture Design** (Current)
2. **Database Models** - Create tables for resumes, jobs, matches
3. **AI Parser** - Build NER + LLM parsing pipeline
4. **Background Jobs** - Set up Celery + Redis
5. **Google Drive** - Implement OAuth and folder sync
6. **API Endpoints** - Build upload and status endpoints
7. **Frontend UI** - Create upload components
8. **Matching Algorithm** - Implement candidate-job matching
9. **Admin Dashboard** - Add monitoring and analytics
10. **Testing & Documentation** - Comprehensive testing

---

**Next:** Create database models for resume data and processing jobs.

