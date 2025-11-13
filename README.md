# 🎵 GitHub Music Generator

> **An experimental art project exploring the creative intersection of code and music**

This is a playful artistic experiment that transforms GitHub repositories into musical inspiration using AI. Think of it as digital alchemy - converting the logical world of code into the emotional realm of music. This project demonstrates a whimsical, creative application of AI beyond traditional productivity tools, asking the question: *What would your favorite open-source project sound like as a song?*

## 🎭 Why This Project

This isn't just another productivity tool - it's an artistic exploration that:

- **Celebrates Developer Creativity**: Shows that code isn't just functional; it has rhythm, emotion, and story
- **Explores AI's Creative Side**: Uses AI not for optimization, but for artistic interpretation and metaphor
- **Creates Unexpected Connections**: Bridges the technical and artistic worlds in delightful ways
- **Sparks Curiosity**: Makes people think about the hidden beauty in everyday code

Perfect for:
- Creative developers looking for inspiration
- Anyone curious about AI's artistic capabilities  
- Generating unique gifts for fellow developers
- Creating themed music for tech events or hackathons
- Just having fun exploring the musical side of code

## 🚀 Features

### 🎨 Artistic AI Interpretation
- **Creative Code Analysis**: DeepSeek AI finds the poetry in programming - extracting themes, emotions, and stories from code
- **Musical Metaphors**: Transforms technical concepts like loops, APIs, and algorithms into musical ideas
- **Smart File Selection**: AI acts as a music curator, selecting files with the most "musical potential"  
- **Emotional Intelligence**: Understands the human experience behind the code - the frustrations, triumphs, and creative moments

### 🎸 Musical Storytelling
- **10 Music Genres**: From the elegance of Classical to the energy of Heavy Metal, plus AI's "auto" selection
- **Repository Personality**: Each codebase gets its own musical identity based on complexity, purpose, and innovation
- **Character-Optimized**: Prompts (2000 chars) and lyrics (3000 chars) perfectly sized for AI music tools
- **Narrative Focus**: Creates stories about developers, users, and the problems being solved

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

## 🎼 Bringing Your Music to Life

Once you've generated music prompts and lyrics, try these tested AI music services to create actual audio tracks:

### 🎵 Recommended Services

| Service | Free Access | Best For | Link |
|---------|-------------|----------|------|
| **Suno AI** | ✅ Free tier | Complete songs with vocals | [suno.ai](https://suno.ai/) |
| **Minimax Audio** | ✅ Free testing | High-quality music generation | [minimax.io/audio/music](https://www.minimax.io/audio/music) |

### 💡 How to Use Generated Content

1. **Copy the Music Prompt** - Use the copy button to get the 2000-char optimized prompt
2. **Paste into Your Chosen Service** - Both accept text descriptions for music generation
3. **Generate Audio** - Let the AI create the actual music track
4. **Optional: Add Lyrics** - Suno can incorporate your generated lyrics into the songs

### 🎯 Service-Specific Tips

**Suno AI:**
- Great for complete songs with vocals
- Simple, user-friendly interface
- Can use both your prompts and generated lyrics

**Minimax Audio:**
- Excellent for high-quality instrumental tracks
- Good at capturing complex musical moods
- Works well with detailed genre descriptions from the prompts

> **Note**: Both services offer free tiers for testing. Check their current pricing and usage limits when generating multiple tracks.

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

- DeepSeek AI for powering the creative analysis
- GitHub API for repository access
- Open source community for inspiration and feedback
- All the developers whose code serves as artistic inspiration

---

> **💫 This is an experimental art project** - part technology demo, part creative exploration. If it makes you smile, think differently about code, or just creates something beautiful, then it's succeeded.