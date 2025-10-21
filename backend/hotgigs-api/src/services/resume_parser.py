"""
AI-Powered Resume Parser Service

This module provides comprehensive resume parsing using:
1. Text extraction from PDF/DOCX files
2. OCR for scanned documents
3. spaCy-based Named Entity Recognition (NER)
4. OpenAI GPT-4 for enhanced extraction and structuring

This is the common module used by all import scenarios:
- Single candidate upload
- Bulk recruiter upload
- Google Drive sync
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import fitz  # PyMuPDF
import pdfplumber
from docx import Document
import spacy
from openai import OpenAI
import pytesseract
from PIL import Image
import io
import phonenumbers
from email_validator import validate_email, EmailNotValidError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResumeParser:
    """
    Advanced AI-powered resume parser.
    
    Follows best practices from ML/AI resume parsing:
    - Layout-aware text extraction
    - Named Entity Recognition (NER) with spaCy
    - LLM enhancement with GPT-4
    - Structured JSON output
    """
    
    def __init__(self):
        """Initialize the resume parser with NLP models."""
        try:
            # Load spaCy model for NER
            # Download with: python -m spacy download en_core_web_lg
            self.nlp = spacy.load("en_core_web_lg")
            logger.info("Loaded spaCy model: en_core_web_lg")
        except OSError:
            logger.warning("spaCy model not found. Using small model.")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Initialize OpenAI client
        self.openai_client = OpenAI()
        
        # Skill taxonomy (expandable)
        self.skill_categories = {
            "programming": ["python", "java", "javascript", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin"],
            "frontend": ["react", "vue", "angular", "html", "css", "typescript", "next.js", "svelte"],
            "backend": ["node.js", "django", "flask", "spring", "express", "fastapi", ".net", "rails"],
            "database": ["postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "cassandra"],
            "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible"],
            "data": ["pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "spark", "hadoop"],
            "tools": ["git", "jira", "jenkins", "gitlab", "github actions", "circleci"],
        }
    
    def parse(self, file_path: str) -> Dict:
        """
        Main parsing function - used by all import types.
        
        Args:
            file_path: Path to the resume file
            
        Returns:
            Dictionary with structured resume data
        """
        logger.info(f"Starting to parse resume: {file_path}")
        
        try:
            # Step 1: Extract text
            text, is_scanned = self._extract_text(file_path)
            
            if not text or len(text.strip()) < 50:
                raise ValueError("Insufficient text extracted from resume")
            
            # Step 2: Run NER with spaCy
            entities = self._extract_entities_with_spacy(text)
            
            # Step 3: Enhance with LLM
            structured_data = self._enhance_with_llm(text, entities)
            
            # Step 4: Post-process and validate
            final_data = self._post_process(structured_data, text)
            
            logger.info(f"Successfully parsed resume: {file_path}")
            return final_data
            
        except Exception as e:
            logger.error(f"Error parsing resume {file_path}: {str(e)}")
            raise
    
    def _extract_text(self, file_path: str) -> Tuple[str, bool]:
        """
        Extract text from PDF or DOCX file.
        
        Returns:
            Tuple of (extracted_text, is_scanned)
        """
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._extract_from_pdf(file_path)
        elif file_ext in ['.docx', '.doc']:
            return self._extract_from_docx(file_path), False
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
    
    def _extract_from_pdf(self, file_path: str) -> Tuple[str, bool]:
        """
        Extract text from PDF with OCR fallback for scanned documents.
        """
        text = ""
        is_scanned = False
        
        try:
            # Try PyMuPDF first (faster)
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
            
            # If very little text extracted, it might be scanned
            if len(text.strip()) < 100:
                logger.info("PDF appears to be scanned. Running OCR...")
                text = self._extract_with_ocr(file_path)
                is_scanned = True
            
        except Exception as e:
            logger.warning(f"PyMuPDF failed: {e}. Trying pdfplumber...")
            
            # Fallback to pdfplumber
            try:
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                
                if len(text.strip()) < 100:
                    text = self._extract_with_ocr(file_path)
                    is_scanned = True
                    
            except Exception as e2:
                logger.error(f"pdfplumber also failed: {e2}")
                raise
        
        return text, is_scanned
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            logger.error(f"Error extracting from DOCX: {e}")
            raise
    
    def _extract_with_ocr(self, file_path: str) -> str:
        """
        Extract text using OCR (Tesseract).
        """
        try:
            # Convert PDF pages to images and run OCR
            doc = fitz.open(file_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes()))
                
                # Run OCR
                page_text = pytesseract.image_to_string(img)
                text += page_text + "\n"
            
            doc.close()
            return text
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise
    
    def _extract_entities_with_spacy(self, text: str) -> Dict:
        """
        Extract named entities using spaCy NER.
        """
        doc = self.nlp(text)
        
        entities = {
            "persons": [],
            "organizations": [],
            "locations": [],
            "dates": [],
            "emails": [],
            "phones": [],
            "urls": []
        }
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                entities["persons"].append(ent.text)
            elif ent.label_ == "ORG":
                entities["organizations"].append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                entities["locations"].append(ent.text)
            elif ent.label_ == "DATE":
                entities["dates"].append(ent.text)
        
        # Extract emails with regex
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        entities["emails"] = list(set(re.findall(email_pattern, text)))
        
        # Extract phone numbers
        entities["phones"] = self._extract_phone_numbers(text)
        
        # Extract URLs
        url_pattern = r'https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)'
        entities["urls"] = list(set(re.findall(url_pattern, text)))
        
        return entities
    
    def _extract_phone_numbers(self, text: str) -> List[str]:
        """Extract and validate phone numbers."""
        phones = []
        
        # Common phone patterns
        patterns = [
            r'\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US
            r'\+?([0-9]{1,3})\s*\(?([0-9]{2,4})\)?[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{4})',  # International
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                phone = ''.join(match)
                try:
                    parsed = phonenumbers.parse(phone, "US")
                    if phonenumbers.is_valid_number(parsed):
                        phones.append(phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL))
                except:
                    pass
        
        return list(set(phones))
    
    def _enhance_with_llm(self, text: str, entities: Dict) -> Dict:
        """
        Use OpenAI GPT-4 to extract structured information and enhance parsing.
        """
        prompt = f"""
You are an expert resume parser. Extract the following information from the resume text and return it as a valid JSON object.

Resume Text:
{text[:4000]}  # Limit to 4000 chars to fit in context

Entities already extracted:
{json.dumps(entities, indent=2)}

Please extract and structure the following information:

1. Personal Information:
   - full_name
   - email
   - phone
   - location (city, state/country)
   - linkedin_url
   - github_url
   - portfolio_url

2. Professional Summary (2-3 sentences)

3. Work Experience (array of objects with):
   - title
   - company
   - location
   - start_date (YYYY-MM format)
   - end_date (YYYY-MM format or "Present")
   - current (boolean)
   - description
   - achievements (array of strings)

4. Education (array of objects with):
   - degree
   - institution
   - location
   - graduation_date (YYYY-MM format)
   - gpa (if mentioned)

5. Skills (array of objects with):
   - name
   - category (programming, frontend, backend, database, cloud, data, tools, other)
   - proficiency (beginner, intermediate, advanced, expert) - infer from context

6. Top 5 Skills (array of strings) - the most important/prominent skills

7. Certifications (array of objects with):
   - name
   - issuer
   - issue_date (YYYY-MM format)
   - expiry_date (YYYY-MM format, if applicable)
   - credential_id (if mentioned)

8. Languages (array of strings like "English (Native)", "Spanish (Fluent)")

9. total_experience_years (float, calculated from work experience)

10. ai_summary (2-3 sentence summary of the candidate's profile)

11. key_strengths (array of 3-5 strings highlighting main strengths)

Return ONLY a valid JSON object. Do not include any explanatory text.
"""
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4-1106-preview",  # or gpt-4-turbo
                messages=[
                    {"role": "system", "content": "You are a professional resume parser that outputs only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            logger.error(f"LLM enhancement failed: {e}")
            # Return basic structure if LLM fails
            return self._create_fallback_structure(entities)
    
    def _create_fallback_structure(self, entities: Dict) -> Dict:
        """Create basic structure if LLM fails."""
        return {
            "full_name": entities["persons"][0] if entities["persons"] else None,
            "email": entities["emails"][0] if entities["emails"] else None,
            "phone": entities["phones"][0] if entities["phones"] else None,
            "location": entities["locations"][0] if entities["locations"] else None,
            "linkedin_url": next((url for url in entities["urls"] if "linkedin" in url.lower()), None),
            "github_url": next((url for url in entities["urls"] if "github" in url.lower()), None),
            "portfolio_url": None,
            "summary": None,
            "experience": [],
            "education": [],
            "skills": [],
            "top_skills": [],
            "certifications": [],
            "languages": [],
            "total_experience_years": 0.0,
            "ai_summary": None,
            "key_strengths": []
        }
    
    def _post_process(self, data: Dict, raw_text: str) -> Dict:
        """
        Post-process and validate extracted data.
        """
        # Validate email
        if data.get("email"):
            try:
                validate_email(data["email"])
            except EmailNotValidError:
                data["email"] = None
        
        # Categorize skills
        if data.get("skills"):
            for skill in data["skills"]:
                if "category" not in skill or skill["category"] == "other":
                    skill["category"] = self._categorize_skill(skill["name"])
        
        # Add raw text
        data["raw_text"] = raw_text
        
        # Ensure top_skills is populated
        if not data.get("top_skills") and data.get("skills"):
            data["top_skills"] = [s["name"] for s in data["skills"][:5]]
        
        return data
    
    def _categorize_skill(self, skill_name: str) -> str:
        """Categorize a skill based on skill taxonomy."""
        skill_lower = skill_name.lower()
        
        for category, skills in self.skill_categories.items():
            if any(s in skill_lower for s in skills):
                return category
        
        return "other"


# Singleton instance
_parser_instance = None

def get_resume_parser() -> ResumeParser:
    """Get or create the resume parser singleton."""
    global _parser_instance
    if _parser_instance is None:
        _parser_instance = ResumeParser()
    return _parser_instance

