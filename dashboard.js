const API_BASE = localStorage.getItem('SEQUOIA_API_BASE');

async function init() {
    if (!API_BASE) { window.location.href = './index.html'; return; }

    try {
        // 1. Load Profile
        const profile = await fetch(`${API_BASE}/profile`).then(r => r.json());
        document.getElementById('user-greeting').innerText = `War Eagle, ${profile.name}!`;

        // 2. Load Courses
        const courses = await fetch(`${API_BASE}/my-courses`).then(r => r.json());
        const courseGrid = document.getElementById('course-grid');
        courseGrid.innerHTML = courses.map(c => `
            <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <h3 class="text-xl font-bold text-[#1B3022] mb-1">${c.course_name}</h3>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-tighter">Course ID: ${c.id}</p>
                <div class="mt-4 h-1 w-0 group-hover:w-full bg-[#3A5A40] transition-all duration-500"></div>
            </div>
        `).join('');

        // 3. Load Assignments (from the full-data route)
        const fullData = await fetch(`${API_BASE}/full-data`).then(r => r.json());
        const assignList = document.getElementById('assignment-list');
        
        let allAssignments = [];
        fullData.forEach(course => {
            course.assignments.forEach(a => {
                allAssignments.push({...a, course: course.course_name});
            });
        });

        assignList.innerHTML = allAssignments.slice(0, 10).map(a => `
            <div class="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                    <h4 class="font-bold text-slate-800">${a.title}</h4>
                    <p class="text-xs text-[#3A5A40] font-bold uppercase">${a.course}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm font-black text-slate-600">${a.points_possible || 0} pts</p>
                    <p class="text-[10px] text-slate-400 uppercase font-bold">${a.due_at ? new Date(a.due_at).toLocaleDateString() : 'No Date'}</p>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
    }
}

init();
