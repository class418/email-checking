const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());

const MAILS_DIR = path.join(__dirname, "mails");

// mailsフォルダがなければ作成
if (!fs.existsSync(MAILS_DIR)) {
  fs.mkdirSync(MAILS_DIR);
}

// メール保存API
app.post("/save-email", (req, res) => {
  const email = req.body.email;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email" });
  }

  const filename = `${Date.now()}.txt`;
  const filepath = path.join(MAILS_DIR, filename);

  fs.writeFile(filepath, email, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save email" });
    }
    res.json({ status: "success" });
  });
});

// メール一覧取得API
app.get("/mails", (req, res) => {
  fs.readdir(MAILS_DIR, (err, files) => {
    if (err) {
      return res.status(500).send("Failed to read mails directory");
    }
    res.json(files);
  });
});

// 個別メール内容取得API
app.get("/mails/:filename", (req, res) => {
  const filename = req.params.filename;
  if (!filename.match(/^\d+\.txt$/)) {
    return res.status(400).send("Invalid filename");
  }

  const filepath = path.join(MAILS_DIR, filename);
  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).send("File not found");
    }
    res.type("text/plain").send(data);
  });
});

// メール一覧をHTMLで表示するページ
app.get("/mail-list", (req, res) => {
  fs.readdir(MAILS_DIR, (err, files) => {
    if (err) {
      return res.status(500).send("Failed to read mails directory");
    }
    const links = files
      .sort((a, b) => b.localeCompare(a)) // 新しい順に並べ替え
      .map(f => `<li><a href="/mails/${f}" target="_blank">${f}</a></li>`)
      .join("");
    res.send(`
      <html>
      <head>
        <title>保存されたメール一覧</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #333; }
          ul { list-style: none; padding: 0; }
          li { margin-bottom: 6px; }
          a { text-decoration: none; color: #1a73e8; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>保存されたメール一覧</h1>
        <ul>${links}</ul>
      </body>
      </html>
    `);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
