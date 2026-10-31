// Tender Dossier & Official NIT Document Exporter for TenderAI
// Generates official Government NIT specification sheets and formal B2B Bid Packages.

/**
 * Generate formatted HTML for an official Government NIT Document
 */
export function generateOfficialNITHTML(tender) {
  const title = tender.title || 'Procurement Project'
  const org = tender.organization || 'Government Procurement Authority'
  const id = tender.id || 'NIT/2026/001'
  const val = tender.estimated_value || tender.estimatedValue || 'To be specified'
  const emd = tender.emd || 'Standard Bid Security'
  const portal = tender.source_portal || tender.sourcePortal || 'Government e-Marketplace (GeM)'
  const location = tender.location || 'India'
  const published = tender.published_at || tender.published || '2026-08-01'
  const closing = tender.closing_at || tender.closing || '2026-11-30'
  const desc = tender.description || 'Full turnkey execution and maintenance as per government standards.'

  const eligibilityList = (
    Array.isArray(tender.eligibility)
      ? tender.eligibility
      : typeof tender.eligibility === 'string'
      ? JSON.parse(tender.eligibility || '[]')
      : []
  )
    .map((e) => `<li>${e}</li>`)
    .join('')

  const docsList = (
    Array.isArray(tender.documents_required)
      ? tender.documents_required
      : Array.isArray(tender.documents)
      ? tender.documents
      : typeof tender.documents_required === 'string'
      ? JSON.parse(tender.documents_required || '[]')
      : []
  )
    .map((d) => `<li>${d}</li>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official NIT - ${id}</title>
  <style>
    @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
    body { font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.5; font-size: 11pt; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
    .emblem { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .sub-emblem { font-size: 11pt; font-style: italic; margin-top: 4px; color: #333; }
    .doc-title { font-size: 13pt; font-weight: bold; text-decoration: underline; margin-top: 12px; text-transform: uppercase; }
    .nit-meta { display: flex; justify-content: space-between; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 10pt; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10.5pt; }
    table, th, td { border: 1px solid #333; }
    th { background-color: #f2f2f2; text-align: left; padding: 6px 10px; font-weight: bold; }
    td { padding: 6px 10px; }
    h3 { font-size: 11pt; text-transform: uppercase; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px solid #888; padding-bottom: 2px; }
    ul { margin: 6px 0 12px 20px; padding: 0; }
    li { margin-bottom: 4px; }
    .footer-sign { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .stamp-box { border: 1px dashed #666; width: 150px; height: 70px; text-align: center; line-height: 70px; font-size: 9pt; color: #888; }
    .print-bar { background: #1e293b; color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; margin-bottom: 20px; font-family: sans-serif; font-size: 13px; }
    .print-btn { background: #f59e0b; color: #000; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    @media print {
      .print-bar { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>Official Tender Document:</strong> ${id} (${portal})</span>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div class="emblem">GOVERNMENT OF INDIA / STATE PROCUREMENT PORTAL</div>
    <div class="sub-emblem">${org}</div>
    <div class="sub-emblem">Office of the Superintending Engineer / Competent Procurement Authority</div>
    <div class="doc-title">NOTICE INVITING TENDER (NIT) & BID SPECIFICATIONS</div>
  </div>

  <div class="nit-meta">
    <span>Tender Ref No: ${id}</span>
    <span>Date: ${published}</span>
  </div>

  <p>Online electronic bids are hereby invited under a <strong>Two-Cover System (Technical & Financial)</strong> through the <strong>${portal}</strong> by the competent authority on behalf of <strong>${org}</strong> for the execution of the contract specified hereunder:</p>

  <table>
    <tr>
      <th style="width: 35%;">Project Name / Scope</th>
      <td><strong>${title}</strong></td>
    </tr>
    <tr>
      <th>Procuring Authority</th>
      <td>${org}</td>
    </tr>
    <tr>
      <th>Place of Execution</th>
      <td>${location}</td>
    </tr>
    <tr>
      <th>Estimated Contract Value</th>
      <td><strong>${val}</strong></td>
    </tr>
    <tr>
      <th>Earnest Money Deposit (EMD)</th>
      <td><strong>${emd}</strong> (Exemption as per MSME / Startup GTC guidelines)</td>
    </tr>
    <tr>
      <th>Source Procurement Portal</th>
      <td>${portal}</td>
    </tr>
    <tr>
      <th>Bid Document Download Start Date</th>
      <td>${published} 10:00 AM IST</td>
    </tr>
    <tr>
      <th>Last Date & Time for Online Submission</th>
      <td><strong>${closing} 17:00 PM IST</strong></td>
    </tr>
    <tr>
      <th>Technical Bid Opening Date</th>
      <td>${closing} 17:30 PM IST</td>
    </tr>
  </table>

  <h3>Section 1: Scope of Work & Project Deliverables</h3>
  <p>${desc}</p>
  <p>The contractor shall be solely responsible for turnkey delivery, compliance with technical specifications, obtaining necessary statutory clearances, and providing comprehensive on-site warranty and maintenance for the designated contract duration.</p>

  <h3>Section 2: Minimum Vendor Eligibility Criteria</h3>
  <ul>
    ${eligibilityList || '<li>Standard vendor compliance and active registration required.</li>'}
  </ul>

  <h3>Section 3: Mandatory Statutory Documents Required</h3>
  <ul>
    ${docsList || '<li>GST, PAN, Technical Compliance, and Financial Certificates.</li>'}
  </ul>

  <h3>Section 4: General Terms, Conditions & Penalties</h3>
  <ul>
    <li><strong>Liquidated Damages (LD):</strong> Delay in execution beyond agreed milestones shall incur liquidated damages @ 0.5% per week of delay subject to a maximum ceiling of 10% of total contract value.</li>
    <li><strong>Performance Security:</strong> The successful bidder must furnish a Performance Bank Guarantee (PBG) equivalent to 3% to 5% of the contract value within 15 days of Award of Contract.</li>
    <li><strong>Payment Terms:</strong> Milestone-based progressive payments cleared upon stage-wise technical inspection and verification by the nodal engineer.</li>
    <li><strong>Make in India Preference:</strong> Purchase preference shall be granted to Class-I and Class-II Local Suppliers as per Ministry of Commerce guidelines.</li>
  </ul>

  <div class="footer-sign">
    <div class="stamp-box">OFFICIAL EMBLEM / SEAL</div>
    <div style="text-align: right;">
      <p style="margin-bottom: 40px;"><strong>For and on behalf of ${org}</strong></p>
      <p><strong>Authorized Tender Officer / Superintending Engineer</strong><br>Procurement & Contract Division</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Triggers direct download/print of the official government NIT document
 */
export function downloadOfficialNIT(tender) {
  // If user uploaded a real PDF file URL or direct portal document link exists:
  if (tender.raw_pdf_url || (tender.source_url && tender.source_url.startsWith('http'))) {
    window.open(tender.raw_pdf_url || tender.source_url, '_blank')
    return
  }

  // Otherwise, generate the official standardized government NIT document
  const html = generateOfficialNITHTML(tender)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  // Open in a printable tab
  const win = window.open(url, '_blank')
  if (!win) {
    // Popup blocked, trigger direct HTML download
    const link = document.createElement('a')
    link.href = url
    link.download = `${tender.id.replace(/[^a-zA-Z0-9_-]/g, '_')}_Official_NIT.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Export the complete formal Bid Submission Dossier to Microsoft Word (.doc)
 */
export function exportBidDossierToWord({ tender, company, form, checkedDocs }) {
  const tenderTitle = tender?.title || 'Government Procurement Bid'
  const tenderOrg = tender?.organization || 'Procuring Authority'
  const tenderId = tender?.id || 'N/A'
  const firmName = form?.firmName || company?.name || 'Registered Bidder Firm'
  const quoted = form?.quotedAmount || tender?.estimated_value || 'As per BOQ'
  const proposalText = form?.technicalProposal || 'Technical proposal details as submitted.'

  const checkedList = Object.entries(checkedDocs || {})
    .filter(([_, checked]) => checked)
    .map(([doc]) => `<li>[VERIFIED] ${doc}</li>`)
    .join('')

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Bid Submission Dossier - ${tenderId}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #111; }
    h1 { font-size: 16pt; color: #10233f; text-align: center; text-transform: uppercase; border-bottom: 2px solid #10233f; padding-bottom: 6px; }
    h2 { font-size: 13pt; color: #a8791d; border-bottom: 1px solid #ccc; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    table, th, td { border: 1px solid #999; padding: 6px 10px; font-size: 10pt; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .letterhead { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 15px; color: #10233f; }
  </style>
</head>
<body>
  <div class='letterhead'>${firmName.toUpperCase()}<br><span style='font-size: 10pt; font-weight: normal; color: #555;'>GSTIN: ${form?.gstNumber || company?.gstin || 'N/A'} | PAN: ${company?.pan || 'N/A'}</span></div>

  <h1>FORMAL BID SUBMISSION DOSSIER</h1>
  <p><strong>To:</strong><br>The Competent Procurement Officer<br>${tenderOrg}<br>${tender?.location || 'India'}</p>
  <p><strong>Sub:</strong> Submission of Technical & Commercial Bid for <em>"${tenderTitle}"</em> (Ref NIT: <strong>${tenderId}</strong>)</p>

  <h2>1. Executive Bid Summary</h2>
  <table>
    <tr><th>Tender Reference</th><td>${tenderId}</td></tr>
    <tr><th>Procuring Entity</th><td>${tenderOrg}</td></tr>
    <tr><th>Bidder Name</th><td>${firmName}</td></tr>
    <tr><th>Quoted Bid Value</th><td><strong>${quoted}</strong></td></tr>
    <tr><th>Authorized Signatory</th><td>${form?.contactPerson || 'Authorized Representative'} (${form?.phone || ''})</td></tr>
  </table>

  <h2>2. Technical Proposal & Execution Methodology</h2>
  <div>${proposalText.replace(/\n/g, '<br>')}</div>

  <h2>3. Document Verification & Compliance Matrix</h2>
  <ul>
    ${checkedList || '<li>All mandatory documents as requested in NIT uploaded.</li>'}
  </ul>

  <h2>4. Statutory Undertakings & Declarations</h2>
  <p>1. <strong>Non-Blacklisting:</strong> We hereby declare that our firm has not been debarred or blacklisted by any Central/State Government Ministry, PSU, or autonomous body.<br>
  2. <strong>Make in India:</strong> We certify that the local value addition for the proposed deliverables satisfies Class-I Local Supplier criteria.<br>
  3. <strong>Validity:</strong> This commercial quotation and technical undertaking remain unconditionally valid for a minimum period of 180 days from the date of bid opening.</p>

  <br><br>
  <table style='border: none;'>
    <tr style='border: none;'>
      <td style='border: none;'><strong>Authorized Signature & Stamp</strong><br><br>________________________________<br>${firmName}</td>
      <td style='border: none; text-align: right;'><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br><strong>Place:</strong> ${tender?.location || 'India'}</td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const blob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${tenderId.replace(/[^a-zA-Z0-9_-]/g, '_')}_Bid_Dossier_${firmName.replace(/[^a-zA-Z0-9]/g, '_')}.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
