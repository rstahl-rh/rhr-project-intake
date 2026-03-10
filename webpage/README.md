# MOC Project Intake Form

A web application for submitting MOC (Massachusetts Open Cloud) project intake forms. The application features a user-friendly interface with client-side validation and stores submissions in an SQLite database.

## Features

- Complete web form based on the MOC_Intake_Form template
- Pre-filled example data to guide users
- Client-side JavaScript validation (all fields required)
- SQLite database storage
- RESTful API for form submission
- Responsive design

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Navigate to the webpage directory:
```bash
cd webpage
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The server will automatically create the SQLite database in the `../data/` directory on first run.

## Project Structure

```
webpage/
├── index.html          # Main form page
├── style.css           # Styling
├── script.js           # Client-side validation and form handling
├── server.js           # Express server and API endpoints
├── package.json        # Node.js dependencies
└── README.md          # This file

data/
└── intake_forms.db    # SQLite database (created automatically)
```

## API Endpoints

### POST /api/submit-form
Submit a new intake form.

**Request Body:** JSON object with all form fields

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "id": 1
}
```

### GET /api/submissions
Retrieve all form submissions (optional endpoint for viewing).

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

## Database Schema

The `intake_forms` table contains the following fields:
- id (PRIMARY KEY, AUTOINCREMENT)
- project_name
- project_overview
- requestor
- funding
- oversight
- timeline_start
- timeline_duration
- timeline_constraints
- runtime_environment
- hardware_requirements
- network_requirements
- storage_requirements
- externalities
- user_accounts
- additional_notes
- attachments_info
- submission_timestamp (DATETIME, automatically set)

## Form Validation

All fields are required. Validation occurs:
1. On field blur (when user leaves a field)
2. On form submission (comprehensive check)

Empty or whitespace-only values are not accepted.

## Development

The application uses:
- **Express.js** for the web server
- **SQLite3** for database operations
- **Body-parser** for parsing request bodies
- **CORS** for cross-origin resource sharing
- Vanilla JavaScript for client-side functionality

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Notes

- The database file is stored in `../data/intake_forms.db`
- The server runs on port 3000 by default
- Form submissions are stored permanently in the database
- The example data from the MOC_Intake_Form is pre-filled to guide users
