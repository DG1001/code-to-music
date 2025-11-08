# GitHub Music Generator

An application that scans GitHub repositories and generates music prompts and lyrics using the DeepSeek API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your API keys:
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GITHUB_TOKEN=your_github_token_here
PORT=3000
```

3. Start the application:
```bash
npm start
```

## Usage

Send a POST request to `/api/generate` with a GitHub repository URL to generate music prompts and lyrics based on the repository's content.

## API Endpoints

- `POST /api/generate` - Generate music prompts and lyrics from a GitHub repo
- `GET /api/health` - Health check endpoint