const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./database');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// 1. Get Internships (API with loading/error handling support)
app.get('/api/internships', (req, res) => {
    db.all("SELECT * FROM internships", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err.message });
        }
        res.json({ status: "success", data: rows });
    });
});

// 2. Secure Application Endpoint with Validation
app.post('/api/applications', (req, res) => {
    const { internship_id, applicant_name, applicant_email } = req.body;

    if (!internship_id || !applicant_name || !applicant_email) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicant_email)) {
        return res.status(400).json({ status: "error", message: "Invalid email format" });
    }

    // Parameterized query to prevent SQL Injection
    const query = `INSERT INTO applications (internship_id, applicant_name, applicant_email) VALUES (?, ?, ?)`;
    db.run(query, [internship_id, applicant_name, applicant_email], function(err) {
        if (err) {
            return res.status(400).json({ status: "error", message: "Failed to submit application" });
        }
        res.status(201).json({ 
            status: "success", 
            message: "Application submitted securely",
            data: { id: this.lastID, internship_id, applicant_name, applicant_email } 
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});