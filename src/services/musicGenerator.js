const GitHubScanner = require('../services/githubScanner');
const DeepSeekService = require('../services/deepseekService');

class MusicGenerator {
  constructor() {
    this.githubScanner = new GitHubScanner();
    this.deepseekService = new DeepSeekService();
  }

  async generateFromRepo(repoUrl, musicStyle = 'electronic') {
    try {
      console.log(`Analyzing repository: ${repoUrl}`);
      
      const repoAnalysis = await this.githubScanner.analyzeRepository(repoUrl);
      
      // Determine the actual style used (important for auto mode)
      let actualStyle = musicStyle;
      if (musicStyle === 'auto') {
        actualStyle = await this.deepseekService.determineBestMusicStyle(repoAnalysis);
      }
      
      console.log('Generating music prompt...');
      const musicPrompt = await this.deepseekService.generateMusicPrompt(repoAnalysis, actualStyle);
      
      console.log(`Generating lyrics in ${actualStyle} style...`);
      const lyrics = await this.deepseekService.generateLyrics(repoAnalysis, actualStyle);
      
      return {
        repository: {
          name: repoAnalysis.repository.name,
          description: repoAnalysis.repository.description,
          language: repoAnalysis.repository.language,
          stars: repoAnalysis.repository.stars,
          forks: repoAnalysis.repository.forks,
          topics: repoAnalysis.repository.topics || []
        },
        fileStats: repoAnalysis.fileStats,
        purpose: repoAnalysis.purpose,
        themes: repoAnalysis.themes || [],
        emotions: repoAnalysis.emotions || [],
        technicalConcepts: repoAnalysis.technicalConcepts || [],
        musicalMetaphors: repoAnalysis.musicalMetaphors || [],
        keyFeatures: repoAnalysis.keyFeatures || [],
        innovationLevel: repoAnalysis.innovationLevel || 'medium',
        complexity: repoAnalysis.complexity || 'moderate',
        userImpact: repoAnalysis.userImpact || '',
        artisticInterpretation: repoAnalysis.artisticInterpretation || '',
        selectedFiles: repoAnalysis.selectedFiles || [],
        selectedStyle: actualStyle,
        requestedStyle: musicStyle,
        musicPrompt,
        lyrics,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating music from repository:', error);
      throw error;
    }
  }

  async generateMultipleStyles(repoUrl, styles = ['auto', 'electronic', 'rock', 'pop']) {
    try {
      const repoAnalysis = await this.githubScanner.analyzeRepository(repoUrl);
      const musicPrompt = await this.deepseekService.generateMusicPrompt(repoAnalysis, 'auto');
      
      const lyricsResults = await Promise.allSettled(
        styles.map(style => 
          this.deepseekService.generateLyrics(repoAnalysis, style)
            .then(lyrics => ({ style, lyrics }))
        )
      );
      
      const successfulLyrics = lyricsResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failedLyrics = lyricsResults
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      return {
        repository: {
          name: repoAnalysis.repository.name,
          description: repoAnalysis.repository.description,
          language: repoAnalysis.repository.language,
          stars: repoAnalysis.repository.stars,
          forks: repoAnalysis.repository.forks,
          topics: repoAnalysis.repository.topics || []
        },
        fileStats: repoAnalysis.fileStats,
        purpose: repoAnalysis.purpose,
        themes: repoAnalysis.themes || [],
        emotions: repoAnalysis.emotions || [],
        technicalConcepts: repoAnalysis.technicalConcepts || [],
        musicalMetaphors: repoAnalysis.musicalMetaphors || [],
        keyFeatures: repoAnalysis.keyFeatures || [],
        innovationLevel: repoAnalysis.innovationLevel || 'medium',
        complexity: repoAnalysis.complexity || 'moderate',
        userImpact: repoAnalysis.userImpact || '',
        artisticInterpretation: repoAnalysis.artisticInterpretation || '',
        selectedFiles: repoAnalysis.selectedFiles || [],
        requestedStyles: styles,
        musicPrompt,
        lyrics: successfulLyrics,
        errors: failedLyrics,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating multiple styles:', error);
      throw error;
    }
  }

  validateRepoUrl(url) {
    try {
      this.githubScanner.parseRepoUrl(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = MusicGenerator;