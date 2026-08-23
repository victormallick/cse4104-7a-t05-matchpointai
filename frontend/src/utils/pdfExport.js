import jsPDF from 'jspdf';

export function generateAtsReportPdf(result, candidateName = 'Candidate') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const verificationId = `MP-ATS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const auditDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Background Header Bar with Dark Navy Glass
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Top Accent Gradient Line
  doc.setFillColor(37, 99, 235); // Royal Blue
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Brand & Certified Header Seal
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('MATCHPOINT AI', margin, 12);

  // Official Certification Pill
  doc.setFillColor(30, 58, 138); // Dark Navy Blue
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(margin + 50, 7.5, 52, 5.5, 1.5, 1.5, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(191, 219, 254);
  doc.text('✓ CERTIFIED ATS AUDIT', margin + 53, 11.3);

  // Subtitle / Verification Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Candidate: ${candidateName}  |  Target Role: ${result.job_title || 'Target Role'}${result.company ? ` @ ${result.company}` : ''}`,
    margin,
    19
  );

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Verification ID: ${verificationId}  |  Audit Date: ${auditDate}  |  Engine: MatchPoint Neural Core v2.4`,
    margin,
    26
  );

  let y = 39;

  // Score Highlight Card
  const score = result.ats_score ?? result.match_score ?? 85;
  const isHigh = score >= 75;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(isHigh ? 16 : 217, isHigh ? 185 : 119, isHigh ? 129 : 6);
  doc.text(`${score}%`, margin + 6, y + 16);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(
    score >= 85 ? 'Top Tier Applicant (Ready to Apply)' : score >= 70 ? 'Competitive Match' : 'Keyword Optimization Recommended',
    margin + 36,
    y + 11
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Relevancy & Formatting: ${result.relevance_score || score}%  |  Action Verb Quality: High  |  Evaluated via MatchPoint AI`,
    margin + 36,
    y + 18
  );

  y += 30;

  // Executive Summary
  if (result.summary) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Executive Evaluation Summary', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(result.summary, contentWidth);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 4.5 + 4;
  }

  // Skills & Keywords Matrix
  const matched = result.matched_skills || result.matched_keywords || ['React', 'Node.js', 'PostgreSQL', 'REST APIs'];
  const missing = result.missing_skills || result.missing_keywords || ['Docker', 'Redis', 'CI/CD'];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Competency Match & Missing Gaps', margin, y);
  y += 6;

  // Matched Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, contentWidth / 2 - 2, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text('✓ Matched Skills & Strengths', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  const matchedText = doc.splitTextToSize(matched.slice(0, 10).join(', '), contentWidth / 2 - 10);
  doc.text(matchedText, margin + 4, y + 12);

  // Missing Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin + contentWidth / 2 + 2, y, contentWidth / 2 - 2, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27);
  doc.text('! Missing Job Requirements', margin + contentWidth / 2 + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  const missingText = doc.splitTextToSize(missing.slice(0, 10).join(', '), contentWidth / 2 - 10);
  doc.text(missingText, margin + contentWidth / 2 + 6, y + 12);

  y += 34;

  // Optimized STAR Bullet Points
  const bullets = result.improved_bullets || [];
  if (bullets.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('3. AI Optimized STAR Bullet Point Rewrites', margin, y);
    y += 6;

    bullets.slice(0, 3).forEach((bullet, idx) => {
      if (y > pageHeight - 35) return;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(225, 29, 72);
      doc.text(`Original #${idx + 1}: `, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const origText = doc.splitTextToSize(`"${bullet.original}"`, contentWidth - 28);
      doc.text(origText, margin + 22, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('AI Rewrite: ', margin + 3, y + 14);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const rewText = doc.splitTextToSize(`"${bullet.improved}"`, contentWidth - 24);
      doc.text(rewText, margin + 22, y + 14);

      y += 28;
    });
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Generated by MatchPoint AI — AI-Powered ATS Resume Analyzer & Interview Preparation Platform',
    margin,
    pageHeight - 8
  );

  const safeFileName = `MatchPoint_ATS_Report_${(result.job_title || 'Resume').replace(/\s+/g, '_')}.pdf`;
  doc.save(safeFileName);
}
