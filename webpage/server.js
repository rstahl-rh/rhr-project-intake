const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Initialize Google Gemini AI (if API key is available)
let genAI = null;
let geminiModel = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('Google Gemini AI initialized');
} else {
    console.warn('GEMINI_API_KEY not found. AI feedback features will be disabled.');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database setup
const dbPath = path.join(__dirname, '../data/intake_forms.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database table
function initializeDatabase() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS intake_forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            project_overview TEXT NOT NULL,
            requestor TEXT NOT NULL,
            funding TEXT NOT NULL,
            oversight TEXT NOT NULL,
            timeline_start TEXT NOT NULL,
            timeline_duration TEXT NOT NULL,
            timeline_constraints TEXT NOT NULL,
            runtime_environment TEXT NOT NULL,
            hardware_requirements TEXT NOT NULL,
            network_requirements TEXT NOT NULL,
            storage_requirements TEXT NOT NULL,
            externalities TEXT NOT NULL,
            user_accounts TEXT NOT NULL,
            additional_notes TEXT NOT NULL,
            attachments_info TEXT NOT NULL,
            submission_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Database table ready');
        }
    });
}

// API endpoint to submit form
app.post('/api/submit-form', (req, res) => {
    const {
        project_name,
        project_overview,
        requestor,
        funding,
        oversight,
        timeline_start,
        timeline_duration,
        timeline_constraints,
        runtime_environment,
        hardware_requirements,
        network_requirements,
        storage_requirements,
        externalities,
        user_accounts,
        additional_notes,
        attachments_info
    } = req.body;

    // Validate all required fields are present
    const requiredFields = [
        'project_name', 'project_overview', 'requestor', 'funding', 'oversight',
        'timeline_start', 'timeline_duration', 'timeline_constraints',
        'runtime_environment', 'hardware_requirements', 'network_requirements',
        'storage_requirements', 'externalities', 'user_accounts',
        'additional_notes', 'attachments_info'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].trim() === '');

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            fields: missingFields
        });
    }

    const insertSQL = `
        INSERT INTO intake_forms (
            project_name, project_overview, requestor, funding, oversight,
            timeline_start, timeline_duration, timeline_constraints,
            runtime_environment, hardware_requirements, network_requirements,
            storage_requirements, externalities, user_accounts,
            additional_notes, attachments_info
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(insertSQL, [
        project_name, project_overview, requestor, funding, oversight,
        timeline_start, timeline_duration, timeline_constraints,
        runtime_environment, hardware_requirements, network_requirements,
        storage_requirements, externalities, user_accounts,
        additional_notes, attachments_info
    ], function(err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error saving form submission'
            });
        }

        res.json({
            success: true,
            message: 'Form submitted successfully',
            id: this.lastID
        });
    });
});

// API endpoint to get all submissions (optional, for viewing)
app.get('/api/submissions', (req, res) => {
    db.all('SELECT * FROM intake_forms ORDER BY submission_timestamp DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching submissions:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Error fetching submissions'
            });
        }
        res.json({
            success: true,
            data: rows
        });
    });
});

// API endpoint to check if Gemini is available
app.get('/api/gemini-status', (req, res) => {
    res.json({
        available: geminiModel !== null
    });
});

// API endpoint to get AI feedback on form field
app.post('/api/gemini-feedback', async (req, res) => {
    if (!geminiModel) {
        return res.status(503).json({
            success: false,
            message: 'AI feedback is not available. Please configure GEMINI_API_KEY.'
        });
    }

    const { fieldName, fieldValue, fieldDescription } = req.body;

    if (!fieldName || !fieldValue) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters: fieldName and fieldValue'
        });
    }

    try {
        const prompt = `You are helping review a project intake form for the Massachusetts Open Cloud (MOC).

Field: ${fieldName}
${fieldDescription ? `Description: ${fieldDescription}` : ''}

User's input:
${fieldValue}

Provide brief, constructive feedback on this field entry. Consider:
- Is it clear and specific enough?
- Are there any missing details that would be helpful?
- Does it align with typical MOC project requirements?
- Any suggestions for improvement?

Keep your feedback concise (2-4 sentences) and actionable.`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const feedback = response.text();

        res.json({
            success: true,
            feedback: feedback
        });
    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating AI feedback: ' + error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database located at: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
    });
});
