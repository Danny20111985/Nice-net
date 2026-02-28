const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// API ROUTEN ZUERST
let posts = [];

/* Alle Posts */
app.get("/api/posts", (req, res) => {
    res.json(posts);
});

/* Post erstellen */
app.post("/api/posts", (req, res) => {
    const { user, content } = req.body;

    if (!user || !content) {
        return res.status(400).json({ message: "Ungültige Daten" });
    }

    const post = {
        id: Date.now(),
        user,
        content,
        date: new Date().toLocaleString(),
        comments: []
    };

    posts.unshift(post);
    res.json(post);
});

/* Kommentar hinzufügen */
app.post("/api/posts/:id/comments", (req, res) => {
    const post = posts.find(p => p.id == req.params.id);

    if (!post) {
        return res.status(404).json({ message: "Post nicht gefunden" });
    }

    const { user, text } = req.body;

    if (!user || !text) {
        return res.status(400).json({ message: "Ungültige Daten" });
    }

    post.comments.push({
        user,
        text,
        date: new Date().toLocaleString()
    });

    res.json({ message: "Kommentar gespeichert" });
});

// DANN ERST Frontend bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Fallback → immer index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
});