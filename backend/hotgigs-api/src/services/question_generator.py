"""
AI-powered screening question generator
Generates relevant screening questions based on job skills and domain
"""

import os
import json
from typing import List, Dict
from openai import OpenAI


class QuestionGeneratorService:
    """Service to generate screening questions using AI"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def generate_questions(
        self, 
        skills: List[str], 
        job_domain: str, 
        experience_level: str
    ) -> List[Dict]:
        """
        Generate screening questions based on skills and job domain
        
        Args:
            skills: List of required skills
            job_domain: Job domain/industry
            experience_level: Experience level (entry, mid, senior, etc.)
        
        Returns:
            List of question dictionaries
        """
        
        prompt = self._build_prompt(skills, job_domain, experience_level)
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR professional and technical recruiter. Generate relevant, insightful screening questions for job applications."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            questions_json = response.choices[0].message.content
            questions = json.loads(questions_json)
            
            return questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            # Return default questions if AI fails
            return self._get_default_questions(skills)
    
    def _build_prompt(self, skills: List[str], job_domain: str, experience_level: str) -> str:
        """Build the prompt for question generation"""
        
        skills_str = ", ".join(skills)
        
        prompt = f"""Generate 8-10 screening questions for a job application with the following details:

**Job Domain:** {job_domain}
**Required Skills:** {skills_str}
**Experience Level:** {experience_level}

Generate a mix of question types:
- 3-4 technical/skill-based questions (multiple choice or text)
- 2-3 experience-based questions (text)
- 1-2 scenario-based questions (text)
- 1-2 yes/no questions for basic qualifications
- 1 rating question for self-assessment

For each question, provide:
1. question_text: The actual question
2. question_type: One of ["multiple_choice", "text", "yes_no", "rating"]
3. options: Array of options (only for multiple_choice, provide 4 options)
4. is_required: Boolean (make most questions required)
5. order: Sequential number starting from 0

Return ONLY a valid JSON array of question objects, no additional text.

Example format:
[
  {{
    "question_text": "How many years of experience do you have with Python?",
    "question_type": "multiple_choice",
    "options": ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"],
    "is_required": true,
    "order": 0,
    "ai_generated": true
  }},
  {{
    "question_text": "Describe a challenging project where you used React and how you solved the main technical obstacle.",
    "question_type": "text",
    "options": null,
    "is_required": true,
    "order": 1,
    "ai_generated": true
  }}
]"""
        
        return prompt
    
    def _get_default_questions(self, skills: List[str]) -> List[Dict]:
        """Return default questions if AI generation fails"""
        
        questions = [
            {
                "question_text": f"How many years of experience do you have with {skills[0] if skills else 'the required skills'}?",
                "question_type": "multiple_choice",
                "options": ["Less than 1 year", "1-3 years", "3-5 years", "5+ years"],
                "is_required": True,
                "order": 0,
                "ai_generated": False
            },
            {
                "question_text": "Are you legally authorized to work in the country where this position is located?",
                "question_type": "yes_no",
                "options": None,
                "is_required": True,
                "order": 1,
                "ai_generated": False
            },
            {
                "question_text": "What is your expected salary range for this position?",
                "question_type": "text",
                "options": None,
                "is_required": False,
                "order": 2,
                "ai_generated": False
            },
            {
                "question_text": "When are you available to start?",
                "question_type": "multiple_choice",
                "options": ["Immediately", "2 weeks notice", "1 month notice", "More than 1 month"],
                "is_required": True,
                "order": 3,
                "ai_generated": False
            },
            {
                "question_text": "On a scale of 1-10, how would you rate your overall fit for this position?",
                "question_type": "rating",
                "options": None,
                "is_required": False,
                "order": 4,
                "ai_generated": False
            }
        ]
        
        return questions
    
    def evaluate_response(self, question: str, response: str, context: Dict = None) -> Dict:
        """
        Evaluate a candidate's response using AI
        
        Args:
            question: The screening question
            response: Candidate's response
            context: Additional context (job requirements, etc.)
        
        Returns:
            Dictionary with score and feedback
        """
        
        try:
            prompt = f"""Evaluate the following candidate response to a screening question.

**Question:** {question}
**Candidate Response:** {response}

Provide:
1. A score from 0-100 based on relevance, clarity, and depth
2. Brief constructive feedback (2-3 sentences)

Return as JSON:
{{
  "score": 85,
  "feedback": "Your feedback here"
}}"""
            
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert recruiter evaluating candidate responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"Error evaluating response: {e}")
            return {
                "score": None,
                "feedback": "Unable to evaluate response automatically."
            }

