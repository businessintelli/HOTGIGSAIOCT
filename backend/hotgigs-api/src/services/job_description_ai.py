"""
AI Job Description Generator Service
Uses OpenAI API to generate professional job descriptions
based on key inputs like role, skills, location, and salary.
"""

from typing import Dict, List, Any, Optional
import os
from openai import OpenAI


class JobDescriptionAIService:
    """Service for AI-powered job description generation"""
    
    def __init__(self):
        self.client = OpenAI()  # API key from environment variable
        self.model = "gpt-4.1-mini"  # Using the available model
    
    def generate_job_description(
        self,
        job_title: str,
        primary_skills: List[str],
        secondary_skills: List[str] = None,
        experience_level: str = "mid",
        location: str = None,
        work_model: str = "hybrid",
        employment_type: str = "full-time",
        salary_range: Dict[str, int] = None,
        company_description: str = None,
        additional_requirements: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive job description using AI
        
        Args:
            job_title: The job title/role
            primary_skills: List of primary/required skills
            secondary_skills: List of secondary/preferred skills
            experience_level: entry, mid, senior, lead, executive
            location: Job location
            work_model: remote, hybrid, on-site
            employment_type: full-time, part-time, contract, internship
            salary_range: Dict with 'min' and 'max' keys
            company_description: Brief company description
            additional_requirements: Any additional requirements
        
        Returns:
            Dict with generated description, requirements, responsibilities, and benefits
        """
        
        # Build the prompt
        prompt = self._build_prompt(
            job_title,
            primary_skills,
            secondary_skills,
            experience_level,
            location,
            work_model,
            employment_type,
            salary_range,
            company_description,
            additional_requirements
        )
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR professional and technical recruiter who writes compelling, clear, and professional job descriptions. You understand ATS optimization and candidate psychology."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Parse the response
            generated_text = response.choices[0].message.content
            parsed_result = self._parse_generated_description(generated_text)
            
            return {
                'success': True,
                'job_title': job_title,
                'description': parsed_result['description'],
                'requirements': parsed_result['requirements'],
                'responsibilities': parsed_result['responsibilities'],
                'preferred_qualifications': parsed_result['preferred_qualifications'],
                'benefits': parsed_result['benefits'],
                'full_text': generated_text
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'fallback_description': self._generate_fallback_description(
                    job_title,
                    primary_skills,
                    experience_level
                )
            }
    
    def _build_prompt(
        self,
        job_title: str,
        primary_skills: List[str],
        secondary_skills: List[str],
        experience_level: str,
        location: str,
        work_model: str,
        employment_type: str,
        salary_range: Dict[str, int],
        company_description: str,
        additional_requirements: List[str]
    ) -> str:
        """Build the prompt for AI generation"""
        
        prompt = f"""Generate a professional and compelling job description for the following position:

**Job Title:** {job_title}
**Experience Level:** {experience_level}
**Employment Type:** {employment_type}
**Work Model:** {work_model}
"""
        
        if location:
            prompt += f"**Location:** {location}\n"
        
        if salary_range:
            prompt += f"**Salary Range:** ${salary_range.get('min', 0):,} - ${salary_range.get('max', 0):,}\n"
        
        prompt += f"\n**Primary Skills Required:**\n"
        for skill in primary_skills:
            prompt += f"- {skill}\n"
        
        if secondary_skills:
            prompt += f"\n**Secondary/Preferred Skills:**\n"
            for skill in secondary_skills:
                prompt += f"- {skill}\n"
        
        if additional_requirements:
            prompt += f"\n**Additional Requirements:**\n"
            for req in additional_requirements:
                prompt += f"- {req}\n"
        
        if company_description:
            prompt += f"\n**Company Context:** {company_description}\n"
        
        prompt += """

Please generate a complete job description with the following sections:

1. **Job Description:** A compelling 2-3 paragraph overview that sells the role and excites candidates
2. **Key Responsibilities:** 6-8 specific responsibilities (use action verbs)
3. **Required Qualifications:** Essential requirements for the role
4. **Preferred Qualifications:** Nice-to-have skills and experience
5. **Benefits & Perks:** Attractive benefits that would appeal to candidates

Format the output clearly with section headers. Make it professional, engaging, and ATS-friendly."""
        
        return prompt
    
    def _parse_generated_description(self, generated_text: str) -> Dict[str, Any]:
        """Parse the AI-generated text into structured components"""
        
        sections = {
            'description': '',
            'responsibilities': [],
            'requirements': [],
            'preferred_qualifications': [],
            'benefits': []
        }
        
        # Split by common section headers
        lines = generated_text.split('\n')
        current_section = 'description'
        
        for line in lines:
            line = line.strip()
            
            if not line:
                continue
            
            # Detect section headers
            lower_line = line.lower()
            if 'job description' in lower_line or 'overview' in lower_line:
                current_section = 'description'
                continue
            elif 'responsibilities' in lower_line or 'duties' in lower_line:
                current_section = 'responsibilities'
                continue
            elif 'required' in lower_line and 'qualification' in lower_line:
                current_section = 'requirements'
                continue
            elif 'preferred' in lower_line or 'nice to have' in lower_line:
                current_section = 'preferred_qualifications'
                continue
            elif 'benefit' in lower_line or 'perk' in lower_line:
                current_section = 'benefits'
                continue
            
            # Add content to current section
            if line.startswith('- ') or line.startswith('• ') or line.startswith('* '):
                # It's a list item
                item = line[2:].strip()
                if current_section in ['responsibilities', 'requirements', 'preferred_qualifications', 'benefits']:
                    sections[current_section].append(item)
            elif line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
                # Numbered list item
                item = line.split('.', 1)[1].strip()
                if current_section in ['responsibilities', 'requirements', 'preferred_qualifications', 'benefits']:
                    sections[current_section].append(item)
            else:
                # Regular paragraph text
                if current_section == 'description':
                    if sections['description']:
                        sections['description'] += ' ' + line
                    else:
                        sections['description'] = line
        
        return sections
    
    def _generate_fallback_description(
        self,
        job_title: str,
        primary_skills: List[str],
        experience_level: str
    ) -> str:
        """Generate a basic fallback description if AI fails"""
        
        skills_text = ', '.join(primary_skills[:5])
        
        description = f"""We are seeking a talented {job_title} to join our growing team. 

The ideal candidate will have strong expertise in {skills_text} and a proven track record of delivering high-quality results. This is a {experience_level}-level position offering an opportunity to work on challenging projects and grow your career.

Key Responsibilities:
- Design, develop, and maintain high-quality solutions
- Collaborate with cross-functional teams
- Participate in code reviews and technical discussions
- Contribute to architectural decisions
- Mentor junior team members (for senior roles)

Requirements:
- Proven experience with {skills_text}
- Strong problem-solving and analytical skills
- Excellent communication and teamwork abilities
- Bachelor's degree in Computer Science or related field (or equivalent experience)

We offer competitive compensation, comprehensive benefits, and a collaborative work environment that values innovation and professional growth."""
        
        return description
    
    def enhance_job_description(
        self,
        existing_description: str,
        enhancement_focus: str = "general"
    ) -> Dict[str, Any]:
        """
        Enhance an existing job description
        
        Args:
            existing_description: The current job description
            enhancement_focus: What to focus on (general, ats, engagement, clarity)
        
        Returns:
            Dict with enhanced description and suggestions
        """
        
        focus_instructions = {
            'general': "Improve overall quality, clarity, and professionalism",
            'ats': "Optimize for ATS systems with better keywords and structure",
            'engagement': "Make it more engaging and appealing to top candidates",
            'clarity': "Improve clarity and remove ambiguity"
        }
        
        instruction = focus_instructions.get(enhancement_focus, focus_instructions['general'])
        
        prompt = f"""Please enhance the following job description. Focus on: {instruction}

Current Job Description:
{existing_description}

Provide an improved version that is more professional, clear, and effective."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR professional who enhances job descriptions to be more effective and appealing."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            enhanced_text = response.choices[0].message.content
            
            return {
                'success': True,
                'enhanced_description': enhanced_text,
                'original_description': existing_description
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'original_description': existing_description
            }

