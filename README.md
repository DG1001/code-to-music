# 🎵 GitHub Music Generator

An AI-powered application that intelligently scans GitHub repositories and generates creative music prompts and lyrics using DeepSeek AI. The app analyzes code structure, themes, and technical concepts to transform them into musical inspiration.

## 🚀 Features

### 🤖 AI-Powered Intelligence
- **Smart File Selection**: DeepSeek AI analyzes repository structure and selects the most relevant files for analysis
- **Two-Step Analysis**: First lists all files, then AI determines which ones provide the best insights
- **Deep Content Analysis**: Extracts themes, emotions, technical concepts, and musical metaphors
- **Intelligent Style Selection**: Auto mode lets AI choose the perfect music style based on repository characteristics

### 🎸 Music Generation
- **Multiple Genres**: Electronic, Rock, Hard Rock, Heavy Metal, Pop, Jazz, Classical, Hip Hop, Ambient
- **Auto Mode**: AI analyzes repository complexity, purpose, and innovation to select the best style
- **Character Limits**: Optimized for music AI tools (2000 chars for prompts, 3000 for lyrics)
- **No Timing Constraints**: Focuses on creative elements, lets music AI handle structure

### 🎨 User Experience
- **Beautiful Web Interface**: Modern, responsive design with real-time feedback
- **Detailed Analysis Display**: Shows AI insights, themes, emotions, and repository statistics
- **Character Count Indicators**: Visual feedback for content limits
- **Error Handling**: Graceful fallbacks and clear error messages

## 🛠️ Setup

### Prerequisites
- Node.js 16+ 
- DeepSeek API key
- GitHub Personal Access Token

### Installation

1. **Clone and Install**:
```bash
git clone <repository-url>
cd github-music-generator
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GITHUB_TOKEN=your_github_personal_access_token
PORT=3000
```

3. **Get GitHub Token**:
- Visit https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select `public_repo` scope
- Copy and add to `.env` file

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit http://localhost:3000 to use the application.

## 📖 Usage

### Web Interface
1. **Enter Repository URL**: Any public GitHub repository
2. **Choose Music Style**: 
   - **Auto**: AI analyzes repository and selects best style
   - **Manual**: Choose specific genre (Electronic, Rock, Hard Rock, Heavy Metal, etc.)
3. **Generate**: Click to create music prompts and lyrics
4. **View Results**: Organized tabs with character counts

### API Usage

#### Generate Music (Single Style)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/user/repo",
    "musicStyle": "heavy-metal"
  }'
```

#### Generate Multiple Styles
```bash
curl -X POST http://localhost:3000/api/generate-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/user/repo",
    "styles": ["auto", "electronic", "rock"]
  }'
```

#### Health Check
```bash
curl http://localhost:3000/api/health
```

## 🧠 How It Works

### 1. Repository Analysis
- Fetches repository metadata (stars, forks, topics, language)
- Lists all files in the repository
- AI selects 10-15 most relevant files based on:
  - Core functionality files
  - Documentation and configuration
  - Unique algorithmic implementations
  - Creative naming and patterns

### 2. AI-Powered Content Analysis
DeepSeek analyzes selected files to extract:
- **Purpose**: What the repository does and problems it solves
- **Themes**: Core concepts and patterns
- **Emotions**: User experience and emotional impact
- **Technical Concepts**: Algorithms, patterns, architectures
- **Musical Metaphors**: How technical elements translate to music
- **Innovation Level**: Low, medium, or high
- **Complexity**: Simple, moderate, or complex

### 3. Music Generation
Based on analysis, generates:

#### Music Prompts
- Genre-appropriate instrumentation suggestions
- Mood and atmosphere recommendations
- Tempo and rhythm guidance
- Key and scale suggestions
- Special effects and production techniques
- Musical elements from repository metaphors

#### Lyrics
- Repository storytelling and purpose
- Technical concepts as poetic metaphors
- Style-appropriate structure and language
- Human experiences connected to code
- Verse, chorus, bridge organization

## 🎯 Style Mapping

The AI maps repository characteristics to music styles:

| Repository Type | Recommended Style |
|----------------|------------------|
| High complexity/innovation | Electronic, Experimental |
| Technical/analytical | Electronic, Classical |
| Emotional/human-focused | Pop, Rock, Jazz |
| Heavy/complex systems | Heavy Metal, Hard Rock |
| Simple/elegant | Classical, Ambient |
| Modern/trendy | Hip Hop, Electronic |

## 🔧 Configuration

### Environment Variables
- `DEEPSEEK_API_KEY`: Required for AI analysis and generation
- `GITHUB_TOKEN`: Required for repository access (higher rate limits)
- `PORT`: Server port (default: 3000)

### Rate Limits
- **Without GitHub Token**: 60 requests/hour
- **With GitHub Token**: 5,000 requests/hour

## 🐛 Troubleshooting

### Common Issues

**"API rate limit exceeded"**
- Add GitHub token to `.env` file
- Token increases limits from 60 to 5,000 requests/hour

**"Cannot access 'actualStyle' before initialization"**
- Should be resolved with latest updates
- Restart application after adding token

**AI selection seems too fast"**
- Check console logs for "AI file selection failed"
- May be falling back to heuristic selection

**Generated style doesn't match selection**
- Ensure DeepSeek API key is valid
- Check logs for style determination errors

### Debug Mode
The app includes detailed logging. Watch console for:
- File selection process
- AI analysis steps
- Style determination
- API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- DeepSeek AI for powering the intelligent analysis
- GitHub API for repository access
- Open source community for inspiration and feedback