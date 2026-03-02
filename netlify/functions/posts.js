let posts = [];

exports.handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  // event.path might be like '/.netlify/functions/posts' or '/.netlify/functions/posts/123/comments'
  const path = (event.path || '').replace(/\/$/, '');
  const parts = path.split('/');
  const idx = parts.indexOf('posts');
  const rest = idx >= 0 ? parts.slice(idx + 1) : [];

  try {
    if (event.httpMethod === 'GET' && rest.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    }

    if (event.httpMethod === 'POST') {
      // Create post: POST /.netlify/functions/posts
      if (rest.length === 0) {
        const body = JSON.parse(event.body || '{}');
        const { user, content } = body;
        if (!user || !content) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Ungültige Daten' }) };
        }

        const post = { id: Date.now(), user, content, date: new Date().toLocaleString(), comments: [] };
        posts.unshift(post);
        return { statusCode: 200, headers, body: JSON.stringify(post) };
      }

      // Add comment: POST /.netlify/functions/posts/:id/comments
      if (rest.length === 2 && rest[1] === 'comments') {
        const id = Number(rest[0]);
        const post = posts.find(p => p.id === id);
        if (!post) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Post nicht gefunden' }) };
        }

        const body = JSON.parse(event.body || '{}');
        const { user, text } = body;
        if (!user || !text) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: 'Ungültige Daten' }) };
        }

        post.comments.push({ user, text, date: new Date().toLocaleString() });
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Kommentar gespeichert' }) };
      }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Nicht gefunden' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: err.message }) };
  }
};
