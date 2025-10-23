"""
Comprehensive Test Suite for Resume Parser

Tests cover:
1. File validation
2. Text extraction
3. Entity extraction
4. LLM enhancement
5. Error handling
6. Edge cases
"""

import pytest
import os
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.services.resume_parser_enhanced import (
    EnhancedResumeParser,
    FileValidationError,
    TextExtractionError,
    ResumeParsingError
)


class TestFileValidation:
    """Test file validation"""
    
    def test_file_not_found(self):
        """Test error when file doesn't exist"""
        parser = EnhancedResumeParser()
        
        with pytest.raises(FileValidationError, match="File not found"):
            parser._validate_file("/nonexistent/file.pdf")
    
    def test_empty_file(self, tmp_path):
        """Test error when file is empty"""
        parser = EnhancedResumeParser()
        
        # Create empty file
        empty_file = tmp_path / "empty.pdf"
        empty_file.touch()
        
        with pytest.raises(FileValidationError, match="File is empty"):
            parser._validate_file(str(empty_file))
    
    def test_file_too_large(self, tmp_path):
        """Test error when file is too large"""
        parser = EnhancedResumeParser()
        
        # Create large file (11MB)
        large_file = tmp_path / "large.pdf"
        with open(large_file, 'wb') as f:
            f.write(b'0' * (11 * 1024 * 1024))
        
        with pytest.raises(FileValidationError, match="File too large"):
            parser._validate_file(str(large_file))
    
    def test_unsupported_file_type(self, tmp_path):
        """Test error for unsupported file types"""
        parser = EnhancedResumeParser()
        
        # Create .txt file
        txt_file = tmp_path / "resume.txt"
        txt_file.write_text("Resume content")
        
        with pytest.raises(FileValidationError, match="Unsupported file type"):
            parser._validate_file(str(txt_file))
    
    def test_valid_pdf_file(self, tmp_path):
        """Test validation passes for valid PDF"""
        parser = EnhancedResumeParser()
        
        # Create small PDF file
        pdf_file = tmp_path / "resume.pdf"
        pdf_file.write_bytes(b'%PDF-1.4\n' + b'0' * 1000)
        
        # Should not raise
        parser._validate_file(str(pdf_file))
    
    def test_valid_docx_file(self, tmp_path):
        """Test validation passes for valid DOCX"""
        parser = EnhancedResumeParser()
        
        # Create small DOCX file
        docx_file = tmp_path / "resume.docx"
        docx_file.write_bytes(b'PK' + b'0' * 1000)
        
        # Should not raise
        parser._validate_file(str(docx_file))


class TestTextValidation:
    """Test text validation"""
    
    def test_empty_text(self):
        """Test error when text is empty"""
        parser = EnhancedResumeParser()
        
        with pytest.raises(TextExtractionError, match="No text extracted"):
            parser._validate_text("")
    
    def test_insufficient_text(self):
        """Test error when text is too short"""
        parser = EnhancedResumeParser()
        
        with pytest.raises(TextExtractionError, match="Insufficient text"):
            parser._validate_text("Short text")
    
    def test_valid_text(self):
        """Test validation passes for sufficient text"""
        parser = EnhancedResumeParser()
        
        # Create text longer than MIN_TEXT_LENGTH (100)
        long_text = "This is a resume with sufficient content. " * 10
        
        # Should not raise
        parser._validate_text(long_text)


class TestEntityExtraction:
    """Test entity extraction"""
    
    def test_extract_email(self):
        """Test email extraction"""
        parser = EnhancedResumeParser()
        
        text = "Contact me at john.doe@example.com for more info"
        entities = parser._extract_entities_with_regex(text)
        
        assert "john.doe@example.com" in entities["emails"]
    
    def test_extract_multiple_emails(self):
        """Test multiple email extraction"""
        parser = EnhancedResumeParser()
        
        text = "Primary: john@example.com, Secondary: jane@example.org"
        entities = parser._extract_entities_with_regex(text)
        
        assert len(entities["emails"]) == 2
        assert "john@example.com" in entities["emails"]
        assert "jane@example.org" in entities["emails"]
    
    def test_extract_phone_us_format(self):
        """Test US phone number extraction"""
        parser = EnhancedResumeParser()
        
        text = "Call me at (555) 123-4567"
        entities = parser._extract_entities_with_regex(text)
        
        assert len(entities["phones"]) > 0
    
    def test_extract_url(self):
        """Test URL extraction"""
        parser = EnhancedResumeParser()
        
        text = "Portfolio: https://johndoe.com LinkedIn: https://linkedin.com/in/johndoe"
        entities = parser._extract_entities_with_regex(text)
        
        assert len(entities["urls"]) == 2


class TestSkillExtraction:
    """Test skill extraction"""
    
    def test_extract_programming_skills(self):
        """Test programming language extraction"""
        parser = EnhancedResumeParser()
        
        text = "Proficient in Java, Python, and JavaScript"
        skills = parser._extract_skills_from_text(text)
        
        assert "Java" in skills
        assert "Python" in skills
        assert "Javascript" in skills
    
    def test_extract_framework_skills(self):
        """Test framework extraction"""
        parser = EnhancedResumeParser()
        
        text = "Experience with React, Angular, Spring Boot, and Django"
        skills = parser._extract_skills_from_text(text)
        
        assert "React" in skills
        assert "Angular" in skills
        assert "Spring" in skills
        assert "Django" in skills
    
    def test_extract_database_skills(self):
        """Test database extraction"""
        parser = EnhancedResumeParser()
        
        text = "Worked with MySQL, PostgreSQL, MongoDB, and Redis"
        skills = parser._extract_skills_from_text(text)
        
        assert "Mysql" in skills
        assert "Postgresql" in skills
        assert "Mongodb" in skills
        assert "Redis" in skills
    
    def test_no_duplicate_skills(self):
        """Test that skills are deduplicated"""
        parser = EnhancedResumeParser()
        
        text = "Java Java Python Python JavaScript"
        skills = parser._extract_skills_from_text(text)
        
        # Should only have 3 unique skills
        assert len(skills) == 3


class TestFallbackStructure:
    """Test fallback structure creation"""
    
    def test_fallback_with_entities(self):
        """Test fallback structure with extracted entities"""
        parser = EnhancedResumeParser()
        
        text = "John Doe\njohn@example.com\n(555) 123-4567\nExperience with Java and Python"
        entities = {
            "persons": ["John Doe"],
            "emails": ["john@example.com"],
            "phones": ["(555) 123-4567"],
            "locations": ["New York"],
            "urls": ["https://linkedin.com/in/johndoe"],
            "organizations": [],
            "dates": []
        }
        
        result = parser._create_fallback_structure(text, entities)
        
        assert result["personal_info"]["name"] == "John Doe"
        assert result["personal_info"]["email"] == "john@example.com"
        assert result["personal_info"]["phone"] == "(555) 123-4567"
        assert result["personal_info"]["location"] == "New York"
        assert "Java" in result["skills"]
        assert "Python" in result["skills"]
    
    def test_fallback_without_entities(self):
        """Test fallback structure with no entities"""
        parser = EnhancedResumeParser()
        
        text = "Resume content without clear structure"
        entities = {
            "persons": [],
            "emails": [],
            "phones": [],
            "locations": [],
            "urls": [],
            "organizations": [],
            "dates": []
        }
        
        result = parser._create_fallback_structure(text, entities)
        
        # Should still create structure
        assert "personal_info" in result
        assert "skills" in result
        assert "experience" in result
        assert "education" in result


class TestMetadata:
    """Test metadata creation"""
    
    def test_metadata_structure(self, tmp_path):
        """Test metadata contains all required fields"""
        parser = EnhancedResumeParser()
        parser.start_time = 0
        
        # Create test file
        test_file = tmp_path / "resume.pdf"
        test_file.write_bytes(b'%PDF-1.4\n' + b'0' * 1000)
        
        metadata = parser._create_metadata(str(test_file), is_scanned=False)
        
        assert "file_path" in metadata
        assert "file_name" in metadata
        assert "file_size_bytes" in metadata
        assert "file_extension" in metadata
        assert "is_scanned" in metadata
        assert "parsed_at" in metadata
        assert "parsing_time_seconds" in metadata
        assert "parser_version" in metadata
        assert "llm_used" in metadata
        assert "ner_used" in metadata
    
    def test_metadata_values(self, tmp_path):
        """Test metadata values are correct"""
        parser = EnhancedResumeParser()
        parser.start_time = 0
        
        # Create test file
        test_file = tmp_path / "resume.pdf"
        test_file.write_bytes(b'0' * 1000)
        
        metadata = parser._create_metadata(str(test_file), is_scanned=True)
        
        assert metadata["file_name"] == "resume.pdf"
        assert metadata["file_size_bytes"] == 1000
        assert metadata["file_extension"] == ".pdf"
        assert metadata["is_scanned"] is True
        assert metadata["parser_version"] == "2.0.0"


class TestErrorHandling:
    """Test error handling"""
    
    def test_parser_handles_invalid_file(self):
        """Test parser returns error dict for invalid file"""
        parser = EnhancedResumeParser()
        
        result = parser.parse("/nonexistent/file.pdf")
        
        assert result["success"] is False
        assert "error" in result
        assert len(result["errors"]) > 0
    
    def test_parser_collects_warnings(self):
        """Test parser collects warnings"""
        # Create parser without OpenAI key
        parser = EnhancedResumeParser(openai_api_key=None)
        
        assert len(parser.warnings) > 0
        assert any("OpenAI" in w for w in parser.warnings)


class TestIntegration:
    """Integration tests with real files"""
    
    @pytest.mark.skipif(not os.path.exists("/home/ubuntu/upload/Jyothi_Java_Developer.docx"),
                        reason="Test file not available")
    def test_parse_real_docx(self):
        """Test parsing real DOCX resume"""
        parser = EnhancedResumeParser()
        
        result = parser.parse("/home/ubuntu/upload/Jyothi_Java_Developer.docx")
        
        assert result["success"] is True
        assert result["personal_info"]["email"] is not None
        assert len(result["skills"]) > 0
    
    @pytest.mark.skipif(not os.path.exists("/home/ubuntu/upload/Jyoshna.pdf"),
                        reason="Test file not available")
    def test_parse_real_pdf(self):
        """Test parsing real PDF resume"""
        parser = EnhancedResumeParser()
        
        result = parser.parse("/home/ubuntu/upload/Jyoshna.pdf")
        
        assert result["success"] is True
        assert result["personal_info"]["email"] is not None
        assert len(result["skills"]) > 0


# Test fixtures
@pytest.fixture
def sample_resume_text():
    """Sample resume text for testing"""
    return """
    John Doe
    john.doe@example.com | (555) 123-4567 | New York, NY
    LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe
    
    PROFESSIONAL SUMMARY
    Experienced Full Stack Developer with 8+ years of experience in Java and React.
    
    EXPERIENCE
    Senior Software Engineer | Tech Corp | New York, NY | 2020 - Present
    - Developed microservices using Spring Boot and Java
    - Built React applications with TypeScript
    - Deployed on AWS using Docker and Kubernetes
    
    Software Engineer | StartupCo | San Francisco, CA | 2016 - 2020
    - Developed REST APIs using Python and Django
    - Worked with PostgreSQL and MongoDB
    - Implemented CI/CD pipelines with Jenkins
    
    EDUCATION
    Master of Science in Computer Science | MIT | 2016
    Bachelor of Science in Computer Science | Stanford | 2014
    
    SKILLS
    Languages: Java, Python, JavaScript, TypeScript, SQL
    Frameworks: Spring Boot, React, Django, Node.js
    Databases: PostgreSQL, MySQL, MongoDB, Redis
    Cloud: AWS, Docker, Kubernetes, Terraform
    Tools: Git, Jenkins, Jira, Maven
    """


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])

