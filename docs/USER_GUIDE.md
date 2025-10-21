# HotGigs.ai Resume Import System - User Guide

## Welcome to HotGigs.ai Resume Import!

This guide will help you get started with the resume import system, whether you're a candidate uploading your resume, a recruiter managing candidate databases, or an admin overseeing the entire system.

**Version:** 1.0  
**Last Updated:** October 20, 2025

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [For Candidates](#for-candidates)
3. [For Recruiters](#for-recruiters)
4. [For Admins](#for-admins)
5. [Notifications](#notifications)
6. [FAQ](#faq)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Supported File Formats:**
- PDF (.pdf)
- Microsoft Word (.docx, .doc)

**File Size Limits:**
- Single upload: 10 MB maximum
- Bulk upload: 10 MB per file, 50 files maximum

### Accessing the System

1. Navigate to `https://hotgigs.ai`
2. Click "Sign In" in the top right
3. Enter your email and password
4. Click "Sign In"

---

## For Candidates

### Uploading Your Resume

#### Step 1: Navigate to Upload Page

1. After logging in, click "Upload Resume" in the navigation menu
2. Or visit directly: `https://hotgigs.ai/resumes/import`

#### Step 2: Choose Your Resume File

**Option A: Drag and Drop**
- Drag your resume file from your computer
- Drop it into the upload area

**Option B: Browse Files**
- Click "Browse Files"
- Select your resume from your computer
- Click "Open"

#### Step 3: Upload and Process

1. Click the "Upload" button
2. Wait while your resume is processed (typically 10-30 seconds)
3. You'll see a progress bar showing the current step:
   - Uploading file
   - Parsing resume
   - Extracting information
   - Creating profile

#### Step 4: Review Your Profile

1. Once processing is complete, click "View Profile"
2. Review the extracted information:
   - Contact information
   - Skills
   - Work experience
   - Education
3. Make any necessary corrections

### What Information is Extracted?

Our AI-powered parser extracts:

- **Contact Information**
  - Full name
  - Email address
  - Phone number
  - Location (city, state)
  - LinkedIn profile (if included)

- **Professional Summary**
  - Career objective or summary statement

- **Skills**
  - Technical skills
  - Soft skills
  - Tools and technologies
  - Certifications

- **Work Experience**
  - Company names
  - Job titles
  - Employment dates
  - Responsibilities and achievements

- **Education**
  - Degrees
  - Institutions
  - Graduation dates
  - GPA (if included)

### Viewing Your Matches

1. From your profile page, click the "Matches" tab
2. See jobs that match your skills and experience
3. Each match shows:
   - Match score (0-100%)
   - Job title and company
   - Why it's a good match
   - Matching skills
   - Missing skills (to improve your chances)

### Tips for Best Results

✅ **Do:**
- Use a standard resume format
- Include clear section headers (Experience, Education, Skills)
- List skills explicitly
- Use common job titles
- Include dates in standard formats

❌ **Don't:**
- Use images or graphics for text
- Use unusual fonts or layouts
- Omit important information
- Use abbreviations without explanation

---

## For Recruiters

### Managing Your Candidate Database

#### Viewing Candidates

1. Click "Candidates" in the navigation menu
2. You'll see all candidates in your database
3. Each card shows:
   - Name and title
   - Location
   - Years of experience
   - Top skills
   - Source (how they were added)

#### Searching and Filtering

**Search:**
- Type in the search box to find candidates by:
  - Name
  - Email
  - Job title
  - Skills

**Filter by Source:**
- Application (applied to a job)
- Resume Import (uploaded resume)
- Bulk Upload (batch import)
- Google Drive (synced from Drive)
- Manual Entry

**Filter by Tags:**
- Click tag filter
- Select one or more tags
- View candidates with those tags

#### Viewing Candidate Details

1. Click on any candidate card
2. View comprehensive profile:
   - **Overview Tab:** Summary, contact info, skills
   - **Experience Tab:** Work history, education
   - **Matches Tab:** Job matches for this candidate
   - **Notes Tab:** Your notes about the candidate
   - **Activity Tab:** History of interactions

### Uploading Resumes

#### Single Resume Upload

1. Navigate to "Upload Resume"
2. Select a candidate's resume
3. Upload and wait for processing
4. The candidate will be added to your database

#### Bulk Resume Upload

**When to use:** When you have multiple resumes to import at once

1. Click "Bulk Upload" in the navigation
2. Select multiple resume files (up to 50)
3. Click "Upload All"
4. Monitor progress for each file
5. Review results summary:
   - Successful uploads
   - Failed uploads (with reasons)
6. All successful candidates are added to your database

### Google Drive Integration

**Automatically import resumes from a Google Drive folder**

#### Setting Up Google Drive Sync

1. Navigate to "Google Drive" in settings
2. Click "Add Folder"
3. **Step 1: Authorize**
   - Click "Authorize Google Drive"
   - Sign in to your Google account
   - Grant permissions (read-only access)
4. **Step 2: Select Folder**
   - Find your Google Drive folder ID:
     - Open the folder in Google Drive
     - Copy the ID from the URL: `drive.google.com/drive/folders/[FOLDER_ID]`
   - Paste the folder ID
   - Give it a friendly name (e.g., "Resumes 2025")
5. **Step 3: Configure**
   - Choose sync frequency:
     - **Daily:** Syncs every 24 hours
     - **Weekly:** Syncs every 7 days
     - **Manual:** Only syncs when you trigger it
   - Click "Complete Setup"

#### Managing Syncs

**View Sync Status:**
- See last sync time
- View next scheduled sync
- Check sync statistics (processed, synced, failed)

**Manual Sync:**
- Click the refresh icon to sync immediately
- Useful for testing or urgent imports

**Pause/Resume:**
- Click pause to temporarily stop automatic syncs
- Click resume to restart

**Delete:**
- Click delete to remove sync configuration
- This doesn't delete already-imported candidates

### Adding Notes

1. Open a candidate profile
2. Click the "Notes" tab
3. Click "Add Note"
4. Enter:
   - **Title:** Brief description (e.g., "Phone Screen")
   - **Content:** Detailed notes
   - **Important:** Check if this is a key note
   - **Private:** Check to keep note private (not shared with team)
5. Click "Save"

### Managing Tags

**Adding Tags:**
1. Open candidate profile
2. Click "Add Tags" button
3. Type tag names separated by commas
4. Press Enter or click "Add"

**Using Tags:**
- Organize candidates (e.g., "Frontend", "Senior", "Interview Ready")
- Filter candidate list by tags
- Track candidate status

### Viewing Matches

**For a Candidate:**
1. Open candidate profile
2. Click "Matches" tab
3. See all job matches for this candidate
4. Filter by minimum match score

**For a Job:**
1. Open job posting
2. Click "Candidates" tab
3. See all candidate matches for this job
4. Sort by match score

**Understanding Match Scores:**
- **80-100%:** Excellent match (green)
- **60-79%:** Good match (yellow)
- **0-59%:** Fair match (red)

**Match Breakdown:**
- Skills match
- Experience match
- Education match
- Location match

---

## For Admins

### Master Candidate Database

**Access:** Navigate to "Admin" → "Master Database"

**Features:**
- View ALL candidates across all recruiters
- See which recruiter owns each candidate
- Share candidates with specific recruiters
- Monitor system-wide statistics

### Sharing Candidates

**When to use:** When a candidate is relevant to multiple recruiters

1. Open candidate profile in master database
2. Click "Share" button
3. Select recruiter(s) to share with
4. Choose permissions:
   - **View Only:** Can see profile but not edit
   - **Full Access:** Can edit and add notes
5. Click "Share"
6. Selected recruiters will receive a notification

### System Monitoring

**Resume Processing Monitor:**
- View all active processing jobs
- See queue status
- Monitor processing times
- Identify stuck jobs

**Google Drive Sync Management:**
- View all sync configurations
- Monitor sync health
- Troubleshoot failed syncs
- Manage OAuth tokens

**System Health Dashboard:**
- API response times
- Database performance
- WebSocket connections
- Error rates

### User Management

**Adding Users:**
1. Navigate to "Admin" → "Users"
2. Click "Add User"
3. Enter user details
4. Select role:
   - **Candidate:** Can upload resume and view matches
   - **Recruiter:** Can manage candidates and jobs
   - **Admin:** Full system access
5. Click "Create User"

**Managing Permissions:**
- Edit user roles
- Enable/disable accounts
- Reset passwords
- View user activity logs

---

## Notifications

### Notification Center

**Accessing:**
- Click the bell icon in the top right
- Red badge shows unread count
- Green dot indicates WebSocket connection active

### Notification Types

**Resume Processing Complete**
- When your uploaded resume finishes processing
- Click to view candidate profile

**New Candidate Added**
- When a new candidate is added to your database
- Shows candidate name and source

**Candidate Shared**
- When an admin shares a candidate with you
- Shows who shared and why

**Match Found**
- When a high-quality match is discovered
- Shows match score and details

**Bulk Upload Complete**
- When bulk upload processing finishes
- Shows success/failure count

**Google Drive Sync Complete**
- When Drive sync finishes
- Shows number of new resumes

### Managing Notifications

**Mark as Read:**
- Click checkmark icon on individual notification
- Or click "Mark all read" at the top

**Delete:**
- Click trash icon to remove notification

**Browser Notifications:**
- Allow browser notifications for desktop alerts
- Receive notifications even when tab is not active

---

## FAQ

### General Questions

**Q: How long does resume processing take?**  
A: Typically 10-30 seconds, depending on resume complexity and file size.

**Q: What file formats are supported?**  
A: PDF (.pdf) and Microsoft Word (.docx, .doc) files.

**Q: Is my data secure?**  
A: Yes, all data is encrypted in transit and at rest. We follow industry-standard security practices.

**Q: Can I edit extracted information?**  
A: Yes, you can edit any information in your candidate profile.

### Candidate Questions

**Q: Can I upload multiple versions of my resume?**  
A: Yes, uploading a new resume will update your profile with the latest information.

**Q: How are my skills matched to jobs?**  
A: Our AI algorithm compares your skills, experience, and education to job requirements.

**Q: Will recruiters see my current employer?**  
A: Only if you include it in your resume. You can edit your profile to hide sensitive information.

### Recruiter Questions

**Q: How many resumes can I upload at once?**  
A: Up to 50 resumes in a single bulk upload.

**Q: Can I export candidate data?**  
A: Yes, use the "Export" button to download candidate data in CSV or PDF format.

**Q: How do I prevent duplicate candidates?**  
A: The system automatically detects duplicates based on email address.

**Q: Can I integrate with my ATS?**  
A: Yes, we offer API integration. Contact support for details.

### Admin Questions

**Q: How do I monitor system performance?**  
A: Use the System Health Dashboard in the admin panel.

**Q: Can I customize matching algorithm weights?**  
A: Yes, in Admin → Settings → Matching Configuration.

**Q: How do I troubleshoot failed uploads?**  
A: Check the Resume Processing Monitor for error details.

---

## Troubleshooting

### Upload Issues

**Problem:** File won't upload  
**Solutions:**
- Check file size (must be under 10 MB)
- Verify file format (PDF or DOCX only)
- Try a different browser
- Check internet connection

**Problem:** Processing stuck at 0%  
**Solutions:**
- Wait 2-3 minutes (server may be busy)
- Refresh the page
- Try uploading again
- Contact support if issue persists

**Problem:** Extracted information is incorrect  
**Solutions:**
- Edit the information manually
- Ensure resume uses standard format
- Try re-uploading with a cleaner resume

### Google Drive Issues

**Problem:** OAuth authorization fails  
**Solutions:**
- Clear browser cache and cookies
- Try incognito/private mode
- Ensure pop-ups are allowed
- Check Google account permissions

**Problem:** Sync not finding files  
**Solutions:**
- Verify folder ID is correct
- Check folder permissions (must be accessible)
- Ensure files are PDF or DOCX format
- Trigger manual sync to test

**Problem:** Sync shows all files as failed  
**Solutions:**
- Check OAuth token is still valid
- Re-authorize Google Drive access
- Verify file formats
- Check error messages in sync log

### Notification Issues

**Problem:** Not receiving notifications  
**Solutions:**
- Check WebSocket connection (green dot in bell icon)
- Refresh the page
- Check notification preferences
- Allow browser notifications

**Problem:** Notifications delayed  
**Solutions:**
- Check internet connection
- Verify WebSocket is connected
- Clear browser cache
- Try different browser

### Performance Issues

**Problem:** Page loading slowly  
**Solutions:**
- Clear browser cache
- Disable browser extensions
- Check internet speed
- Try different browser

**Problem:** Search not working  
**Solutions:**
- Refresh the page
- Clear search filters
- Try simpler search terms
- Contact support if issue persists

---

## Getting Help

### Support Channels

**Email:** support@hotgigs.ai  
**Phone:** 1-800-HOT-GIGS  
**Live Chat:** Available 9 AM - 5 PM PST  
**Help Center:** https://help.hotgigs.ai

### Feedback

We'd love to hear from you! Submit feedback at:  
https://hotgigs.ai/feedback

### Feature Requests

Have an idea for a new feature? Let us know:  
https://hotgigs.ai/feature-requests

---

## Updates and Changelog

**Version 1.0 - October 2025**
- Initial release
- Resume upload and parsing
- Candidate database management
- Google Drive integration
- AI-powered matching
- Real-time notifications

---

**Thank you for using HotGigs.ai!**

We're committed to making your job search and recruitment process as smooth as possible. If you have any questions or need assistance, don't hesitate to reach out to our support team.

Happy hiring! 🎉

