const axios = require('axios');

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.com/v1';
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }
  }

  async generateJSONResponse(prompt, model = 'deepseek-coder') {
    return await this.generateResponse(prompt, model, true);
  }

  async generateResponse(prompt, model = 'deepseek-coder', requireJSON = false) {
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
    return this.truncateToCharLimit(response, 2000);
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
    const { repository, purpose, themes, emotions, technicalConcepts, complexity, innovationLevel } = repoAnalysis;
    
    const prompt = `
Based on the following GitHub repository analysis, determine the most suitable music style for generating lyrics:

Repository Information:
- Name: ${repository.name}
- Description: ${repository.description || 'No description'}
- Language: ${repository.language || 'Unknown'}
- Topics: ${repository.topics?.join(', ') || 'No topics'}

Analysis:
- Purpose: ${purpose}
- Themes: ${themes.join(', ')}
- Emotions: ${emotions.join(', ')}
- Technical Concepts: ${technicalConcepts.join(', ')}
- Complexity: ${complexity}
- Innovation Level: ${innovationLevel}

Available styles: electronic, rock, hardrock, heavy-metal, pop, jazz, classical, hip-hop, ambient

Choose the single best style that matches the repository's character and purpose. Consider:
- High complexity/innovation → electronic, experimental styles
- Technical/analytical → electronic, classical
- Emotional/human-focused → pop, rock, jazz
- Heavy/complex systems → heavy-metal, hardrock
- Simple/elegant → classical, ambient
- Modern/trendy → hip-hop, electronic

Respond with ONLY the style name (no explanation): electronic, rock, hardrock, heavy-metal, pop, jazz, classical, hip-hop, or ambient
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
        model: 'deepseek-coder',
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
Based on the following enhanced GitHub repository analysis, generate a detailed music prompt for AI music generation:

Repository Information:
- Name: ${repository.name}
- Description: ${repository.description || 'No description'}
- Primary Language: ${repository.language || 'Unknown'}
- Stars: ${repository.stars}, Forks: ${repository.forks}
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

File Analysis:
- Total Files Scanned: ${fileStats.total}
- AI-Selected Files: ${fileStats.selected}
- Files Analyzed: ${fileStats.analyzed}

Generate a comprehensive music prompt in **${musicStyle.toUpperCase()}** style that includes:
1. **Genre and Style**: Must be ${musicStyle.toUpperCase()}, based on the repository's characteristics
2. **Mood and Atmosphere**: Reflect the emotional tone and user impact
3. **Tempo and Rhythm**: Inspired by technical concepts and innovation level
4. **Instrumentation**: Match the complexity and themes with ${musicStyle} instruments
5. **Key and Scale**: Complement the emotional tone
6. **Special Effects**: Represent unique features and innovation
7. **Musical Elements**: Directly incorporate the musical metaphors identified

CRITICAL: You MUST generate content specifically in ${musicStyle.toUpperCase()} style. Do not suggest other genres or styles. The user explicitly chose ${musicStyle.toUpperCase()} and expects that style.

IMPORTANT: Do NOT include timing instructions, section durations, timestamps, or any temporal references (like "0:00-0:45", intro/outro lengths, etc.). The music AI will handle timing automatically. Focus only on musical characteristics, mood, instruments, and creative elements.

The prompt should deeply connect the technical essence with musical expression. Use the AI analysis to create a prompt that truly captures the soul of this codebase in musical form.

Format the response as a structured, detailed prompt ready for AI music generation tools.

IMPORTANT: Keep your response under 2000 characters total to ensure compatibility with music generation AI tools.
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