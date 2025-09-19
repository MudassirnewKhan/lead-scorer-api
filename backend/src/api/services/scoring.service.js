const csvParser = require('csv-parser');
const { Readable } = require('stream');
const store = require('./data.service');
const { getAIAssessment } = require('./ai.service');

exports.setOffer = (offer) => {
  store.offer = offer;
  store.leads = [];
  store.scoredLeads = [];
};


exports.processAndStoreLeads = (buffer) => {
  return new Promise((resolve, reject) => {
    const leads = [];
    Readable.from(buffer).pipe(csvParser())
      .on('data', (data) => leads.push(data))
      .on('end', () => { store.leads = leads; resolve(leads.length); })
      .on('error', (error) => reject(error));
  });
};

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

const mapAIToPoints = (intent) => ({ High: 50, Medium: 30, Low: 10 }[intent] || 0);

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

exports.getResults = () => store.scoredLeads;
