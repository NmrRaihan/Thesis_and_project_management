// services/aiService.js
// AI Service for integrating with OpenAI API

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Check if API key is available
if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. AI features will use mock data.');
}

/**
 * Call OpenAI API with a prompt
 * @param {string} prompt - The prompt to send to the AI
 * @param {number} maxTokens - Maximum tokens for the response
 * @returns {Promise<string>} - The AI-generated response
 */
const callOpenAI = async (prompt, maxTokens = 500) => {
  // If no API key, return mock data
  if (!OPENAI_API_KEY) {
    return mockAIResponse(prompt);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI Service Error:', error);
    // Fallback to mock data on error
    return mockAIResponse(prompt);
  }
};

/**
 * Generate mock AI responses for development/testing
 * @param {string} prompt - The prompt that was sent
 * @returns {string} - Mock response based on prompt type
 */
const mockAIResponse = (prompt) => {
  if (prompt.includes('title') || prompt.includes('Title')) {
    return "AI-Enhanced Approach to Modern Research Challenges";
  } else if (prompt.includes('proposal') || prompt.includes('Proposal')) {
    return `# Research Proposal: AI-Driven Solutions

## Abstract
This research explores cutting-edge methodologies in the specified field with a focus on innovative approaches to current challenges.

## Introduction
This comprehensive study aims to investigate advanced technologies with a particular focus on addressing contemporary issues in the field. The research will explore various methodologies and techniques to provide valuable insights and practical solutions.

## Problem Statement
The primary challenge addressed in this research is the need for more efficient and effective approaches to solving complex problems in the domain.

## Objectives
1. To analyze current methodologies and identify limitations
2. To develop innovative solutions that address key challenges
3. To evaluate the effectiveness of proposed approaches through rigorous testing
4. To contribute valuable insights to the academic community

## Methodology
The research will employ a mixed-methods approach combining:
- Literature review and analysis
- Experimental design and implementation
- Data collection and statistical analysis
- Comparative studies with existing approaches

## Expected Outcomes
This research aims to achieve significant contributions to the field by:
- Developing novel methodologies
- Providing empirical evidence for proposed solutions
- Creating a framework for future research
- Publishing findings in reputable academic journals

## Timeline
- Phase 1 (Months 1-2): Literature Review and Problem Definition
- Phase 2 (Months 3-4): Methodology Design and Planning
- Phase 3 (Months 5-8): Implementation and Experimentation
- Phase 4 (Months 9-10): Data Analysis and Evaluation
- Phase 5 (Months 11-12): Documentation and Dissemination

## References
1. Smith, J. (2023). Advanced Research Methods. Academic Press.
2. Johnson, A. (2022). Innovation in Technology. Tech Publications.
3. Williams, R. (2021). Contemporary Approaches. Research House.`;
  } else if (prompt.includes('description') || prompt.includes('Description')) {
    return "This comprehensive research aims to investigate cutting-edge technologies with a particular focus on innovative approaches to current challenges. The study will explore various methodologies and techniques to address key issues in the field, with the ultimate goal of contributing valuable insights and practical solutions to the academic community and industry professionals.";
  }
  return "AI-generated content would appear here with a valid API key.";
};

/**
 * Generate research proposal titles
 * @param {string} description - Research description
 * @param {string} field - Research field
 * @returns {Promise<string>} - Generated title
 */
export const generateProposalTitle = async (description, field) => {
  const prompt = `Generate exactly 3 compelling and professional research proposal titles for a ${field || 'academic'} project with this description: "${description || 'general research in the field'}". Number them 1., 2., 3. and make them concise but descriptive.`;
  
  const response = await callOpenAI(prompt, 150);
  return response;
};

/**
 * Improve research description
 * @param {string} description - Original description
 * @param {string} field - Research field
 * @returns {Promise<string>} - Enhanced description
 */
export const improveDescription = async (description, field) => {
  const prompt = `Improve and expand this research description for a ${field || 'academic'} project: "${description}". Make it more professional, detailed, and compelling for academic review. Focus on clarity, significance, and methodology.`;
  
  const response = await callOpenAI(prompt, 300);
  return response;
};

/**
 * Generate full research proposal
 * @param {object} proposalData - Object containing title, description, field, etc.
 * @returns {Promise<string>} - Generated full proposal
 */
export const generateFullProposal = async (proposalData) => {
  const { title, description, field, project_type, keywords } = proposalData;
  
  const prompt = `Create a comprehensive ${project_type || 'research'} proposal with the following details:
Title: "${title || 'Research Project'}"
Field: ${field || 'Academic Research'}
Description: "${description || 'General research investigation'}"
Keywords: ${keywords ? keywords.join(', ') : 'Not specified'}

Structure the proposal with these sections:
1. Title
2. Abstract (150-200 words)
3. Introduction (200-300 words)
4. Problem Statement (150-200 words)
5. Objectives (bullet points)
6. Methodology (300-400 words)
7. Expected Outcomes (150-200 words)
8. Timeline (5 phases as bullet points)
9. References (3 academic-style references)

Make it professional and detailed.`;
  
  const response = await callOpenAI(prompt, 1000);
  return response;
};

/**
 * Get AI suggestions for keywords
 * @param {string} title - Proposal title
 * @param {string} description - Research description
 * @returns {Promise<string[]>} - Array of suggested keywords
 */
export const suggestKeywords = async (title, description) => {
  const prompt = `Based on this research title: "${title || 'Academic Research'}" and description: "${description || 'General investigation'}", suggest 5-8 relevant academic keywords for indexing and searchability. Return them as a comma-separated list.`;
  
  const response = await callOpenAI(prompt, 100);
  return response.split(',').map(keyword => keyword.trim()).filter(Boolean);
};

export default {
  generateProposalTitle,
  improveDescription,
  generateFullProposal,
  suggestKeywords
};