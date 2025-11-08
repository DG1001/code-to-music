const { Octokit } = require('@octokit/rest');
const DeepSeekService = require('./deepseekService');

class GitHubScanner {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.deepseekService = new DeepSeekService();
  }

  parseRepoUrl(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  }

  async getRepositoryInfo(owner, repo) {
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error.message}`);
    }
  }

  async getRepositoryFiles(owner, repo, path = '') {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path
      });

      const files = [];
      const directories = [];

      for (const item of data) {
        if (item.type === 'file') {
          files.push({
            name: item.name,
            path: item.path,
            size: item.size,
            download_url: item.download_url
          });
        } else if (item.type === 'dir') {
          directories.push(item.path);
        }
      }

      for (const dir of directories) {
        const subFiles = await this.getRepositoryFiles(owner, repo, dir);
        files.push(...subFiles);
      }

      return files;
    } catch (error) {
      throw new Error(`Failed to fetch repository files: ${error.message}`);
    }
  }

  async getFileContent(downloadUrl) {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error.message}`);
    }
  }

  async analyzeRepository(repoUrl) {
    const { owner, repo } = this.parseRepoUrl(repoUrl);
    
    console.log('Step 1: Fetching repository information...');
    const repoInfo = await this.getRepositoryInfo(owner, repo);
    
    console.log('Step 2: Listing all repository files...');
    const allFiles = await this.getRepositoryFiles(owner, repo);
    
    console.log('Step 3: Using AI to select relevant files for analysis...');
    const selectedFiles = await this.selectRelevantFiles(allFiles, repoInfo);
    
    console.log('Step 4: Fetching content of selected files...');
    const fileContents = await this.fetchSelectedFileContents(selectedFiles);
    
    console.log('Step 5: Using AI to analyze repository content and themes...');
    const analysis = await this.analyzeRepositoryWithAI(repoInfo, fileContents);
    
    return {
      repository: {
        name: repoInfo.name,
        description: repoInfo.description,
        language: repoInfo.language,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        topics: repoInfo.topics || []
      },
      fileStats: {
        total: allFiles.length,
        selected: selectedFiles.length,
        analyzed: fileContents.length
      },
      selectedFiles: selectedFiles.map(f => ({ name: f.name, path: f.path, type: f.type })),
      ...analysis
    };
  }

  async selectRelevantFiles(files, repoInfo) {
    const fileList = files.map(file => ({
      name: file.name,
      path: file.path,
      size: file.size,
      extension: file.name.split('.').pop()?.toLowerCase(),
      type: this.categorizeFile(file.name, file.path)
    }));

    const prompt = `
You are an AI assistant helping to analyze a GitHub repository for music generation inspiration. 

Repository Information:
- Name: ${repoInfo.name}
- Description: ${repoInfo.description || 'No description'}
- Primary Language: ${repoInfo.language || 'Unknown'}
- Topics: ${repoInfo.topics?.join(', ') || 'No topics'}

Available Files (${files.length} total):
${fileList.map((file, index) => 
  `${index + 1}. ${file.path} (${file.type}, ${file.size} bytes, .${file.extension})`
).join('\n')}

Your task: Select the 10-15 most relevant files that would provide the best understanding of this repository's purpose, functionality, and character for creative music generation. Consider:

1. Core functionality files (main entry points, key classes/modules)
2. Configuration and documentation that reveals purpose
3. Unique or interesting algorithmic implementations
4. Files that represent the project's main features
5. Files with creative or interesting naming/patterns

Prioritize files that would inspire musical themes over boilerplate or test files.

Return your selection ONLY as a JSON array (no markdown formatting, no code blocks):
["path/to/file1.js", "path/to/file2.py", ...]
`;

    try {
      const response = await this.deepseekService.generateJSONResponse(prompt, 'deepseek-coder');
      const selectedPaths = this.parseJSONResponse(response);
      
      return files.filter(file => selectedPaths.includes(file.path));
    } catch (error) {
      console.warn('AI file selection failed, falling back to heuristic selection:', error.message);
      return this.fallbackFileSelection(files);
    }
  }

  categorizeFile(fileName, filePath) {
    const name = fileName.toLowerCase();
    const path = filePath.toLowerCase();
    
    if (name.includes('readme') || name.includes('contributing') || name.includes('license')) {
      return 'documentation';
    }
    if (name.includes('package') || name.includes('requirements') || name.includes('cargo') || 
        name.includes('pom') || name.includes('build') || name.includes('makefile')) {
      return 'configuration';
    }
    if (name.includes('test') || path.includes('test') || path.includes('spec')) {
      return 'test';
    }
    if (name.includes('main') || name.includes('index') || name.includes('app')) {
      return 'entry-point';
    }
    if (name.includes('config') || name.includes('setting')) {
      return 'configuration';
    }
    if (/\.(js|ts|py|java|cpp|c|go|rs|php|rb|swift|kt|scala|cs|dart)$/.test(name)) {
      return 'source-code';
    }
    if (/\.(md|txt|rst|adoc)$/.test(name)) {
      return 'documentation';
    }
    if (/\.(json|yaml|yml|toml|ini|conf|config|xml)$/.test(name)) {
      return 'configuration';
    }
    if (/\.(html|css|scss|sass|less)$/.test(name)) {
      return 'frontend';
    }
    
    return 'other';
  }

  fallbackFileSelection(files) {
    const prioritized = files.sort((a, b) => {
      const aPriority = this.getFilePriority(a.name, a.path);
      const bPriority = this.getFilePriority(b.name, b.path);
      return bPriority - aPriority;
    });
    
    return prioritized.slice(0, 12);
  }

  getFilePriority(fileName, filePath) {
    const name = fileName.toLowerCase();
    const path = filePath.toLowerCase();
    
    if (name.includes('readme')) return 100;
    if (name.includes('main') || name.includes('index')) return 90;
    if (name.includes('app') && !path.includes('test')) return 85;
    if (path.includes('src') || path.includes('lib')) return 80;
    if (name.includes('package') || name.includes('requirements')) return 75;
    if (name.includes('config')) return 70;
    if (path.includes('test') || name.includes('test')) return 10;
    if (name.includes('license')) return 60;
    
    return 50;
  }

  async fetchSelectedFileContents(selectedFiles) {
    const contents = [];
    
    for (const file of selectedFiles) {
      try {
        const content = await this.getFileContent(file.download_url);
        contents.push({
          name: file.name,
          path: file.path,
          type: this.categorizeFile(file.name, file.path),
          size: file.size,
          content: content.length > 10000 ? content.substring(0, 10000) + '...' : content
        });
      } catch (error) {
        console.warn(`Failed to fetch ${file.path}: ${error.message}`);
      }
    }
    
    return contents;
  }

  parseJSONResponse(response) {
    // Remove markdown code blocks if present
    let cleanResponse = response.trim();
    
    // Remove ```json and ``` markers
    cleanResponse = cleanResponse.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    
    // Remove any other code block markers
    cleanResponse = cleanResponse.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    
    // Try to parse the cleaned response
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      // If still fails, try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error(`Failed to parse JSON: ${e.message}. Original error: ${error.message}`);
        }
      }
      throw new Error(`No valid JSON found in response: ${error.message}`);
    }
  }

  async analyzeRepositoryWithAI(repoInfo, fileContents) {
    const contentSummary = fileContents.map(file => ({
      path: file.path,
      type: file.type,
      preview: file.content.substring(0, 500) + (file.content.length > 500 ? '...' : ''),
      keyFeatures: this.extractKeyFeatures(file.content, file.type)
    }));

    const prompt = `
You are analyzing a GitHub repository to extract themes, concepts, and characteristics for music generation inspiration.

Repository Context:
- Name: ${repoInfo.name}
- Description: ${repoInfo.description || 'No description'}
- Language: ${repoInfo.language || 'Unknown'}
- Topics: ${repoInfo.topics?.join(', ') || 'No topics'}

File Contents Analysis:
${contentSummary.map((file, index) => `
File ${index + 1}: ${file.path} (${file.type})
Preview: ${file.preview}
Key Features: ${file.keyFeatures.join(', ')}
`).join('\n')}

Based on this analysis, provide a comprehensive assessment focusing on:

1. **Core Purpose & Functionality**: What does this repository do? What problem does it solve?
2. **Technical Themes**: What algorithms, patterns, or concepts are prominent?
3. **User Experience & Impact**: How does this affect users? What emotions might it evoke?
4. **Architectural Patterns**: What structures and design patterns are used?
5. **Innovation & Uniqueness**: What makes this project special or innovative?
6. **Musical Metaphors**: How could the technical concepts translate to musical elements?

Respond ONLY with a JSON object (no markdown formatting, no code blocks):
{
  "purpose": "Brief description of what the repository does",
  "themes": ["theme1", "theme2", "theme3"],
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "technicalConcepts": ["concept1", "concept2", "concept3"],
  "musicalMetaphors": ["metaphor1", "metaphor2", "metaphor3"],
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "innovationLevel": "low|medium|high",
  "complexity": "simple|moderate|complex",
  "userImpact": "description of how users interact with this",
  "artisticInterpretation": "creative interpretation of the project's essence"
}
`;

    try {
      const response = await this.deepseekService.generateJSONResponse(prompt, 'deepseek-coder');
      return this.parseJSONResponse(response);
    } catch (error) {
      console.warn('AI analysis failed, using basic analysis:', error.message);
      return this.fallbackAnalysis(repoInfo, fileContents);
    }
  }

  extractKeyFeatures(content, fileType) {
    const features = [];
    const lowerContent = content.toLowerCase();
    
    if (fileType === 'source-code') {
      if (lowerContent.includes('async') || lowerContent.includes('await')) features.push('asynchronous');
      if (lowerContent.includes('class')) features.push('object-oriented');
      if (lowerContent.includes('function') || lowerContent.includes('def')) features.push('functional');
      if (lowerContent.includes('api') || lowerContent.includes('http')) features.push('api-interaction');
      if (lowerContent.includes('database') || lowerContent.includes('sql')) features.push('data-persistence');
      if (lowerContent.includes('algorithm') || lowerContent.includes('sort')) features.push('algorithms');
      if (lowerContent.includes('render') || lowerContent.includes('draw')) features.push('visualization');
      if (lowerContent.includes('encrypt') || lowerContent.includes('secure')) features.push('security');
    }
    
    if (fileType === 'documentation') {
      if (lowerContent.includes('tutorial') || lowerContent.includes('guide')) features.push('educational');
      if (lowerContent.includes('api') || lowerContent.includes('endpoint')) features.push('api-documentation');
    }
    
    if (fileType === 'configuration') {
      if (lowerContent.includes('deploy') || lowerContent.includes('build')) features.push('deployment');
      if (lowerContent.includes('test') || lowerContent.includes('ci')) features.push('testing');
    }
    
    return features.length > 0 ? features : ['general'];
  }

  fallbackAnalysis(repoInfo, fileContents) {
    const sourceFiles = fileContents.filter(f => f.type === 'source-code');
    const docFiles = fileContents.filter(f => f.type === 'documentation');
    
    return {
      purpose: repoInfo.description || `A ${repoInfo.language || 'software'} repository`,
      themes: ['technology', 'innovation', 'development'],
      emotions: ['focused', 'analytical', 'creative'],
      technicalConcepts: ['programming', 'software-development'],
      musicalMetaphors: ['rhythm', 'structure', 'harmony'],
      keyFeatures: ['code-organization', 'problem-solving'],
      innovationLevel: 'medium',
      complexity: sourceFiles.length > 10 ? 'complex' : 'moderate',
      userImpact: 'Provides tools or solutions for developers',
      artisticInterpretation: 'A structured approach to solving technical challenges'
    };
  }
}

module.exports = GitHubScanner;