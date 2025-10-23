"""
Intelligent Skill Ranking and Classification System

This module provides advanced skill extraction, ranking, and classification
to identify the top 5 technology skills and top 5 domain skills from resumes.

Author: HotGigs.ai
Date: October 22, 2025
Version: 1.0.0
"""

import re
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SkillRanker:
    """
    Intelligent skill ranking system that identifies top technology and domain skills
    based on multiple factors: frequency, recency, context, and proficiency indicators.
    """
    
    # Comprehensive technology skills database
    TECHNOLOGY_SKILLS = {
        # Programming Languages
        'java', 'python', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
        'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
        
        # Frontend Frameworks/Libraries
        'react', 'react.js', 'angular', 'vue', 'vue.js', 'next.js', 'nuxt',
        'svelte', 'ember', 'backbone', 'jquery', 'bootstrap', 'tailwind',
        'material-ui', 'mui', 'ant design', 'chakra ui',
        
        # Backend Frameworks
        'spring', 'spring boot', 'django', 'flask', 'fastapi', 'express',
        'express.js', 'node.js', 'nest.js', 'laravel', 'rails', 'asp.net',
        '.net core', 'hibernate', 'jpa',
        
        # Databases
        'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
        'dynamodb', 'oracle', 'sql server', 'mariadb', 'sqlite', 'neo4j',
        'couchdb', 'influxdb', 'timescaledb',
        
        # Cloud Platforms
        'aws', 'azure', 'gcp', 'google cloud', 'amazon web services',
        'microsoft azure', 'cloud', 'serverless', 'lambda', 'ec2', 's3',
        'cloudfront', 'route53', 'rds', 'ecs', 'eks', 'fargate',
        
        # DevOps & Tools
        'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions',
        'circleci', 'travis ci', 'terraform', 'ansible', 'puppet', 'chef',
        'helm', 'argocd', 'prometheus', 'grafana', 'datadog', 'new relic',
        'splunk', 'elk', 'logstash', 'kibana',
        
        # Version Control
        'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
        
        # Testing
        'junit', 'pytest', 'jest', 'mocha', 'chai', 'selenium', 'cypress',
        'testng', 'cucumber', 'postman', 'jmeter', 'loadrunner',
        
        # Build Tools
        'maven', 'gradle', 'npm', 'yarn', 'webpack', 'vite', 'rollup',
        'parcel', 'gulp', 'grunt',
        
        # Message Queues
        'kafka', 'rabbitmq', 'activemq', 'redis pub/sub', 'aws sqs', 'sns',
        
        # API Technologies
        'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket',
        
        # Mobile Development
        'react native', 'flutter', 'ios', 'android', 'xamarin', 'ionic',
        
        # Data Science/ML
        'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'pandas', 'numpy',
        'matplotlib', 'seaborn', 'jupyter', 'spark', 'hadoop', 'airflow',
        
        # Other Technologies
        'linux', 'unix', 'bash', 'shell scripting', 'powershell', 'nginx',
        'apache', 'tomcat', 'jboss', 'websphere', 'oauth', 'jwt', 'saml',
        'ldap', 'active directory', 'ssl', 'tls', 'https'
    }
    
    # Domain/Business skills database
    DOMAIN_SKILLS = {
        # Methodologies
        'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd',
        'continuous integration', 'continuous deployment', 'tdd', 'bdd',
        'test-driven development', 'behavior-driven development',
        
        # Architecture
        'microservices', 'monolithic', 'soa', 'service-oriented architecture',
        'event-driven', 'domain-driven design', 'ddd', 'cqrs', 'event sourcing',
        'clean architecture', 'hexagonal architecture', 'mvc', 'mvvm',
        
        # Leadership & Management
        'leadership', 'team lead', 'technical lead', 'architect', 'principal',
        'staff engineer', 'engineering manager', 'project management', 'product management',
        'stakeholder management', 'vendor management', 'mentoring', 'coaching',
        
        # Business Domains
        'finance', 'fintech', 'banking', 'insurance', 'healthcare', 'healthtech',
        'e-commerce', 'retail', 'logistics', 'supply chain', 'manufacturing',
        'telecommunications', 'media', 'entertainment', 'gaming', 'education',
        'edtech', 'real estate', 'proptech', 'automotive', 'aerospace',
        'energy', 'utilities', 'government', 'public sector', 'non-profit',
        
        # Specialized Areas
        'machine learning', 'artificial intelligence', 'deep learning', 'nlp',
        'natural language processing', 'computer vision', 'data science',
        'data engineering', 'data analytics', 'business intelligence', 'bi',
        'big data', 'etl', 'data warehousing', 'data modeling',
        
        # Security & Compliance
        'security', 'cybersecurity', 'information security', 'application security',
        'network security', 'cloud security', 'devsecops', 'penetration testing',
        'vulnerability assessment', 'compliance', 'gdpr', 'hipaa', 'pci-dss',
        'sox', 'iso 27001', 'nist', 'owasp',
        
        # Soft Skills
        'communication', 'problem-solving', 'analytical thinking', 'critical thinking',
        'collaboration', 'teamwork', 'adaptability', 'time management',
        'decision making', 'conflict resolution', 'negotiation', 'presentation',
        
        # Business Skills
        'requirements gathering', 'requirements analysis', 'business analysis',
        'process improvement', 'process optimization', 'cost optimization',
        'roi analysis', 'risk management', 'change management', 'quality assurance',
        'quality management', 'performance optimization', 'scalability',
        'high availability', 'disaster recovery', 'business continuity',
        
        # Certifications (Domain Knowledge)
        'pmp', 'csm', 'psm', 'safe', 'itil', 'togaf', 'prince2', 'six sigma',
        'lean', 'certified scrum master', 'certified product owner'
    }
    
    # Proficiency indicators
    PROFICIENCY_INDICATORS = {
        'expert', 'advanced', 'senior', 'lead', 'principal', 'staff',
        'architect', 'master', 'specialist', 'proficient', 'experienced',
        'extensive', 'deep', 'strong', 'solid', 'proven', 'demonstrated'
    }
    
    # Context boost keywords
    CONTEXT_KEYWORDS = {
        'title': ['lead', 'senior', 'principal', 'architect', 'engineer', 'developer', 'manager'],
        'achievement': ['achieved', 'delivered', 'implemented', 'designed', 'built', 'created', 'developed'],
        'responsibility': ['responsible', 'led', 'managed', 'oversaw', 'coordinated', 'directed']
    }
    
    def __init__(self):
        """Initialize the skill ranker"""
        self.logger = logging.getLogger(__name__)
    
    def rank_and_classify_skills(
        self,
        resume_text: str,
        all_skills: List[str],
        experience_data: List[Dict],
        top_n: int = 5
    ) -> Dict:
        """
        Rank all skills and return top N technology and domain skills.
        
        Args:
            resume_text: Full resume text
            all_skills: List of all extracted skills
            experience_data: List of work experience entries
            top_n: Number of top skills to return for each category
            
        Returns:
            Dictionary with top technology and domain skills
        """
        try:
            self.logger.info(f"Ranking {len(all_skills)} skills")
            
            # Rank all skills
            ranked_skills = self._rank_skills(resume_text, all_skills, experience_data)
            
            # Classify into technology and domain
            tech_skills = []
            domain_skills = []
            
            for skill, score in ranked_skills:
                skill_type = self._classify_skill(skill)
                if skill_type == 'technology':
                    tech_skills.append((skill, score))
                else:
                    domain_skills.append((skill, score))
            
            # Get top N from each category
            top_tech = tech_skills[:top_n]
            top_domain = domain_skills[:top_n]
            
            result = {
                'top_technology_skills': [skill for skill, _ in top_tech],
                'top_domain_skills': [skill for skill, _ in top_domain],
                'technology_skills_with_scores': [
                    {'skill': skill, 'score': round(score, 2)} 
                    for skill, score in top_tech
                ],
                'domain_skills_with_scores': [
                    {'skill': skill, 'score': round(score, 2)} 
                    for skill, score in top_domain
                ],
                'total_technology_skills': len(tech_skills),
                'total_domain_skills': len(domain_skills),
                'ranking_metadata': {
                    'total_skills_analyzed': len(all_skills),
                    'ranking_algorithm_version': '1.0.0',
                    'timestamp': datetime.utcnow().isoformat()
                }
            }
            
            self.logger.info(f"Ranked skills: {len(top_tech)} tech, {len(top_domain)} domain")
            return result
            
        except Exception as e:
            self.logger.error(f"Error ranking skills: {str(e)}")
            return {
                'top_technology_skills': all_skills[:top_n],
                'top_domain_skills': [],
                'error': str(e)
            }
    
    def _rank_skills(
        self,
        resume_text: str,
        all_skills: List[str],
        experience_data: List[Dict]
    ) -> List[Tuple[str, float]]:
        """
        Rank skills based on multiple factors.
        
        Scoring Algorithm:
        - Frequency: 25% (how often skill appears)
        - Recency: 30% (appears in recent jobs)
        - Context: 25% (appears in important sections)
        - Proficiency: 20% (proficiency indicators present)
        
        Returns:
            List of (skill, score) tuples sorted by score
        """
        skill_scores = {}
        text_lower = resume_text.lower()
        
        for skill in all_skills:
            skill_lower = skill.lower()
            score = 0.0
            
            # 1. Frequency Analysis (25 points max)
            frequency = text_lower.count(skill_lower)
            frequency_score = min(frequency * 5, 25)
            score += frequency_score
            
            # 2. Recency Analysis (30 points max)
            recency_score = self._calculate_recency_score(skill, experience_data)
            score += recency_score * 30
            
            # 3. Context Analysis (25 points max)
            context_score = self._calculate_context_score(skill, resume_text)
            score += context_score * 25
            
            # 4. Proficiency Indicators (20 points max)
            proficiency_score = self._calculate_proficiency_score(skill, resume_text)
            score += proficiency_score * 20
            
            skill_scores[skill] = score
        
        # Sort by score (descending)
        ranked_skills = sorted(skill_scores.items(), key=lambda x: x[1], reverse=True)
        
        return ranked_skills
    
    def _calculate_recency_score(self, skill: str, experience_data: List[Dict]) -> float:
        """
        Calculate score based on skill recency in work experience.
        
        Returns:
            Float between 0.0 and 1.0
        """
        if not experience_data:
            return 0.5  # Neutral score if no experience data
        
        skill_lower = skill.lower()
        
        # Check recent jobs (top 3)
        for i, exp in enumerate(experience_data[:3]):
            # Combine title, company, and description
            exp_text = ' '.join([
                exp.get('title', ''),
                exp.get('company', ''),
                exp.get('description', ''),
                ' '.join(exp.get('responsibilities', []))
            ]).lower()
            
            if skill_lower in exp_text:
                # More recent = higher score
                # Job 1: 1.0, Job 2: 0.8, Job 3: 0.6
                return 1.0 - (i * 0.2)
        
        # Check older jobs
        for exp in experience_data[3:]:
            exp_text = ' '.join([
                exp.get('title', ''),
                exp.get('description', ''),
                ' '.join(exp.get('responsibilities', []))
            ]).lower()
            
            if skill_lower in exp_text:
                return 0.3  # Lower score for older experience
        
        return 0.1  # Skill not found in experience
    
    def _calculate_context_score(self, skill: str, resume_text: str) -> float:
        """
        Calculate score based on where skill appears in resume.
        
        Higher scores for:
        - Job titles (0.4)
        - Achievements/responsibilities (0.3)
        - Skills section (0.2)
        - Summary (0.1)
        
        Returns:
            Float between 0.0 and 1.0
        """
        score = 0.0
        skill_lower = skill.lower()
        
        # Split resume into sections
        sections = self._extract_sections(resume_text)
        
        # Check job titles
        if skill_lower in sections.get('titles', '').lower():
            score += 0.4
        
        # Check achievements/responsibilities
        if skill_lower in sections.get('achievements', '').lower():
            score += 0.3
        
        # Check skills section
        if skill_lower in sections.get('skills', '').lower():
            score += 0.2
        
        # Check summary/profile
        if skill_lower in sections.get('summary', '').lower():
            score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_proficiency_score(self, skill: str, resume_text: str) -> float:
        """
        Calculate score based on proficiency indicators near skill mentions.
        
        Returns:
            Float between 0.0 and 1.0
        """
        skill_lower = skill.lower()
        
        # Find sentences containing the skill
        sentences = re.split(r'[.!?]', resume_text)
        skill_sentences = [s for s in sentences if skill_lower in s.lower()]
        
        if not skill_sentences:
            return 0.5  # Neutral score
        
        # Check for proficiency indicators
        max_score = 0.0
        for sentence in skill_sentences:
            sentence_lower = sentence.lower()
            
            # Check for strong proficiency indicators
            for indicator in self.PROFICIENCY_INDICATORS:
                if indicator in sentence_lower:
                    # Check proximity to skill
                    skill_pos = sentence_lower.find(skill_lower)
                    indicator_pos = sentence_lower.find(indicator)
                    distance = abs(skill_pos - indicator_pos)
                    
                    # Closer = higher score
                    if distance < 20:
                        max_score = max(max_score, 1.0)
                    elif distance < 50:
                        max_score = max(max_score, 0.8)
                    else:
                        max_score = max(max_score, 0.6)
        
        return max_score if max_score > 0 else 0.5
    
    def _extract_sections(self, resume_text: str) -> Dict[str, str]:
        """
        Extract different sections from resume.
        
        Returns:
            Dictionary with section names as keys and text as values
        """
        sections = {
            'titles': '',
            'achievements': '',
            'skills': '',
            'summary': ''
        }
        
        lines = resume_text.split('\n')
        current_section = None
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Detect section headers
            if any(keyword in line_lower for keyword in ['experience', 'employment', 'work history']):
                current_section = 'titles'
            elif any(keyword in line_lower for keyword in ['skills', 'technical', 'expertise', 'technologies']):
                current_section = 'skills'
            elif any(keyword in line_lower for keyword in ['summary', 'profile', 'objective', 'about']):
                current_section = 'summary'
            elif any(keyword in line_lower for keyword in ['achievement', 'accomplishment', 'responsibility', 'duties']):
                current_section = 'achievements'
            elif current_section:
                sections[current_section] += line + ' '
        
        return sections
    
    def _classify_skill(self, skill: str) -> str:
        """
        Classify skill as 'technology' or 'domain'.
        
        Args:
            skill: Skill name
            
        Returns:
            'technology' or 'domain'
        """
        skill_lower = skill.lower().strip()
        
        # Check against technology skills database
        if skill_lower in self.TECHNOLOGY_SKILLS:
            return 'technology'
        
        # Check against domain skills database
        if skill_lower in self.DOMAIN_SKILLS:
            return 'domain'
        
        # Heuristic classification for unknown skills
        
        # Contains version numbers or file extensions -> technology
        if re.search(r'\d+\.\d+|\.\w{2,4}$', skill_lower):
            return 'technology'
        
        # Contains programming-related keywords -> technology
        tech_patterns = ['js', 'py', 'api', 'db', 'sql', 'framework', 'library', 'tool']
        if any(pattern in skill_lower for pattern in tech_patterns):
            return 'technology'
        
        # Multi-word skills (3+ words) often domain
        if len(skill.split()) >= 3:
            return 'domain'
        
        # Contains business/management keywords -> domain
        domain_patterns = ['management', 'leadership', 'strategy', 'business', 'process']
        if any(pattern in skill_lower for pattern in domain_patterns):
            return 'domain'
        
        # Default to technology (most technical skills are shorter)
        return 'technology'


# Convenience function
def rank_and_classify_skills(
    resume_text: str,
    all_skills: List[str],
    experience_data: List[Dict],
    top_n: int = 5
) -> Dict:
    """
    Convenience function to rank and classify skills.
    
    Args:
        resume_text: Full resume text
        all_skills: List of all extracted skills
        experience_data: List of work experience entries
        top_n: Number of top skills to return for each category
        
    Returns:
        Dictionary with top technology and domain skills
    """
    ranker = SkillRanker()
    return ranker.rank_and_classify_skills(resume_text, all_skills, experience_data, top_n)

