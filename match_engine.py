import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv('GEMINI_API_KEY'))

def get_match_score(resume_text, job_description):
    try:
        prompt = f"""Analyze resume vs job. Return ONLY JSON, no extra text.
RESUME: {resume_text[:2000]}
JOB: {job_description[:1000]}
JSON: {{"score": 75, "grade": "B", "summary": "Good match.", "strengths": ["Python", "Flask"], "weaknesses": ["Docker", "AWS"], "recommendation": "Worth interviewing."}}"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=400
        )
        text = response.choices[0].message.content.strip()
        text = re.sub(r'```json|```', '', text).strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception as e:
        return {"score": 0, "grade": "N/A", "summary": f"Failed: {str(e)}", "strengths": [], "weaknesses": [], "recommendation": "Check API key."}
