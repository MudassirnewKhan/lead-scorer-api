const scoringService = require('../services/scoring.service');

exports.setOffer = (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Offer data is missing.' });
    }
    scoringService.setOffer(req.body);
    res.status(200).json({ message: 'Offer context set.', offer: req.body });
  } catch (error) {
    res.status(400).json({ error: 'Invalid offer data.' });
  }
};

exports.uploadLeads = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  try {
    const leadCount = await scoringService.processAndStoreLeads(req.file.buffer);
    return res.status(200).json({ message: `${leadCount} leads processed.` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process CSV file.' });
  }
};

exports.scoreLeads = async (req, res) => {
  try {
    const scoredLeads = await scoringService.scoreAllLeads();
    return res.status(200).json({ message: 'Scoring complete.', count: scoredLeads.length, results: scoredLeads });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

exports.getResults = (req, res) => {
  const results = scoringService.getResults();
  res.status(200).json(results);
};