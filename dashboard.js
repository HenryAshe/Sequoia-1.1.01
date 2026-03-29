// dashboard.js
const user = JSON.parse(localStorage.getItem('sequoia_user') || 'null');
if (!user) {
  window.location.href = '/';
}

const API_BASE = localStorage.getItem('SEQUOIA_API_BASE') || 'https://your-render-server.example.com';

const classesList = document.getElementById('classes-list');
const assignmentsList = document.getElementById('assignments-list');
const signoutBtn = document.getElementById('signout');

signoutBtn.addEventListener('click', () => {
  localStorage.removeItem('sequoia_user');
  window.location.href = '/';
});

async function fetchJSON(path) {
  try {
    const res = await fetch(API_BASE + path, { credentials: 'include' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function renderClasses(classes){
  classesList.innerHTML = '';
  if (!classes || classes.length === 0) {
    classesList.innerHTML = '<li class="item"><div class="meta">No classes found</div></li>';
    return;
  }
  classes.forEach(c => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `<div>
                      <div style="font-weight:600">${escapeHtml(c.name || c.course_name || 'Untitled')}</div>
                      <div class="meta">${escapeHtml(c.code || c.course_code || '')}</div>
                    </div>
                    <div class="meta">${escapeHtml(c.term || '')}</div>`;
    classesList.appendChild(li);
  });
}

function renderAssignments(assignments){
  assignmentsList.innerHTML = '';
  if (!assignments || assignments.length === 0) {
    assignmentsList.innerHTML = '<li class="item"><div class="meta">No upcoming assignments</div></li>';
    return;
  }

  // sort by due date ascending
  assignments.sort((a,b) => new Date(a.due_at || a.due) - new Date(b.due_at || b.due));

  assignments.forEach(a => {
    const li = document.createElement('li');
    li.className = 'item';
    const due = new Date(a.due_at || a.due || a.due_date || null);
    const dueText = due && !isNaN(due) ? due.toLocaleString() : 'No due date';
    li.innerHTML = `<div>
                      <div style="font-weight:600">${escapeHtml(a.title || a.name || 'Untitled')}</div>
                      <div class="meta">${escapeHtml(a.course || a.course_name || a.course_code || '')}</div>
                    </div>
                    <div class="assignment-due">${escapeHtml(dueText)}</div>`;
    assignmentsList.appendChild(li);
  });
}

function escapeHtml(s = ''){
  return String(s).replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

async function loadData(){
  // Expected server endpoints (adjust if different):
  // GET /api/classes -> [{ id, name, course_code, term }]
  // GET /api/assignments/upcoming -> [{ id, title, course, due_at }]
  const classes = await fetchJSON('/api/classes');
  const assignments = await fetchJSON('/api/assignments/upcoming');

  renderClasses(classes || []);
  renderAssignments(assignments || []);
}

loadData();
