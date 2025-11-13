const axios = require('axios');

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }
  }

  async generateJSONResponse(prompt, model = 'deepseek-chat') {
    return await this.generateResponse(prompt, model, true);
  }

  async generateResponse(prompt, model = 'deepseek-chat', requireJSON = false) {
    try {
      const systemMessage = requireJSON 
        ? 'You are an AI assistant that analyzes GitHub repositories. Always respond with pure JSON only - no markdown formatting, no code blocks, no explanations, just the JSON response.'
        : 'You are a creative AI assistant that specializes in generating music prompts and lyrics based on code repositories. You analyze the technical content and create artistic interpretations.';
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: requireJSON ? 1000 : 4000,
        temperature: requireJSON ? 0.3 : 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        throw new Error(`DeepSeek API error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response from DeepSeek API');
      } else {
        throw new Error(`DeepSeek API request failed: ${error.message}`);
      }
    }
  }

  async generateMusicPrompt(repoAnalysis, musicStyle = 'electronic') {
    const prompt = this.buildMusicPrompt(repoAnalysis, musicStyle);
    const response = await this.generateResponseWithLimit(prompt, 3000);
    return this.truncateToCharLimit(response, 1000);
  }

  async generateLyrics(repoAnalysis, musicStyle = 'electronic') {
    let actualStyle = musicStyle;
    
    // If auto mode, let AI decide the best style based on repository
    if (musicStyle === 'auto') {
      actualStyle = await this.determineBestMusicStyle(repoAnalysis);
    }
    
    const prompt = this.buildLyricsPrompt(repoAnalysis, actualStyle);
    const response = await this.generateResponseWithLimit(prompt, 4000);
    return this.truncateToCharLimit(response, 3000);
  }

  async determineBestMusicStyle(repoAnalysis) {
    const { repository, purpose, themes, emotions, technicalConcepts, complexity, innovationLevel, artisticInterpretation } = repoAnalysis;
    
    const prompt = `
You are a music expert analyzing a GitHub repository to determine the perfect musical style that captures its essence.

REPOSITORY ANALYSIS:
- Name: "${repository.name}"
- Description: "${repository.description || 'No description'}"
- Language: "${repository.language || 'Unknown'}"
- Topics: ${repository.topics?.join(', ') || 'No topics'}
- Purpose: "${purpose}"
- Core Themes: ${themes.join(', ')}
- Emotional Tone: ${emotions.join(', ')}
- Technical Concepts: ${technicalConcepts.join(', ')}
- Complexity: ${complexity}
- Innovation Level: ${innovationLevel}
- Artistic Essence: "${artisticInterpretation}"

MUSIC STYLE MATCHING GUIDE:
Analyze the repository's characteristics and match them to these styles:

ELECTRONIC: For modern, innovative, technical projects. Perfect for AI, data science, cutting-edge tech. Use for complex algorithms, futuristic concepts, digital systems.
ROCK: For projects with energy, impact, and strong foundations. Great for infrastructure, frameworks, tools that empower others.
HARDROCK: For intense, powerful systems. Database engines, compilers, performance-critical applications.
HEAVY-METAL: For complex, aggressive, highly technical systems. Operating systems, game engines, cryptography.
POP: For user-friendly, accessible projects. UI libraries, educational tools, applications with mass appeal.
JAZZ: For creative, improvisational, elegant solutions. Creative coding, generative art, experimental projects.
CLASSICAL: For timeless, structured, elegant architectures. Foundational libraries, mathematical systems, well-engineered solutions.
HIP-HOP: For modern, rhythmic, community-driven projects. Social apps, collaboration tools, trend-setting technologies.
AMBIENT: For background services, subtle tools, atmospheric projects. APIs, microservices, utilities that work behind the scenes.

Consider these factors:
- Emotional tone and user experience
- Technical complexity and innovation level
- Project purpose and target audience
- The "soul" of the codebase

Choose ONE style that best represents the repository's character. Respond with ONLY the style name: electronic, rock, hardrock, heavy-metal, pop, jazz, classical, hip-hop, or ambient
    `;

    try {
      const response = await this.generateResponseWithLimit(prompt, 500);
      const cleanResponse = response.trim().toLowerCase();
      
      // Validate the response is one of the allowed styles
      const validStyles = ['electronic', 'rock', 'hardrock', 'heavy-metal', 'pop', 'jazz', 'classical', 'hip-hop', 'ambient'];
      if (validStyles.includes(cleanResponse)) {
        return cleanResponse;
      }
      
      // Try to extract style from response if it contains extra text
      for (const style of validStyles) {
        if (cleanResponse.includes(style)) {
          return style;
        }
      }
      
      console.warn(`Invalid style response: ${cleanResponse}, using default`);
      return 'electronic';
    } catch (error) {
      console.warn('Failed to determine music style, using default:', error.message);
      return 'electronic';
    }
  }

  truncateToCharLimit(text, maxChars) {
    if (text.length <= maxChars) {
      return text;
    }
    
    // Try to truncate at a sentence boundary
    const truncated = text.substring(0, maxChars);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > maxChars * 0.8) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }
    
    // If no good sentence boundary, try to truncate at a word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxChars * 0.9) {
      return truncated.substring(0, lastSpace) + '...';
    }
    
    // Last resort: hard truncate with ellipsis
    return truncated.substring(0, maxChars - 3) + '...';
  }

  async generateResponseWithLimit(prompt, maxTokens) {
    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a creative AI assistant that specializes in generating music prompts and lyrics based on code repositories. You analyze the technical content and create artistic interpretations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.8
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        throw new Error(`DeepSeek API error: ${error.response.status} - ${error.response.data?.error?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response from DeepSeek API');
      } else {
        throw new Error(`DeepSeek API request failed: ${error.message}`);
      }
    }
  }

  buildMusicPrompt(repoAnalysis, musicStyle = 'electronic') {
    const { repository, fileStats, purpose, themes, emotions, technicalConcepts, musicalMetaphors, keyFeatures, innovationLevel, complexity, userImpact, artisticInterpretation } = repoAnalysis;
    
    return `
Create an evocative music generation prompt that translates this code repository into ${musicStyle.toUpperCase()} music.

REPOSITORY ESSENCE:
"${repository.name}" - ${purpose}
${repository.description ? `Description: "${repository.description}"` : ''}
Language: ${repository.language || 'Unknown'} | Topics: ${repository.topics.join(', ') || 'None'}

ARTISTIC INTERPRETATION:
${artisticInterpretation}

KEY CHARACTERISTICS:
- Emotional Landscape: ${emotions.join(', ')}
- Core Themes: ${themes.join(', ')}
- Technical Soul: ${technicalConcepts.join(', ')}
- Musical Inspiration: ${musicalMetaphors.join(', ')}
- Innovation Level: ${innovationLevel}
- Complexity: ${complexity}

STYLE-SPECIFIC ${musicStyle.toUpperCase()} DIRECTIONS:
${this.getStyleSpecificDirections(musicStyle)}

MUSICAL ELEMENTS TO CREATE:
• MELODY: Create melodic themes that reflect the repository's purpose and emotional tone
• HARMONY: Build chord progressions that support the ${musicStyle} style and technical concepts
• RHYTHM: Design rhythmic patterns inspired by ${technicalConcepts.join(', ')}
• TEXTURE: Layer sounds that represent the ${complexity} architecture
• DYNAMICS: Shape volume and intensity to mirror ${userImpact}

INSTRUMENTATION: Use authentic ${musicStyle} instruments and sounds that capture the project's essence.

MOOD: Create an atmosphere that embodies: ${emotions.join(', ')} through ${musicStyle} expression.

CRITICAL: Stay strictly within ${musicStyle} conventions. No timing/structure notes. Focus on sonic qualities, emotional impact, and technical-to-musical translation.

Keep under 1000 characters. Create a prompt that would inspire a musician to compose the perfect soundtrack for this codebase.
    `;
  }

  buildLyricsPrompt(repoAnalysis, musicStyle) {
    const { repository, purpose, themes, emotions, technicalConcepts, musicalMetaphors, keyFeatures, innovationLevel, complexity, userImpact, artisticInterpretation } = repoAnalysis;
    
    return `
Based on the following enhanced GitHub repository analysis, generate song lyrics in the ${musicStyle} style:

Repository Information:
- Name: ${repository.name}
- Description: ${repository.description || 'No description'}
- Primary Language: ${repository.language || 'Unknown'}
- Topics: ${repository.topics.join(', ') || 'No topics'}

AI-Enhanced Analysis:
- Purpose: ${purpose}
- Core Themes: ${themes.join(', ')}
- Emotional Tone: ${emotions.join(', ')}
- Technical Concepts: ${technicalConcepts.join(', ')}
- Musical Metaphors: ${musicalMetaphors.join(', ')}
- Key Features: ${keyFeatures.join(', ')}
- Innovation Level: ${innovationLevel}
- Complexity: ${complexity}
- User Impact: ${userImpact}
- Artistic Interpretation: ${artisticInterpretation}

Generate song lyrics that:
1. **Tell the Story**: Narrate the repository's purpose and impact
2. **Emotional Connection**: Reflect the identified emotional tones
3. **Technical Poetry**: Weave technical concepts into artistic metaphors
4. **Style Authenticity**: Match the ${musicStyle} genre conventions
5. **Creative Structure**: Include verses, choruses, and bridges naturally
6. **Metaphorical Depth**: Use the musical metaphors as lyrical inspiration
7. **Human Experience**: Connect the technical to universal human experiences

The lyrics should be deeply creative and artistic, transforming code and algorithms into relatable human stories. Use technical terms not literally, but as poetic devices that convey emotion, struggle, innovation, and triumph.

Make the lyrics accessible to non-technical listeners while maintaining the essence of the repository's soul.

Format the response with clear [Verse], [Chorus], [Bridge], [Outro] labels for structure.

IMPORTANT: Keep your response under 3000 characters total to ensure compatibility with music generation AI tools.
    `;
  }

  getStyleSpecificDirections(musicStyle) {
    const directions = {
      electronic: "Use synthesizers, drum machines, and digital effects. Create futuristic, precise sounds with clean rhythms. Incorporate glitch effects for complexity, pads for atmosphere, and arpeggios for technical patterns.",
      rock: "Use electric guitars, bass, drums, and passionate vocals. Build energy with driving rhythms and powerful chord progressions. Include guitar solos for technical brilliance and breakdowns for complex sections.",
      hardrock: "Amplify with distorted guitars, heavy drums, and intense energy. Create powerful riffs that represent strong foundations and screaming solos for innovation.",
      'heavy-metal': "Use extreme distortion, double-bass drums, and aggressive tones. Create complex time signatures for intricate systems and powerful vocals for impact.",
      pop: "Focus on catchy melodies, clear structure, and accessibility. Use modern production, memorable hooks, and relatable emotional expression.",
      jazz: "Incorporate improvisation, complex harmonies, and sophisticated rhythms. Use brass, piano, and upright bass for elegance and creativity.",
      classical: "Use orchestral instruments, structured compositions, and emotional depth. Create themes that develop like algorithms and harmonies that build like architectures.",
      'hip-hop': "Use strong beats, samples, and rhythmic flow. Incorporate modern production techniques and urban sounds that reflect community and innovation.",
      ambient: "Create atmospheric pads, subtle textures, and evolving soundscapes. Use minimal percussion and focus on mood and space over traditional structure."
    };
    
    return directions[musicStyle] || "Create music that captures the essence of the repository through appropriate instrumentation and style.";
  }

  extractCodeThemes(codeContent) {
    const themes = [];
    
    if (codeContent.includes('function') || codeContent.includes('def')) {
      themes.push('functions and methods');
    }
    if (codeContent.includes('class')) {
      themes.push('classes and objects');
    }
    if (codeContent.includes('async') || codeContent.includes('await')) {
      themes.push('asynchronous operations');
    }
    if (codeContent.includes('import') || codeContent.includes('require')) {
      themes.push('dependencies and imports');
    }
    if (codeContent.includes('API') || codeContent.includes('api')) {
      themes.push('API interactions');
    }
    if (codeContent.includes('data') || codeContent.includes('database')) {
      themes.push('data handling');
    }
    if (codeContent.includes('error') || codeContent.includes('try') || codeContent.includes('catch')) {
      themes.push('error handling');
    }
    
    return themes.join(', ') || 'general programming concepts';
  }
}

module.exports = DeepSeekService;
