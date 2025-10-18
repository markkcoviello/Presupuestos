import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

export const generateBudgetPDF = async (
  budget: Budget,
  client: Client,
  recipient: Recipient,
  quoteNumber: string = 'AUTO'
) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  
  // Configuración de fuentes
  pdf.setFont('helvetica')
  
  // Función para agregar texto con formato
  const addText = (text: string, x: number, y: number, fontSize: number = 12, isBold: boolean = false) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    pdf.text(text, x, y)
  }
  
  // Función para agregar línea horizontal
  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    pdf.line(x1, y1, x2, y2)
  }
  
  // Encabezado - Logo y información de la empresa
  const logoUrl = '/logo.png'
  
  try {
    // Intentar cargar el logo
    const img = new Image()
    img.src = logoUrl
    
    // Esperar a que la imagen cargue
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      setTimeout(resolve, 1000) // Timeout por si el logo no carga
    })
    
    // Agregar logo (simulado con texto si no carga la imagen)
    addText('CONSTRU-FE', pageWidth / 2, 25, 24, true)
    addText('CONSTRUIRLO ES POSIBLE', pageWidth / 2, 35, 12, false)
    
  } catch (error) {
    // Si el logo no carga, usar texto
    addText('CONSTRU-FE', pageWidth / 2, 25, 24, true)
    addText('CONSTRUIRLO ES POSIBLE', pageWidth / 2, 35, 12, false)
  }
  
  // Información de contacto de la empresa
  const contactInfo = [
    'MARICELA GONZALEZ TOLOSA',
    'RFC: GOTM5611245W5',
    'Tulipán #22, Col. 10 de Mayo, C.P. 80270',
    'Culiacán de Rosales, Culiacán, Sinaloa.',
    'CEL. (667)154 4098',
    'TEL. (667)718 3885'
  ]
  
  let yPos = 55
  contactInfo.forEach(line => {
    addText(line, 20, yPos, 10)
    yPos += 6
  })
  
  // Fecha
  const date = new Date(budget.date).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  addText(date, pageWidth - 20, yPos, 10, false)
  
  // Línea separadora
  addLine(20, yPos + 10, pageWidth - 20, yPos + 10)
  
  // Título del documento
  yPos += 20
  addText('INSTALACION DE VALVULA EN TUBERÍA EN CISTERNA', pageWidth / 2, yPos, 16, true)
  
  // Subtítulo
  yPos += 10
  addText('ANTENCIÓN', pageWidth / 2, yPos, 12, true)
  
  // Información del destinatario
  yPos += 10
  addText('COMPRAS ARCA CONTAL', pageWidth / 2, yPos, 12, true)
  
  // Número de cotización
  yPos += 10
  addText(`COTIZACIÓN ${quoteNumber}`, pageWidth / 2, yPos, 12, true)
  
  // Línea separadora
  yPos += 15
  addLine(20, yPos, pageWidth - 20, yPos)
  
  // Tabla de conceptos
  yPos += 10
  
  // Encabezados de tabla
  const tableStartY = yPos
  const colWidths = [15, 120, 25, 30, 30] // Cantidad, Concepto, Unidad, P.U., Importe
  const colX = [20, 35, 155, 180, 210]
  
  addText('Cantidad', colX[0], yPos, 10, true)
  addText('Concepto', colX[1], yPos, 10, true)
  addText('Unidad', colX[2], yPos, 10, true)
  addText('P.U.', colX[3], yPos, 10, true)
  addText('Importe', colX[4], yPos, 10, true)
  
  yPos += 8
  addLine(20, yPos, pageWidth - 20, yPos)
  
  // Conceptos
  yPos += 8
  let conceptCount = 0
  
  budget.concepts.forEach((concept, index) => {
    if (concept.type === 'title') {
      // Título de sección
      if (conceptCount > 0) yPos += 5 // Espacio antes del título
      addText(concept.title || '', colX[1], yPos, 11, true)
      yPos += 8
    } else if (concept.type === 'concept') {
      // Concepto individual
      const quantity = concept.quantity || 0
      const description = concept.description || ''
      const unit = concept.unit || 'UNIDAD'
      const unitPrice = concept.unitPrice || 0
      const total = concept.total || 0
      
      addText(quantity.toString(), colX[0], yPos, 10)
      
      // Descripción (puede ser larga, necesitará manejo de múltiples líneas)
      const maxCharsPerLine = 60
      if (description.length > maxCharsPerLine) {
        const words = description.split(' ')
        let currentLine = ''
        let lineCount = 0
        
        words.forEach(word => {
          if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word
          } else {
            if (lineCount === 0) {
              addText(currentLine, colX[1], yPos, 9)
            } else {
              addText(currentLine, colX[1], yPos + (lineCount * 5), 9)
            }
            currentLine = word
            lineCount++
          }
        })
        
        if (currentLine) {
          addText(currentLine, colX[1], yPos + (lineCount * 5), 9)
          yPos += lineCount * 5
        }
      } else {
        addText(description, colX[1], yPos, 9)
      }
      
      addText(unit, colX[2], yPos, 10)
      addText(`$${unitPrice.toFixed(2)}`, colX[3], yPos, 10)
      addText(`$${total.toFixed(2)}`, colX[4], yPos, 10)
      
      yPos += 8
      conceptCount++
    }
    
    // Verificar si necesitamos una nueva página
    if (yPos > pageHeight - 60) {
      pdf.addPage()
      yPos = 20
      
      // Repetir encabezados en nueva página
      addText('Cantidad', colX[0], yPos, 10, true)
      addText('Concepto', colX[1], yPos, 10, true)
      addText('Unidad', colX[2], yPos, 10, true)
      addText('P.U.', colX[3], yPos, 10, true)
      addText('Importe', colX[4], yPos, 10, true)
      
      yPos += 8
      addLine(20, yPos, pageWidth - 20, yPos)
      yPos += 8
    }
  })
  
  // Línea final de la tabla
  addLine(20, yPos, pageWidth - 20, yPos)
  
  // Totales
  yPos += 15
  
  const totalsX = 150
  addText('Subtotal', totalsX, yPos, 12)
  addText(`$${budget.subtotal.toFixed(2)}`, totalsX + 50, yPos, 12)
  
  yPos += 8
  addText(`I.V.A.${budget.ivaPercentage}%`, totalsX, yPos, 12)
  addText(`$${budget.ivaAmount.toFixed(2)}`, totalsX + 50, yPos, 12)
  
  yPos += 8
  addText('TOTAL', totalsX, yPos, 14, true)
  addText(`$${budget.total.toFixed(2)}`, totalsX + 50, yPos, 14, true)
  
  // Espacio para firma
  yPos = pageHeight - 40
  addLine(100, yPos, 160, yPos)
  addText('Ing. Francisco José Coviello Marcano', 130, yPos + 5, 10, true)
  addText('Director General', 130, yPos + 10, 9)
  addText('Cel. (667)154 4098', 130, yPos + 15, 8)
  addText('Tel. (667)718 3885', 130, yPos + 20, 8)
  addText('constru_fe@hotmail.com', 130, yPos + 25, 8)
  
  // Número de página
  addText('Página 1', pageWidth - 30, pageHeight - 10, 8)
  
  // Guardar el PDF
  const fileName = `Presupuesto_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

// Función directa con jsPDF - más confiable y rápida
export const generateBudgetPDFDirect = (
  budget: Budget,
  client: Client,
  recipient: Recipient,
  quoteNumber: string = 'AUTO'
) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20
  
  // Configuración de fuentes
  pdf.setFont('helvetica')
  
  // Función para agregar texto
  const addText = (text: string, x: number, y: number, fontSize: number = 12, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
    
    let xPos = x
    if (align === 'center') {
      xPos = pageWidth / 2
    } else if (align === 'right') {
      xPos = pageWidth - x
    }
    
    const textWidth = pdf.getTextWidth(text)
    if (align === 'center') {
      xPos = xPos - textWidth / 2
    } else if (align === 'right') {
      xPos = xPos - textWidth
    }
    
    pdf.text(text, xPos, y)
  }
  
  // Función para verificar si necesitamos nueva página
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - 30) {
      pdf.addPage()
      yPosition = 20
      return true
    }
    return false
  }
  
  // Logo CONSTRU-FE (simulado con texto y formas)
  addText('CONSTRU-FE', pageWidth / 2, yPosition, 24, true, 'center')
  yPosition += 8
  addText('CONSTRUIRLO ES POSIBLE', pageWidth / 2, yPosition, 12, false, 'center')
  yPosition += 15
  
  // Información de la empresa
  const companyInfo = [
    'MARICELA GONZALEZ TOLOSA',
    'RFC: GOTM5611245W5',
    'Tulipán #22, Col. 10 de Mayo, C.P. 80270',
    'Culiacán de Rosales, Culiacán, Sinaloa.',
    'CEL. (667)154 4098',
    'TEL. (667)718 3885'
  ]
  
  companyInfo.forEach(line => {
    addText(line, 20, yPosition, 10)
    yPosition += 6
  })
  
  // Fecha
  const date = new Date(budget.date).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  addText(date, pageWidth - 20, yPosition, 10, false, 'right')
  yPosition += 15
  
  // Línea separadora
  pdf.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 10
  
  // Título del documento
  addText(budget.description || 'INSTALACION DE VALVULA EN TUBERÍA EN CISTERNA', pageWidth / 2, yPosition, 16, true, 'center')
  yPosition += 8
  addText('ANTENCIÓN', pageWidth / 2, yPosition, 12, true, 'center')
  yPosition += 6
  addText(recipient.name, pageWidth / 2, yPosition, 12, true, 'center')
  yPosition += 6
  addText(`COTIZACIÓN ${quoteNumber}`, pageWidth / 2, yPosition, 12, true, 'center')
  yPosition += 15
  
  // Línea separadora
  pdf.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 10
  
  // Tabla de conceptos
  const colWidths = {
    cantidad: 20,
    concepto: 100,
    unidad: 25,
    pu: 30,
    importe: 35
  }
  
  const colX = {
    cantidad: 20,
    concepto: 40,
    unidad: 140,
    pu: 165,
    importe: 195
  }
  
  // Encabezados de tabla
  addText('Cantidad', colX.cantidad, yPosition, 10, true)
  addText('Concepto', colX.concepto, yPosition, 10, true)
  addText('Unidad', colX.unidad, yPosition, 10, true)
  addText('P.U.', colX.pu, yPosition, 10, true)
  addText('Importe', colX.importe, yPosition, 10, true)
  yPosition += 8
  
  // Línea debajo de encabezados
  pdf.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 8
  
  // Conceptos
  budget.concepts.forEach((concept) => {
    checkNewPage(20)
    
    if (concept.type === 'title') {
      // Título de sección
      addText(concept.title || '', colX.concepto, yPosition, 11, true)
      yPosition += 10
    } else if (concept.type === 'concept') {
      // Concepto individual
      const quantity = concept.quantity || 0
      const description = concept.description || ''
      const unit = concept.unit || 'UNIDAD'
      const unitPrice = concept.unitPrice || 0
      const total = concept.total || 0
      
      addText(quantity.toString(), colX.cantidad, yPosition, 9)
      
      // Manejo de descripciones largas
      const maxCharsPerLine = 45
      if (description.length > maxCharsPerLine) {
        const words = description.split(' ')
        let currentLine = ''
        let lineCount = 0
        
        words.forEach(word => {
          if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word
          } else {
            addText(currentLine, colX.concepto, yPosition + (lineCount * 5), 9)
            currentLine = word
            lineCount++
          }
        })
        
        if (currentLine) {
          addText(currentLine, colX.concepto, yPosition + (lineCount * 5), 9)
          yPosition += lineCount * 5
        }
      } else {
        addText(description, colX.concepto, yPosition, 9)
      }
      
      addText(unit, colX.unidad, yPosition, 9)
      addText(`$${unitPrice.toFixed(2)}`, colX.pu, yPosition, 9, false, 'right')
      addText(`$${total.toFixed(2)}`, colX.importe, yPosition, 9, true, 'right')
      
      yPosition += 12
    }
  })
  
  // Línea final de la tabla
  pdf.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 15
  
  // Totales
  const totalsX = 150
  addText('Subtotal', totalsX, yPosition, 12)
  addText(`$${budget.subtotal.toFixed(2)}`, pageWidth - 20, yPosition, 12, false, 'right')
  
  yPosition += 8
  addText(`I.V.A. ${budget.ivaPercentage}%`, totalsX, yPosition, 12)
  addText(`$${budget.ivaAmount.toFixed(2)}`, pageWidth - 20, yPosition, 12, false, 'right')
  
  yPosition += 8
  addText('TOTAL', totalsX, yPosition, 14, true)
  addText(`$${budget.total.toFixed(2)}`, pageWidth - 20, yPosition, 14, true, 'right')
  
  // Firma
  yPosition = pageHeight - 50
  pdf.line(120, yPosition, 180, yPosition)
  addText('Ing. Francisco José Coviello Marcano', pageWidth / 2, yPosition + 5, 10, true, 'center')
  addText('Director General', pageWidth / 2, yPosition + 10, 9, false, 'center')
  addText('Cel. (667)154 4098', pageWidth / 2, yPosition + 15, 8, false, 'center')
  addText('Tel. (667)718 3885', pageWidth / 2, yPosition + 20, 8, false, 'center')
  addText('constru_fe@hotmail.com', pageWidth / 2, yPosition + 25, 8, false, 'center')
  
  // Número de página
  addText('Página 1', pageWidth - 30, pageHeight - 10, 8)
  
  // Guardar el PDF
  const fileName = `Presupuesto_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
  
  return true
}