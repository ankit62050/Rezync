const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to initialize Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Analyzes a resume using Gemini 1.5 Flash.
 * Returns score, detailed pros/cons/recommendations, and structured sections.
 * @param {string} text 
 * @returns {Promise<object>}
 */
const analyzeResumeText = async (text) => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are an expert technical recruiter and resume writer. Analyze the following resume text.
Provide an overall score (0-100), key strengths (pros), weaknesses (cons), actionable improvement recommendations, and parse the text into standard resume sections: Summary, Experience, Projects, Skills, Education.

Ensure the output is in JSON format matching this schema exactly:
{
  "score": number,
  "feedback": {
    "summary": "string describing overall resume quality and recruiters first impression",
    "pros": ["string pro 1", "string pro 2", ...],
    "cons": ["string con 1", "string con 2", ...],
    "recommendations": ["recommendation 1", "recommendation 2", ...]
  },
  "sections": [
    {
      "title": "Summary",
      "content": "parsed professional summary text. Make it clean and professional."
    },
    {
      "title": "Experience",
      "content": "parsed experience details. Include job title, company, dates, and bullet points. Make it clean and professional."
    },
    {
      "title": "Projects",
      "content": "parsed projects details. Include project name, tech stack, and bullet points. Make it clean and professional."
    },
    {
      "title": "Skills",
      "content": "parsed skills details. List languages, frameworks, tools, etc."
    },
    {
      "title": "Education",
      "content": "parsed education details. Include degree, major, university, dates."
    }
  ]
}

Resume Text:
${text}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error in analyzeResumeText:', error);
    throw new Error('Gemini resume analysis failed: ' + error.message);
  }
};

/**
 * Tailors a resume to a job description.
 * Returns match score, gap analysis, modifications list, and tailored sections.
 * @param {string} originalText 
 * @param {string} jobDescription 
 * @returns {Promise<object>}
 */
const tailorResumeText = async (originalText, jobDescription) => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are an expert career coach and technical recruiter. Your task is to tailor a candidate's resume to match a specific Job Description.
Evaluate how well the original resume matches the job description, compute a match score (0-100), identify gaps, and rewrite the resume sections to align with the job requirements without fabricating experience.

Ensure the output is in JSON format matching this schema exactly:
{
  "score": number (match score from 0 to 100),
  "feedback": {
    "summary": "short analysis of how the candidate matches the job and what key modifications were made to align the resume",
    "gaps": ["identified gap 1", "identified gap 2", ...],
    "modifications": ["change 1", "change 2", ...]
  },
  "sections": [
    {
      "title": "Summary",
      "content": "tailored summary content, highlighting experience and goals relevant to the job."
    },
    {
      "title": "Experience",
      "content": "tailored experience content, emphasizing relevant bullet points and accomplishments related to the job."
    },
    {
      "title": "Projects",
      "content": "tailored projects content, highlighting projects that use similar tech or demonstrate relevant skills."
    },
    {
      "title": "Skills",
      "content": "tailored skills content, prioritizing technologies, tools, and methodologies mentioned in the job description."
    },
    {
      "title": "Education",
      "content": "tailored education content."
    }
  ]
}

Original Resume Text:
${originalText}

Job Description:
${jobDescription}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error in tailorResumeText:', error);
    throw new Error('Gemini resume tailoring failed: ' + error.message);
  }
};

module.exports = {
  analyzeResumeText,
  tailorResumeText,
};
