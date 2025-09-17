const express = require('express');
const router = express.Router();
const placesService = require('../services/placesService');
const csvWriter = require('../services/csvExporter');

// Search places by text query
router.post('/search', async (req, res) => {
  try {
    const { query, location, radius = 5000, categories = [], maxResults = 20 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const places = await placesService.searchPlaces(query, location, radius, categories, maxResults);
    
    res.json({
      success: true,
      data: places,
      count: places.length,
      query: query,
      location: location
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Bulk search places with multiple queries
router.post('/bulk-search', async (req, res) => {
  try {
    const { queries, location, radius = 5000, categories = [], maxResults = 20 } = req.body;
    
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({ error: 'Queries array is required' });
    }

    if (queries.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 queries allowed per bulk search' });
    }

    const results = [];
    for (const query of queries) {
      if (query.trim()) {
        try {
          const places = await placesService.searchPlaces(query.trim(), location, radius, categories, maxResults);
          results.push({
            query: query.trim(),
            places: places,
            count: places.length
          });
          // Add delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Bulk search error for query "${query}":`, error);
          results.push({
            query: query.trim(),
            places: [],
            count: 0,
            error: error.message
          });
        }
      }
    }

    // Flatten all places for combined results
    const allPlaces = results.flatMap(result => result.places || []);

    res.json({
      success: true,
      data: allPlaces,
      count: allPlaces.length,
      queryResults: results,
      totalQueries: queries.length
    });
  } catch (error) {
    console.error('Bulk search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Get place details by place ID
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await placesService.getPlaceDetails(placeId);
    
    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Export places data as CSV
router.post('/export/csv', async (req, res) => {
  try {
    const { places, filename = 'google-places-export' } = req.body;
    
    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: 'Places data is required for export' });
    }

    const csvData = await csvWriter.generateCSV(places, filename);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send(csvData);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export CSV' 
    });
  }
});

// Export places data as JSON
router.post('/export/json', async (req, res) => {
  try {
    const { places, filename = 'google-places-export' } = req.body;
    
    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: 'Places data is required for export' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.json({
      exported_at: new Date().toISOString(),
      total_places: places.length,
      places: places
    });
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export JSON' 
    });
  }
});

module.exports = router;