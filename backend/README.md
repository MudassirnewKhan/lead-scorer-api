# Lead Scoring Backend API

This is a Node.js backend service for scoring leads based on custom rules and AI assessment. It accepts CSV lead uploads, sets offer context, processes leads, and returns scored results.

---


## Features

-   **RESTful API:** Clean and well-documented API for managing offers, uploading leads, and retrieving results.
-   **Hybrid Scoring Pipeline:**    
    -   **Rule Layer:** Scores leads based on objective criteria like role, industry, and data completeness.
    -   **AI Layer:** Uses Google Gemini to analyze qualitative data (like a LinkedIn bio) to assess buying intent.
-   **CSV Upload:** Allows for batch processing of leads by uploading a simple CSV file.
-   **In-Memory Storage:** A lightweight solution for storing offer and lead data for a single session, making it easy to test and deploy.

---

## Getting Started

### Prerequisites

- Node.js (v14 or above recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lead-scoring-backend.git
   cd lead-scoring-backend
   npm install

2. Create .env file:
  GEMINI_API_KEY=your_api_key_here
  PORT=8080




3. start server:

  npm start




## API Usage

You can interact with the API using `curl` or any API client like Postman. The base URL for a local server is `http://localhost:8080`. The following endpoints must be called in sequence.

# Step 1: Set the Offer Context
# This defines the product you are scoring leads against.
curl -X POST http://localhost:8080/api/offer \
-H "Content-Type: application/json" \
-d '{
  "name": "AI Outreach Automation",
  "value_props": ["24/7 outreach", "6x more meetings"],
  "ideal_use_cases": ["B2B SaaS mid-market"]
}'


# Step 2: Upload the Leads CSV
# This sends the leads from your local file to the server.
curl -X POST http://localhost:8080/api/leads/upload \
-F "leadsFile=@leads.csv"


# Step 3: Trigger the Scoring Process
# This tells the server to score the uploaded leads against the offer.
curl -X POST http://localhost:8080/api/score


# Step 4: Get the Final Results
# This retrieves the scored leads from the server's memory.
curl http://localhost:8080/api/results




## Scoring Logic & AI Prompt

The lead scoring combines two layers for a final score out of 100:

### 1. Rule-Based Scoring (Up to 50 points)
- **Role Relevance:**
  - +20 points for decision-makers (e.g., head, vp, director, c-level, founder)
  - +10 points for influencers (e.g., manager, lead, senior)
- **Industry Match:** +20 points if lead’s industry matches offer’s ideal use cases
- **Data Completeness:** +10 points if all lead fields are filled

### 2. AI-Powered Scoring (Up to 50 points)
- Sends lead and offer data to Google Gemini AI for intent analysis
- Maps AI intent to points:
  - High intent: 50 points
  - Medium intent: 30 points
  - Low intent: 10 points

### AI Prompt Example

The AI receives lead and product info and returns JSON with:
- `"intent"`: `"High"`, `"Medium"`, or `"Low"`
- `"reasoning"`: A brief explanation for the intent

Example AI response:

```json
{"intent":"High","reasoning":"The lead's role as Head of Growth in SaaS perfectly matches the ideal profile."}


my running kink of vercel -
https://lead-scorer-api-4za6.vercel.app/