const { Router } = require('express');
const scoringController = require('../controllers/scoring.controller');
const { upload } = require('../middleware/upload.middleware');

// Create a new router instance to define our API endpoints
const router = Router();

// --- API ROUTES ---

// @route   POST /api/offer
// @desc    Accepts JSON data about the product/offer to set the context for scoring.
router.post('/offer', scoringController.setOffer);

// @route   POST /api/leads/upload
// @desc    Accepts a single CSV file upload containing the leads to be scored.
//          The 'upload.single('leadsFile')' part is middleware that handles the file processing.
router.post('/leads/upload', upload.single('leadsFile'), scoringController.uploadLeads);

// @route   POST /api/score
// @desc    Triggers the main scoring pipeline for the leads that have been uploaded.
router.post('/score', scoringController.scoreLeads);

// @route   GET /api/results
// @desc    Returns a JSON array of the leads after they have been scored.
router.get('/results', scoringController.getResults);

// Export the router so it can be used by the main server in index.js
module.exports = router;

