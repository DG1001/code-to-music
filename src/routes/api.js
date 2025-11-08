const express = require('express');
const cors = require('cors');
const MusicGenerator = require('../services/musicGenerator');

const router = express.Router();
const musicGenerator = new MusicGenerator();

router.post('/generate', async (req, res) => {
  try {
    const { repoUrl, musicStyle = 'electronic' } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ 
        error: 'Repository URL is required' 
      });
    }
    
    if (!musicGenerator.validateRepoUrl(repoUrl)) {
      return res.status(400).json({ 
        error: 'Invalid GitHub repository URL' 
      });
    }
    
    const result = await musicGenerator.generateFromRepo(repoUrl, musicStyle);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate music content',
      details: error.message 
    });
  }
});

router.post('/generate-multiple', async (req, res) => {
  try {
    const { repoUrl, styles = ['electronic', 'rock', 'pop', 'jazz'] } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ 
        error: 'Repository URL is required' 
      });
    }
    
    if (!musicGenerator.validateRepoUrl(repoUrl)) {
      return res.status(400).json({ 
        error: 'Invalid GitHub repository URL' 
      });
    }
    
    const result = await musicGenerator.generateMultipleStyles(repoUrl, styles);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Multiple generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate multiple music styles',
      details: error.message 
    });
  }
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;