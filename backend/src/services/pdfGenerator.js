const PDFDocument = require('pdfkit');

/**
 * Helper to render text with markdown bolding (**text**) inline in PDFKit
 */
const renderRichText = (doc, text, x, width, isBullet = false) => {
  doc.x = x;
  
  if (isBullet) {
    doc.font('Helvetica').fontSize(9).fillColor('#000000');
    // Bullet character: standard bullet (•)
    doc.text('\u2022  ', { continued: true });
  }

  // Split by '**' to alternate bold/normal text
  const parts = text.split('**');
  let isBold = false;
  const textWidth = isBullet ? width - 12 : width;
  
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    doc
      .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(9)
      .fillColor('#000000');
    
    doc.text(part, {
      width: textWidth,
      continued: !isLast,
      lineGap: 2
    });
    isBold = !isBold;
  });
  
  // Reset continuation state for future lines
  doc.text('', { continued: false });
};

/**
 * Generates a highly polished, ATS-friendly resume PDF.
 * @param {object} options
 * @param {string} options.candidateName - Name of the candidate
 * @param {string} [options.role] - Role/title
 * @param {string} [options.email] - Contact email
 * @param {string} [options.linkedin] - LinkedIn URL
 * @param {string} [options.github] - GitHub URL
 * @param {Array<{title: string, content: string}>} options.sections - Resume sections
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateResumePDF = (options) => {
  return new Promise((resolve, reject) => {
    try {
      const { candidateName, role, email, linkedin, github, sections } = options;

      // ATS margin standards: 0.5 inches (36pt)
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 45, right: 45 },
        bufferPages: true,
        info: {
          Title: `${candidateName} - Resume`,
          Author: candidateName,
          Subject: role || 'Resume',
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const leftMargin = doc.page.margins.left;

      // ===== HEADER =====
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#000000')
        .text(candidateName.toUpperCase(), { align: 'center' });

      if (role) {
        doc
          .moveDown(0.1)
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#333333')
          .text(role, { align: 'center' });
      }

      // Contact info row (clean, pipe separated)
      const contactParts = [];
      if (email) contactParts.push(email);
      if (linkedin) {
        // Clean URL to make it shorter and cleaner for resume header
        const cleanLinkedin = linkedin.replace(/^https?:\/\/(www\.)?/, '');
        contactParts.push(cleanLinkedin);
      }
      if (github) {
        const cleanGithub = github.replace(/^https?:\/\/(www\.)?/, '');
        contactParts.push(cleanGithub);
      }

      if (contactParts.length > 0) {
        doc
          .moveDown(0.2)
          .font('Helvetica')
          .fontSize(8.5)
          .fillColor('#444444')
          .text(contactParts.join('   |   '), { align: 'center' });
      }

      doc.moveDown(0.4);

      // ===== SECTIONS =====
      if (sections && sections.length > 0) {
        sections.forEach((section, index) => {
          if (!section.title || !section.content) return;

          // Section Title
          doc.moveDown(0.6);
          
          // Page check before adding section header
          if (doc.y > doc.page.height - doc.page.margins.bottom - 50) {
            doc.addPage();
          }

          doc
            .font('Helvetica-Bold')
            .fontSize(10.5)
            .fillColor('#000000')
            .text(section.title.toUpperCase(), leftMargin, doc.y);

          // Horizontal rule divider under section title
          doc.moveDown(0.15);
          const lineY = doc.y;
          doc
            .moveTo(leftMargin, lineY)
            .lineTo(leftMargin + pageWidth, lineY)
            .strokeColor('#000000')
            .lineWidth(0.75)
            .stroke();

          doc.moveDown(0.3);

          // Render section contents line by line
          const lines = section.content.split('\n');
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) {
              doc.moveDown(0.15);
              return;
            }

            // Check if page overflow
            if (doc.y > doc.page.height - doc.page.margins.bottom - 15) {
              doc.addPage();
            }

            // Detect list indentation level
            const leadingSpaces = line.match(/^\s*/)[0].length;
            let indent = 0;
            if (leadingSpaces >= 4) {
              indent = 20; // Nested bullets
            } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
              indent = 8;  // First-level bullets
            }

            // Clean list markers
            let isBullet = false;
            let textContent = trimmed;
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
              isBullet = true;
              textContent = trimmed.substring(2).trim();
            } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
              isBullet = true;
              textContent = trimmed.substring(1).trim();
            }

            // Check for right-aligned metadata separated by a pipe '|'
            const lastPipeIndex = textContent.lastIndexOf('|');
            if (lastPipeIndex !== -1) {
              const leftPart = textContent.substring(0, lastPipeIndex).trim();
              const rightPart = textContent.substring(lastPipeIndex + 1).trim();

              // Right-align only if the right side is brief/metadata (e.g. date, GPA, location, short links)
              if (rightPart.length < 35 && !rightPart.includes('http') && !rightPart.includes('@')) {
                const startY = doc.y;

                // Render right part
                doc.font('Helvetica-Bold').fontSize(9).fillColor('#333333');
                const rightWidth = doc.widthOfString(rightPart);
                doc.text(rightPart, leftMargin + pageWidth - rightWidth, startY, { lineBreak: false });

                // Render left part
                const leftWidth = pageWidth - rightWidth - 15 - indent;
                renderRichText(doc, leftPart, leftMargin + indent, leftWidth, isBullet);

                // Set cursor below both elements
                doc.y = Math.max(doc.y, startY + 11);
                return;
              }
            }

            // Standard line rendering
            renderRichText(doc, textContent, leftMargin + indent, pageWidth - indent, isBullet);
          });
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateResumePDF };
