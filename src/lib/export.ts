import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 2500): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

async function imageUrlToPngBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        // Default to a reasonable size if not defined
        const width = img.naturalWidth || img.width || 120
        const height = img.naturalHeight || img.height || 120
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context'))
          return
        }
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        const base64 = canvas.toDataURL('image/png')
        resolve(base64)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
}

async function loadAndRegisterFont(doc: jsPDF, fontUrl: string, fontName: string, fontStyle = 'normal') {
  try {
    const response = await fetchWithTimeout(fontUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.substring(result.indexOf(',') + 1))
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    
    const filename = `${fontName}.ttf`
    doc.addFileToVFS(filename, base64)
    doc.addFont(filename, fontName, fontStyle)
  } catch (e) {
    console.error(`Failed to load font ${fontName}:`, e)
  }
}

export function exportToXLSX(rows: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

function setSafeFont(doc: jsPDF, fontName: string, fontStyle = 'normal', fallback = 'helvetica') {
  try {
    const fonts = doc.getFontList()
    if (fonts[fontName]) {
      doc.setFont(fontName, fontStyle)
    } else {
      doc.setFont(fallback, fontStyle)
    }
  } catch (e) {
    doc.setFont(fallback, fontStyle)
  }
}

export async function exportToPDF(
  columns: string[],
  rows: (string | number | null)[][],
  eventTitle: string,
  filename: string,
  logoUrl: string,
  clogoUrl: string
) {
  const toastId = toast.loading('Generating premium PDF report...')
  try {
    const doc = new jsPDF({ orientation: 'landscape' })

    // 1. Load Custom Fonts (Non-blocking fallback)
    await Promise.all([
      loadAndRegisterFont(doc, '/fonts/Mokoto.ttf', 'Mokoto'),
      loadAndRegisterFont(doc, 'https://cdn.jsdelivr.net/fontsource/fonts/quicksand@latest/latin-400-normal.ttf', 'Quicksand')
    ]).catch(err => console.warn('Font preloading failed, using fallback fonts:', err))

    // 2. Load Logos (Rendered to PNG canvas)
    let logoBase64 = ''
    let clogoBase64 = ''
    try {
      logoBase64 = await imageUrlToPngBase64(logoUrl)
    } catch (err) {
      console.warn('Failed to load logo.svg:', err)
    }
    try {
      clogoBase64 = await imageUrlToPngBase64(clogoUrl)
    } catch (err) {
      console.warn('Failed to load clogo.png:', err)
    }

    // 3. Draw Header Logos
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 24, 24)
    }
    if (clogoBase64) {
      doc.addImage(clogoBase64, 'PNG', 297 - 14 - 24, 10, 24, 24)
    }

    const centerX = 297 / 2

    // 4. Above HYPERSPACE: Wadia College Header in Quicksand (Black color)
    setSafeFont(doc, 'Quicksand', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text("WADIA COLLEGE OF ENGINEERING'S", centerX, 14, { align: 'center' })
    doc.text("DEPARTMENT OF COMPUTER ENGINEERING", centerX, 19, { align: 'center' })

    // 5. HYPERSPACE in Mokoto (Black color)
    setSafeFont(doc, 'Mokoto', 'normal')
    doc.setFontSize(30)
    doc.setTextColor(0, 0, 0)
    doc.text("HYPERSPACE", centerX, 32, { align: 'center' })

    // 6. XR SIG below right end of HYPERSPACE in Times Normal (Black color)
    const hyperspaceWidth = doc.getTextWidth("HYPERSPACE")
    const rightEndX = centerX + (hyperspaceWidth / 2)
    doc.setFont('times', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("XR SIG", rightEndX, 39, { align: 'right' })

    // 7. Event Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(eventTitle, centerX, 52, { align: 'center' })

    // 8. "Attendance" Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text("Attendance Report", centerX, 58, { align: 'center' })

    // 9. Table starting below header area
    autoTable(doc, {
      head: [columns],
      body: rows as (string | number)[][],
      startY: 64,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 30, 30] },
    })

    doc.save(`${filename}.pdf`)
    toast.success('PDF report downloaded successfully!', { id: toastId })
  } catch (err) {
    console.error('Failed to export PDF:', err)
    toast.error(`Failed to export PDF: ${err instanceof Error ? err.message : String(err)}`, { id: toastId })
  }
}

