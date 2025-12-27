//login as an existing user
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

//register a new user
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

