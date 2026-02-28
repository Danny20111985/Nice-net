const API = "/api/posts";

function login() {
    const username = document.getElementById("username").value.trim();

    if (username.length < 3) {
        alert("Username muss mindestens 3 Zeichen haben");
        return;
    }

    localStorage.setItem("user", username);
    showDashboard();
}

function logout() {
    localStorage.removeItem("user");
    location.reload();
}

function showDashboard() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadPosts();
}

async function createPost() {
    const content = document.getElementById("newPost").value.trim();
    const user = localStorage.getItem("user");

    if (!content || !user) return;

    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, content })
    });

    if (!res.ok) {
        console.error("Fehler beim Posten");
        return;
    }

    document.getElementById("newPost").value = "";
    loadPosts();
}

async function loadPosts() {
    const res = await fetch(API);

    if (!res.ok) {
        console.error("API Fehler:", res.status);
        return;
    }

    const posts = await res.json();

    const container = document.getElementById("postsList");
    container.innerHTML = "";

    posts.forEach(post => {
        const div = document.createElement("div");
        div.className = "post";

        const user = document.createElement("strong");
        user.textContent = post.user;

        const content = document.createElement("div");
        content.textContent = post.content;

        const date = document.createElement("small");
        date.textContent = post.date;

        const commentInput = document.createElement("input");
        commentInput.placeholder = "Kommentar...";
        commentInput.id = "comment-" + post.id;

        const commentButton = document.createElement("button");
        commentButton.textContent = "Senden";
        commentButton.onclick = () => addComment(post.id);

        const commentsDiv = document.createElement("div");

        post.comments.forEach(c => {
            const cDiv = document.createElement("div");
            cDiv.className = "comment";

            const cUser = document.createElement("strong");
            cUser.textContent = c.user + ": ";

            const cText = document.createElement("span");
            cText.textContent = c.text;

            cDiv.appendChild(cUser);
            cDiv.appendChild(cText);
            commentsDiv.appendChild(cDiv);
        });

        div.appendChild(user);
        div.appendChild(document.createElement("br"));
        div.appendChild(content);
        div.appendChild(date);
        div.appendChild(document.createElement("hr"));
        div.appendChild(commentInput);
        div.appendChild(commentButton);
        div.appendChild(commentsDiv);

        container.appendChild(div);
    });
}

async function addComment(id) {
    const input = document.getElementById("comment-" + id);
    const text = input.value.trim();
    const user = localStorage.getItem("user");

    if (!text || !user) return;

    const res = await fetch(API + "/" + id + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, text })
    });

    if (!res.ok) {
        console.error("Kommentar Fehler");
        return;
    }

    loadPosts();
}

window.onload = () => {
    if (localStorage.getItem("user")) {
        showDashboard();
    }
};