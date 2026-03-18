# AI Service API Endpoints

## Base URL
All endpoints are prefixed with `/ai`

---

## Analysis Endpoints

### 1. Analyze Sentiment
**POST** `/ai/analysis/sentiment`

Analyze sentiment of a text (book review, description, etc.)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "This book was absolutely amazing! The characters were well-developed and the plot kept me engaged throughout."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "text": "This book was absolutely amazing! The characters were well-developed and the plot kept me engaged throughout.",
    "sentiment": "POSITIVE",
    "confidenceScore": 0.95
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/analysis/sentiment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "This book was absolutely amazing! The characters were well-developed and the plot kept me engaged throughout."}'
```

---

### 2. Extract Genres
**POST** `/ai/analysis/genres`

Extract genre tags from book description

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "A thrilling mystery novel set in Victorian London. Detective Holmes investigates a series of bizarre murders while navigating the foggy streets and dark alleys of the city."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "genres": ["Mystery", "Historical Fiction", "Thriller"],
    "count": 3
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/analysis/genres \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "A thrilling mystery novel set in Victorian London. Detective Holmes investigates a series of bizarre murders while navigating the foggy streets and dark alleys of the city."}'
```

---

### 3. Record Interaction
**POST** `/ai/analysis/interaction`

Record a book interaction (view/rate/read) and update taste profile

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bookId": "book_12345",
  "title": "The Great Gatsby",
  "description": "A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
  "genres": ["Classic", "Fiction", "Romance"],
  "rating": 4.5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Interaction recorded and preference profile updated.",
  "data": {
    "interactionId": "int_67890",
    "profileUpdated": true,
    "newPreferences": {
      "topGenres": ["Classic", "Fiction", "Romance"],
      "averageRating": 4.5
    }
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/analysis/interaction \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "book_12345",
    "title": "The Great Gatsby",
    "description": "A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    "genres": ["Classic", "Fiction", "Romance"],
    "rating": 4.5
  }'
```

---

### 4. Get Recommendations
**POST** `/ai/analysis/recommend`

Get personalized book recommendations from a candidate pool

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "books": [
    {
      "bookId": "book_001",
      "title": "1984",
      "description": "A dystopian social science fiction novel and cautionary tale.",
      "genres": ["Dystopian", "Science Fiction", "Classic"]
    },
    {
      "bookId": "book_002",
      "title": "Pride and Prejudice",
      "description": "A romantic novel of manners that follows the character development of Elizabeth Bennet.",
      "genres": ["Romance", "Classic", "Fiction"]
    },
    {
      "bookId": "book_003",
      "title": "The Hobbit",
      "description": "A fantasy novel about the adventures of hobbit Bilbo Baggins.",
      "genres": ["Fantasy", "Adventure", "Classic"]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "bookId": "book_002",
        "title": "Pride and Prejudice",
        "score": 0.92,
        "reason": "Matches your preference for Classic and Romance genres"
      },
      {
        "bookId": "book_001",
        "title": "1984",
        "score": 0.78,
        "reason": "Aligns with your interest in Classic literature"
      }
    ],
    "count": 2
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/analysis/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "books": [
      {
        "bookId": "book_001",
        "title": "1984",
        "description": "A dystopian social science fiction novel and cautionary tale.",
        "genres": ["Dystopian", "Science Fiction", "Classic"]
      },
      {
        "bookId": "book_002",
        "title": "Pride and Prejudice",
        "description": "A romantic novel of manners that follows the character development of Elizabeth Bennet.",
        "genres": ["Romance", "Classic", "Fiction"]
      }
    ]
  }'
```

---

### 5. Get User Profile
**GET** `/ai/analysis/profile`

Retrieve current user's taste profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "topGenres": ["Classic", "Fiction", "Romance", "Mystery"],
    "averageRating": 4.2,
    "totalInteractions": 15,
    "favoriteAuthors": ["F. Scott Fitzgerald", "Jane Austen"],
    "readingHistory": [
      {
        "bookId": "book_12345",
        "title": "The Great Gatsby",
        "rating": 4.5,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (404) - No Profile:**
```json
{
  "success": false,
  "message": "No profile found. Start reading to build your taste profile!"
}
```

**Testing with cURL:**
```bash
curl -X GET http://localhost:3000/ai/analysis/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary Endpoints

### 6. Upload PDF for Summary
**POST** `/ai/summary/upload`

Upload a PDF file and get an AI-generated summary

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file (required)
- `bookId`: string (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": "This book explores the themes of love, loss, and redemption through the journey of its protagonist...",
    "keyPoints": [
      "The main character undergoes significant personal growth",
      "The story is set in post-war Europe",
      "Themes of forgiveness and reconciliation are central"
    ],
    "metadata": {
      "title": "Sample Book",
      "author": "John Doe",
      "pages": 245,
      "detectedLanguage": "English",
      "languageCode": "eng"
    },
    "performance": {
      "fromCache": false,
      "processingTimeMs": 3500,
      "model": "gemini-pro",
      "totalTimeMs": 4200
    }
  }
}
```

**Response (422) - Unreadable PDF:**
```json
{
  "success": false,
  "message": "Could not extract readable text from this PDF. It may be image-based or encrypted."
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/summary/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/book.pdf" \
  -F "bookId=book_12345"
```

---

### 7. Summarize PDF from URL
**POST** `/ai/summary/url`

Summarize a PDF from a remote URL (e.g., from BookUpload service S3 URL)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/books/sample-book.pdf",
  "bookId": "book_12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": "This book explores the themes of love, loss, and redemption...",
    "keyPoints": [
      "The main character undergoes significant personal growth",
      "The story is set in post-war Europe",
      "Themes of forgiveness and reconciliation are central"
    ],
    "sourceUrl": "https://s3.amazonaws.com/bucket/books/sample-book.pdf",
    "metadata": {
      "title": "Sample Book",
      "author": "John Doe",
      "pages": 245,
      "detectedLanguage": "English"
    },
    "performance": {
      "fromCache": false,
      "processingTimeMs": 3500,
      "model": "gemini-pro",
      "totalTimeMs": 4200
    }
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/summary/url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://s3.amazonaws.com/bucket/books/sample-book.pdf",
    "bookId": "book_12345"
  }'
```

---

### 8. Summarize Text
**POST** `/ai/summary/text`

Summarize raw text directly (no PDF needed)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "The quick brown fox jumps over the lazy dog. This is a sample text that needs to be summarized. It contains multiple sentences and paragraphs to demonstrate the summarization capability. The AI will analyze this text and provide a concise summary along with key points extracted from the content.",
  "bookId": "book_12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": "A sample text demonstrating summarization capability with multiple sentences.",
    "keyPoints": [
      "Contains sample text for demonstration",
      "Multiple sentences and paragraphs",
      "AI analyzes and summarizes content"
    ],
    "metadata": {
      "charCount": 287,
      "wordCount": 42,
      "detectedLanguage": "English"
    },
    "performance": {
      "fromCache": false,
      "processingTimeMs": 1200,
      "model": "gemini-pro",
      "totalTimeMs": 1350
    }
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/summary/text \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The quick brown fox jumps over the lazy dog. This is a sample text that needs to be summarized. It contains multiple sentences and paragraphs to demonstrate the summarization capability.",
    "bookId": "book_12345"
  }'
```

---

## TTS (Text-to-Speech) Endpoints

### 9. Get Supported Languages
**GET** `/ai/tts/languages`

List all Sarvam-supported TTS languages and available voices

**Headers:**
```
No authentication required (Public endpoint)
```

**Response (200):**
```json
{
  "success": true,
  {
    "languages": [
      {
        "code": "en",
        "name": "English",
        "availableVoices": ["en-US-Standard-A", "en-US-Standard-B"]
      },
      {
        "code": "hi",
        "name": "Hindi",
        "availableVoices": ["hi-IN-Standard-A", "hi-IN-Standard-B"]
      },
      {
        "code": "ta",
        "name": "Tamil",
        "availableVoices": ["ta-IN-Standard-A"]
      }
    ],
    "count": 3,
    "model": "bulbul:v1",
    "provider": "Sarvam.ai"
  }
}
```

**Testing with cURL:**
```bash
curl -X GET http://localhost:3000/ai/tts/languages
```

---

### 10. Generate Speech (Stream)
**POST** `/ai/tts/generate`

Generate and stream WAV audio using Sarvam Bulbul v3

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Hello, this is a test of the text-to-speech system. The audio will be streamed directly to you.",
  "speaker": "en-US-Standard-A",
  "pitch": 1.0,
  "pace": 1.0,
  "targetLanguage": "en"
}
```

**Response (200):**
- Content-Type: `audio/wav`
- Content-Disposition: `attachment; filename="tts_1234567890.wav"`
- X-Detected-Language: `English`
- X-Language-Used: `en`
- X-Speaker: `en-US-Standard-A`
- Body: WAV audio stream

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/tts/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the text-to-speech system.",
    "speaker": "en-US-Standard-A",
    "pitch": 1.0,
    "pace": 1.0,
    "targetLanguage": "en"
  }' \
  --output audio.wav
```

---

### 11. Generate Speech URL
**POST** `/ai/tts/generate-url`

Generate audio and return a temporary download URL

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Hello, this is a test of the text-to-speech system. You can download the audio using the provided URL.",
  "speaker": "en-US-Standard-A",
  "pitch": 1.0,
  "pace": 1.0,
  "targetLanguage": "en"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://localhost:3000/ai/tts/download/tts_1234567890.wav",
    "format": "wav",
    "expiresInMinutes": 10,
    "detectedLanguage": {
      "code": "en",
      "name": "English"
    },
    "languageUsed": "en",
    "speaker": "en-US-Standard-A",
    "model": "bulbul:v1"
  }
}
```

**Testing with cURL:**
```bash
curl -X POST http://localhost:3000/ai/tts/generate-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test of the text-to-speech system.",
    "speaker": "en-US-Standard-A",
    "pitch": 1.0,
    "pace": 1.0,
    "targetLanguage": "en"
  }'
```

---

### 12. Download Audio File
**GET** `/ai/tts/download/:fileName`

Download a previously generated audio file

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `fileName`: Name of the audio file (e.g., `tts_1234567890.wav`)

**Response (200):**
- Content-Type: `audio/wav`
- Content-Disposition: `attachment; filename="tts_1234567890.wav"`
- Body: WAV audio file

**Response (404) - File Not Found:**
```json
{
  "success": false,
  "message": "Audio file not found or expired."
}
```

**Testing with cURL:**
```bash
curl -X GET http://localhost:3000/ai/tts/download/tts_1234567890.wav \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded_audio.wav
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Text is required."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required."
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An unexpected error occurred."
}
```

---

## Rate Limiting

All endpoints have rate limiting applied:
- **Analysis endpoints**: Limited requests per user
- **Summary endpoints**: Limited requests per user
- **TTS endpoints**: Limited requests per user

---

## Authentication

All endpoints (except `/ai/tts/languages`) require authentication via Bearer token in the Authorization header.

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
