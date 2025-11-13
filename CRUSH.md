# CRUSH.md - GitHub Music Generator

## Project Overview
AI-powered Node.js/Express application that scans GitHub repositories and generates creative music prompts and lyrics using DeepSeek AI. The app analyzes code structure, themes, and technical concepts to transform them into musical inspiration.

## Development Commands

### Running the Application
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

### Testing
```bash
# Run tests (uses Jest)
npm test
```

### Installation
```bash
npm install
```

## Environment Configuration

Required environment variables (copy `.env.example` to `.env`):
- `DEEPSEEK_API_KEY` - Required for AI analysis and generation
- `GITHUB_TOKEN` - GitHub Personal Access Token (increases rate limits from 60 to 5,000 requests/hour)
- `PORT` - Server port (default: 3000)

## Project Structure

```
src/
├── index.js                 # Main Express server entry point
├── routes/
│   └── api.js              # API route handlers
├── services/
│   ├── musicGenerator.js   # Main business logic coordinator
│   ├── githubScanner.js    # GitHub API integration
│   └── deepseekService.js  # DeepSeek AI API integration
└── utils/                  # Utility functions (currently empty)
public/
└── index.html             # Frontend web interface
```

## Code Patterns and Conventions

### Class-Based Architecture
- Services use ES6 classes with dependency injection
- Each service encapsulates specific functionality
- `MusicGenerator` orchestrates the other services

### Error Handling Pattern
```javascript
try {
  // operation
} catch (error) {
  console.error('Error description:', error);
  throw error; // Re-throw for higher-level handling
}
```

### API Response Pattern
```javascript
res.json({
  success: true,
  data: result
});
// or for errors
res.status(500).json({ 
  error: 'Description',
  details: error.message 
});
```

### Async/Await Usage
- Consistent use of async/await throughout
- Promise.allSettled for concurrent operations with partial failure handling

### Environment Variable Access
- Direct `process.env` usage throughout the codebase
- No centralized configuration management

## API Endpoints

### POST /api/generate
Generate music for a single style.
Request: `{ repoUrl: string, musicStyle?: string }`
Response: Music prompt, lyrics, and analysis data

### POST /api/generate-multiple
Generate lyrics for multiple styles concurrently.
Request: `{ repoUrl: string, styles: string[] }`
Response: Multiple lyrics with error handling for failed styles

### GET /api/health
Health check endpoint.
Response: `{ status: 'healthy', timestamp: string }`

## Key Dependencies

- **Express**: Web framework
- **@octokit/rest**: GitHub API client
- **axios**: HTTP client for DeepSeek API
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable loading
- **multer**: File upload middleware (installed but unused)

## Music Styles Supported
Electronic, Rock, Hard Rock, Heavy Metal, Pop, Jazz, Classical, Hip Hop, Ambient, plus 'auto' mode where AI selects the best style.

## Important Implementation Details

### GitHub Token Rate Limits
- Without token: 60 requests/hour
- With token: 5,000 requests/hour
- Token needs `public_repo` scope

### AI-Powered File Selection
The app uses a two-step process:
1. Lists all repository files
2. DeepSeek AI selects 10-15 most relevant files based on core functionality, documentation, unique algorithms, and creative naming

### Character Limits
- Music prompts: 2000 characters (optimized for music AI tools)
- Lyrics: 3000 characters
- No timing constraints - focuses on creative elements

### Style Mapping Logic
AI maps repository characteristics to music styles:
- High complexity/innovation → Electronic, Experimental
- Technical/analytical → Electronic, Classical
- Emotional/human-focused → Pop, Rock, Jazz
- Heavy/complex systems → Heavy Metal, Hard Rock
- Simple/elegant → Classical, Ambient
- Modern/trendy → Hip Hop, Electronic

## Common Issues and Solutions

### API Rate Limiting
Add GitHub token to `.env` file to increase limits.

### DeepSeek API Errors
Check API key validity and console logs for specific error messages.

### Repository URL Validation
URLs must match pattern: `github.com/owner/repo`

## Testing Approach
- Uses Jest for testing (configured in package.json)
- No test files currently exist in the codebase
- Tests should be added for service classes and API endpoints

## Frontend
- Single-file HTML application in `/public/index.html`
- Modern responsive design with embedded CSS and JavaScript
- Real-time feedback and character count indicators
- Tab-based interface for displaying results