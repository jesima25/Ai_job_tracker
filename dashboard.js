// ── STATE ─────────────────────────────────────────────────────
let allJobs = [];
let currentFilter = 'all';
let editingId = null;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadJobs();
});

// ── LOAD ALL JOBS ────────────────────────────────────────────
async function loadJobs() {
  const data = await apiFetch('/jobs');
  if (!data.success) {
    showToast(data.error || 'Failed to load jobs', 'error');
    document.getElementById('jobs-container').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <span class="empty-icon">⚠️</span>
        <h3>Backend not connected</h3>
        <p>Make sure Flask server is running on port 5000</p>
      </div>`;
    return;
  }
  allJobs = data.jobs || [];
  updateStats();
  renderJobs();
}

// ── UPDATE STATS ─────────────────────────────────────────────
function updateStats() {
  const total = allJobs.length;
  const interview = allJobs.filter(j => j.status === 'Interview').length;
  const offer = allJobs.filter(j => j.status === 'Offer').length;
  const rejected = allJobs.filter(j => j.status === 'Rejected').length;
  const rate = interview > 0 ? Math.round((offer / interview) * 100) : 0;

  animateNumber(document.getElementById('stat-total'), total);
  animateNumber(document.getElementById('stat-interview'), interview);
  animateNumber(document.getElementById('stat-offer'), offer);
  animateNumber(document.getElementById('stat-rejected'), rejected);
  const rateEl = document.getElementById('stat-rate');
  if (rateEl) animateNumber(rateEl, rate, '%');
}

// ── RENDER JOBS ───────────────────────────────────────────────
function renderJobs() {
  const container = document.getElementById('jobs-container');
  const search = document.getElementById('search-input')?.value?.toLowerCase() || '';

  let filtered = allJobs.filter(job => {
    const matchStatus = currentFilter === 'all' || job.status === currentFilter;
    const matchSearch = !search || job.company.toLowerCase().includes(search) || job.role.toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <span class="empty-icon">📭</span>
        <h3>No applications found</h3>
        <p>${allJobs.length === 0 ? 'Add your first job application to get started!' : 'Try changing the filter or search term.'}</p>
        ${allJobs.length === 0 ? '<button class="btn btn-primary" style="margin-top:1rem;" onclick="openModal()">+ Add Job</button>' : ''}
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(job => jobCardHTML(job)).join('');
}

// ── JOB CARD HTML ────────────────────────────────────────────
function jobCardHTML(job) {
  const initials = job.company.slice(0, 2).toUpperCase();
  const colors = ['#6c63ff', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];
  const color = colors[job.id % colors.length];

  return `
    <div class="job-card">
      <div class="job-card-header">
        <div style="display:flex;align-items:center;gap:.875rem;">
          <div style="width:42px;height:42px;border-radius:10px;background:${color}22;border:1px solid ${color}44;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.875rem;color:${color};flex-shrink:0;">
            ${initials}
          </div>
          <div>
            <div class="job-company">${escHtml(job.company)}</div>
            <div class="job-role">${escHtml(job.role)}</div>
          </div>
        </div>
        ${statusBadge(job.status)}
      </div>
      <div class="job-meta">
        ${job.location ? `<span>📍 ${escHtml(job.location)}</span>` : ''}
        ${job.salary ? `<span>💰 ${escHtml(job.salary)}</span>` : ''}
        <span>📅 ${formatDate(job.created_at)}</span>
      </div>
      ${job.notes ? `<div style="font-size:.8rem;color:var(--text3);margin-bottom:.75rem;padding:.6rem .875rem;background:var(--bg3);border-radius:8px;border-left:2px solid var(--accent);">${escHtml(job.notes)}</div>` : ''}
      <div class="job-card-footer">
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;">
          ${['Applied','Interview','Offer','Rejected'].map(s => `
            <button class="btn btn-sm ${job.status === s ? 'btn-primary' : 'btn-ghost'}" onclick="quickStatus(${job.id}, '${s}')" style="${job.status === s ? '' : 'font-size:.7rem;padding:.25rem .6rem;'}">
              ${s}
            </button>`).join('')}
        </div>
        <div class="job-actions">
          ${job.job_url ? `<a href="${job.job_url}" target="_blank" class="btn btn-sm btn-ghost">🔗</a>` : ''}
          <button class="btn btn-sm btn-ghost" onclick="editJob(${job.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.id})">🗑️</button>
        </div>
      </div>
    </div>`;
}

// ── FILTER & SEARCH ───────────────────────────────────────────
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderJobs();
}

function filterJobs() {
  renderJobs();
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(job = null) {
  editingId = job ? job.id : null;
  document.getElementById('modal-title').textContent = job ? 'Edit Application' : 'Add New Job';
  document.getElementById('submit-btn').textContent = job ? 'Update Application' : 'Save Application';
  document.getElementById('job-id').value = job?.id || '';
  document.getElementById('job-company').value = job?.company || '';
  document.getElementById('job-role').value = job?.role || '';
  document.getElementById('job-status').value = job?.status || 'Applied';
  document.getElementById('job-location').value = job?.location || '';
  document.getElementById('job-salary').value = job?.salary || '';
  document.getElementById('job-url').value = job?.job_url || '';
  document.getElementById('job-notes').value = job?.notes || '';
  document.getElementById('job-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('job-modal').classList.remove('active');
  document.getElementById('job-form').reset();
  editingId = null;
}

document.getElementById('job-modal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ── SUBMIT JOB ────────────────────────────────────────────────
async function submitJob(e) {
  e.preventDefault();
  const payload = {
    company: document.getElementById('job-company').value.trim(),
    role: document.getElementById('job-role').value.trim(),
    status: document.getElementById('job-status').value,
    location: document.getElementById('job-location').value.trim(),
    salary: document.getElementById('job-salary').value.trim(),
    job_url: document.getElementById('job-url').value.trim(),
    notes: document.getElementById('job-notes').value.trim()
  };
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Saving...';

  let data;
  if (editingId) {
    data = await apiFetch(`/jobs/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
  } else {
    data = await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) });
  }

  btn.disabled = false;
  btn.textContent = editingId ? 'Update Application' : 'Save Application';

  if (data.success) {
    showToast(editingId ? 'Application updated!' : 'Application added!');
    closeModal();
    loadJobs();
  } else {
    showToast(data.error || 'Failed to save', 'error');
  }
}

// ── EDIT JOB ──────────────────────────────────────────────────
function editJob(id) {
  const job = allJobs.find(j => j.id === id);
  if (job) openModal(job);
}

// ── DELETE JOB ────────────────────────────────────────────────
async function deleteJob(id) {
  if (!confirm('Delete this application?')) return;
  const data = await apiFetch(`/jobs/${id}`, { method: 'DELETE' });
  if (data.success) {
    showToast('Application deleted');
    loadJobs();
  } else {
    showToast('Failed to delete', 'error');
  }
}

// ── QUICK STATUS ──────────────────────────────────────────────
async function quickStatus(id, status) {
  const data = await apiFetch(`/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  if (data.success) {
    showToast(`Status → ${status}`);
    loadJobs();
  }
}

// ── ESCAPE HTML ───────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
