import * as pdfjsLib from 'pdfjs-dist'

// Configure worker for Vite client bundling
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

/**
 * Extracts plain text from an uploaded PDF or text file.
 * Reads up to 20 pages (standard for government NITs, scope schedules, and criteria).
 */
export async function extractTextFromFile(file) {
  if (!file) throw new Error('No file provided')

  // Plain text or Markdown fallback
  if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
    return await file.text()
  }

  // Parse PDF
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
  })

  const pdf = await loadingTask.promise
  const maxPages = Math.min(pdf.numPages, 20)
  let extractedText = ''

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const rawPageStrings = textContent.items.map((item) => item.str).join(' ')
    // Sanitize unprintable glyphs and Private Use Area (PUA) characters frequently found in Indian govt PDFs
    const sanitizedPage = rawPageStrings
      .replace(/[\uE000-\uF8FF\uDB80-\uDBFF\uDC00-\uDFFF\uFFF0-\uFFFF\u0000-\u0008\u000B\u000C\u000E-\u001F]/gu, '')
      .replace(/\u00A0/g, ' ')
      .replace(/[ \t]+/g, ' ')
    extractedText += `\n--- [Page ${i} of ${pdf.numPages}] ---\n${sanitizedPage}`
  }

  if (!extractedText.trim()) {
    throw new Error('Could not extract readable text from this PDF. It may be a scanned image-only PDF.')
  }

  return extractedText
}

/**
 * Strips non-Latin regional characters (Devanagari, Hindi, etc.) and private glyphs,
 * retaining purely clean, readable English text, numbers, punctuation, and currency symbols.
 */
export function sanitizeToEnglishText(text) {
  if (!text) return ''
  return text
    // Remove Private Use Area unicode
    .replace(/[\uE000-\uF8FF\uDB80-\uDBFF\uDC00-\uDFFF\uFFF0-\uFFFF]/gu, '')
    // Remove Devanagari and other Indic scripts
    .replace(/[\u0900-\u0DFF]/g, '')
    // Replace non-breaking spaces
    .replace(/\u00A0/g, ' ')
    // Remove stray pipes or slashes left over from bilingual headers
    .replace(/\s*[\/|]\s*[\/|]+\s*/g, ' | ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}
