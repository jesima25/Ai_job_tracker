import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv('GEMINI_API_KEY'))

def get_skill_gap(resume_text, job_description):
    try:
        prompt = f"""Find skill gaps. Return ONLY JSON, no extra text.
RESUME: {resume_text[:2000]}
JOB: {job_description[:1000]}
JSON: {{"matched_skills": ["Python", "Flask"], "missing_skills": ["Docker", "AWS"], "nice_to_have": ["Redis"], "priority_skills": ["Docker"], "learning_resources": [{{"skill": "Docker", "resource": "YouTube + Docs", "time": "1 week"}}], "overall_readiness": "70%", "advice": "Learn Docker and AWS next."}}"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500
        )
        text = response.choices[0].message.content.strip()
        text = re.sub(r'```json|```', '', text).strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception as e:
        return {"matched_skills": [], "missing_skills": [], "nice_to_have": [], "priority_skills": [], "learning_resources": [], "overall_readiness": "0%", "advice": f"Failed: {str(e)}"}
