# DISC Profile Analysis API

## Overview
The DISC Profile API analyzes LinkedIn profiles and posts to generate comprehensive sales intelligence reports. It uses NLP, heuristics, and OpenAI to create personalized insights including personality profiles, talking points, opening scripts, objection handling strategies, and follow-up cadences.

## Features
- **DISC Personality Analysis**: Analyzes profiles and posts to determine Dominance, Influence, Steadiness, and Conscientiousness scores
- **Confidence Scoring**: 5-factor confidence score (0-100) based on data completeness, quality, recency, agreement, and signal strength
- **Personalized Scripts**: Generates opening scripts for LinkedIn DM, email, phone, and WhatsApp
- **Objection Handling**: AI-generated common objections and tailored responses
- **Follow-up Cadence**: Recommended action plan with timing and channels
- **Talking Points**: Prioritized conversation topics based on recent posts
- **Personalization Cues**: Extracted details from profile and posts for personalized outreach

## Database Structure

### DISCProfile Model
Stores complete analysis results including:
- User and LinkedIn profile references
- Product description
- Executive summary
- DISC personality scores and bullets
- Talking points (prioritized)
- Opening scripts (multi-channel)
- Objection handling strategies
- Personalization cues
- Next actions and follow-up plan
- Confidence score with breakdown
- Analysis metadata

## API Endpoints

### 1. Analyze LinkedIn Profile
**POST** `/api/disc/analyze`

Analyzes a LinkedIn profile with product description and stores the result.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "linkedinContentId": "linkedin_content_id_here",
  "linkedinPostId": "linkedin_post_id_here",
  "productDescription": "Your product/service description"
}
```

**Notes:**
- `userId` is required
- `productDescription` is required
- If `linkedinContentId` and `linkedinPostId` are not provided, the API will use the ones linked to the user

**Response:**
```json
{
  "message": "DISC Profile analysis completed successfully",
  "analysis": {
    "userId": "...",
    "linkedinContentId": "...",
    "productDescription": "...",
    "executive": "DISC: High D / Low S. Be direct and data-driven.",
    "personality": {
      "disc": { "D": 78, "I": 42, "S": 22, "C": 58 },
      "bullets": [
        "Fast decision-maker",
        "Prefers short, data-backed talks"
      ],
      "primaryType": "D",
      "secondaryType": "C"
    },
    "talkingPoints": [
      {
        "topic": "Growth",
        "why": "Mentioned 5 times in recent posts",
        "priority": 1
      }
    ],
    "openingScripts": {
      "linkedin_dm": ["Hi {Name}, congrats on growth..."],
      "email": [{"subject": "Quick question", "body": "..."}],
      "phone": "Opener line",
      "whatsapp": "Opener message"
    },
    "objectionHandling": [
      {
        "objection": "Too busy",
        "response": "Send 1-page case study...",
        "category": "timing"
      }
    ],
    "personalizationCues": [
      "Mentioned sustainability project"
    ],
    "nextActions": {
      "plan": [
        {"day": 0, "action": "DM", "channel": "LinkedIn", "note": "..."}
      ],
      "cadence": "3-touch sequence"
    },
    "confidence": {
      "score": 82,
      "breakdown": {
        "completeness": 0.9,
        "sampleQuality": 0.85,
        "recency": 0.78,
        "agreement": 0.82,
        "signalStrength": 0.88
      },
      "warnings": []
    },
    "dataSources": ["profile_id", "posts_20_items"],
    "analysisMetadata": {
      "profileFieldsUsed": 12,
      "postsAnalyzed": 20,
      "avgPostEngagement": "45 interactions",
      "dominantTopics": ["Growth", "Innovation", "Team"],
      "writingTone": "Formal"
    }
  }
}
```

### 2. Get DISC Profile by ID
**GET** `/api/disc/profile/:id`

Retrieves a specific DISC profile analysis by its ID.

**Response:** Returns the complete DISC profile document with populated user and LinkedIn data.

### 3. Get DISC Profiles by User
**GET** `/api/disc/user/:userId`

Retrieves all DISC profile analyses for a specific user, sorted by most recent.

**Response:**
```json
{
  "count": 3,
  "profiles": [...]
}
```

### 4. Get All DISC Profiles (Paginated)
**GET** `/api/disc/all?page=1&limit=10&name=John&minConfidence=70`

Retrieves all DISC profiles with pagination and filtering options.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `name` (optional): Filter by prospect name
- `minConfidence` (optional): Filter by minimum confidence score

**Response:**
```json
{
  "profiles": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 47
}
```

### 5. Delete DISC Profile
**DELETE** `/api/disc/delete/:id`

Deletes a specific DISC profile analysis.

**Response:**
```json
{
  "message": "DISC Profile deleted successfully",
  "deletedProfile": {...}
}
```

### 6. Update DISC Profile
**PUT** `/api/disc/update/:id`

Updates a DISC profile with new data.

**Request Body:** Any fields from the DISC profile schema

**Response:**
```json
{
  "message": "DISC Profile updated successfully",
  "profile": {...}
}
```

### 7. Reanalyze DISC Profile
**POST** `/api/disc/reanalyze/:id`

Reanalyzes an existing DISC profile, optionally with a new product description.

**Request Body:**
```json
{
  "productDescription": "New product description (optional)"
}
```

**Response:**
```json
{
  "message": "DISC Profile reanalyzed successfully",
  "profile": {...}
}
```

## Confidence Score Algorithm

The confidence score (0-100) is calculated using 5 factors:

### 1. Completeness (30% weight)
- Evaluates the number of filled profile fields
- Counts available posts (optimal: 25+)
- Formula: `(profileScore * 0.6) + (postsScore * 0.4)`

### 2. Sample Quality (20% weight)
- Analyzes post content depth (word count)
- Considers engagement levels (likes, comments)
- Evaluates post types (articles vs. shares)
- Engagement-weighted scoring

### 3. Recency (15% weight)
- Posts within 7 days: 1.0 score
- Posts within 30 days: 0.8 score
- Posts within 90 days: 0.5 score
- Posts within 180 days: 0.3 score
- Older posts: 0.1 score

### 4. Agreement (20% weight)
- Consistency across profile, posts, and writing style
- Measures variance in DISC signals
- Lower variance = higher agreement

### 5. Signal Strength (15% weight)
- Dominance of primary DISC trait
- Gap between highest and second-highest scores
- Clear dominant trait = higher strength

### Rules & Caps
- Fewer than 5 posts: **capped at 50**
- Zero posts: **capped at 45**
- Low agreement (<0.5): **-10 points**
- Weak signal strength (<0.4): **-5 points**

## DISC Analysis Algorithm

### Three-Stage Analysis:

#### 1. Profile Analysis
- Analyzes job title, about section, experience
- Keyword matching for each DISC trait
- Role-based scoring adjustments

#### 2. Posts Analysis
- Content keyword analysis
- Sentence structure and punctuation patterns
- Engagement patterns
- Team vs. individual language

#### 3. Writing Style Analysis
- Average words per post and sentence
- Use of exclamation marks and questions
- Emotional vs. technical vocabulary
- Tone and formality level

### Final DISC Score
Merges all three analyses with weights:
- Profile: 35%
- Posts: 40%
- Style: 25%

## OpenAI Integration

The API uses OpenAI GPT-4o-mini for generating:
- Executive summaries
- Personality bullets
- Opening scripts (multi-channel)
- Objection handling responses
- Follow-up action plans

### Environment Variable
Set your OpenAI API key in `.env`:
```
OPENAI_SECRET_KEY="your-openai-api-key-here"
```

## Integration with Chrome Extension

### Step 1: Upload LinkedIn Data
Use the existing LinkedIn upload endpoint:
```
POST /api/linked/create/file/:userId
```

This saves profile and posts data to the database.

### Step 2: Analyze with Product Description
Call the DISC analysis endpoint:
```
POST /api/disc/analyze
```

With body:
```json
{
  "userId": "user_id_from_step_1",
  "productDescription": "Description from chrome extension form field"
}
```

### Step 3: Retrieve Results
The analysis result is returned immediately and saved to the database.

Use the GET endpoints to retrieve stored analyses anytime.

## Example Workflow for Chrome Extension

```javascript
// 1. User extracts LinkedIn data via Chrome extension
const linkedinData = {
  LinkedinURL: "https://linkedin.com/in/john-doe",
  LinkedinDec: "Product description from form field",
  content: { /* profile data */ },
  posts: [ /* posts array */ ]
};

// 2. Upload LinkedIn data
const uploadResponse = await fetch(`/api/linked/create/file/${userId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(linkedinData)
});

// 3. Analyze with DISC algorithm
const analysisResponse = await fetch('/api/disc/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId,
    productDescription: linkedinData.LinkedinDec
  })
});

const discProfile = await analysisResponse.json();
console.log(discProfile.analysis);
```

## Data Storage

All analysis results are permanently stored in MongoDB with:
- Complete DISC scores and personality insights
- Generated scripts and objection handling
- Confidence scores with breakdowns
- Metadata about the analysis
- References to original LinkedIn data
- Timestamps for tracking

## Error Handling

The API includes comprehensive error handling for:
- Missing required fields
- LinkedIn data not found
- OpenAI API failures (with fallbacks)
- Invalid user IDs
- Database connection issues

## Notes

- The API automatically uses LinkedIn data linked to the user if not explicitly provided
- OpenAI calls have fallback default responses if the API fails
- Confidence score warnings provide transparency about data limitations
- All analyses are timestamped for tracking
- The system supports reanalysis with different product descriptions

## Dependencies

Required npm packages:
- `openai`: OpenAI API integration
- `mongoose`: MongoDB ODM
- `express`: Web framework

Ensure `openai` is installed:
```bash
npm install openai
```
