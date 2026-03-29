const form = document.getElementById('signin-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email) return;

    // Use YOUR actual render URL here
    const RENDER_URL = 'https://sequoia-1-1-01.onrender.com';
    
    localStorage.setItem('SEQUOIA_API_BASE', RENDER_URL);
    localStorage.setItem('sequoia_user', JSON.stringify({ email }));

    window.location.href = './dashboard.html';
});
