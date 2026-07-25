const pdf = require('pdf-parse');
const axios = require('axios');

/**
 * Parses raw PDF text from a buffer.
 * @param {Buffer} buffer 
 * @returns {Promise<string>}
 */
const parsePDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error(`Failed to parse PDF content: ${error.message}`);
  }
};

/**
 * Downloads a PDF from a URL and extracts its text.
 * Useful for processing files already uploaded to Cloudinary.
 * @param {string} url 
 * @returns {Promise<string>}
 */
const getPDFTextFromUrl = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    return await parsePDF(buffer);
  } catch (error) {
    console.error(`Error downloading/parsing PDF from URL (${url}):`, error);
    throw new Error('Failed to retrieve PDF content from external URL.');
  }
};

module.exports = {
  parsePDF,
  getPDFTextFromUrl,
};
