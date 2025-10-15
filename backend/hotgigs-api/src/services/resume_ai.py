"""
Resume AI Analyzer Service
Provides resume parsing, analysis, ATS compatibility scoring,
and improvement recommendations.
"""

from typing import Dict, List, Any
import re


class ResumeAIService:
    """Service for AI-powered resume analysis"""
    
    def __init__(self):
        self.ats_keywords = {
            'contact': ['email', 'phone', 'linkedin', 'github', 'portfolio'],
            'skills': ['skills', 'technologies', 'proficiency', 'expertise'],
            'experience': ['experience', 'work history', 'employment'],
            'education': ['education', 'degree', 'university', 'college'],
            'achievements': ['achieved', 'improved', 'increased', 'reduced', 'led'],
            'action_verbs': [
                'managed', 'developed', 'created', 'implemented', 'designed',
                'led', 'coordinated', 'achieved', 'improved', 'increased'
            ]
        }
    
    def analyze_resume(
        self,
        resume_text: str,
        target_job: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive resume analysis
        
        Args:
            resume_text: Full text content of the resume
            target_job: Optional job description for targeted analysis
        
        Returns:
            Dict with ATS score, analysis, and recommendations
        """
        
        # Perform various analyses
        ats_score = self._calculate_ats_score(resume_text)
        structure_analysis = self._analyze_structure(resume_text)
        keyword_analysis = self._analyze_keywords(resume_text, target_job)
        formatting_analysis = self._analyze_formatting(resume_text)
        content_quality = self._analyze_content_quality(resume_text)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            ats_score,
            structure_analysis,
            keyword_analysis,
            formatting_analysis,
            content_quality
        )
        
        # Calculate overall score
        overall_score = self._calculate_overall_score(
            ats_score,
            structure_analysis,
            content_quality
        )
        
        return {
            'overall_score': overall_score,
            'ats_compatibility_score': ats_score,
            'structure_analysis': structure_analysis,
            'keyword_analysis': keyword_analysis,
            'formatting_analysis': formatting_analysis,
            'content_quality': content_quality,
            'recommendations': recommendations,
            'strengths': self._identify_strengths(
                structure_analysis,
                keyword_analysis,
                content_quality
            ),
            'weaknesses': self._identify_weaknesses(
                structure_analysis,
                keyword_analysis,
                content_quality
            )
        }
    
    def _calculate_ats_score(self, resume_text: str) -> float:
        """Calculate ATS compatibility score (0-100)"""
        
        score = 0
        max_score = 100
        
        # Check for essential sections (40 points)
        section_scores = {
            'contact': 10,
            'experience': 15,
            'education': 10,
            'skills': 5
        }
        
        for section, points in section_scores.items():
            if any(keyword in resume_text.lower() for keyword in self.ats_keywords.get(section, [])):
                score += points
        
        # Check for action verbs (20 points)
        action_verb_count = sum(
            1 for verb in self.ats_keywords['action_verbs']
            if verb in resume_text.lower()
        )
        score += min(action_verb_count * 2, 20)
        
        # Check for quantifiable achievements (20 points)
        numbers_count = len(re.findall(r'\d+%|\$\d+|\d+ years?', resume_text))
        score += min(numbers_count * 2, 20)
        
        # Check for proper formatting (20 points)
        if len(resume_text) > 200:  # Minimum length
            score += 5
        if len(resume_text) < 5000:  # Not too long
            score += 5
        if re.search(r'[A-Z][a-z]+ [A-Z][a-z]+', resume_text):  # Has name
            score += 5
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume_text):  # Has email
            score += 5
        
        return min(score, max_score)
    
    def _analyze_structure(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume structure"""
        
        sections_found = []
        missing_sections = []
        
        essential_sections = {
            'contact': ['contact', 'email', 'phone'],
            'summary': ['summary', 'objective', 'profile'],
            'experience': ['experience', 'work history', 'employment'],
            'education': ['education', 'degree', 'university'],
            'skills': ['skills', 'technologies', 'technical skills']
        }
        
        for section_name, keywords in essential_sections.items():
            if any(keyword in resume_text.lower() for keyword in keywords):
                sections_found.append(section_name)
            else:
                missing_sections.append(section_name)
        
        return {
            'sections_found': sections_found,
            'missing_sections': missing_sections,
            'structure_score': (len(sections_found) / len(essential_sections)) * 100,
            'has_clear_sections': len(sections_found) >= 4
        }
    
    def _analyze_keywords(
        self,
        resume_text: str,
        target_job: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Analyze keyword usage and relevance"""
        
        if not target_job:
            return {
                'keyword_score': 70,
                'matched_keywords': [],
                'missing_keywords': [],
                'keyword_density': 'N/A'
            }
        
        # Extract keywords from job description
        job_skills = target_job.get('required_skills', []) + target_job.get('preferred_skills', [])
        job_keywords = [skill.lower() for skill in job_skills]
        
        # Find matched keywords
        matched = [kw for kw in job_keywords if kw in resume_text.lower()]
        missing = [kw for kw in job_keywords if kw not in resume_text.lower()]
        
        keyword_score = (len(matched) / len(job_keywords) * 100) if job_keywords else 100
        
        return {
            'keyword_score': round(keyword_score, 1),
            'matched_keywords': matched,
            'missing_keywords': missing[:10],  # Top 10 missing
            'keyword_density': f"{len(matched)}/{len(job_keywords)}"
        }
    
    def _analyze_formatting(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume formatting"""
        
        issues = []
        score = 100
        
        # Check length
        word_count = len(resume_text.split())
        if word_count < 200:
            issues.append("Resume is too short (less than 200 words)")
            score -= 20
        elif word_count > 1000:
            issues.append("Resume might be too long (over 1000 words)")
            score -= 10
        
        # Check for contact information
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume_text):
            issues.append("Missing email address")
            score -= 15
        
        if not re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_text):
            issues.append("Missing phone number")
            score -= 10
        
        # Check for special characters that might confuse ATS
        special_chars = len(re.findall(r'[^\w\s@.-]', resume_text))
        if special_chars > 50:
            issues.append("Too many special characters that might confuse ATS")
            score -= 15
        
        return {
            'formatting_score': max(score, 0),
            'word_count': word_count,
            'issues': issues,
            'is_ats_friendly': len(issues) <= 2
        }
    
    def _analyze_content_quality(self, resume_text: str) -> Dict[str, Any]:
        """Analyze content quality"""
        
        # Count action verbs
        action_verbs = sum(
            1 for verb in self.ats_keywords['action_verbs']
            if verb in resume_text.lower()
        )
        
        # Count quantifiable achievements
        achievements = len(re.findall(r'\d+%|\$\d+|\d+ years?|\d+\+', resume_text))
        
        # Check for buzzwords (negative)
        buzzwords = ['team player', 'hard worker', 'detail-oriented', 'self-motivated']
        buzzword_count = sum(1 for word in buzzwords if word in resume_text.lower())
        
        quality_score = 50
        quality_score += min(action_verbs * 5, 30)  # Up to 30 points for action verbs
        quality_score += min(achievements * 3, 20)  # Up to 20 points for achievements
        quality_score -= buzzword_count * 5  # Penalty for buzzwords
        
        return {
            'quality_score': max(min(quality_score, 100), 0),
            'action_verb_count': action_verbs,
            'achievement_count': achievements,
            'buzzword_count': buzzword_count,
            'has_quantifiable_results': achievements > 3
        }
    
    def _calculate_overall_score(
        self,
        ats_score: float,
        structure_analysis: Dict,
        content_quality: Dict
    ) -> float:
        """Calculate overall resume score"""
        
        weights = {
            'ats': 0.40,
            'structure': 0.30,
            'quality': 0.30
        }
        
        overall = (
            ats_score * weights['ats'] +
            structure_analysis['structure_score'] * weights['structure'] +
            content_quality['quality_score'] * weights['quality']
        )
        
        return round(overall, 1)
    
    def _generate_recommendations(
        self,
        ats_score: float,
        structure_analysis: Dict,
        keyword_analysis: Dict,
        formatting_analysis: Dict,
        content_quality: Dict
    ) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # ATS recommendations
        if ats_score < 70:
            recommendations.append(
                "🎯 Improve ATS compatibility by adding more relevant keywords and standard section headers"
            )
        
        # Structure recommendations
        if structure_analysis['missing_sections']:
            missing = ', '.join(structure_analysis['missing_sections'][:3])
            recommendations.append(
                f"📋 Add missing sections: {missing}"
            )
        
        # Keyword recommendations
        if keyword_analysis.get('keyword_score', 100) < 70:
            if keyword_analysis.get('missing_keywords'):
                missing_kw = ', '.join(keyword_analysis['missing_keywords'][:5])
                recommendations.append(
                    f"🔑 Include these important keywords: {missing_kw}"
                )
        
        # Formatting recommendations
        if formatting_analysis['issues']:
            for issue in formatting_analysis['issues'][:3]:
                recommendations.append(f"✏️ {issue}")
        
        # Content quality recommendations
        if content_quality['action_verb_count'] < 5:
            recommendations.append(
                "💪 Use more action verbs (managed, developed, led, implemented, etc.)"
            )
        
        if content_quality['achievement_count'] < 3:
            recommendations.append(
                "📊 Add more quantifiable achievements (percentages, numbers, metrics)"
            )
        
        if content_quality['buzzword_count'] > 3:
            recommendations.append(
                "⚠️ Reduce generic buzzwords and focus on specific accomplishments"
            )
        
        return recommendations[:8]  # Return top 8 recommendations
    
    def _identify_strengths(
        self,
        structure_analysis: Dict,
        keyword_analysis: Dict,
        content_quality: Dict
    ) -> List[str]:
        """Identify resume strengths"""
        
        strengths = []
        
        if structure_analysis['structure_score'] >= 80:
            strengths.append("Well-structured with clear sections")
        
        if keyword_analysis.get('keyword_score', 0) >= 80:
            strengths.append("Strong keyword optimization")
        
        if content_quality['action_verb_count'] >= 8:
            strengths.append("Excellent use of action verbs")
        
        if content_quality['achievement_count'] >= 5:
            strengths.append("Rich in quantifiable achievements")
        
        if content_quality['buzzword_count'] <= 2:
            strengths.append("Focused on specific accomplishments")
        
        return strengths
    
    def _identify_weaknesses(
        self,
        structure_analysis: Dict,
        keyword_analysis: Dict,
        content_quality: Dict
    ) -> List[str]:
        """Identify resume weaknesses"""
        
        weaknesses = []
        
        if structure_analysis['structure_score'] < 60:
            weaknesses.append("Missing essential sections")
        
        if keyword_analysis.get('keyword_score', 100) < 60:
            weaknesses.append("Low keyword relevance for target job")
        
        if content_quality['action_verb_count'] < 5:
            weaknesses.append("Limited use of action verbs")
        
        if content_quality['achievement_count'] < 3:
            weaknesses.append("Few quantifiable achievements")
        
        if content_quality['buzzword_count'] > 5:
            weaknesses.append("Too many generic buzzwords")
        
        return weaknesses

