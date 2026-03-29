// signin.js
const form = document.getElementById('signin-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  if (!email) return;

  // store a simple session
  localStorage.setItem('sequoia_user', JSON.stringify({ email }));
  // optionally store api base for dev (change to your Render URL)
  if (!localStorage.getItem('SEQUOIA_API_BASE')) {
    localStorage.setItem('SEQUOIA_API_BASE', 'https://sequoia-1-1-01.onrender.com');
  }

  // go to dashboard
  window.location.href = '/dashboard.html';
});
