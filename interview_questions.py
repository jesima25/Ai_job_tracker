import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv('GEMINI_API_KEY'))

def get_interview_questions(job_description):
    try:
        prompt = f"""Generate interview questions. Return ONLY JSON, no extra text.
JOB: {job_description[:1000]}
JSON: {{"technical": [{{"question": "Explain REST API.", "difficulty": "Medium", "tip": "Mention HTTP methods"}}, {{"question": "SQL vs NoSQL?", "difficulty": "Easy", "tip": "Compare structure"}}, {{"question": "What is Docker?", "difficulty": "Medium", "tip": "Mention containers"}}, {{"question": "What is Flask routing?", "difficulty": "Easy", "tip": "Mention @app.route"}}, {{"question": "What is CI/CD?", "difficulty": "Hard", "tip": "Mention automation"}}], "behavioral": [{{"question": "Tell me about a hard problem.", "framework": "STAR", "tip": "Use STAR method"}}, {{"question": "How handle deadlines?", "framework": "STAR", "tip": "Show time management"}}, {{"question": "Teamwork experience?", "framework": "STAR", "tip": "Show collaboration"}}], "situational": [{{"question": "Server down what to do?", "tip": "Check logs first"}}, {{"question": "Slow query how to fix?", "tip": "Try indexing"}}], "questions_to_ask": ["What does day look like?", "What tech stack?", "Growth opportunities?"]}}"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=800
        )
        text = response.choices[0].message.content.strip()
        text = re.sub(r'```json|```', '', text).strip()
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except Exception as e:
        return {"technical": [], "behavioral": [], "situational": [], "questions_to_ask": [], "error": str(e)}
