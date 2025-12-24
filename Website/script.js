function login() {
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    }).then(res => res.json())
        .then(() => location.href = "dashboard.html");
}

function register() {
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
        })
    }).then(() => alert("Registered"));
}
// Post a new message
function post() {
    fetch('/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, content: content.value })
    }).then(load);
}

function load() {
    fetch('/posts')
        .then(res => res.json())
        .then(data => {
            posts.innerHTML = "";
            data.forEach(p => {
                posts.innerHTML += `<p>${p.content}</p>`;
            });
        });
}