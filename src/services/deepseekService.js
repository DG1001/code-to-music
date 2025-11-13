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
    const { repository, purpose, themes, emotions, technicalConcepts, musicalMetaphors, keyFeatures, innovationLevel, complexity, userImpact, artisticInterpretation } = repoAnalysis;
    
    return `
Generate a detailed music prompt for AI music generation in ${musicStyle.toUpperCase()} style:

Repository: "${repository.name}" - ${purpose}
${repository.description ? `Description: "${repository.description}"` : ''}
Language: ${repository.language || 'Unknown'} | Topics: ${repository.topics.join(', ') || 'None'}

Analysis:
- Purpose: ${purpose}
- Themes: ${themes.join(', ')}
- Emotions: ${emotions.join(', ')}
- Technical Concepts: ${technicalConcepts.join(', ')}
- Musical Metaphors: ${musicalMetaphors.join(', ')}
- Key Features: ${keyFeatures.join(', ')}
- Innovation: ${innovationLevel}
- Complexity: ${complexity}
- Artistic Essence: ${artisticInterpretation}

Create a ${musicStyle} music prompt that includes:
1. Genre and Style: Pure ${musicStyle} - ${this.getStyleDescription(musicStyle)}
2. Mood and Atmosphere: Capture ${emotions.join(', ')} emotions
3. Tempo and Rhythm: Reflect ${technicalConcepts.slice(0, 3).join(', ')}
4. Instrumentation: ${this.getStyleInstruments(musicStyle)}
5. Musical Character: ${complexity} complexity with ${innovationLevel} innovation
6. Creative Elements: Incorporate ${musicalMetaphors.slice(0, 2).join(' and ')}

Focus on creating a cohesive musical piece that translates the technical essence into ${musicStyle} expression. The prompt should be ready for AI music generation tools.

IMPORTANT: Keep under 1000 characters. No timing instructions or section durations.
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

  getStyleDescription(musicStyle) {
    const descriptions = {
      electronic: "modern, innovative, technical with synthesizers and digital effects",
      rock: "energetic, powerful with electric guitars and driving rhythms",
      hardrock: "intense, amplified with distorted guitars and heavy drums",
      'heavy-metal': "aggressive, complex with extreme distortion and powerful vocals",
      pop: "catchy, accessible with clear structure and memorable hooks",
      jazz: "improvisational, sophisticated with complex harmonies and brass/piano",
      classical: "structured, elegant with orchestral instruments and emotional depth",
      'hip-hop': "rhythmic, modern with strong beats and urban sounds",
      ambient: "atmospheric, evolving with subtle textures and minimal percussion"
    };
    return descriptions[musicStyle] || "creative and expressive";
  }

  getStyleInstruments(musicStyle) {
    const instruments = {
      electronic: "synthesizers, drum machines, digital effects",
      rock: "electric guitars, bass, drums, passionate vocals",
      hardrock: "distorted guitars, heavy drums, intense vocals",
      'heavy-metal': "extreme distortion guitars, double-bass drums, powerful vocals",
      pop: "modern production, catchy melodies, clear vocals",
      jazz: "brass, piano, upright bass, sophisticated rhythms",
      classical: "orchestral strings, woodwinds, piano, structured arrangements",
      'hip-hop': "strong beats, samples, rhythmic vocals",
      ambient: "atmospheric pads, subtle textures, evolving soundscapes"
    };
    return instruments[musicStyle] || "appropriate instrumentation";
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
