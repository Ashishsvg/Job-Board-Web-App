const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");
const PORT = 3000;

// ✅ Set up the database
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT,
  role TEXT
)`);

db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
  if (row.count === 0) {
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ["admin", "admin123", "admin"]);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, ["student", "stud123", "student"]);
  }
});

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
    const extname = path.extname(filePath);
    const contentType = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
    }[extname] || "text/plain";

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
      }
    });
  }

  // ✅ Correct login logic using SQLite
  if (req.method === "POST" && req.url === "/login") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const { username, password, role } = JSON.parse(body);

      db.get(
        `SELECT * FROM users WHERE username = ? AND password = ? AND role = ?`,
        [username, password, role],
        (err, user) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Server error" }));
          } else if (user) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, role: user.role }));
          } else {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "Invalid credentials" }));
          }
        }
      );
    });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
