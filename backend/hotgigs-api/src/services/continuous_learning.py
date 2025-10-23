"""
Continuous Learning System for Resume Parser

This module implements continuous learning capabilities including:
1. Feedback loop for recruiter corrections
2. Vector database for similar resume retrieval
3. Few-shot learning with best examples
4. Training data preparation for fine-tuning

Author: HotGigs.ai
Date: October 22, 2025
Version: 1.0.0
"""

import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
from openai import OpenAI
import os

logger = logging.getLogger(__name__)


class ContinuousLearningSystem:
    """
    Continuous learning system that improves resume parsing over time
    through recruiter feedback and similar resume retrieval.
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """
        Initialize the continuous learning system.
        
        Args:
            openai_api_key: Optional OpenAI API key for embeddings
        """
        self.openai_api_key = openai_api_key or os.getenv('OPENAI_API_KEY')
        self.openai_client = None
        
        if self.openai_api_key:
            try:
                self.openai_client = OpenAI(api_key=self.openai_api_key)
                logger.info("OpenAI client initialized for embeddings")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {str(e)}")
        
        # In-memory storage (replace with actual database in production)
        self.training_data = []
        self.feedback_history = []
        self.embeddings_cache = {}
    
    def store_resume_data(
        self,
        resume_id: str,
        raw_text: str,
        parsed_data: Dict,
        recruiter_feedback: Optional[Dict] = None
    ) -> bool:
        """
        Store resume data for continuous learning.
        
        Args:
            resume_id: Unique resume identifier
            raw_text: Raw resume text
            parsed_data: Parsed resume data
            recruiter_feedback: Optional feedback from recruiter
            
        Returns:
            True if stored successfully
        """
        try:
            # Create embedding for similarity search
            embedding = None
            if self.openai_client:
                try:
                    response = self.openai_client.embeddings.create(
                        model="text-embedding-3-small",
                        input=raw_text[:8000]  # Limit to 8K chars
                    )
                    embedding = response.data[0].embedding
                    logger.info(f"Created embedding for resume {resume_id}")
                except Exception as e:
                    logger.error(f"Failed to create embedding: {str(e)}")
            
            # Store in cache
            self.embeddings_cache[resume_id] = {
                'id': resume_id,
                'raw_text': raw_text,
                'parsed_data': parsed_data,
                'feedback': recruiter_feedback,
                'embedding': embedding,
                'accuracy_score': self._calculate_accuracy(parsed_data, recruiter_feedback) if recruiter_feedback else None,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Store high-quality examples for fine-tuning
            if recruiter_feedback and recruiter_feedback.get('accuracy_score', 0) >= 0.9:
                self.training_data.append({
                    'resume_id': resume_id,
                    'input': raw_text,
                    'output': recruiter_feedback.get('corrected_data', parsed_data),
                    'accuracy': recruiter_feedback.get('accuracy_score'),
                    'timestamp': datetime.utcnow().isoformat()
                })
                logger.info(f"Added resume {resume_id} to training data (accuracy: {recruiter_feedback.get('accuracy_score')})")
            
            # TODO: Store in actual vector database (Pinecone, Weaviate, Chroma)
            # vector_db.upsert(resume_id, embedding, metadata)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store resume data: {str(e)}")
            return False
    
    def record_feedback(
        self,
        resume_id: str,
        original_data: Dict,
        corrected_data: Dict,
        recruiter_id: str,
        feedback_notes: Optional[str] = None
    ) -> Dict:
        """
        Record recruiter feedback for continuous improvement.
        
        Args:
            resume_id: Resume identifier
            original_data: Original parsed data
            corrected_data: Recruiter-corrected data
            recruiter_id: Recruiter who provided feedback
            feedback_notes: Optional notes from recruiter
            
        Returns:
            Feedback record with accuracy score
        """
        try:
            # Calculate accuracy
            accuracy_score = self._calculate_accuracy(original_data, corrected_data)
            
            # Create feedback record
            feedback = {
                'resume_id': resume_id,
                'recruiter_id': recruiter_id,
                'original_data': original_data,
                'corrected_data': corrected_data,
                'accuracy_score': accuracy_score,
                'feedback_notes': feedback_notes,
                'timestamp': datetime.utcnow().isoformat(),
                'field_corrections': self._analyze_corrections(original_data, corrected_data)
            }
            
            # Store feedback
            self.feedback_history.append(feedback)
            
            # Update embeddings cache with feedback
            if resume_id in self.embeddings_cache:
                self.embeddings_cache[resume_id]['feedback'] = feedback
                self.embeddings_cache[resume_id]['accuracy_score'] = accuracy_score
            
            logger.info(f"Recorded feedback for resume {resume_id} (accuracy: {accuracy_score:.2f})")
            
            # TODO: Store in actual database
            # db.feedback.insert(feedback)
            
            return feedback
            
        except Exception as e:
            logger.error(f"Failed to record feedback: {str(e)}")
            return {'error': str(e)}
    
    def get_similar_resumes(
        self,
        query_text: str,
        top_k: int = 5,
        min_accuracy: float = 0.8
    ) -> List[Dict]:
        """
        Get similar resumes for few-shot learning.
        
        Args:
            query_text: Resume text to find similar examples for
            top_k: Number of similar resumes to return
            min_accuracy: Minimum accuracy score for examples
            
        Returns:
            List of similar resume examples
        """
        if not self.openai_client:
            logger.warning("OpenAI client not initialized, cannot find similar resumes")
            return []
        
        try:
            # Create embedding for query
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=query_text[:8000]
            )
            query_embedding = response.data[0].embedding
            
            # Calculate cosine similarity with cached embeddings
            similarities = []
            for resume_id, data in self.embeddings_cache.items():
                if data['embedding'] is None:
                    continue
                
                # Filter by accuracy
                if data['accuracy_score'] is not None and data['accuracy_score'] < min_accuracy:
                    continue
                
                # Calculate cosine similarity
                similarity = self._cosine_similarity(query_embedding, data['embedding'])
                similarities.append((similarity, data))
            
            # Sort by similarity
            similarities.sort(reverse=True, key=lambda x: x[0])
            
            # Return top K
            similar_resumes = [
                {
                    'resume_id': data['id'],
                    'similarity_score': similarity,
                    'accuracy_score': data['accuracy_score'],
                    'parsed_data': data['parsed_data'],
                    'raw_text_preview': data['raw_text'][:500]
                }
                for similarity, data in similarities[:top_k]
            ]
            
            logger.info(f"Found {len(similar_resumes)} similar resumes")
            return similar_resumes
            
        except Exception as e:
            logger.error(f"Failed to find similar resumes: {str(e)}")
            return []
    
    def enhance_prompt_with_examples(
        self,
        base_prompt: str,
        query_text: str,
        num_examples: int = 3
    ) -> str:
        """
        Enhance prompt with few-shot examples from similar resumes.
        
        Args:
            base_prompt: Base prompt for LLM
            query_text: Resume text being parsed
            num_examples: Number of examples to include
            
        Returns:
            Enhanced prompt with examples
        """
        similar_resumes = self.get_similar_resumes(query_text, top_k=num_examples)
        
        if not similar_resumes:
            return base_prompt
        
        # Build examples section
        examples_text = "\n\nHere are similar resumes for reference:\n\n"
        
        for i, resume in enumerate(similar_resumes, 1):
            examples_text += f"Example {i} (similarity: {resume['similarity_score']:.2f}):\n"
            examples_text += f"Resume Preview: {resume['raw_text_preview']}...\n"
            examples_text += f"Parsed Data: {json.dumps(resume['parsed_data'], indent=2)}\n\n"
        
        enhanced_prompt = base_prompt + examples_text
        
        logger.info(f"Enhanced prompt with {len(similar_resumes)} examples")
        return enhanced_prompt
    
    def prepare_fine_tuning_data(self, min_examples: int = 100) -> Optional[List[Dict]]:
        """
        Prepare training data for OpenAI fine-tuning.
        
        Args:
            min_examples: Minimum number of examples required
            
        Returns:
            List of training examples in OpenAI format, or None if insufficient data
        """
        if len(self.training_data) < min_examples:
            logger.warning(f"Insufficient training data: {len(self.training_data)} < {min_examples}")
            return None
        
        # Format for OpenAI fine-tuning
        formatted_data = []
        
        for item in self.training_data:
            formatted_data.append({
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a resume parser that extracts structured information from resumes. Output only valid JSON."
                    },
                    {
                        "role": "user",
                        "content": f"Parse this resume:\n\n{item['input']}"
                    },
                    {
                        "role": "assistant",
                        "content": json.dumps(item['output'])
                    }
                ]
            })
        
        logger.info(f"Prepared {len(formatted_data)} examples for fine-tuning")
        return formatted_data
    
    def export_training_data(self, output_path: str) -> bool:
        """
        Export training data to JSONL file for fine-tuning.
        
        Args:
            output_path: Path to output JSONL file
            
        Returns:
            True if exported successfully
        """
        try:
            formatted_data = self.prepare_fine_tuning_data(min_examples=1)
            
            if not formatted_data:
                logger.error("No training data to export")
                return False
            
            with open(output_path, 'w') as f:
                for item in formatted_data:
                    f.write(json.dumps(item) + '\n')
            
            logger.info(f"Exported {len(formatted_data)} training examples to {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to export training data: {str(e)}")
            return False
    
    def get_learning_statistics(self) -> Dict:
        """
        Get statistics about the continuous learning system.
        
        Returns:
            Dictionary with statistics
        """
        total_resumes = len(self.embeddings_cache)
        total_feedback = len(self.feedback_history)
        total_training_data = len(self.training_data)
        
        # Calculate average accuracy
        accuracies = [
            data['accuracy_score']
            for data in self.embeddings_cache.values()
            if data['accuracy_score'] is not None
        ]
        avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
        
        # Field-level accuracy
        field_corrections = {}
        for feedback in self.feedback_history:
            for field, correction in feedback.get('field_corrections', {}).items():
                if field not in field_corrections:
                    field_corrections[field] = {'total': 0, 'correct': 0}
                field_corrections[field]['total'] += 1
                if correction['was_correct']:
                    field_corrections[field]['correct'] += 1
        
        field_accuracy = {
            field: stats['correct'] / stats['total'] if stats['total'] > 0 else 0
            for field, stats in field_corrections.items()
        }
        
        return {
            'total_resumes_stored': total_resumes,
            'total_feedback_received': total_feedback,
            'total_training_examples': total_training_data,
            'average_accuracy': round(avg_accuracy, 3),
            'ready_for_fine_tuning': total_training_data >= 100,
            'field_accuracy': field_accuracy,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _calculate_accuracy(self, original: Dict, corrected: Dict) -> float:
        """Calculate accuracy score between original and corrected data."""
        if not corrected:
            return 1.0  # No corrections means 100% accurate
        
        total_fields = 0
        correct_fields = 0
        
        # Compare personal info
        if 'personal_info' in original and 'personal_info' in corrected:
            for key in ['name', 'email', 'phone', 'location']:
                if key in corrected['personal_info']:
                    total_fields += 1
                    if original.get('personal_info', {}).get(key) == corrected['personal_info'][key]:
                        correct_fields += 1
        
        # Compare skills
        if 'skills' in original and 'skills' in corrected:
            original_skills = set(original.get('skills', []))
            corrected_skills = set(corrected.get('skills', []))
            if corrected_skills:
                total_fields += len(corrected_skills)
                correct_fields += len(original_skills & corrected_skills)
        
        # Compare experience count
        if 'experience' in original and 'experience' in corrected:
            total_fields += 1
            if len(original.get('experience', [])) == len(corrected.get('experience', [])):
                correct_fields += 1
        
        # Compare education count
        if 'education' in original and 'education' in corrected:
            total_fields += 1
            if len(original.get('education', [])) == len(corrected.get('education', [])):
                correct_fields += 1
        
        return correct_fields / total_fields if total_fields > 0 else 1.0
    
    def _analyze_corrections(self, original: Dict, corrected: Dict) -> Dict:
        """Analyze which fields were corrected."""
        corrections = {}
        
        # Check each field
        for field in ['personal_info', 'skills', 'experience', 'education']:
            if field in corrected:
                was_correct = original.get(field) == corrected[field]
                corrections[field] = {
                    'was_correct': was_correct,
                    'original': original.get(field),
                    'corrected': corrected[field]
                }
        
        return corrections
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        return dot_product / (magnitude1 * magnitude2)


# Convenience functions
def create_learning_system(openai_api_key: Optional[str] = None) -> ContinuousLearningSystem:
    """Create a continuous learning system instance."""
    return ContinuousLearningSystem(openai_api_key=openai_api_key)


def record_feedback(
    resume_id: str,
    original_data: Dict,
    corrected_data: Dict,
    recruiter_id: str,
    feedback_notes: Optional[str] = None,
    learning_system: Optional[ContinuousLearningSystem] = None
) -> Dict:
    """Record feedback for a resume parsing."""
    if learning_system is None:
        learning_system = create_learning_system()
    
    return learning_system.record_feedback(
        resume_id=resume_id,
        original_data=original_data,
        corrected_data=corrected_data,
        recruiter_id=recruiter_id,
        feedback_notes=feedback_notes
    )

