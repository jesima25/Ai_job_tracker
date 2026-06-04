// ── STATE ─────────────────────────────────────────────────────
let resumeText = '';
let analysisResults = null;

// ── RESUME UPLOAD ─────────────────────────────────────────────
async function uploadResume(input) {
  const file = input.files[0];
  if (!file) return;
  await handleResumeFile(file);
}

async function handleResumeFile(file) {
  if (!file.name.endsWith('.pdf')) {
    showToast('Please upload a PDF file', 'error');
    return;
  }
  const status = document.getElementById('resume-status');
  status.textContent = '⏳ Extracting text...';
  status.style.color = 'var(--yellow)';

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const res = await fetch('http://localhost:5000/api/upload-resume', {
      method: 'POST', body: formData
    });
    const data = await res.json();
    if (data.success) {
      resumeText = data.text;
      document.getElementById('resume-text').value = resumeText;
      document.getElementById('resume-filename').textContent = file.name;
      document.getElementById('resume-chars').textContent = `${resumeText.length.toLocaleString()} characters extracted`;
      document.getElementById('resume-preview').style.display = 'block';
      document.getElementById('upload-zone').style.display = 'none';
      status.textContent = '✅ Resume ready';
      status.style.color = 'var(--green)';
      showToast('Resume uploaded and text extracted!');
    } else {
      status.textContent = '❌ Upload failed';
      status.style.color = 'var(--red)';
      showToast(data.error || 'Upload failed', 'error');
    }
  } catch (err) {
    status.textContent = '❌ Backend not connected';
    status.style.color = 'var(--red)';
    showToast('Make sure Flask backend is running', 'error');
  }
}

function clearResume() {
  resumeText = '';
  document.getElementById('resume-text').value = '';
  document.getElementById('resume-preview').style.display = 'none';
  document.getElementById('upload-zone').style.display = 'block';
  document.getElementById('resume-file').value = '';
  document.getElementById('resume-status').textContent = 'No file uploaded';
  document.getElementById('resume-status').style.color = 'var(--text3)';
}

// ── RUN FULL ANALYSIS ─────────────────────────────────────────
async function runAnalysis() {
  const resume = document.getElementById('resume-text').value.trim() || resumeText;
  const jd = document.getElementById('jd-text').value.trim();

  if (!resume) { showToast('Please upload or paste your resume', 'error'); return; }
  if (!jd) { showToast('Please paste the job description', 'error'); return; }

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Analyzing with AI...';

  document.getElementById('results-section').style.display = 'none';

  try {
    const data = await apiFetch('/analyze', {
      method: 'POST',
      body: JSON.stringify({ resume_text: resume, job_description: jd })
    });

    if (data.success) {
      analysisResults = data;
      renderResults(data);
      document.getElementById('results-section').style.display = 'block';
      document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('Analysis complete! ✨');
    } else {
      showToast(data.error || 'Analysis failed', 'error');
    }
  } catch (err) {
    showToast('Make sure Flask backend is running', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '✨ Analyze with AI';
}

// ── RENDER ALL RESULTS ────────────────────────────────────────
function renderResults(data) {
  renderMatchScore(data.match_score);
  renderATSScore(data.ats_score);
  renderSkillGap(data.skill_gap);
  renderInterviewQuestions(data.interview_questions);
}

// ── MATCH SCORE ───────────────────────────────────────────────
function renderMatchScore(m) {
  if (!m) return;
  const score = m.score || 0;
  setScoreRing('match-ring', 'match-score-num', score, scoreColor(score));
  setTextContent('match-summary', m.summary);
  setTextContent('match-grade', m.grade);
  setTextContent('match-rec', m.recommendation);

  const strengthsEl = document.getElementById('match-strengths');
  if (strengthsEl && m.strengths) {
    strengthsEl.innerHTML = m.strengths.map(s => `<div>• ${escHtml(s)}</div>`).join('');
  }
  const weakEl = document.getElementById('match-weaknesses');
  if (weakEl && m.weaknesses) {
    weakEl.innerHTML = m.weaknesses.map(w => `<div>• ${escHtml(w)}</div>`).join('');
  }
}

// ── ATS SCORE ─────────────────────────────────────────────────
function renderATSScore(a) {
  if (!a) return;
  const score = a.score || 0;
  setScoreRing('ats-ring', 'ats-score-num', score, scoreColor(score));
  setTextContent('ats-summary', a.summary);
  setTextContent('ats-grade', a.grade);

  const passedEl = document.getElementById('ats-passed');
  if (passedEl && a.passed) {
    passedEl.innerHTML = a.passed.map(p => `<div>✅ ${escHtml(p)}</div>`).join('');
  }
  const failedEl = document.getElementById('ats-failed');
  if (failedEl && a.failed) {
    failedEl.innerHTML = a.failed.map(f => `<div>❌ ${escHtml(f)}</div>`).join('');
  }
  const tipsEl = document.getElementById('ats-tips');
  if (tipsEl && a.tips) {
    tipsEl.innerHTML = a.tips.map((t, i) => `<div>${i + 1}. ${escHtml(t)}</div>`).join('');
  }
}

// ── SKILL GAP ─────────────────────────────────────────────────
function renderSkillGap(sg) {
  if (!sg) return;
  setTextContent('readiness-badge', `Overall Readiness: ${sg.overall_readiness || '0%'}`);

  const matchedEl = document.getElementById('matched-skills');
  if (matchedEl && sg.matched_skills) {
    matchedEl.innerHTML = sg.matched_skills.map(s => `<span class="skill-tag matched">${escHtml(s)}</span>`).join('');
  }
  const missingEl = document.getElementById('missing-skills');
  if (missingEl && sg.missing_skills) {
    missingEl.innerHTML = sg.missing_skills.map(s => `<span class="skill-tag missing">${escHtml(s)}</span>`).join('');
  }
  const optEl = document.getElementById('optional-skills');
  if (optEl && sg.nice_to_have) {
    optEl.innerHTML = sg.nice_to_have.map(s => `<span class="skill-tag optional">${escHtml(s)}</span>`).join('');
  }

  const resourcesEl = document.getElementById('learning-resources');
  if (resourcesEl && sg.learning_resources) {
    resourcesEl.innerHTML = sg.learning_resources.map(r => `
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:.875rem 1rem;">
        <div style="font-weight:600;font-size:.85rem;color:var(--accent2);margin-bottom:.3rem;">${escHtml(r.skill)}</div>
        <div style="font-size:.8rem;color:var(--text2);">📚 ${escHtml(r.resource)}</div>
        <div style="font-size:.78rem;color:var(--text3);margin-top:.25rem;">⏱ ${escHtml(r.time)}</div>
      </div>`).join('');
  }

  setTextContent('skill-advice', sg.advice);
}

// ── INTERVIEW QUESTIONS ───────────────────────────────────────
function renderInterviewQuestions(iq) {
  if (!iq) return;

  const techEl = document.getElementById('technical-questions');
  if (techEl && iq.technical) {
    techEl.innerHTML = iq.technical.map(q => `
      <div class="question-card">
        <div class="difficulty-badge ${q.difficulty?.toLowerCase()}">${q.difficulty || 'Medium'}</div>
        <div class="question-text">${escHtml(q.question)}</div>
        <div class="question-tip">💡 ${escHtml(q.tip)}</div>
      </div>`).join('');
  }

  const behEl = document.getElementById('behavioral-questions');
  if (behEl && iq.behavioral) {
    behEl.innerHTML = iq.behavioral.map(q => `
      <div class="question-card">
        <div class="difficulty-badge medium" style="background:rgba(108,99,255,.15);color:var(--accent2);">STAR Framework</div>
        <div class="question-text">${escHtml(q.question)}</div>
        <div class="question-tip">💡 ${escHtml(q.tip)}</div>
      </div>`).join('');
  }

  const sitEl = document.getElementById('situational-questions');
  if (sitEl && iq.situational) {
    sitEl.innerHTML = iq.situational.map(q => `
      <div class="question-card">
        <div class="question-text">${escHtml(q.question)}</div>
        <div class="question-tip">💡 ${escHtml(q.tip)}</div>
      </div>`).join('');
  }

  const askEl = document.getElementById('ask-questions');
  if (askEl && iq.questions_to_ask) {
    askEl.innerHTML = `
      <div style="background:rgba(108,99,255,.06);border:1px solid rgba(108,99,255,.15);border-radius:12px;padding:1.25rem;">
        <p style="font-size:.85rem;color:var(--text2);margin-bottom:1rem;">Ask these questions to show genuine interest and preparation:</p>
        ${iq.questions_to_ask.map((q, i) => `
          <div style="padding:.75rem 0;border-bottom:1px solid var(--border);display:flex;gap:.75rem;align-items:flex-start;">
            <span style="color:var(--accent2);font-weight:700;min-width:1.5rem;">${i + 1}.</span>
            <span style="font-size:.9rem;color:var(--text);">${escHtml(q)}</span>
          </div>`).join('')}
      </div>`;
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function setTextContent(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
