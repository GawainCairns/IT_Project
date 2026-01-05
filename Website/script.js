// Helper: safe element lookup
function el(id) { return document.getElementById(id); }

// Cookie helpers
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/';
}

// Read cookie by name and try to parse JSON
function getCookie(name) {
    const pairs = document.cookie.split(';').map(s => s.trim());
    for (const p of pairs) {
        if (!p) continue;
        const [k, ...rest] = p.split('=');
        if (k === name) {
            try {
                const v = decodeURIComponent(rest.join('='));
                return JSON.parse(v);
            } catch (e) {
                try { return decodeURIComponent(rest.join('=')); } catch (_) { return null; }
            }
        }
    }
    return null;
}

function setUserCookie(userObj, days = 7) {
    try {
        setCookie('user', JSON.stringify({ id: userObj.id, username: userObj.username }), days);
    } catch (e) { console.error('Failed to set user cookie', e); }
}

function clearUserCookie() { deleteCookie('user'); }

// Login as an existing user (tries common field ids)
async function login(e) {
    if (e && e.preventDefault) e.preventDefault();
    const emailEl = el('loginEmail') || el('email') || document.querySelector('input[name="email"]');
    const passwordEl = el('loginPassword') || el('password') || document.querySelector('input[name="password"]');
    if (!emailEl || !passwordEl) return alert('Login fields not found');

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailEl.value, password: passwordEl.value })
        });
        if (res.ok) {
            // try to read returned user info (id and username) and set a cookie
            const data = await res.json().catch(() => null);
            if (data && (data.id || data.username)) setUserCookie({ id: data.id, username: data.username }, 7);
            return location.href = 'dashboard.html';
        }
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Login failed');
    } catch (err) {
        alert('Network error');
        console.error(err);
    }
}

// Register a new user
async function register(e) {
    if (e && e.preventDefault) e.preventDefault();
    const userEl = el('registerUsername') || document.querySelector('input[name="username"]');
    const emailEl = el('registerEmail') || el('email') || document.querySelector('input[name="email"]');
    const passwordEl = el('registerPassword') || el('password') || document.querySelector('input[name="password"]');
    if (!emailEl || !passwordEl) return alert('Registration fields not found');

    try {
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userEl ? userEl.value : undefined, email: emailEl.value, password: passwordEl.value })
        });
        if (res.ok) return alert('Registered');
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Registration failed');
    } catch (err) {
        alert('Network error');
        console.error(err);
    }
}

// Escape HTML for safe insert
function escapeHtml(str){
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Fetch and render surveys for dashboard
async function fetchSurveys(){
    const list = el('surveysList');
    if (!list) return;
    list.textContent = 'Loading...';
    try {
        const res = await fetch('/api/surveys');
        if (!res.ok) { list.textContent = 'Could not load surveys'; return; }
        const surveys = await res.json();
        if (!Array.isArray(surveys) || surveys.length === 0) { list.innerHTML = '<p>No surveys yet.</p>'; return; }
        list.innerHTML = '';
        surveys.forEach(s => {
            const div = document.createElement('div');
            div.className = 'survey-item';
            div.innerHTML = `<strong>${escapeHtml(s.title || 'Untitled')}</strong> <div class="survey-actions"><button data-id="${escapeHtml(s.id)}" class="view-btn">View</button> <button data-id="${escapeHtml(s.id)}" class="edit-btn">Edit</button> <button data-id="${escapeHtml(s.id)}" class="delete-btn">Delete</button></div>`;
            list.appendChild(div);
        });
        // delegate clicks
        list.querySelectorAll('.view-btn').forEach(b=>b.addEventListener('click', ()=>viewSurvey(b.dataset.id)));
        list.querySelectorAll('.edit-btn').forEach(b=>b.addEventListener('click', ()=>editSurvey(b.dataset.id)));
        list.querySelectorAll('.delete-btn').forEach(b=>b.addEventListener('click', ()=>deleteSurvey(b.dataset.id)));
    } catch (err) {
        list.textContent = 'Error loading surveys';
        console.error(err);
    }
}

function viewSurvey(id){ if (!id) return; location.href = `survey.html?id=${encodeURIComponent(id)}`; }
function editSurvey(id){ if (!id) return; location.href = `surveycreator.html?id=${encodeURIComponent(id)}`; }

async function deleteSurvey(id){
    if (!id) return;
    if (!confirm('Delete this survey? This cannot be undone.')) return;
    try {
        const res = await fetch(`/api/surveys/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) { fetchSurveys(); return; }
        const err = await res.json().catch(()=>({}));
        alert(err.message || 'Could not delete survey');
    } catch (err) { alert('Network error'); console.error(err); }
}

// Logout helper
async function logout(){
    try {
        await fetch('/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    // clear local user cookie then redirect
    clearUserCookie();
    location.href = 'index.html';
}

// Profile page: load and update
async function loadProfile(){
    const nameEl = el('nameInput');
    const emailEl = el('emailInput');
    if (!nameEl || !emailEl) return;
    try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        nameEl.value = data.name || '';
        emailEl.value = data.email || '';
    } catch (err) { console.error(err); }
}

async function saveProfile(){
    const nameEl = el('nameInput');
    const emailEl = el('emailInput');
    const passwordEl = el('passwordInput');
    if (!nameEl || !emailEl) return alert('Profile form not found');
    try {
        const body = { name: nameEl.value, email: emailEl.value };
        if (passwordEl && passwordEl.value) body.password = passwordEl.value;
        const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (res.ok) return alert('Profile saved');
        const err = await res.json().catch(()=>({}));
        alert(err.message || 'Could not save profile');
    } catch (err) { alert('Network error'); console.error(err); }
}

async function deleteAccount(){
    if (!confirm('Delete your account? This is permanent.')) return;
    try {
        const res = await fetch('/api/account', { method: 'DELETE' });
        if (res.ok) { alert('Account deleted'); location.href = 'index.html'; return; }
        const err = await res.json().catch(()=>({}));
        alert(err.message || 'Could not delete account');
    } catch (err) { alert('Network error'); console.error(err); }
}

async function fetchUserSurveys(){
    const list = el('userSurveys');
    if (!list) return;
    list.textContent = 'Loading...';
    try {
        const res = await fetch('/api/my-surveys');
        if (!res.ok) { list.textContent = 'Could not load surveys'; return; }
        const surveys = await res.json();
        if (!Array.isArray(surveys) || surveys.length === 0) { list.innerHTML = '<p>No surveys.</p>'; return; }
        list.innerHTML = '';
        surveys.forEach(s => {
            const d = document.createElement('div');
            d.className = 'survey-item';
            d.innerHTML = `<strong>${escapeHtml(s.title || 'Untitled')}</strong> <button onclick="viewSurvey('${escapeHtml(s.id)}')">View</button> <button onclick="editSurvey('${escapeHtml(s.id)}')">Edit</button>`;
            list.appendChild(d);
        });
    } catch (err) { list.textContent = 'Error loading surveys'; console.error(err); }
}

// Initialize dashboard page
function initDashboard(){
    const logoutBtn = el('logoutBtn');
    const profileBtn = el('profileBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (profileBtn) profileBtn.addEventListener('click', ()=> location.href = 'profile.html');
    fetchSurveys();
}

// Initialize profile page
function initProfile(){
    const saveBtn = el('saveProfileBtn');
    const logoutBtn = el('logoutBtnProfile');
    const delBtn = el('deleteAccountBtn');
    const createBtn = el('createSurveyBtnProfile');
    if (saveBtn) saveBtn.addEventListener('click', saveProfile);
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (delBtn) delBtn.addEventListener('click', deleteAccount);
    if (createBtn) createBtn.addEventListener('click', ()=> location.href = 'surveycreator.html');
    loadProfile();
    fetchUserSurveys();
}

// Auto-init depending on page
document.addEventListener('DOMContentLoaded', ()=>{
    // Update navbar links depending on logged-in user
    try { updateNavbar(); } catch (e) { /* ignore */ }
    const href = window.location.href;
    if (href.includes('dashboard.html') || document.title.includes('Dashboard')) initDashboard();
    else if (href.includes('profile.html') || document.title.includes('Profile')) initProfile();
});

// Replace login/register with profile + logout when user cookie exists
function updateNavbar(){
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const user = getCookie('user');
    const profileExists = !!nav.querySelector('a[href="profile.html"]');
    const loginA = nav.querySelector('a[href="login.html"]');
    const registerA = nav.querySelector('a[href="register.html"]');

    if (user && typeof user === 'object' && user.username) {
        if (profileExists) return; // already updated
        // remove login/register anchors if present
        if (loginA && loginA.parentElement) loginA.parentElement.remove();
        if (registerA && registerA.parentElement) registerA.parentElement.remove();

        const liProfile = document.createElement('li'); liProfile.className = 'navbar_right';
        const aProfile = document.createElement('a'); aProfile.href = 'profile.html'; aProfile.textContent = escapeHtml(user.username || 'Profile');
        liProfile.appendChild(aProfile);

        const liLogout = document.createElement('li'); liLogout.className = 'navbar_right';
        const aLogout = document.createElement('a'); aLogout.href = '#'; aLogout.textContent = 'Logout';
        aLogout.addEventListener('click', function(e){ e.preventDefault(); logout(); });
        liLogout.appendChild(aLogout);

        nav.appendChild(liProfile);
        nav.appendChild(liLogout);
    } else {
        // ensure login/register links exist
        if (!loginA) {
            const li = document.createElement('li'); li.className = 'navbar_right';
            const a = document.createElement('a'); a.href = 'login.html'; a.textContent = 'Login';
            li.appendChild(a); nav.appendChild(li);
        }
        if (!registerA) {
            const li = document.createElement('li'); li.className = 'navbar_right';
            const a = document.createElement('a'); a.href = 'register.html'; a.textContent = 'Register';
            li.appendChild(a); nav.appendChild(li);
        }
    }
}

