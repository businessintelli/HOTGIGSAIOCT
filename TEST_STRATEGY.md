# HotGigs.ai - Comprehensive Test Strategy

**Version:** 1.0  
**Date:** October 15, 2025  
**Author:** Manus AI

## 1. Introduction

This document outlines the comprehensive testing strategy for the HotGigs.ai platform. Following user feedback, it has been identified that while the backend APIs and frontend UI components are largely in place, the integration between them is incomplete, leading to non-functional UI elements. 

This strategy adopts a phased, systematic approach to test, fix, and verify every feature of the platform for both **Candidate** and **Company** portals. Each phase will conclude with a commit to the GitHub repository, ensuring a clean history and enabling CI/CD integration.

## 2. Overall Objectives

- **Ensure 100% Feature Functionality:** Every button, link, and form must perform its intended action.
- **Validate End-to-End Workflows:** User journeys, from registration to application or job posting, must be seamless.
- **Verify Data Integrity:** Ensure data is correctly created, retrieved, updated, and deleted in the database via frontend interactions.
- **Confirm API Integration:** All frontend actions must correctly call the corresponding backend APIs and handle the responses.
- **Systematic Bug Fixing:** Isolate, fix, and test issues in a structured manner.
- **Phased GitHub Commits:** Integrate with CI/CD by committing tested and verified feature sets in phases.

## 3. Scope of Testing

### In Scope:
- **Candidate Portal:** All features including authentication, dashboard, profile management, job search, filtering, job details, application, saved jobs, and AI features (Orion, Resume AI).
- **Company Portal:** All features including authentication, dashboard, company profile, job posting, applicant tracking (ATS), and team management.
- **API Testing:** Verification of all 57+ API endpoints.
- **UI/UX Testing:** Ensuring the user interface is intuitive, responsive, and error-free.
- **Integration Testing:** Verifying the connection and data flow between the frontend, backend, and database.

### Out of Scope (for this phase):
- **Performance/Load Testing:** Will be conducted after functional testing is complete.
- **Security Penetration Testing:** Will be conducted as a separate, dedicated effort.
- **Usability Testing with real users:** Recommended after this internal testing phase is complete.

## 4. Testing Phases & Approach

We will follow a 6-phase testing and fixing plan. Each phase focuses on a specific module of the application. After each phase, the fixes will be committed to GitHub.

| Phase | Module | Key Objectives | Test Cases |
| :--- | :--- | :--- | :--- |
| **1** | **Candidate Dashboard** | Fix all navigation and action buttons on the main dashboard. | 1.1 - 1.5 |
| **2** | **Job Search & Details** | Ensure job search, filtering, sorting, and viewing job details works. | 2.1 - 2.6 |
| **3** | **Job Application & Profile** | Fix the "Apply Now", "Save Job", and main profile navigation. | 3.1 - 3.4 |
| **4** | **AI Features** | Connect Orion Chat to a mock response and implement resume upload. | 4.1 - 4.3 |
| **5** | **Company Portal** | Test and fix all employer-side features from login to ATS. | 5.1 - 5.5 |
| **6** | **Final Integration** | Implement logout functionality and conduct final regression testing. | 6.1 - 6.3 |

## 5. Detailed Test Cases

### Phase 1: Candidate Dashboard
- **1.1:** Click "Browse Jobs" button -> **Expected:** Navigate to `/jobs`.
- **1.2:** Click "Update Resume" button -> **Expected:** Navigate to `/profile/edit`.
- **1.3:** Click "Search Jobs" button -> **Expected:** Navigate to `/jobs`.
- **1.4:** Click "Find Connections" button -> **Expected:** Navigate to `/connections` (placeholder page).
- **1.5:** Click "Chat with Orion" button -> **Expected:** Open Orion chat modal.

### Phase 2: Job Search & Details
- **2.1:** On `/jobs` page, type "Software Engineer" in search bar and click search -> **Expected:** Job list updates with relevant results.
- **2.2:** Click "Remote" filter button -> **Expected:** Job list shows only remote jobs.
- **2.3:** Use "Sort by Salary" dropdown -> **Expected:** Job list re-orders by salary.
- **2.4:** Click on a job card title -> **Expected:** Navigate to `/jobs/{jobId}`.
- **2.5:** On job detail page, verify all job info is displayed correctly.
- **2.6:** Verify AI Match Score is visible and accurate.

### Phase 3: Job Application & Profile
- **3.1:** On a job card, click "Save" -> **Expected:** API call to save job is made, button state changes to "Saved".
- **3.2:** On a job card, click "Apply Now" -> **Expected:** Application modal opens with pre-filled job info.
- **3.3:** Submit application from modal -> **Expected:** API call is made, user sees "Application Submitted" confirmation.
- **3.4:** In main nav, click "Profile" button -> **Expected:** Dropdown menu appears with "My Profile", "Settings", and "Logout".

### Phase 4: AI Features
- **4.1:** Open Orion Chat, click a quick prompt -> **Expected:** A mocked, relevant response appears in the chat window.
- **4.2:** Navigate to `/profile/edit`, find "Resume Upload" section.
- **4.3:** Upload a PDF file -> **Expected:** API call is made, UI updates to show "Resume Score: 85%".

### Phase 5: Company Portal
- **5.1:** Register and log in as an Employer.
- **5.2:** Create a new job posting and verify it appears on the company dashboard.
- **5.3:** As a candidate, apply to the new job.
- **5.4:** As the employer, view the new application in the ATS.
- **5.5:** Change the application status from "Submitted" to "Reviewed" and verify the change is saved.

### Phase 6: Final Integration
- **6.1:** From the profile dropdown, click "Logout".
- **6.2:** **Expected:** User is redirected to homepage, `localStorage` is cleared.
- **6.3:** Attempt to navigate to `/dashboard` manually -> **Expected:** User is redirected to `/signin`.

## 6. Tools & Environment

- **Frontend:** React / Vite
- **Backend:** FastAPI / Python
- **Database:** PostgreSQL
- **Testing Tools:** Browser Developer Tools (Network, Console), Manus Browser
- **Version Control:** Git / GitHub

## 7. Reporting

- A **Phase Completion Report** will be created after each phase.
- A **Final Testing Report** will be generated at the end of the entire process, summarizing all findings, fixes, and the final status of the application.

This structured approach will ensure we methodically address all issues and deliver a fully functional, high-quality platform.

