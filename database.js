const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./secure_internship.db', (err) => {
    if (err) console.error('DB Error:', err.message);
    else console.log('Connected to SQLite Database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS internships (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        mode TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        internship_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        FOREIGN KEY(internship_id) REFERENCES internships(id)
    )`);
});

module.exports = db;