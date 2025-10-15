#!/usr/bin/env python3
"""
Phase 2 API Testing Script
Tests all authentication and candidate profile management endpoints
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://8000-ieax82bblh1eijfgixov5-97ad08b4.manusvm.computer"

class TestResults:
    def __init__(self):
        self.tests = []
        self.passed = 0
        self.failed = 0
    
    def add_result(self, test_name, passed, details=""):
        self.tests.append({
            "test": test_name,
            "status": "PASSED" if passed else "FAILED",
            "details": details
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        for test in self.tests:
            status_icon = "✅" if test["status"] == "PASSED" else "❌"
            print(f"{status_icon} {test['test']}: {test['status']}")
            if test['details']:
                print(f"   Details: {test['details']}")
        print(f"\nTotal: {len(self.tests)} tests")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/len(self.tests)*100):.1f}%")
        print("="*80)

results = TestResults()

# Test 1: Health Check
print("\n[TEST 1] Health Check")
try:
    response = requests.get(f"{BASE_URL}/api/health")
    if response.status_code == 200:
        print(f"✅ Health check passed: {response.json()}")
        results.add_result("Health Check", True, f"Status: {response.json()}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
        results.add_result("Health Check", False, f"Status code: {response.status_code}")
except Exception as e:
    print(f"❌ Health check error: {e}")
    results.add_result("Health Check", False, str(e))

# Test 2: User Registration
print("\n[TEST 2] User Registration")
test_user = {
    "email": f"testuser_{datetime.now().timestamp()}@hotgigs.ai",
    "password": "testpass123",
    "full_name": "Test User Phase 2",
    "role": "candidate"
}

try:
    response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Registration successful")
        print(f"   Token: {data['access_token'][:20]}...")
        print(f"   User: {data['user']}")
        results.add_result("User Registration", True, f"User: {data['user']['email']}")
        
        # Save token and email for subsequent tests
        token = data['access_token']
        user_email = data['user']['email']
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Response: {response.text}")
        results.add_result("User Registration", False, f"Status: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"❌ Registration error: {e}")
    results.add_result("User Registration", False, str(e))
    exit(1)

# Test 3: User Login
print("\n[TEST 3] User Login")
login_data = {
    "email": user_email,
    "password": test_user["password"]
}

try:
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful")
        print(f"   Token: {data['access_token'][:20]}...")
        results.add_result("User Login", True, "Successfully authenticated")
    else:
        print(f"❌ Login failed: {response.status_code}")
        results.add_result("User Login", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Login error: {e}")
    results.add_result("User Login", False, str(e))

# Test 4: Create Candidate Profile
print("\n[TEST 4] Create Candidate Profile")
profile_data = {
    "title": "Senior Software Engineer",
    "bio": "Experienced software engineer with 5+ years in full-stack development",
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "linkedin_url": "https://linkedin.com/in/testuser",
    "github_url": "https://github.com/testuser",
    "years_of_experience": 5,
    "current_company": "Tech Corp",
    "current_position": "Senior Developer",
    "desired_job_titles": ["Senior Engineer", "Tech Lead"],
    "desired_locations": ["San Francisco", "Remote"],
    "desired_salary_min": 120000,
    "desired_salary_max": 180000,
    "job_type_preferences": ["full-time", "remote"],
    "willing_to_relocate": False,
    "looking_for_job": True
}

try:
    response = requests.post(
        f"{BASE_URL}/api/candidates/profile?user_email={user_email}",
        json=profile_data
    )
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Profile created successfully")
        print(f"   Profile ID: {data['id']}")
        print(f"   Title: {data['title']}")
        results.add_result("Create Candidate Profile", True, f"Profile ID: {data['id']}")
        profile_id = data['id']
    else:
        print(f"❌ Profile creation failed: {response.status_code}")
        print(f"   Response: {response.text}")
        results.add_result("Create Candidate Profile", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Profile creation error: {e}")
    results.add_result("Create Candidate Profile", False, str(e))

# Test 5: Get Candidate Profile
print("\n[TEST 5] Get Candidate Profile")
try:
    response = requests.get(f"{BASE_URL}/api/candidates/profile/{user_email}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Profile retrieved successfully")
        print(f"   Title: {data['title']}")
        print(f"   Location: {data['location']}")
        print(f"   Experience: {data['years_of_experience']} years")
        results.add_result("Get Candidate Profile", True, "Profile data retrieved")
    else:
        print(f"❌ Profile retrieval failed: {response.status_code}")
        results.add_result("Get Candidate Profile", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Profile retrieval error: {e}")
    results.add_result("Get Candidate Profile", False, str(e))

# Test 6: Update Candidate Profile
print("\n[TEST 6] Update Candidate Profile")
update_data = {
    "bio": "Updated bio: Expert in React, Python, and cloud technologies",
    "years_of_experience": 6
}

try:
    response = requests.put(
        f"{BASE_URL}/api/candidates/profile/{user_email}",
        json=update_data
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Profile updated successfully")
        print(f"   New bio: {data['bio'][:50]}...")
        print(f"   Experience: {data['years_of_experience']} years")
        results.add_result("Update Candidate Profile", True, "Profile updated")
    else:
        print(f"❌ Profile update failed: {response.status_code}")
        results.add_result("Update Candidate Profile", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Profile update error: {e}")
    results.add_result("Update Candidate Profile", False, str(e))

# Test 7: Add Skills
print("\n[TEST 7] Add Skills")
skills = [
    {"skill_name": "Python", "skill_category": "Programming", "proficiency_level": "Expert", "years_of_experience": 5},
    {"skill_name": "React", "skill_category": "Frontend", "proficiency_level": "Advanced", "years_of_experience": 4},
    {"skill_name": "PostgreSQL", "skill_category": "Database", "proficiency_level": "Advanced", "years_of_experience": 3}
]

skills_added = 0
for skill in skills:
    try:
        response = requests.post(
            f"{BASE_URL}/api/candidates/profile/{user_email}/skills",
            json=skill
        )
        if response.status_code == 201:
            skills_added += 1
            print(f"✅ Added skill: {skill['skill_name']}")
        else:
            print(f"❌ Failed to add skill: {skill['skill_name']}")
    except Exception as e:
        print(f"❌ Error adding skill {skill['skill_name']}: {e}")

if skills_added == len(skills):
    results.add_result("Add Skills", True, f"Added {skills_added} skills")
else:
    results.add_result("Add Skills", False, f"Only added {skills_added}/{len(skills)} skills")

# Test 8: Get Skills
print("\n[TEST 8] Get Skills")
try:
    response = requests.get(f"{BASE_URL}/api/candidates/profile/{user_email}/skills")
    if response.status_code == 200:
        skills_data = response.json()
        print(f"✅ Retrieved {len(skills_data)} skills")
        for skill in skills_data:
            print(f"   - {skill['skill_name']} ({skill['proficiency_level']})")
        results.add_result("Get Skills", True, f"Retrieved {len(skills_data)} skills")
    else:
        print(f"❌ Skills retrieval failed: {response.status_code}")
        results.add_result("Get Skills", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Skills retrieval error: {e}")
    results.add_result("Get Skills", False, str(e))

# Test 9: Add Work Experience
print("\n[TEST 9] Add Work Experience")
experience = {
    "company_name": "Tech Corp",
    "job_title": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "employment_type": "Full-time",
    "start_date": "2020-01-01T00:00:00",
    "end_date": None,
    "is_current": True,
    "description": "Leading development of cloud-based applications",
    "achievements": ["Improved system performance by 40%", "Led team of 5 developers"],
    "technologies_used": ["Python", "React", "AWS", "PostgreSQL"]
}

try:
    response = requests.post(
        f"{BASE_URL}/api/candidates/profile/{user_email}/experience",
        json=experience
    )
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Work experience added")
        print(f"   Company: {data['company_name']}")
        print(f"   Title: {data['job_title']}")
        results.add_result("Add Work Experience", True, f"{data['company_name']} - {data['job_title']}")
    else:
        print(f"❌ Work experience addition failed: {response.status_code}")
        print(f"   Response: {response.text}")
        results.add_result("Add Work Experience", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Work experience error: {e}")
    results.add_result("Add Work Experience", False, str(e))

# Test 10: Get Work Experience
print("\n[TEST 10] Get Work Experience")
try:
    response = requests.get(f"{BASE_URL}/api/candidates/profile/{user_email}/experience")
    if response.status_code == 200:
        exp_data = response.json()
        print(f"✅ Retrieved {len(exp_data)} work experience entries")
        for exp in exp_data:
            print(f"   - {exp['job_title']} at {exp['company_name']}")
        results.add_result("Get Work Experience", True, f"Retrieved {len(exp_data)} entries")
    else:
        print(f"❌ Experience retrieval failed: {response.status_code}")
        results.add_result("Get Work Experience", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Experience retrieval error: {e}")
    results.add_result("Get Work Experience", False, str(e))

# Test 11: Add Education
print("\n[TEST 11] Add Education")
education = {
    "institution_name": "Stanford University",
    "degree": "Bachelor's",
    "field_of_study": "Computer Science",
    "location": "Stanford, CA",
    "start_date": "2014-09-01T00:00:00",
    "end_date": "2018-06-01T00:00:00",
    "is_current": False,
    "grade": "3.8 GPA",
    "description": "Focus on artificial intelligence and software engineering",
    "achievements": ["Dean's List", "Graduated with Honors"]
}

try:
    response = requests.post(
        f"{BASE_URL}/api/candidates/profile/{user_email}/education",
        json=education
    )
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Education added")
        print(f"   Institution: {data['institution_name']}")
        print(f"   Degree: {data['degree']} in {data['field_of_study']}")
        results.add_result("Add Education", True, f"{data['degree']} from {data['institution_name']}")
    else:
        print(f"❌ Education addition failed: {response.status_code}")
        print(f"   Response: {response.text}")
        results.add_result("Add Education", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Education error: {e}")
    results.add_result("Add Education", False, str(e))

# Test 12: Get Education
print("\n[TEST 12] Get Education")
try:
    response = requests.get(f"{BASE_URL}/api/candidates/profile/{user_email}/education")
    if response.status_code == 200:
        edu_data = response.json()
        print(f"✅ Retrieved {len(edu_data)} education entries")
        for edu in edu_data:
            print(f"   - {edu['degree']} in {edu['field_of_study']} from {edu['institution_name']}")
        results.add_result("Get Education", True, f"Retrieved {len(edu_data)} entries")
    else:
        print(f"❌ Education retrieval failed: {response.status_code}")
        results.add_result("Get Education", False, f"Status: {response.status_code}")
except Exception as e:
    print(f"❌ Education retrieval error: {e}")
    results.add_result("Get Education", False, str(e))

# Print final summary
results.print_summary()

# Save results to file
with open('/home/ubuntu/hotgigs/test_results.json', 'w') as f:
    json.dump(results.tests, f, indent=2)
print("\n✅ Test results saved to test_results.json")

