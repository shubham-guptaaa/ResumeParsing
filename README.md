# Resume Parsing & Job Matching System

A **rule-based** resume parsing and job matching system built with Node.js and Express.
No LLMs, no external AI APIs — 100% regex and keyword dictionary matching.



## Setup

### Backend

```bash
cd server
npm install
npm start            # production → node server.js (port 3001)
npm run dev          # development → nodemon server.js (port 3001)
```

### Frontend

```bash
cd client
npm install
npm run dev          # starts Vite dev server on port 5173 by default
```

> Run backend first, then start the frontend to connect the app to `http://localhost:3001`.

---

## API Endpoints

### `GET /health`
Returns server status.

```json
{ "status": "ok", "timestamp": "2026-04-15T17:00:00.000Z" }
```

---

### `POST /api/v1/match` — Text Mode

Send resume and JD text directly in the JSON body.

**Request**
```json
{
  "resumeText": "John Doe\njohn@email.com\n\n5 years of experience\nSkills: Java, Spring Boot, MySQL...",
  "jds": [
    {
      "jobId": "JD001",
      "jdText": "Role: Backend Developer\nSalary: 12 LPA\n4+ years of experience\n\nRequired Skills\nJava, Spring Boot, Kafka..."
    }
  ]
}
```

**Response**
```json
{
  "name": "John Doe",
  "salary": "14 LPA",
  "yearOfExperience": 5,
  "resumeSkills": ["Java", "Spring Boot", "MySQL", "Docker"],
  "matchingJobs": [
    {
      "jobId": "JD001",
      "role": "Backend Developer",
      "aboutRole": "We are looking for a skilled backend developer...",
      "salary": "12 LPA",
      "yearOfExperience": 4,
      "skillsAnalysis": [
        { "skill": "Java",        "presentInResume": true },
        { "skill": "Spring Boot", "presentInResume": true },
        { "skill": "Kafka",       "presentInResume": false }
      ],
      "matchingScore": 66.67
    }
  ]
}
```

---

### `POST /api/v1/match/upload` — PDF Mode

Upload PDF files using `multipart/form-data`.

| Field    | Type   | Description                           |
|----------|--------|---------------------------------------|
| `resume` | File   | candidate resume PDF (required)       |
| `jd`     | File[] | one or more job description PDFs      |



Response structure is the same as the text-mode endpoint.

---

## Extraction Logic

### Name
Scans the first 10 lines and returns the first line that looks like a name, excluding email, phone, URLs, and other non-name lines.

### Salary
Regex-based extraction supports:
- Indian formats: `12 LPA`, `₹10,00,000 per annum`, `8L CTC`
- Global formats: `$80,000/year`, `USD 90K`

### Years of Experience
1. Explicit statements such as `5 years of experience`, `4+ years`, or `fresher`
2. Date-range arithmetic from ranges like `Jan 2020 – Dec 2022`
3. Falls back to `0` if no experience is detected

### Skills
- Uses a dictionary of canonical skills with aliases
- Word-boundary aware matching prevents partial hits (for example, `C` will not match `C++`)

### Matching Score
```
matchingScore = (matched JD skills / total JD skills) × 100
```
- Required and optional skills are both counted toward the total
- Results are sorted by score in descending order


