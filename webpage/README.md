# MOC Project Intake Form

A web application for submitting MOC (Massachusetts Open Cloud) project intake forms. The application features a user-friendly interface with client-side validation and stores submissions in an SQLite database.

## Features

- Complete web form based on the MOC_Intake_Form template
- **Gray example text** that appears in empty fields and disappears when users add their own input
- **Google Gemini AI integration** for intelligent feedback on form fields (optional)
- Client-side JavaScript validation (all fields required)
- SQLite database storage
- RESTful API for form submission
- Responsive design with sliding AI feedback panel

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

3. **(Optional)** Configure Google Gemini AI for feedback:
   - Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - If you skip this step, the application will work normally but AI feedback buttons will be hidden

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

## Using AI Feedback

If you have configured a Google Gemini API key:

1. Fill in any form field with your own content
2. Click the **"Get AI Feedback"** button next to the field
3. An AI feedback panel will slide in from the right with suggestions and recommendations
4. Review the feedback and refine your input as needed
5. Click the × button or click outside the panel to close it

**Note:** AI feedback is only available for fields with actual user input (not example text).

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

### GET /api/gemini-status
Check if Google Gemini AI is available.

**Response:**
```json
{
  "available": true
}
```

### POST /api/gemini-feedback
Get AI feedback on a form field.

**Request Body:**
```json
{
  "fieldName": "Project Name",
  "fieldValue": "My Project",
  "fieldDescription": "Brief description of the field"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": "AI-generated feedback text"
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
- **Google Generative AI SDK** for AI-powered feedback (optional)
- **dotenv** for environment variable management
- Vanilla JavaScript for client-side functionality

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Notes

- The database file is stored in `../data/intake_forms.db`
- The server runs on port 3000 by default
- Form submissions are stored permanently in the database
- **Example text behavior:**
  - All fields display gray example text when empty
  - Example text automatically disappears when you click into a field
  - If you leave a field empty, the example text reappears
  - Example text is not submitted with the form (fields must have real user input)
- AI feedback requires a valid Google Gemini API key in the `.env` file
- Without an API key, AI feedback buttons are automatically hidden
