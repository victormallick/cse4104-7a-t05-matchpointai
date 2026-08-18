let pdfjsLib = null;
try {
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
} catch (e) {
  // pdfjs-dist optional load
}

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
   * Extract text from PDF buffer with multi-stage fallback
   * @param {Buffer} buffer 
   * @returns {Promise<string>}
   */
  static async parsePdf(buffer) {
    // 1. Primary: Modern PDF.js
    if (pdfjsLib) {
      try {
        const uint8Array = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Array,
          useSystemFonts: true,
          disableFontFace: true,
          isEvalSupported: false
        });
        const doc = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        if (fullText.trim()) {
          return fullText.trim();
        }
      } catch (err) {
        console.warn('pdfjs-dist extraction notice:', err.message);
      }
    }

    // 2. Secondary fallback: pdf-parse
    try {
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim()) {
        return data.text.trim();
      }
    } catch (err) {
      console.warn('pdfParse fallback notice:', err.message);
    }

    // 3. Tertiary fallback: Raw stream / text chunk regex extraction
    try {
      const rawString = buffer.toString('latin1');
      const textMatches = rawString.match(/\(([^()]{2,})\)[\s]*Tj/g) || rawString.match(/BT[\s\S]*?ET/g);
      if (textMatches && textMatches.length > 0) {
        const extracted = textMatches
          .join(' ')
          .replace(/BT|ET|Tj|TD|Tm|Tf|\[|\]/g, ' ')
          .replace(/[\\()]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (extracted.length > 20) {
          return extracted;
        }
      }
    } catch (err) {
      console.warn('raw text stream fallback notice:', err.message);
    }

    throw new Error('PDF parsed text is empty or document structure is unreadable.');
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
