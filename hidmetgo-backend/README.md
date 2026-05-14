# OddJobs Backend API

AI-powered backend server for the OddJobs mobile app using Google Gemini and Flask.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
# Add your Google API key for Gemini
```

### 4. Run the Server

```bash
python app.py
```

Server will start at `http://localhost:5000`

## API Endpoints

### Health Check

```
GET /health
```

Check if server is running.

### Process Request (AI Agent)

```
POST /api/agent/process
Content-Type: application/json

{
    "message": "user question here",
    "user_id": "user123",
    "context": "optional context"
}
```

### Search Craftsmen

```
POST /api/hire/search
Content-Type: application/json

{
    "category": "plumbing",
    "location": "optional location",
    "user_id": "user123"
}
```

### Get Job Listings

```
GET /api/work/listings?category=plumbing&user_id=user123
```

### Create Service Request

```
POST /api/request/create
Content-Type: application/json

{
    "type": "hire|find_work",
    "category": "plumbing",
    "description": "detailed description",
    "budget": "$100-150",
    "user_id": "user123"
}
```

### Get User Profile

```
GET /api/user/profile?user_id=user123
```

## Mobile App Integration

Connect from React Native app:

```typescript
const API_URL = "http://your_server_ip:5000";

// Example: Send request to AI agent
const response = await fetch(`${API_URL}/api/agent/process`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: userInput,
    user_id: userId,
  }),
});

const data = await response.json();
console.log(data.response);
```

## Architecture

```
hidmetgo-backend/
├── app.py              # Main Flask server
├── requirements.txt    # Python dependencies
├── .env.example        # Example environment variables
└── app/
    └── hidmetgo_agent/
        └── agent.py    # AI Agent definition
```

## TODO

- [ ] Connect to Supabase database
- [ ] Implement real craftsman/job search queries
- [ ] Add user authentication
- [ ] Integrate Google Gemini agent responses
- [ ] Deploy to cloud (Firebase, Heroku, Railway)
- [ ] Add error handling and logging

## Development

To reload on file changes:

```bash
pip install flask-reloader
```

For production deployment:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
