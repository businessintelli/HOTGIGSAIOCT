"""
Orion AI Copilot Service
Provides 24/7 AI-powered career guidance, interview preparation,
application tips, and personalized recommendations.
"""

from typing import Dict, List, Any, Optional
import os
from openai import OpenAI
from datetime import datetime


class OrionCopilotService:
    """Service for Orion AI Copilot - 24/7 Career Guidance"""
    
    def __init__(self):
        self.client = OpenAI()  # API key from environment variable
        self.model = "gpt-4.1-mini"
        
        # Conversation history per user (in production, store in database)
        self.conversation_history = {}
    
    def chat(
        self,
        user_id: str,
        message: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Chat with Orion AI Copilot
        
        Args:
            user_id: User identifier
            message: User's message/question
            context: Optional context (user profile, current job, etc.)
        
        Returns:
            Dict with AI response and suggestions
        """
        
        # Get or create conversation history
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        # Build system prompt with context
        system_prompt = self._build_system_prompt(context)
        
        # Add user message to history
        self.conversation_history[user_id].append({
            "role": "user",
            "content": message
        })
        
        # Keep only last 10 messages to avoid token limits
        recent_history = self.conversation_history[user_id][-10:]
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt}
                ] + recent_history,
                temperature=0.8,
                max_tokens=800
            )
            
            ai_response = response.choices[0].message.content
            
            # Add AI response to history
            self.conversation_history[user_id].append({
                "role": "assistant",
                "content": ai_response
            })
            
            # Generate action items if applicable
            action_items = self._extract_action_items(ai_response)
            
            return {
                'success': True,
                'response': ai_response,
                'action_items': action_items,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
            }
    
    def get_career_advice(
        self,
        user_profile: Dict[str, Any],
        advice_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Get specific career advice
        
        Args:
            user_profile: User's profile information
            advice_type: Type of advice (general, career_change, skill_development, salary_negotiation)
        
        Returns:
            Dict with personalized advice
        """
        
        advice_prompts = {
            'general': "Provide general career advice and next steps",
            'career_change': "Provide advice on changing careers or transitioning to a new field",
            'skill_development': "Recommend skills to develop and learning resources",
            'salary_negotiation': "Provide salary negotiation strategies and tips",
            'interview_prep': "Provide interview preparation guidance",
            'resume_improvement': "Suggest ways to improve the resume"
        }
        
        prompt_instruction = advice_prompts.get(advice_type, advice_prompts['general'])
        
        prompt = f"""Based on the following candidate profile, {prompt_instruction}:

**Profile:**
- Current Role: {user_profile.get('headline', 'Not specified')}
- Experience Level: {user_profile.get('experience_level', 'Not specified')}
- Years of Experience: {user_profile.get('years_of_experience', 'Not specified')}
- Skills: {', '.join(user_profile.get('skills', [])[:10])}
- Location: {user_profile.get('location', 'Not specified')}

Provide specific, actionable advice tailored to this profile."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are Orion, an expert career coach with 20+ years of experience helping professionals advance their careers. You provide specific, actionable advice."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            advice = response.choices[0].message.content
            
            return {
                'success': True,
                'advice_type': advice_type,
                'advice': advice,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def prepare_for_interview(
        self,
        job_title: str,
        company_name: str = None,
        job_description: str = None,
        user_background: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Generate interview preparation guidance
        
        Args:
            job_title: The job title
            company_name: Optional company name
            job_description: Optional job description
            user_background: Optional user background info
        
        Returns:
            Dict with interview questions, tips, and preparation guide
        """
        
        prompt = f"""Help prepare for an interview for the position of {job_title}"""
        
        if company_name:
            prompt += f" at {company_name}"
        
        prompt += ".\n\n"
        
        if job_description:
            prompt += f"**Job Description:**\n{job_description[:500]}\n\n"
        
        if user_background:
            prompt += f"**Candidate Background:**\n"
            prompt += f"- Experience: {user_background.get('experience_level', 'Not specified')}\n"
            prompt += f"- Skills: {', '.join(user_background.get('skills', [])[:5])}\n\n"
        
        prompt += """Please provide:
1. 10 common interview questions for this role
2. Tips for answering behavioral questions
3. Technical topics to review
4. Questions to ask the interviewer
5. General interview tips"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are Orion, an expert interview coach who helps candidates prepare for job interviews. You provide specific, practical guidance."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            preparation_guide = response.choices[0].message.content
            
            # Parse into sections
            sections = self._parse_interview_prep(preparation_guide)
            
            return {
                'success': True,
                'job_title': job_title,
                'company_name': company_name,
                'preparation_guide': preparation_guide,
                'sections': sections,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_job_fit(
        self,
        user_profile: Dict[str, Any],
        job: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze how well a candidate fits a job and provide guidance
        
        Args:
            user_profile: Candidate profile
            job: Job details
        
        Returns:
            Dict with fit analysis and application advice
        """
        
        prompt = f"""Analyze the fit between this candidate and job, and provide application advice:

**Candidate Profile:**
- Experience: {user_profile.get('experience_level', 'Not specified')} ({user_profile.get('years_of_experience', 0)} years)
- Skills: {', '.join(user_profile.get('skills', [])[:10])}
- Location: {user_profile.get('location', 'Not specified')}

**Job:**
- Title: {job.get('title', 'Not specified')}
- Experience Level: {job.get('experience_level', 'Not specified')}
- Required Skills: {', '.join(job.get('required_skills', [])[:10])}
- Location: {job.get('location', 'Not specified')}
- Work Model: {job.get('work_model', 'Not specified')}

Provide:
1. Overall fit assessment (percentage and explanation)
2. Strengths that match the role
3. Gaps or areas of concern
4. Specific advice for the application
5. How to position yourself in the cover letter"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are Orion, a career advisor who helps candidates understand their fit for roles and craft winning applications."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            analysis = response.choices[0].message.content
            
            return {
                'success': True,
                'analysis': analysis,
                'job_title': job.get('title'),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _build_system_prompt(self, context: Dict[str, Any] = None) -> str:
        """Build system prompt with context"""
        
        base_prompt = """You are Orion, an AI career copilot and expert career advisor. You provide:

- Personalized career guidance and advice
- Interview preparation and tips
- Resume and application feedback
- Salary negotiation strategies
- Skill development recommendations
- Job search strategies

You are friendly, supportive, encouraging, and provide specific, actionable advice. You understand the tech industry, job market trends, and career development best practices.

Always be:
- Supportive and encouraging
- Specific and actionable
- Professional yet friendly
- Honest about challenges while remaining optimistic"""
        
        if context:
            base_prompt += f"\n\n**Current Context:**\n"
            if context.get('user_profile'):
                profile = context['user_profile']
                base_prompt += f"- User's role: {profile.get('headline', 'Not specified')}\n"
                base_prompt += f"- Experience level: {profile.get('experience_level', 'Not specified')}\n"
            
            if context.get('current_job'):
                job = context['current_job']
                base_prompt += f"- Viewing job: {job.get('title', 'Not specified')}\n"
        
        return base_prompt
    
    def _extract_action_items(self, response: str) -> List[str]:
        """Extract action items from AI response"""
        
        action_items = []
        lines = response.split('\n')
        
        for line in lines:
            line = line.strip()
            # Look for numbered lists or bullet points
            if line.startswith(('1.', '2.', '3.', '4.', '5.', '- ', '• ')):
                # Check if it contains action verbs
                action_verbs = ['update', 'review', 'practice', 'prepare', 'research', 'apply', 'reach out', 'connect', 'learn']
                if any(verb in line.lower() for verb in action_verbs):
                    action_items.append(line)
        
        return action_items[:5]  # Return top 5 action items
    
    def _parse_interview_prep(self, guide: str) -> Dict[str, List[str]]:
        """Parse interview preparation guide into sections"""
        
        sections = {
            'questions': [],
            'tips': [],
            'topics': [],
            'questions_to_ask': []
        }
        
        lines = guide.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if not line:
                continue
            
            lower_line = line.lower()
            
            # Detect sections
            if 'interview question' in lower_line:
                current_section = 'questions'
                continue
            elif 'tip' in lower_line or 'advice' in lower_line:
                current_section = 'tips'
                continue
            elif 'topic' in lower_line or 'technical' in lower_line:
                current_section = 'topics'
                continue
            elif 'questions to ask' in lower_line or 'ask the interviewer' in lower_line:
                current_section = 'questions_to_ask'
                continue
            
            # Add items to current section
            if current_section and (line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '- ', '• '))):
                sections[current_section].append(line)
        
        return sections
    
    def clear_conversation_history(self, user_id: str):
        """Clear conversation history for a user"""
        if user_id in self.conversation_history:
            del self.conversation_history[user_id]

