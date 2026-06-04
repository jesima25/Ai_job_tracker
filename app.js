// ── GLOBAL CONFIG ────────────────────────────────────────────
const API = 'http://localhost:5000/api';

// ── TOAST NOTIFICATIONS ──────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ── STATUS BADGE ─────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    Applied: ['badge-applied', '🔵'],
    Interview: ['badge-interview', '🟡'],
    Offer: ['badge-offer', '🟢'],
    Rejected: ['badge-rejected', '🔴']
  };
  const [cls, icon] = map[status] || ['badge-applied', '🔵'];
  return `<span class="badge ${cls}">${icon} ${status}</span>`;
}

// ── FORMAT DATE ───────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

// ── SCORE COLOR ───────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

// ── ANIMATE NUMBER ────────────────────────────────────────────
function animateNumber(el, target, suffix = '') {
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ── SCORE RING ────────────────────────────────────────────────
function setScoreRing(ringId, numId, score, color) {
  const ring = document.getElementById(ringId);
  const num = document.getElementById(numId);
  if (!ring || !num) return;
  const circumference = 314;
  const offset = circumference - (score / 100) * circumference;
  ring.style.stroke = color || scoreColor(score);
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
  animateNumber(num, score, '%');
}

// ── FETCH HELPER ─────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(API + endpoint, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, error: 'Network error. Is the backend running?' };
  }
}

// ── TAB SWITCHER ─────────────────────────────────────────────
function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const pane = document.getElementById('tab-' + tabName);
  if (pane) pane.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── DRAG AND DROP UPLOAD ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('upload-zone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleResumeFile(file);
    } else {
      showToast('Please drop a PDF file', 'error');
    }
  });
});
