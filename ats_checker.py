import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv('GEMINI_API_KEY'))

def get_ats_score(resume_text):
    try:
        prompt = f"""Check ATS compatibility. Return ONLY JSON, no extra text.
RESUME: {resume_text[:2000]}
JSON: {{"score": 78, "grade": "Good", "summary": "Mostly ATS friendly.", "passed": ["Clear headings", "Good keywords"], "failed": ["No summary section"], "tips": ["Add numbers", "Add summary", "More keywords"]}}"""
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
        return {"score": 0, "grade": "N/A", "summary": f"Failed: {str(e)}", "passed": [], "failed": [], "tips": []}
