# API Quick Reference - 3-Step Workflow

## ✅ New Workflow (Fixed 413 Error)

### Step 1: Upload LinkedIn Data
```http
POST /api/linked/create/file/:userId
Content-Type: application/json

{
  "LinkedinURL": "https://linkedin.com/in/john-doe",
  "content": {
    "name": "John Doe",
    "title": "CEO",
    "company": "TechCorp",
    "about": "...",
    "experience": [...],
    "skills": [...]
  },
  "posts": [
    {
      "content": "Post text...",
      "likes": 150,
      "comments": 25
    }
  ]
}
```

**Response:**
```json
{
  "message": "LinkedIn data uploaded successfully",
  "profileId": "abc123",
  "postId": "xyz789"
}
```

---

### Step 2: Save Product Description
```http
POST /api/linked/save-disc-request/:userId
Content-Type: application/json

{
  "LinkedinURL": "https://linkedin.com/in/john-doe",
  "productDescription": "Your product/service description"
}
```

**Response:**
```json
{
  "message": "Request saved successfully. Ready for analysis.",
  "LinkedinURL": "...",
  "productDescription": "..."
}
```

---

### Step 3: Analyze Profile
```http
POST /api/linked/analyze-disc/:userId
Content-Type: application/json

(No body required - uses saved data)
```

**Response:**
```json
{
  "message": "DISC analysis completed successfully",
  "analysisId": "disc123",
  "analysis": {
    "executive": "...",
    "personality": {
      "disc": {"D": 75, "I": 60, "S": 45, "C": 70},
      "bullets": [...],
      "primaryType": "Dominance"
    },
    "talkingPoints": [...],
    "openingScripts": [...],
    "objectionHandling": [...],
    "nextActions": [...],
    "confidence": {
      "overall": 85,
      "breakdown": {...}
    }
  }
}
```

---

### Step 4: Get Latest Analysis
```http
GET /api/linked/disc/latest/:userId
```

**Response:** Complete analysis object

---

## 📊 All Available Endpoints

| Endpoint | Method | Purpose | Payload |
|----------|--------|---------|---------|
| `/api/linked/create/file/:userId` | POST | Upload profile + posts | LinkedinURL, content, posts |
| `/api/linked/save-disc-request/:userId` | POST | Save product description | LinkedinURL, productDescription |
| `/api/linked/analyze-disc/:userId` | POST | Run DISC analysis | None |
| `/api/linked/disc/latest/:userId` | GET | Get latest analysis | None |
| `/api/linked/disc/analysis/:analysisId` | GET | Get specific analysis | None |
| `/api/linked/disc/user/:userId` | GET | Get all user analyses | ?page=1&limit=10 |
| `/api/linked/disc/summary/:analysisId` | GET | Get analysis summary | None |
| `/api/linked/get/:id` | GET | Get user LinkedIn data | None |
| `/api/linked/delete/:id` | DELETE | Delete LinkedIn data | None |

---

## 🧪 Test Commands

```bash
# Start server
npm run dev

# Test Step 1: Upload LinkedIn data
curl -X POST http://localhost:5000/api/linked/create/file/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "LinkedinURL": "https://linkedin.com/in/test",
    "content": {
      "name": "Test User",
      "title": "CEO",
      "company": "TestCorp"
    },
    "posts": []
  }'

# Test Step 2: Save product description
curl -X POST http://localhost:5000/api/linked/save-disc-request/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "LinkedinURL": "https://linkedin.com/in/test",
    "productDescription": "AI-powered CRM software"
  }'

# Test Step 3: Analyze
curl -X POST http://localhost:5000/api/linked/analyze-disc/USER_ID

# Get results
curl http://localhost:5000/api/linked/disc/latest/USER_ID
```

---

## 🎯 Chrome Extension Flow

```javascript
// Step 1: Upload LinkedIn Data
const uploadResponse = await fetch(`${API_URL}/api/linked/create/file/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    LinkedinURL: url,
    content: profileData,
    posts: postsData
  })
});

// Step 2: Save Product Description
const saveResponse = await fetch(`${API_URL}/api/linked/save-disc-request/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    LinkedinURL: url,
    productDescription: productDesc
  })
});

// Step 3: Analyze
const analyzeResponse = await fetch(`${API_URL}/api/linked/analyze-disc/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

// Step 4: Display Results
const result = await analyzeResponse.json();
displayResults(result.analysis);
```

---

## ⚡ Benefits

✅ **No 413 Error** - Smaller payloads
✅ **Better UX** - Step-by-step progress
✅ **Flexible** - Can change product description without re-uploading
✅ **Reliable** - Each step independent
✅ **Fast** - Profile data cached in database

---

## 🔒 User Model Updates

Added to UserModel:
```javascript
pendingLinkedInURL: { type: String }
pendingProductDescription: { type: String }
```

These fields store the data temporarily until analysis completes, then they're cleared.
