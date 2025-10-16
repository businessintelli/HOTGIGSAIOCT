# HotGigs.ai Email API Usage Guide

**Date:** October 16, 2025  
**Author:** Manus AI  
**Project:** HotGigs.ai - AI-Powered Recruitment Platform

---

## Introduction

This guide provides detailed instructions on how to use the HotGigs.ai Email API. The API allows you to send various types of emails, manage user preferences, and access analytics data.

All endpoints are available under the `/api` prefix. The base URL for the API is `http://localhost:8000`.

---

## Authentication

Most endpoints do not require authentication for this demo. In a production environment, you would need to include a valid JWT token in the `Authorization` header.

---

## Email Sending Endpoints

These endpoints are used to send transactional and marketing emails.

### 1. Send Application Confirmation

- **Endpoint:** `POST /api/emails/send-application-confirmation`
- **Description:** Sends an email to a candidate confirming their application has been received.
- **Request Body:**

```json
{
  "candidate_email": "candidate@example.com",
  "candidate_name": "John Doe",
  "job_title": "Senior Software Engineer",
  "company_name": "Google"
}
```

### 2. Send Interview Invitation

- **Endpoint:** `POST /api/emails/send-interview-invitation`
- **Description:** Sends an interview invitation to a candidate.
- **Request Body:**

```json
{
  "candidate_email": "candidate@example.com",
  "candidate_name": "John Doe",
  "job_title": "Senior Software Engineer",
  "company_name": "Google",
  "interview_date": "November 15, 2025",
  "interview_time": "2:00 PM EST",
  "interview_link": "https://hotgigs.ai/interview/abc123"
}
```

### 3. Notify Recruiter of New Application

- **Endpoint:** `POST /api/emails/notify-recruiter-new-application`
- **Description:** Notifies a recruiter about a new application for one of their jobs.
- **Request Body:**

```json
{
  "recruiter_email": "recruiter@company.com",
  "recruiter_name": "Jane Smith",
  "candidate_name": "John Doe",
  "job_title": "Senior Software Engineer",
  "application_id": "app-12345"
}
```

### 4. Send Password Reset Email

- **Endpoint:** `POST /api/emails/send-password-reset`
- **Description:** Sends a password reset email to a user.
- **Request Body:**

```json
{
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "reset_link": "https://hotgigs.ai/reset-password?token=xyz789"
}
```

### 5. Send Welcome Email

- **Endpoint:** `POST /api/emails/send-welcome-email`
- **Description:** Sends a welcome email to a new user.
- **Request Body:**

```json
{
  "user_email": "user@example.com",
  "user_name": "John Doe"
}
```

### 6. Send Application Status Update

- **Endpoint:** `POST /api/emails/send-status-update`
- **Description:** Sends an email to a candidate about a change in their application status.
- **Request Body:**

```json
{
  "candidate_email": "candidate@example.com",
  "candidate_name": "John Doe",
  "job_title": "Senior Software Engineer",
  "company_name": "Google",
  "status": "shortlisted"
}
```

### 7. Send Interview Reminder

- **Endpoint:** `POST /api/emails/send-interview-reminder`
- **Description:** Sends a reminder email for an upcoming interview.
- **Request Body:**

```json
{
  "user_email": "candidate@example.com",
  "user_name": "John Doe",
  "job_title": "Senior Software Engineer",
  "interview_date": "November 15, 2025",
  "interview_time": "2:00 PM EST",
  "interview_link": "https://hotgigs.ai/interview/abc123"
}
```

### 8. Send Weekly Job Digest

- **Endpoint:** `POST /api/emails/send-weekly-digest`
- **Description:** Sends a weekly digest of recommended jobs to a user.
- **Request Body:**

```json
{
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "jobs": [
    {
      "title": "Product Manager",
      "company": "Facebook",
      "description": "Lead the development of new and exciting products.",
      "link": "https://hotgigs.ai/jobs/123"
    },
    {
      "title": "Data Scientist",
      "company": "Netflix",
      "description": "Analyze large datasets to drive business decisions.",
      "link": "https://hotgigs.ai/jobs/456"
    }
  ]
}
```

---

## Email Preferences Endpoints

These endpoints are used to manage user email preferences.

### 1. Get Email Preferences

- **Endpoint:** `GET /api/email-preferences/{user_id}`
- **Description:** Retrieves the email preferences for a specific user.

### 2. Update Email Preferences

- **Endpoint:** `PUT /api/email-preferences/{user_id}`
- **Description:** Updates the email preferences for a user.
- **Request Body:**

```json
{
  "application_updates": false,
  "weekly_digest": true
}
```

### 3. Unsubscribe

- **Endpoint:** `POST /api/email-preferences/unsubscribe`
- **Description:** Unsubscribes a user from all marketing and non-essential emails.
- **Request Body:**

```json
{
  "user_email": "user@example.com"
}
```

### 4. Resubscribe

- **Endpoint:** `POST /api/email-preferences/resubscribe`
- **Description:** Resubscribes a user to all emails.
- **Request Body:**

```json
{
  "user_email": "user@example.com"
}
```

---

## Email Analytics Endpoints

These endpoints provide access to email analytics data.

- `GET /api/email-analytics/stats` - Overall email statistics
- `GET /api/email-analytics/activity` - Recent email activity
- `GET /api/email-analytics/templates` - Template performance stats
- `GET /api/email-analytics/trends` - Email sending trends over time
- `GET /api/email-analytics/engagement` - Detailed engagement metrics
- `GET /api/email-analytics/bounces` - Bounce details and reasons
- `GET /api/email-analytics/complaints` - Spam complaint information

---

## Webhook Endpoint

- **Endpoint:** `POST /api/webhooks/resend`
- **Description:** Handles incoming webhook events from Resend for real-time email tracking.

---

This guide provides a comprehensive overview of the HotGigs.ai Email API. For more details, please refer to the Swagger UI documentation at `http://localhost:8000/docs`.

