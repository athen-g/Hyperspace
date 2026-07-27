import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    console.error(`Failed to convert image ${url} to Base64:`, e)
    return ''
  }
}

async function loadAndRegisterFont(doc: jsPDF, fontUrl: string, fontName: string, fontStyle = 'normal') {
  try {
    const response = await fetch(fontUrl)
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
  try {
    const doc = new jsPDF({ orientation: 'landscape' })

    // 1. Load Custom Fonts
    await loadAndRegisterFont(doc, '/fonts/Mokoto.ttf', 'Mokoto')
    await loadAndRegisterFont(doc, 'https://cdn.jsdelivr.net/fontsource/fonts/quicksand@latest/latin-400-normal.ttf', 'Quicksand')

    // 2. Load Logos
    const logoBase64 = await imageUrlToBase64(logoUrl)
    const clogoBase64 = await imageUrlToBase64(clogoUrl)

    // 3. Draw Header Logos
    if (logoBase64) {
      const format = logoUrl.toLowerCase().endsWith('.svg') ? 'SVG' : 'PNG'
      doc.addImage(logoBase64, format, 14, 10, 24, 24)
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

    // 6. XR SIG below right end of HYPERSPACE in Times Italic (Black color)
    const hyperspaceWidth = doc.getTextWidth("HYPERSPACE")
    const rightEndX = centerX + (hyperspaceWidth / 2)
    doc.setFont('times', 'italic')
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
  } catch (err) {
    console.error('Failed to export PDF:', err)
  }
}

