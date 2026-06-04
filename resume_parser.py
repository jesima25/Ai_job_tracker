import fitz  # PyMuPDF
import os
import re

def extract_text_from_pdf(filepath: str) -> str:
    """Extract clean text from a PDF resume file."""
    try:
        doc = fitz.open(filepath)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        text = clean_text(text)
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def clean_text(text: str) -> str:
    """Clean and normalize extracted text."""
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    text = text.strip()
    return text

def extract_sections(text: str) -> dict:
    """Extract common resume sections."""
    sections = {
        'skills': '',
        'experience': '',
        'education': '',
        'summary': ''
    }
    lines = text.lower().split('\n')
    current_section = None
    section_content = []

    section_keywords = {
        'skills': ['skills', 'technical skills', 'technologies'],
        'experience': ['experience', 'work experience', 'employment'],
        'education': ['education', 'academic'],
        'summary': ['summary', 'objective', 'profile']
    }

    for line in lines:
        matched = False
        for section, keywords in section_keywords.items():
            if any(kw in line for kw in keywords):
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = section
                section_content = []
                matched = True
                break
        if not matched and current_section:
            section_content.append(line)

    if current_section and section_content:
        sections[current_section] = '\n'.join(section_content)

    return sections
