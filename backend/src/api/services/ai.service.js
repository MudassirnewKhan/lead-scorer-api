require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure the API key is not undefined
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
}

// Initialize the Google AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// FIX: Switched to the more widely available 'gemini-1.5-flash-latest' model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

exports.getAIAssessment = async (lead, offer) => {
  const prompt = `
    Analyze the following lead and classify their buying intent for the provided product.
    
    **Product Information:**
    - Name: ${offer.name}
    - Value Propositions: ${offer.value_props.join(', ')}
    - Ideal Customer Profile: ${offer.ideal_use_cases.join(', ')}

    **Lead Information:**
    - Role: ${lead.role}
    - Industry: ${lead.industry}
    - LinkedIn Bio: "${lead.linkedin_bio}"

    **Your Task:**
    Return a single, minified JSON object with two keys: "intent" and "reasoning".
    - "intent": Classify the buying intent as exactly "High", "Medium", or "Low".
    - "reasoning": Provide a concise, one-sentence explanation for your classification.

    Example Response: {"intent":"High","reasoning":"The lead's role as Head of Growth in the SaaS industry perfectly aligns with the ideal customer profile."}
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    // Clean up potential markdown formatting from the response
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error with AI response:", error);
    // Return a default low-intent response if the AI fails
    return {
      intent: 'Low',
      reasoning: 'Could not determine intent due to an AI processing error.'
    };
  }
};

