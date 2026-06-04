from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from database import init_db, get_db
from models import Job
from ai.resume_parser import extract_text_from_pdf
from ai.match_engine import get_match_score
from ai.ats_checker import get_ats_score
from ai.skill_gap import get_skill_gap
from ai.interview_questions import get_interview_questions
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB

init_db()

# ─── JOB ROUTES ───────────────────────────────────────────────

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    db = get_db()
    status = request.args.get('status', '')
    search = request.args.get('search', '')
    cursor = db.cursor()
    query = "SELECT * FROM jobs WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    if search:
        query += " AND (company LIKE ? OR role LIKE ?)"
        params.extend([f'%{search}%', f'%{search}%'])
    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    jobs = [dict(row) for row in rows]
    db.close()
    return jsonify({'success': True, 'jobs': jobs})


@app.route('/api/jobs', methods=['POST'])
def add_job():
    data = request.get_json()
    if not data or not data.get('company') or not data.get('role'):
        return jsonify({'success': False, 'error': 'Company and role are required'}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO jobs (company, role, status, location, salary, job_url, notes, created_at) VALUES (?,?,?,?,?,?,?,?)",
        (
            data.get('company'),
            data.get('role'),
            data.get('status', 'Applied'),
            data.get('location', ''),
            data.get('salary', ''),
            data.get('job_url', ''),
            data.get('notes', ''),
            datetime.now().isoformat()
        )
    )
    db.commit()
    job_id = cursor.lastrowid
    db.close()
    return jsonify({'success': True, 'id': job_id, 'message': 'Job added successfully'})


@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE jobs SET company=?, role=?, status=?, location=?, salary=?, job_url=?, notes=? WHERE id=?",
        (
            data.get('company'),
            data.get('role'),
            data.get('status'),
            data.get('location', ''),
            data.get('salary', ''),
            data.get('job_url', ''),
            data.get('notes', ''),
            job_id
        )
    )
    db.commit()
    db.close()
    return jsonify({'success': True, 'message': 'Job updated successfully'})


@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM jobs WHERE id=?", (job_id,))
    db.commit()
    db.close()
    return jsonify({'success': True, 'message': 'Job deleted successfully'})


@app.route('/api/jobs/<int:job_id>/status', methods=['PATCH'])
def update_status(job_id):
    data = request.get_json()
    status = data.get('status')
    valid = ['Applied', 'Interview', 'Offer', 'Rejected']
    if status not in valid:
        return jsonify({'success': False, 'error': 'Invalid status'}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE jobs SET status=? WHERE id=?", (status, job_id))
    db.commit()
    db.close()
    return jsonify({'success': True, 'message': f'Status updated to {status}'})


# ─── ANALYTICS ROUTES ─────────────────────────────────────────

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM jobs")
    total = cursor.fetchone()['total']
    cursor.execute("SELECT status, COUNT(*) as count FROM jobs GROUP BY status")
    status_data = {row['status']: row['count'] for row in cursor.fetchall()}
    cursor.execute("""
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
        FROM jobs GROUP BY month ORDER BY month DESC LIMIT 6
    """)
    monthly = cursor.fetchall()
    monthly_data = [{'month': row['month'], 'count': row['count']} for row in monthly]
    db.close()
    interviews = status_data.get('Interview', 0)
    offers = status_data.get('Offer', 0)
    success_rate = round((offers / interviews * 100), 1) if interviews > 0 else 0
    return jsonify({
        'success': True,
        'total': total,
        'applied': status_data.get('Applied', 0),
        'interviews': interviews,
        'offers': offers,
        'rejected': status_data.get('Rejected', 0),
        'success_rate': success_rate,
        'monthly': monthly_data
    })


# ─── AI ROUTES ────────────────────────────────────────────────

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    if not file.filename.endswith('.pdf'):
        return jsonify({'success': False, 'error': 'Only PDF files are allowed'}), 400
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'resume.pdf')
    file.save(filepath)
    text = extract_text_from_pdf(filepath)
    if not text:
        return jsonify({'success': False, 'error': 'Could not extract text from PDF'}), 400
    return jsonify({'success': True, 'text': text, 'message': 'Resume uploaded successfully'})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    resume_text = data.get('resume_text', '')
    job_description = data.get('job_description', '')
    if not resume_text or not job_description:
        return jsonify({'success': False, 'error': 'Resume text and job description are required'}), 400
    match = get_match_score(resume_text, job_description)
    ats = get_ats_score(resume_text)
    skills = get_skill_gap(resume_text, job_description)
    questions = get_interview_questions(job_description)
    return jsonify({
        'success': True,
        'match_score': match,
        'ats_score': ats,
        'skill_gap': skills,
        'interview_questions': questions
    })


@app.route('/api/match-score', methods=['POST'])
def match_score():
    data = request.get_json()
    result = get_match_score(data.get('resume_text', ''), data.get('job_description', ''))
    return jsonify({'success': True, 'result': result})


@app.route('/api/ats-score', methods=['POST'])
def ats_score():
    data = request.get_json()
    result = get_ats_score(data.get('resume_text', ''))
    return jsonify({'success': True, 'result': result})


@app.route('/api/skill-gap', methods=['POST'])
def skill_gap():
    data = request.get_json()
    result = get_skill_gap(data.get('resume_text', ''), data.get('job_description', ''))
    return jsonify({'success': True, 'result': result})


@app.route('/api/interview-questions', methods=['POST'])
def interview_questions():
    data = request.get_json()
    result = get_interview_questions(data.get('job_description', ''))
    return jsonify({'success': True, 'result': result})


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'AI Job Tracker API is running'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
