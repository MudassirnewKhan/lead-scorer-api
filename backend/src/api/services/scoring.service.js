const csvParser = require('csv-parser');
const { Readable } = require('stream');
const store = require('./data.service');
const { getAIAssessment } = require('./ai.service');

// Sets the offer context and resets the lead and score arrays.
exports.setOffer = (offer) => {
  store.offer = offer;
  store.leads = [];
  store.scoredLeads = [];
};

// Parses a CSV file buffer into an array of lead objects.
exports.processAndStoreLeads = (buffer) => {
  return new Promise((resolve, reject) => {
    const leads = [];
    Readable.from(buffer).pipe(csvParser())
      .on('data', (data) => leads.push(data))
      .on('end', () => { store.leads = leads; resolve(leads.length); })
      .on('error', (error) => reject(error));
  });
};

// Calculates the rule-based score (max 50 points) for a single lead.
const calculateRuleScore = (lead, offer) => {
  let score = 0;
  const role = lead.role?.toLowerCase() || '';
  if (['head', 'vp', 'director', 'c-level', 'founder'].some(term => role.includes(term)))
     score += 20;
  else if (['manager', 'lead', 'senior'].some(term => role.includes(term)))
     score += 10;
  if (offer.ideal_use_cases.includes(lead.industry))
     score += 20;
  if (Object.values(lead).every(field => field && field.toString().trim() !== '')) 
    score += 10;
  return score;
};

// Maps the AI's text-based intent ('High', 'Medium', 'Low') to a numerical score.
const mapAIToPoints = (intent) => ({ High: 50, Medium: 30, Low: 10 }[intent] || 0);

// Scores all stored leads by combining the rule-based score and the AI assessment.
exports.scoreAllLeads = async () => {
  if (!store.offer) throw new Error('Offer context must be set first.');
  if (!store.leads.length) throw new Error('Leads must be uploaded first.');

  const promises = store.leads.map(async (lead) => {
    const ruleScore = calculateRuleScore(lead, store.offer);
    const aiAssessment = await getAIAssessment(lead, store.offer);
    const aiPoints = mapAIToPoints(aiAssessment.intent);
    return { ...lead, intent: aiAssessment.intent, score: ruleScore + aiPoints, reasoning: aiAssessment.reasoning };
  });

  store.scoredLeads = await Promise.all(promises);
  return store.scoredLeads;
};

// Retrieves the final array of scored leads.
exports.getResults = () => store.scoredLeads;