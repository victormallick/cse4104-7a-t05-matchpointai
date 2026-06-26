const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Service to parse text from resumes in different formats (PDF, DOCX, TXT)
 */
class ParserService {
  /**
   * Parse a file buffer based on its MIME type or file extension
   * @param {Buffer} buffer - File buffer from multer
   * @param {string} mimeType - File MIME type
   * @param {string} originalName - Original file name
   * @returns {Promise<string>} Parsed plain text
   */
  static async parseFile(buffer, mimeType, originalName) {
    if (!buffer) {
      throw new Error('No file buffer provided.');
    }

    const extension = originalName ? originalName.split('.').pop().toLowerCase() : '';

    try {
      // 1. PDF Parsing
      if (mimeType === 'application/pdf' || extension === 'pdf') {
        return await this.parsePdf(buffer);
      }

      // 2. DOCX Parsing
      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        extension === 'docx'
      ) {
        return await this.parseDocx(buffer);
      }

      // 3. Plain Text Parsing
      if (mimeType === 'text/plain' || extension === 'txt') {
        return buffer.toString('utf-8');
      }

      // Default fallback or error
      throw new Error(`Unsupported file type: ${mimeType || extension}. Please upload a PDF, DOCX, or TXT file.`);
    } catch (error) {
      console.error(`Error parsing file (${originalName}):`, error);
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF buffer
   * @param {Buffer} buffer 
   * @returns {Promise<string>}
   */
  static async parsePdf(buffer) {
    const data = await pdfParse(buffer);
    if (!data || !data.text) {
      throw new Error('PDF parsed text is empty or invalid.');
    }
    return data.text.trim();
  }

  /**
   * Extract text from DOCX buffer
   * @param {Buffer} buffer 
   * @returns {Promise<string>}
   */
  static async parseDocx(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    if (!result || typeof result.value !== 'string') {
      throw new Error('DOCX parsed text is empty or invalid.');
    }
    
    // Log warnings if any (e.g. unsupported formatting)
    if (result.messages && result.messages.length > 0) {
      console.log('Mammoth parser warnings:', result.messages.map(m => m.message).join(', '));
    }
    
    return result.value.trim();
  }
}

module.exports = ParserService;
