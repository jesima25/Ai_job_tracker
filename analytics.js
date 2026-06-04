// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAnalytics();
});

// ── LOAD ANALYTICS DATA ───────────────────────────────────────
async function loadAnalytics() {
  const data = await apiFetch('/analytics');
  if (!data.success) {
    showToast(data.error || 'Failed to load analytics', 'error');
    return;
  }
  updateStats(data);
  renderMonthlyChart(data.monthly || []);
  renderStatusChart(data);
  renderFunnel(data);
  renderInsights(data);
}

// ── UPDATE STAT CARDS ─────────────────────────────────────────
function updateStats(data) {
  animateNumber(document.getElementById('a-total'), data.total || 0);
  animateNumber(document.getElementById('a-interviews'), data.interviews || 0);
  animateNumber(document.getElementById('a-offers'), data.offers || 0);
  animateNumber(document.getElementById('a-rejected'), data.rejected || 0);
  const rateEl = document.getElementById('a-rate');
  if (rateEl) animateNumber(rateEl, data.success_rate || 0, '%');
}

// ── MONTHLY BAR CHART ─────────────────────────────────────────
function renderMonthlyChart(monthly) {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx) return;

  // If no data, show placeholder months
  let labels, counts;
  if (monthly.length === 0) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
    }
    labels = months;
    counts = [0, 0, 0, 0, 0, 0];
  } else {
    labels = monthly.map(m => {
      const [year, month] = m.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }).reverse();
    counts = monthly.map(m => m.count).reverse();
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Applications',
        data: counts,
        backgroundColor: 'rgba(108,99,255,0.6)',
        borderColor: 'rgba(108,99,255,1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#16161f',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: '#f0f0f8',
          bodyColor: '#9898b0',
          padding: 12,
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9898b0', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#9898b0', font: { size: 11 }, stepSize: 1 },
          beginAtZero: true
        }
      }
    }
  });
}

// ── STATUS DOUGHNUT CHART ─────────────────────────────────────
function renderStatusChart(data) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  const values = [
    data.applied || 0,
    data.interviews || 0,
    data.offers || 0,
    data.rejected || 0
  ];
  const total = values.reduce((a, b) => a + b, 0);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
      datasets: [{
        data: total > 0 ? values : [1, 1, 1, 1],
        backgroundColor: [
          'rgba(59,130,246,0.8)',
          'rgba(245,158,11,0.8)',
          'rgba(34,197,94,0.8)',
          'rgba(239,68,68,0.8)'
        ],
        borderColor: '#0a0a0f',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#9898b0',
            padding: 16,
            font: { size: 12 },
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: {
          backgroundColor: '#16161f',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: '#f0f0f8',
          bodyColor: '#9898b0',
          padding: 12,
          callbacks: {
            label: (ctx) => {
              if (total === 0) return ' No data yet';
              const pct = Math.round((ctx.raw / total) * 100);
              return ` ${ctx.raw} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// ── APPLICATION FUNNEL ────────────────────────────────────────
function renderFunnel(data) {
  const container = document.getElementById('funnel-container');
  if (!container) return;

  const stages = [
    { label: 'Applied', value: (data.applied || 0) + (data.interviews || 0) + (data.offers || 0) + (data.rejected || 0), color: '#3b82f6', icon: '📨' },
    { label: 'Interviewed', value: (data.interviews || 0) + (data.offers || 0), color: '#f59e0b', icon: '🗣️' },
    { label: 'Got Offer', value: data.offers || 0, color: '#22c55e', icon: '🎉' },
  ];

  const max = stages[0].value || 1;

  container.innerHTML = stages.map((stage, i) => {
    const pct = Math.round((stage.value / max) * 100);
    const convRate = i > 0 && stages[i - 1].value > 0
      ? Math.round((stage.value / stages[i - 1].value) * 100)
      : null;

    return `
      <div style="margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
          <div style="display:flex;align-items:center;gap:.5rem;">
            <span>${stage.icon}</span>
            <span style="font-size:.875rem;font-weight:500;">${stage.label}</span>
            ${convRate !== null ? `<span style="font-size:.75rem;color:var(--text3);background:var(--bg3);padding:.15rem .5rem;border-radius:6px;">${convRate}% conversion</span>` : ''}
          </div>
          <span style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:${stage.color};">${stage.value}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${stage.color};"></div>
        </div>
      </div>`;
  }).join('');
}

// ── SMART INSIGHTS ────────────────────────────────────────────
function renderInsights(data) {
  const container = document.getElementById('insights-container');
  if (!container) return;

  const insights = [];
  const total = data.total || 0;
  const interviews = data.interviews || 0;
  const offers = data.offers || 0;
  const rejected = data.rejected || 0;

  if (total === 0) {
    insights.push({ icon: '🚀', title: 'Get Started', desc: 'Add your first job application on the Dashboard to see insights here.', color: '#6c63ff' });
  } else {
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
    if (interviewRate >= 30) {
      insights.push({ icon: '🔥', title: 'Strong Interview Rate', desc: `${interviewRate}% of your applications led to interviews. That's above average!`, color: '#22c55e' });
    } else if (interviewRate > 0) {
      insights.push({ icon: '📈', title: 'Room to Improve', desc: `Your interview rate is ${interviewRate}%. Try using the AI Analyzer to improve your resume match score.`, color: '#f59e0b' });
    }

    if (offers > 0) {
      insights.push({ icon: '🎉', title: 'Offer Received!', desc: `You have ${offers} offer${offers > 1 ? 's' : ''}. Congratulations on your hard work!`, color: '#22c55e' });
    }

    if (rejected > 5) {
      insights.push({ icon: '💪', title: 'Stay Persistent', desc: `${rejected} rejections so far — every rejection is one step closer to the right opportunity.`, color: '#6c63ff' });
    }

    if (total >= 10 && offers === 0) {
      insights.push({ icon: '🤖', title: 'Try AI Resume Analysis', desc: 'You have 10+ applications but no offers yet. Use the AI Analyzer to check your resume match score.', color: '#a78bfa' });
    }

    insights.push({ icon: '📊', title: 'Total Applications', desc: `You have applied to ${total} job${total !== 1 ? 's' : ''}. Keep applying consistently for best results.`, color: '#3b82f6' });
  }

  container.innerHTML = insights.map(ins => `
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:1.25rem;border-left:3px solid ${ins.color};">
      <div style="font-size:1.5rem;margin-bottom:.5rem;">${ins.icon}</div>
      <div style="font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;margin-bottom:.4rem;color:${ins.color};">${ins.title}</div>
      <div style="font-size:.825rem;color:var(--text2);line-height:1.6;">${ins.desc}</div>
    </div>`).join('');
}
