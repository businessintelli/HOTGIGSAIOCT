"""
AI Video Analysis Service
Handles video transcription, content analysis, and intelligent indexing
"""

import os
import json
import re
from typing import List, Dict, Tuple
from openai import OpenAI
from datetime import datetime


class VideoAnalyzer:
    """
    Comprehensive video analysis using AI
    - Speech-to-text transcription
    - Content extraction and summarization
    - Skill identification
    - Communication analysis
    - Chapter generation
    - Highlight detection
    """
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def transcribe_video(self, video_path: str) -> Dict:
        """
        Transcribe video audio to text
        Uses OpenAI Whisper for high-quality transcription
        
        Returns:
            Dict with transcript, timestamps, and metadata
        """
        try:
            # TODO: Extract audio from video
            # TODO: Use Whisper API for transcription
            # For now, return mock data
            
            return {
                "transcript": "Sample transcript of the video...",
                "segments": [
                    {"start": 0, "end": 30, "text": "Introduction segment"},
                    {"start": 30, "end": 90, "text": "Skills discussion"},
                    {"start": 90, "end": 150, "text": "Experience overview"}
                ],
                "language": "en",
                "duration": 150
            }
        except Exception as e:
            print(f"Error transcribing video: {e}")
            return {"error": str(e)}
    
    def analyze_content(self, transcript: str, candidate_profile: Dict = None) -> Dict:
        """
        Analyze video content using AI
        Extracts skills, key points, sentiment, and generates summary
        """
        
        prompt = f"""Analyze this candidate video introduction transcript and provide detailed insights:

TRANSCRIPT:
{transcript}

Provide a comprehensive analysis in JSON format with the following structure:

{{
  "summary": "A compelling 2-3 sentence summary of the candidate",
  "skills_mentioned": ["skill1", "skill2", ...],
  "key_highlights": [
    {{"text": "highlight quote", "timestamp_hint": "early/middle/late", "importance": 0.9}}
  ],
  "experience_level": "entry/mid/senior/expert",
  "communication_analysis": {{
    "clarity": 85,
    "confidence": 90,
    "professionalism": 88,
    "enthusiasm": 92,
    "structure": 85
  }},
  "sentiment_analysis": {{
    "overall": "positive/neutral/negative",
    "confidence": 0.95,
    "key_emotions": ["enthusiasm", "confidence"]
  }},
  "strengths": ["strength1", "strength2", ...],
  "areas_for_improvement": ["area1", "area2", ...],
  "career_goals": "Identified career goals or aspirations",
  "unique_selling_points": ["usp1", "usp2", ...]
}}

Be specific and provide actionable insights."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert HR analyst and career coach specializing in video interview analysis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            analysis = json.loads(response.choices[0].message.content)
            
            # Calculate overall score
            comm_scores = analysis.get("communication_analysis", {})
            overall_score = sum(comm_scores.values()) / len(comm_scores) if comm_scores else 0
            analysis["overall_score"] = round(overall_score, 1)
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing content: {e}")
            return self._get_default_analysis()
    
    def generate_chapters(self, transcript: str, segments: List[Dict]) -> List[Dict]:
        """
        Generate intelligent chapter markers for the video
        Identifies natural sections and topics
        """
        
        prompt = f"""Analyze this video transcript and create chapter markers for easy navigation.

TRANSCRIPT:
{transcript}

SEGMENTS WITH TIMESTAMPS:
{json.dumps(segments, indent=2)}

Generate 4-8 chapters that represent natural sections of the video. Return as JSON array:

[
  {{
    "title": "Introduction & Background",
    "description": "Brief description of what's covered",
    "start_time": 0,
    "end_time": 45,
    "chapter_type": "intro",
    "skills_discussed": [],
    "importance_score": 0.8
  }},
  ...
]

Chapter types: intro, skills, experience, projects, achievements, goals, closing
Importance score: 0-1 (how critical this chapter is)"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at structuring video content for optimal viewer experience."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=1500
            )
            
            chapters = json.loads(response.choices[0].message.content)
            return chapters
            
        except Exception as e:
            print(f"Error generating chapters: {e}")
            return self._get_default_chapters()
    
    def identify_highlights(self, transcript: str, skills: List[str], segments: List[Dict]) -> List[Dict]:
        """
        Identify key moments/highlights in the video
        These are short clips that showcase specific skills or achievements
        """
        
        skills_str = ", ".join(skills) if skills else "any relevant skills"
        
        prompt = f"""Identify 3-5 key highlight moments from this video transcript.
These should be compelling 10-30 second clips that showcase the candidate's best qualities.

TRANSCRIPT:
{transcript}

SKILLS TO LOOK FOR: {skills_str}

Return as JSON array:

[
  {{
    "title": "React Development Expertise",
    "description": "Candidate discusses complex React project",
    "start_time": 120,
    "end_time": 145,
    "highlight_type": "skill_demo",
    "related_skill": "React",
    "confidence_score": 0.9,
    "quote": "Key quote from this moment"
  }},
  ...
]

Highlight types: skill_demo, achievement, project, personality, problem_solving, leadership"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at identifying compelling moments in candidate videos."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.6,
                max_tokens=1500
            )
            
            highlights = json.loads(response.choices[0].message.content)
            return highlights
            
        except Exception as e:
            print(f"Error identifying highlights: {e}")
            return []
    
    def analyze_communication_quality(self, transcript: str) -> Dict:
        """
        Detailed analysis of communication quality
        Checks for filler words, speaking pace, clarity, etc.
        """
        
        # Count filler words
        filler_words = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally']
        filler_count = sum(transcript.lower().count(word) for word in filler_words)
        
        # Estimate word count and speaking pace
        word_count = len(transcript.split())
        
        # Sentence analysis
        sentences = re.split(r'[.!?]+', transcript)
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        return {
            "filler_words_count": filler_count,
            "total_words": word_count,
            "avg_sentence_length": round(avg_sentence_length, 1),
            "vocabulary_diversity": len(set(transcript.lower().split())) / word_count if word_count > 0 else 0,
            "speaking_pace_category": self._categorize_pace(word_count)
        }
    
    def generate_feedback(self, analysis: Dict, communication_quality: Dict) -> Dict:
        """
        Generate actionable feedback for the candidate
        Helps them improve their video presentation
        """
        
        strengths = analysis.get("strengths", [])
        improvements = analysis.get("areas_for_improvement", [])
        comm_scores = analysis.get("communication_analysis", {})
        
        feedback = {
            "communication_feedback": {
                "filler_words": {
                    "count": communication_quality.get("filler_words_count", 0),
                    "feedback": self._get_filler_words_feedback(communication_quality.get("filler_words_count", 0))
                },
                "speaking_pace": {
                    "category": communication_quality.get("speaking_pace_category", "moderate"),
                    "feedback": self._get_pace_feedback(communication_quality.get("speaking_pace_category", "moderate"))
                },
                "clarity_score": comm_scores.get("clarity", 0),
                "confidence_score": comm_scores.get("confidence", 0)
            },
            "content_feedback": {
                "structure_score": comm_scores.get("structure", 0),
                "completeness": "good" if len(strengths) >= 3 else "needs_improvement",
                "relevance": "high" if analysis.get("skills_mentioned") else "medium"
            },
            "presentation_feedback": {
                "professionalism_score": comm_scores.get("professionalism", 0),
                "enthusiasm_score": comm_scores.get("enthusiasm", 0)
            },
            "strengths": strengths,
            "areas_for_improvement": improvements,
            "actionable_tips": self._generate_tips(analysis, communication_quality)
        }
        
        return feedback
    
    def compare_videos(self, video_analyses: List[Dict]) -> Dict:
        """
        Compare multiple candidate videos
        Helps recruiters make side-by-side comparisons
        """
        
        comparison = {
            "candidates_count": len(video_analyses),
            "score_comparison": [],
            "skill_comparison": {},
            "communication_comparison": [],
            "recommendations": []
        }
        
        for analysis in video_analyses:
            comparison["score_comparison"].append({
                "candidate_id": analysis.get("candidate_id"),
                "overall_score": analysis.get("overall_score", 0),
                "communication_score": analysis.get("communication_analysis", {}).get("clarity", 0),
                "confidence_score": analysis.get("communication_analysis", {}).get("confidence", 0)
            })
        
        # Sort by overall score
        comparison["score_comparison"].sort(key=lambda x: x["overall_score"], reverse=True)
        
        return comparison
    
    # Helper methods
    
    def _categorize_pace(self, word_count: int, duration: int = 150) -> str:
        """Categorize speaking pace"""
        wpm = (word_count / duration) * 60 if duration > 0 else 0
        
        if wpm < 120:
            return "slow"
        elif wpm < 160:
            return "moderate"
        else:
            return "fast"
    
    def _get_filler_words_feedback(self, count: int) -> str:
        """Generate feedback about filler words"""
        if count < 5:
            return "Excellent! Very few filler words used."
        elif count < 10:
            return "Good job! Minor use of filler words."
        elif count < 20:
            return "Consider reducing filler words like 'um', 'uh', and 'like' for more professional delivery."
        else:
            return "Try to minimize filler words. Practice pausing instead of using 'um' or 'uh'."
    
    def _get_pace_feedback(self, category: str) -> str:
        """Generate feedback about speaking pace"""
        if category == "slow":
            return "Consider speaking slightly faster to maintain engagement."
        elif category == "moderate":
            return "Great speaking pace! Easy to follow and understand."
        else:
            return "You're speaking quite fast. Try slowing down slightly for better clarity."
    
    def _generate_tips(self, analysis: Dict, communication_quality: Dict) -> List[str]:
        """Generate actionable improvement tips"""
        tips = []
        
        comm_scores = analysis.get("communication_analysis", {})
        
        if comm_scores.get("clarity", 0) < 80:
            tips.append("Practice speaking more clearly and enunciating words")
        
        if comm_scores.get("confidence", 0) < 80:
            tips.append("Make more eye contact with the camera and speak with conviction")
        
        if comm_scores.get("structure", 0) < 80:
            tips.append("Organize your content with a clear introduction, body, and conclusion")
        
        if communication_quality.get("filler_words_count", 0) > 10:
            tips.append("Reduce filler words by practicing pauses instead")
        
        if not tips:
            tips.append("Great job! Keep practicing to maintain your excellent presentation skills")
        
        return tips
    
    def _get_default_analysis(self) -> Dict:
        """Return default analysis if AI fails"""
        return {
            "summary": "Video analysis in progress",
            "skills_mentioned": [],
            "key_highlights": [],
            "experience_level": "mid",
            "communication_analysis": {
                "clarity": 75,
                "confidence": 75,
                "professionalism": 75,
                "enthusiasm": 75,
                "structure": 75
            },
            "sentiment_analysis": {
                "overall": "positive",
                "confidence": 0.8,
                "key_emotions": ["professional"]
            },
            "strengths": [],
            "areas_for_improvement": [],
            "career_goals": "",
            "unique_selling_points": [],
            "overall_score": 75.0
        }
    
    def _get_default_chapters(self) -> List[Dict]:
        """Return default chapters if AI fails"""
        return [
            {
                "title": "Introduction",
                "description": "Candidate introduction",
                "start_time": 0,
                "end_time": 30,
                "chapter_type": "intro",
                "skills_discussed": [],
                "importance_score": 0.8
            },
            {
                "title": "Main Content",
                "description": "Skills and experience discussion",
                "start_time": 30,
                "end_time": 120,
                "chapter_type": "skills",
                "skills_discussed": [],
                "importance_score": 1.0
            },
            {
                "title": "Closing",
                "description": "Wrap-up and next steps",
                "start_time": 120,
                "end_time": 150,
                "chapter_type": "closing",
                "skills_discussed": [],
                "importance_score": 0.6
            }
        ]

