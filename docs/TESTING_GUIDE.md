# Testing Guide - Resume Import System

## Overview

This document provides comprehensive testing guidelines for the HotGigs.ai resume import system, covering unit tests, integration tests, end-to-end tests, and manual testing procedures.

**Last Updated:** October 20, 2025  
**Test Coverage Target:** 80%+

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [End-to-End Tests](#end-to-end-tests)
5. [Manual Testing](#manual-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Data](#test-data)

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\
     /      \  Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /__________  \
```

### Test Environments

1. **Local Development** - Developer machines
2. **CI/CD Pipeline** - Automated testing on commits
3. **Staging** - Pre-production testing
4. **Production** - Smoke tests and monitoring

### Tools & Frameworks

**Backend:**
- `pytest` - Python testing framework
- `pytest-asyncio` - Async test support
- `pytest-cov` - Code coverage
- `factory_boy` - Test data factories
- `faker` - Fake data generation

**Frontend:**
- `Jest` - JavaScript testing framework
- `React Testing Library` - Component testing
- `MSW` (Mock Service Worker) - API mocking
- `Cypress` - End-to-end testing

---

## Unit Tests

### Backend Unit Tests

#### Resume Parser Tests

**File:** `tests/unit/test_resume_parser.py`

```python
import pytest
from src.services.resume_parser import ResumeParser

class TestResumeParser:
    """Test resume parsing functionality"""
    
    @pytest.fixture
    def parser(self):
        return ResumeParser()
    
    def test_extract_contact_info(self, parser):
        """Test contact information extraction"""
        text = """
        John Doe
        john.doe@email.com
        +1 (555) 123-4567
        San Francisco, CA
        """
        
        result = parser.extract_contact_info(text)
        
        assert result['name'] == 'John Doe'
        assert result['email'] == 'john.doe@email.com'
        assert result['phone'] == '+1 (555) 123-4567'
        assert 'San Francisco' in result['location']
    
    def test_extract_skills(self, parser):
        """Test skills extraction"""
        text = """
        Skills: Python, JavaScript, React, PostgreSQL, AWS
        """
        
        skills = parser.extract_skills(text)
        
        assert 'Python' in skills
        assert 'JavaScript' in skills
        assert 'React' in skills
        assert len(skills) >= 5
    
    def test_extract_work_experience(self, parser):
        """Test work experience extraction"""
        text = """
        Senior Software Engineer
        Tech Company Inc.
        Jan 2020 - Present
        - Led development of microservices architecture
        - Managed team of 5 engineers
        """
        
        experience = parser.extract_work_experience(text)
        
        assert len(experience) > 0
        assert experience[0]['title'] == 'Senior Software Engineer'
        assert experience[0]['company'] == 'Tech Company Inc.'
        assert 'Jan 2020' in experience[0]['start_date']
    
    def test_extract_education(self, parser):
        """Test education extraction"""
        text = """
        Bachelor of Science in Computer Science
        Stanford University
        2015 - 2019
        """
        
        education = parser.extract_education(text)
        
        assert len(education) > 0
        assert 'Computer Science' in education[0]['degree']
        assert education[0]['institution'] == 'Stanford University'
    
    @pytest.mark.asyncio
    async def test_parse_resume_pdf(self, parser):
        """Test PDF resume parsing"""
        with open('tests/fixtures/sample_resume.pdf', 'rb') as f:
            result = await parser.parse_resume(f, 'application/pdf')
        
        assert result['contact_info'] is not None
        assert len(result['skills']) > 0
        assert len(result['work_experience']) > 0
    
    def test_parse_invalid_file(self, parser):
        """Test parsing invalid file"""
        with pytest.raises(ValueError):
            parser.parse_resume(b'invalid data', 'text/plain')
```

#### Matching Algorithm Tests

**File:** `tests/unit/test_matching.py`

```python
import pytest
from src.services.matching_service import MatchingService

class TestMatchingService:
    """Test candidate-job matching algorithm"""
    
    @pytest.fixture
    def matching_service(self, db):
        return MatchingService(db)
    
    def test_calculate_skill_match(self, matching_service):
        """Test skill matching score calculation"""
        candidate_skills = ['Python', 'JavaScript', 'React', 'PostgreSQL']
        job_requirements = ['Python', 'JavaScript', 'React', 'AWS']
        
        score = matching_service.calculate_skill_match(
            candidate_skills, 
            job_requirements
        )
        
        assert 0 <= score <= 100
        assert score == 75.0  # 3 out of 4 skills match
    
    def test_calculate_experience_match(self, matching_service):
        """Test experience matching"""
        candidate_years = 5
        required_years = 3
        
        score = matching_service.calculate_experience_match(
            candidate_years,
            required_years
        )
        
        assert score >= 80  # Exceeds requirement
    
    def test_calculate_overall_match(self, matching_service):
        """Test overall match score calculation"""
        scores = {
            'skill_match': 85.0,
            'experience_match': 90.0,
            'education_match': 100.0,
            'location_match': 80.0
        }
        
        overall = matching_service.calculate_overall_match(scores)
        
        assert 0 <= overall <= 100
        assert 85 <= overall <= 95  # Weighted average
```

#### WebSocket Tests

**File:** `tests/unit/test_websocket.py`

```python
import pytest
from src.core.websocket import ConnectionManager

class TestWebSocket:
    """Test WebSocket functionality"""
    
    @pytest.fixture
    def manager(self):
        return ConnectionManager()
    
    @pytest.mark.asyncio
    async def test_connect_user(self, manager):
        """Test user connection"""
        mock_ws = MockWebSocket()
        user_id = "user123"
        
        await manager.connect(mock_ws, user_id)
        
        assert user_id in manager.active_connections
        assert mock_ws in manager.active_connections[user_id]
    
    def test_disconnect_user(self, manager):
        """Test user disconnection"""
        mock_ws = MockWebSocket()
        user_id = "user123"
        
        manager.active_connections[user_id] = [mock_ws]
        manager.disconnect(mock_ws, user_id)
        
        assert user_id not in manager.active_connections
    
    @pytest.mark.asyncio
    async def test_send_personal_message(self, manager):
        """Test sending personal message"""
        mock_ws = MockWebSocket()
        user_id = "user123"
        manager.active_connections[user_id] = [mock_ws]
        
        message = {"type": "test", "data": "hello"}
        await manager.send_personal_message(message, user_id)
        
        assert mock_ws.sent_messages[-1] == message
    
    def test_join_room(self, manager):
        """Test joining a room"""
        user_id = "user123"
        room = "recruiters"
        
        manager.join_room(user_id, room)
        
        assert room in manager.rooms
        assert user_id in manager.rooms[room]
    
    def test_watch_resume(self, manager):
        """Test watching resume processing"""
        user_id = "user123"
        resume_id = "resume456"
        
        manager.watch_resume(user_id, resume_id)
        
        assert resume_id in manager.resume_watchers
        assert user_id in manager.resume_watchers[resume_id]
```

### Frontend Unit Tests

#### WebSocket Hook Tests

**File:** `src/hooks/__tests__/useWebSocket.test.js`

```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import useWebSocket from '../useWebSocket';

describe('useWebSocket', () => {
  let mockWebSocket;
  
  beforeEach(() => {
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
      readyState: WebSocket.OPEN
    };
    
    global.WebSocket = jest.fn(() => mockWebSocket);
  });
  
  test('connects on mount', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });
  
  test('handles notifications', async () => {
    const onNotification = jest.fn();
    const { result } = renderHook(() => 
      useWebSocket({ onNotification })
    );
    
    // Simulate receiving notification
    act(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'notification',
          data: { message: 'Test notification' }
        })
      });
    });
    
    expect(onNotification).toHaveBeenCalledWith({
      message: 'Test notification'
    });
  });
  
  test('sends messages', () => {
    const { result } = renderHook(() => useWebSocket());
    
    act(() => {
      result.current.sendMessage({ type: 'test' });
    });
    
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'test' })
    );
  });
  
  test('watches resume', () => {
    const { result } = renderHook(() => useWebSocket());
    
    act(() => {
      result.current.watchResume('resume123');
    });
    
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'watch_resume',
        resume_id: 'resume123'
      })
    );
  });
  
  test('reconnects on disconnect', async () => {
    const { result } = renderHook(() => useWebSocket());
    
    // Simulate disconnect
    act(() => {
      mockWebSocket.onclose();
    });
    
    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    }, { timeout: 5000 });
  });
});
```

#### Component Tests

**File:** `src/components/__tests__/ResumeUpload.test.jsx`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResumeUpload from '../ResumeUpload';

describe('ResumeUpload', () => {
  test('renders upload interface', () => {
    render(<ResumeUpload mode="single" />);
    
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
    expect(screen.getByText(/browse files/i)).toBeInTheDocument();
  });
  
  test('accepts file drop', async () => {
    render(<ResumeUpload mode="single" />);
    
    const file = new File(['resume content'], 'resume.pdf', {
      type: 'application/pdf'
    });
    
    const dropZone = screen.getByTestId('drop-zone');
    
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    });
    
    await waitFor(() => {
      expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    });
  });
  
  test('validates file type', async () => {
    render(<ResumeUpload mode="single" />);
    
    const file = new File(['content'], 'document.txt', {
      type: 'text/plain'
    });
    
    const dropZone = screen.getByTestId('drop-zone');
    
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });
  
  test('uploads file', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      resume_id: '123',
      status: 'uploaded'
    });
    
    global.fetch = mockUpload;
    
    render(<ResumeUpload mode="single" />);
    
    const file = new File(['resume'], 'resume.pdf', {
      type: 'application/pdf'
    });
    
    const input = screen.getByLabelText(/upload/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    const uploadButton = screen.getByText(/upload/i);
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
    });
  });
});
```

---

## Integration Tests

### API Integration Tests

**File:** `tests/integration/test_resume_api.py`

```python
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

class TestResumeAPI:
    """Test resume import API endpoints"""
    
    @pytest.fixture
    def auth_headers(self, test_user):
        """Get authentication headers"""
        response = client.post('/api/auth/login', json={
            'email': test_user.email,
            'password': 'testpass123'
        })
        token = response.json()['access_token']
        return {'Authorization': f'Bearer {token}'}
    
    def test_upload_resume(self, auth_headers):
        """Test single resume upload"""
        with open('tests/fixtures/sample_resume.pdf', 'rb') as f:
            response = client.post(
                '/api/resumes/upload',
                files={'file': ('resume.pdf', f, 'application/pdf')},
                headers=auth_headers
            )
        
        assert response.status_code == 200
        data = response.json()
        assert 'resume_id' in data
        assert data['status'] == 'uploaded'
    
    def test_bulk_upload(self, auth_headers):
        """Test bulk resume upload"""
        files = []
        for i in range(3):
            files.append(
                ('files', (f'resume{i}.pdf', open(f'tests/fixtures/resume{i}.pdf', 'rb'), 'application/pdf'))
            )
        
        response = client.post(
            '/api/resumes/bulk-upload',
            files=files,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['total_files'] == 3
        assert len(data['results']) == 3
    
    def test_get_processing_status(self, auth_headers):
        """Test getting resume processing status"""
        # Upload resume first
        with open('tests/fixtures/sample_resume.pdf', 'rb') as f:
            upload_response = client.post(
                '/api/resumes/upload',
                files={'file': ('resume.pdf', f, 'application/pdf')},
                headers=auth_headers
            )
        
        resume_id = upload_response.json()['resume_id']
        
        # Get status
        response = client.get(
            f'/api/resumes/{resume_id}/status',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert 'status' in data
        assert 'progress' in data
    
    def test_unauthorized_access(self):
        """Test unauthorized access"""
        response = client.get('/api/resumes/123/status')
        assert response.status_code == 401
```

**File:** `tests/integration/test_candidate_api.py`

```python
class TestCandidateAPI:
    """Test candidate management API"""
    
    def test_list_candidates(self, auth_headers):
        """Test listing candidates"""
        response = client.get(
            '/api/candidates',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert 'candidates' in data
        assert 'total' in data
    
    def test_get_candidate_detail(self, auth_headers, test_candidate):
        """Test getting candidate details"""
        response = client.get(
            f'/api/candidates/{test_candidate.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['id'] == str(test_candidate.id)
        assert 'contact_info' in data
        assert 'skills' in data
    
    def test_add_candidate_note(self, auth_headers, test_candidate):
        """Test adding note to candidate"""
        response = client.post(
            f'/api/candidates/{test_candidate.id}/notes',
            json={
                'title': 'Interview Notes',
                'content': 'Great technical skills',
                'is_important': True
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data['title'] == 'Interview Notes'
    
    def test_privacy_isolation(self, recruiter1_headers, recruiter2_headers, recruiter1_candidate):
        """Test that recruiters can't see each other's candidates"""
        # Recruiter 1 can see their candidate
        response1 = client.get(
            f'/api/candidates/{recruiter1_candidate.id}',
            headers=recruiter1_headers
        )
        assert response1.status_code == 200
        
        # Recruiter 2 cannot see recruiter 1's candidate
        response2 = client.get(
            f'/api/candidates/{recruiter1_candidate.id}',
            headers=recruiter2_headers
        )
        assert response2.status_code == 404
```

---

## End-to-End Tests

### Cypress E2E Tests

**File:** `cypress/e2e/resume_upload_flow.cy.js`

```javascript
describe('Resume Upload Flow', () => {
  beforeEach(() => {
    cy.login('recruiter@test.com', 'password');
  });
  
  it('uploads resume and views candidate', () => {
    // Navigate to upload page
    cy.visit('/resumes/import');
    
    // Upload file
    cy.get('[data-testid="file-input"]').attachFile('sample_resume.pdf');
    
    // Click upload button
    cy.get('[data-testid="upload-button"]').click();
    
    // Wait for processing
    cy.get('[data-testid="progress-bar"]', { timeout: 30000 })
      .should('have.attr', 'value', '100');
    
    // Verify success message
    cy.contains('Resume processed successfully').should('be.visible');
    
    // Navigate to candidate
    cy.get('[data-testid="view-candidate-button"]').click();
    
    // Verify candidate details
    cy.url().should('include', '/candidates/');
    cy.contains('John Doe').should('be.visible');
    cy.contains('john.doe@email.com').should('be.visible');
  });
  
  it('shows real-time progress updates', () => {
    cy.visit('/resumes/import');
    
    // Upload file
    cy.get('[data-testid="file-input"]').attachFile('sample_resume.pdf');
    cy.get('[data-testid="upload-button"]').click();
    
    // Verify progress steps appear
    cy.contains('Uploading file').should('be.visible');
    cy.contains('Parsing resume', { timeout: 10000 }).should('be.visible');
    cy.contains('Extracting information').should('be.visible');
    cy.contains('Creating candidate profile').should('be.visible');
  });
});

describe('Candidate Management Flow', () => {
  beforeEach(() => {
    cy.login('recruiter@test.com', 'password');
  });
  
  it('searches and filters candidates', () => {
    cy.visit('/candidates');
    
    // Search by name
    cy.get('[data-testid="search-input"]').type('John');
    cy.contains('John Doe').should('be.visible');
    
    // Filter by source
    cy.get('[data-testid="source-filter"]').select('resume_import');
    cy.get('[data-testid="candidate-card"]').should('have.length.at.least', 1);
    
    // Filter by tags
    cy.get('[data-testid="tag-filter"]').type('Python{enter}');
    cy.get('[data-testid="candidate-card"]')
      .should('contain', 'Python');
  });
  
  it('adds note to candidate', () => {
    cy.visit('/candidates');
    cy.get('[data-testid="candidate-card"]').first().click();
    
    // Navigate to notes tab
    cy.get('[data-testid="notes-tab"]').click();
    
    // Add note
    cy.get('[data-testid="add-note-button"]').click();
    cy.get('[data-testid="note-title"]').type('Phone Screen');
    cy.get('[data-testid="note-content"]').type('Strong communication skills');
    cy.get('[data-testid="save-note-button"]').click();
    
    // Verify note appears
    cy.contains('Phone Screen').should('be.visible');
  });
});
```

---

## Manual Testing

### Test Scenarios

#### Scenario 1: Single Resume Upload

**Objective:** Verify single resume upload works end-to-end

**Steps:**
1. Log in as recruiter
2. Navigate to Resume Import page
3. Click "Upload Resume" or drag-and-drop a PDF file
4. Observe progress indicator
5. Wait for processing to complete
6. Click "View Candidate" button
7. Verify candidate profile is populated correctly

**Expected Results:**
- File uploads successfully
- Progress bar shows 0-100%
- Processing completes within 30 seconds
- Candidate profile contains extracted information
- Contact info, skills, experience are accurate

#### Scenario 2: Bulk Upload

**Objective:** Test bulk resume upload functionality

**Steps:**
1. Log in as recruiter
2. Navigate to Bulk Upload page
3. Select 10 resume files
4. Click "Upload All"
5. Monitor progress for each file
6. Review results summary

**Expected Results:**
- All 10 files upload successfully
- Individual progress tracked for each
- Success/failure count displayed
- Failed uploads show error messages
- Successfully processed candidates appear in database

#### Scenario 3: Google Drive Integration

**Objective:** Test Google Drive folder sync

**Steps:**
1. Log in as recruiter
2. Navigate to Google Drive Integration
3. Click "Add Folder"
4. Complete OAuth authorization
5. Enter folder ID
6. Set sync frequency to "manual"
7. Click "Complete Setup"
8. Trigger manual sync
9. Wait for sync to complete

**Expected Results:**
- OAuth flow completes successfully
- Folder configuration saved
- Manual sync processes all files in folder
- New candidates appear in database
- Notification received when sync completes

#### Scenario 4: Real-time Notifications

**Objective:** Verify WebSocket notifications work

**Steps:**
1. Log in as recruiter
2. Open notification center (bell icon)
3. In another tab, upload a resume
4. Observe notification center in first tab

**Expected Results:**
- Notification appears in real-time
- No page refresh needed
- Notification shows correct message
- Unread count increments
- Click notification navigates to candidate

#### Scenario 5: Matching Dashboard

**Objective:** Test candidate-job matching

**Steps:**
1. Log in as recruiter
2. Navigate to candidate detail page
3. Click "View Matches" tab
4. Review match scores
5. Filter by minimum score
6. Click on a match to view details

**Expected Results:**
- Matches displayed with scores
- Score breakdown shown (skills, experience, etc.)
- Filtering works correctly
- Match explanations are clear
- Navigation to job details works

---

## Performance Testing

### Load Testing

**Tool:** `locust`

**File:** `tests/performance/locustfile.py`

```python
from locust import HttpUser, task, between

class ResumeUploadUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Login before tests"""
        response = self.client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password'
        })
        self.token = response.json()['access_token']
        self.headers = {'Authorization': f'Bearer {self.token}'}
    
    @task(3)
    def list_candidates(self):
        """List candidates"""
        self.client.get('/api/candidates', headers=self.headers)
    
    @task(1)
    def upload_resume(self):
        """Upload resume"""
        with open('sample_resume.pdf', 'rb') as f:
            self.client.post(
                '/api/resumes/upload',
                files={'file': ('resume.pdf', f, 'application/pdf')},
                headers=self.headers
            )
    
    @task(2)
    def get_candidate_detail(self):
        """Get candidate details"""
        self.client.get(f'/api/candidates/123', headers=self.headers)
```

**Run Load Test:**
```bash
locust -f tests/performance/locustfile.py --host=http://localhost:8000
```

**Performance Targets:**
- API response time < 200ms (p95)
- Resume upload < 5 seconds
- Resume processing < 30 seconds
- WebSocket latency < 100ms
- Support 1000 concurrent users

---

## Security Testing

### Security Checklist

- [ ] **Authentication**
  - JWT tokens properly validated
  - Token expiration enforced
  - Refresh tokens implemented

- [ ] **Authorization**
  - Role-based access control works
  - Privacy isolation enforced
  - Admin-only endpoints protected

- [ ] **Input Validation**
  - File type validation
  - File size limits enforced
  - SQL injection prevention
  - XSS prevention

- [ ] **Data Protection**
  - Sensitive data encrypted
  - HTTPS enforced
  - CORS configured correctly

- [ ] **Rate Limiting**
  - Upload rate limits
  - API rate limits
  - WebSocket connection limits

### Penetration Testing

**Tools:**
- OWASP ZAP
- Burp Suite
- SQLMap

**Test Cases:**
1. Attempt SQL injection in search fields
2. Try XSS in note content
3. Test CSRF protection
4. Attempt unauthorized file access
5. Test for information disclosure

---

## Test Data

### Sample Resumes

**Location:** `tests/fixtures/`

- `sample_resume.pdf` - Standard software engineer resume
- `resume_no_experience.pdf` - Entry-level candidate
- `resume_senior.pdf` - Senior executive resume
- `resume_malformed.pdf` - Intentionally malformed for error testing

### Database Fixtures

**File:** `tests/fixtures/db_fixtures.py`

```python
import pytest
from factory import Factory, Faker
from src.models.candidate import Candidate

class CandidateFactory(Factory):
    class Meta:
        model = Candidate
    
    full_name = Faker('name')
    email = Faker('email')
    phone = Faker('phone_number')
    location = Faker('city')
    title = Faker('job')
    years_of_experience = Faker('random_int', min=0, max=20)

@pytest.fixture
def test_candidate(db):
    """Create test candidate"""
    candidate = CandidateFactory.create()
    db.add(candidate)
    db.commit()
    return candidate
```

---

## Running Tests

### Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_resume_parser.py

# Run specific test
pytest tests/unit/test_resume_parser.py::TestResumeParser::test_extract_contact_info

# Run integration tests only
pytest tests/integration/

# Run with verbose output
pytest -v
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ResumeUpload.test.jsx

# Run in watch mode
npm test -- --watch

# Run E2E tests
npm run cypress:open
```

### CI/CD Pipeline

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest --cov=src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
  
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test -- --coverage
```

---

## Test Coverage Goals

### Backend Coverage

- **Overall:** 80%+
- **Critical paths:** 95%+
  - Resume parsing
  - Matching algorithm
  - Authentication/authorization
  - WebSocket connections

### Frontend Coverage

- **Overall:** 75%+
- **Components:** 80%+
- **Hooks:** 90%+
- **Utils:** 85%+

---

## Continuous Improvement

### Test Maintenance

- Review and update tests monthly
- Add tests for new features
- Remove obsolete tests
- Keep test data up-to-date

### Test Metrics

Track:
- Test coverage percentage
- Test execution time
- Flaky test rate
- Bug escape rate

---

**Last Updated:** October 20, 2025  
**Maintained By:** Development Team  
**Review Frequency:** Monthly

