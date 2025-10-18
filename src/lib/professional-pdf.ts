import jsPDF from 'jspdf'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
}

interface Recipient {
  id: string
  clientId: string
  name: string
  email?: string
  phone?: string
  position?: string
}

interface ConceptItem {
  id: string
  type: 'title' | 'concept'
  title?: string
  description?: string
  unit?: string
  quantity?: number
  unitPrice?: number
  total?: number
}

interface Budget {
  id: string
  clientId: string
  recipientId: string
  date: string
  description?: string
  concepts: ConceptItem[]
  subtotal: number
  ivaPercentage: number
  ivaAmount: number
  total: number
}

// Función para generar PDF profesional con logo y colores corporativos
export const generateProfessionalPDF = (
  budget: Budget,
  client: Client,
  recipient: Recipient,
  quoteNumber: string = 'AUTO'
) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  
  // Colores corporativos
  const colors = {
    primary: [211, 47, 47],     // Rojo CONSTRU-FE
    secondary: [25, 118, 210],  // Azul CONSTRU-FE
    text: [0, 0, 0],           // Negro
    gray: [100, 100, 100],     // Gris
    lightGray: [240, 240, 240] // Gris claro
  }
  
  let currentPage = 1
  let yPosition = 20
  
  // Función para agregar nueva página con encabezado
  const addNewPage = () => {
    pdf.addPage()
    currentPage++
    yPosition = 20
    addPageHeader()
  }
  
  // Función para verificar si necesitamos nueva página
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 40) {
      addNewPage()
      return true
    }
    return false
  }
  
  // Función para agregar encabezado de página con logo
  const addPageHeader = () => {
    // Logo CONSTRU-FE (círculo con espada)
    const logoX = pageWidth / 2 - 15
    const logoY = yPosition
    
    // Círculo exterior rojo
    pdf.setFillColor(...colors.primary)
    pdf.circle(logoX + 15, logoY + 15, 15, 'F')
    
    // Círculo interior azul
    pdf.setFillColor(...colors.secondary)
    pdf.circle(logoX + 15, logoY + 15, 12, 'F')
    
    // Espada/blanco (simulado con rectángulos)
    pdf.setFillColor(255, 255, 255)
    pdf.rect(logoX + 13, logoY + 5, 4, 20, 'F') // Espada vertical
    pdf.rect(logoX + 10, logoY + 10, 10, 3, 'F') // Guardia
    
    // Texto FE
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text('FE', logoX + 15, logoY + 18, { align: 'center' })
    
    yPosition += 35
    
    // Nombre de la empresa
    pdf.setTextColor(...colors.primary)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text('CONSTRU-FE', pageWidth / 2, yPosition, { align: 'center' })
    
    pdf.setTextColor(...colors.secondary)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.text('CONSTRUIRLO ES POSIBLE', pageWidth / 2, yPosition + 7, { align: 'center' })
    
    yPosition += 20
    
    // Línea separadora
    pdf.setDrawColor(...colors.primary)
    pdf.setLineWidth(0.5)
    pdf.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 10
    
    // Número de página
    pdf.setTextColor(...colors.gray)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text(`Página ${currentPage}`, pageWidth - 30, pageHeight - 10)
  }
  
  // Función para agregar texto con formato
  const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, color: number[] = colors.text) => {
    pdf.setTextColor(...color)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    pdf.setFontSize(fontSize)
    pdf.text(text, x, y)
  }
  
  // Función para agregar tabla de conceptos
  const addConceptTable = (concepts: ConceptItem[], startIndex: number = 0) => {
    const tableStartY = yPosition
    const rowHeight = 8
    const maxRowsPerPage = Math.floor((pageHeight - yPosition - 80) / rowHeight)
    
    // Encabezados de tabla
    addText('Cantidad', 20, yPosition, 10, true)
    addText('Concepto', 45, yPosition, 10, true)
    addText('Unidad', 140, yPosition, 10, true)
    addText('P.U.', 165, yPosition, 10, true)
    addText('Importe', 190, yPosition, 10, true)
    
    yPosition += 6
    pdf.setDrawColor(...colors.text)
    pdf.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 4
    
    let conceptsAdded = 0
    
    for (let i = startIndex; i < concepts.length && conceptsAdded < maxRowsPerPage; i++) {
      const concept = concepts[i]
      
      if (concept.type === 'title') {
        // Título de sección
        checkPageBreak(15)
        pdf.setFillColor(...colors.lightGray)
        pdf.rect(20, yPosition - 2, pageWidth - 40, 10, 'F')
        addText(concept.title || '', 45, yPosition + 4, 11, true)
        yPosition += 10
      } else if (concept.type === 'concept') {
        // Concepto individual
        checkPageBreak(12)
        
        const quantity = concept.quantity || 0
        const description = concept.description || ''
        const unit = concept.unit || 'UNIDAD'
        const unitPrice = concept.unitPrice || 0
        const total = concept.total || 0
        
        addText(quantity.toString(), 20, yPosition + 4, 9)
        
        // Manejo de descripciones largas
        const maxCharsPerLine = 40
        if (description.length > maxCharsPerLine) {
          const words = description.split(' ')
          let currentLine = ''
          let lineCount = 0
          
          words.forEach(word => {
            if ((currentLine + word).length <= maxCharsPerLine) {
              currentLine += (currentLine ? ' ' : '') + word
            } else {
              addText(currentLine, 45, yPosition + 4 + (lineCount * 4), 9)
              currentLine = word
              lineCount++
              yPosition += 4
            }
          })
          
          if (currentLine) {
            addText(currentLine, 45, yPosition + 4 + (lineCount * 4), 9)
            yPosition += lineCount * 4
          }
        } else {
          addText(description, 45, yPosition + 4, 9)
        }
        
        addText(unit, 140, yPosition + 4, 9)
        addText(`$${unitPrice.toFixed(2)}`, 165, yPosition + 4, 9, false, colors.text)
        addText(`$${total.toFixed(2)}`, 190, yPosition + 4, 9, true, colors.text)
        
        yPosition += 8
      }
      
      conceptsAdded++
    }
    
    // Línea final de la tabla
    pdf.setDrawColor(...colors.text)
    pdf.line(20, yPosition, pageWidth - 20, yPosition)
    yPosition += 10
    
    return conceptsAdded + startIndex
  }
  
  // === INICIO DEL DOCUMENTO ===
  
  // Primera página - Encabezado completo
  addPageHeader()
  
  // Información de la empresa
  yPosition += 5
  addText('MARICELA GONZALEZ TOLOSA', 20, yPosition, 11, true)
  yPosition += 6
  addText('RFC: GOTM5611245W5', 20, yPosition, 9)
  yPosition += 5
  addText('Tulipán #22, Col. 10 de Mayo, C.P. 80270', 20, yPosition, 9)
  yPosition += 5
  addText('Culiacán de Rosales, Culiacán, Sinaloa.', 20, yPosition, 9)
  yPosition += 5
  addText('CEL. (667)154 4098', 20, yPosition, 9)
  yPosition += 5
  addText('TEL. (667)718 3885', 20, yPosition, 9)
  
  // Fecha
  const date = new Date(budget.date).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  addText(date, pageWidth - 20, yPosition, 9, false, colors.text)
  
  yPosition += 15
  
  // Título del documento
  addText(budget.description || 'INSTALACION DE VALVULA EN TUBERÍA EN CISTERNA', pageWidth / 2, yPosition, 16, true, colors.primary)
  yPosition += 8
  addText('ANTENCIÓN', pageWidth / 2, yPosition, 12, true)
  yPosition += 6
  addText(recipient.name, pageWidth / 2, yPosition, 12, true)
  yPosition += 6
  addText(`COTIZACIÓN ${quoteNumber}`, pageWidth / 2, yPosition, 12, true)
  
  yPosition += 15
  
  // Tabla de conceptos (con soporte para múltiples páginas)
  let currentConceptIndex = 0
  while (currentConceptIndex < budget.concepts.length) {
    if (currentConceptIndex > 0) {
      addNewPage()
    }
    currentConceptIndex = addConceptTable(budget.concepts, currentConceptIndex)
  }
  
  // Totales (en la última página)
  yPosition += 10
  addText('Subtotal', 150, yPosition, 12)
  addText(`$${budget.subtotal.toFixed(2)}`, pageWidth - 20, yPosition, 12, false, colors.text)
  
  yPosition += 8
  addText(`I.V.A. ${budget.ivaPercentage}%`, 150, yPosition, 12)
  addText(`$${budget.ivaAmount.toFixed(2)}`, pageWidth - 20, yPosition, 12, false, colors.text)
  
  yPosition += 8
  pdf.setDrawColor(...colors.primary)
  pdf.setLineWidth(0.8)
  pdf.line(145, yPosition - 2, pageWidth - 15, yPosition - 2)
  
  yPosition += 5
  addText('TOTAL', 150, yPosition, 14, true, colors.primary)
  addText(`$${budget.total.toFixed(2)}`, pageWidth - 20, yPosition, 14, true, colors.primary)
  
  // Firma
  yPosition = pageHeight - 50
  pdf.setDrawColor(...colors.text)
  pdf.setLineWidth(0.5)
  pdf.line(120, yPosition, 180, yPosition)
  
  addText('Ing. Francisco José Coviello Marcano', pageWidth / 2, yPosition + 5, 10, true)
  addText('Director General', pageWidth / 2, yPosition + 10, 9)
  addText('Cel. (667)154 4098', pageWidth / 2, yPosition + 15, 8, false, colors.gray)
  addText('Tel. (667)718 3885', pageWidth / 2, yPosition + 20, 8, false, colors.gray)
  addText('constru_fe@hotmail.com', pageWidth / 2, yPosition + 25, 8, false, colors.gray)
  
  // Guardar el PDF
  const fileName = `Presupuesto_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
  
  return true
}