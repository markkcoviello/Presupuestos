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
  folio: string
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

// Función mejorada para generar PDF con logo real y diseño profesional
export const generateEnhancedPDF = async (
  budget: Budget,
  client: Client,
  recipient: Recipient,
  quoteNumber: string = 'AUTO'
): Promise<boolean> => {
  try {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Colores corporativos mejorados
    const colors = {
      primary: [211, 47, 47],     // Rojo CONSTRU-FE
      secondary: [25, 118, 210],  // Azul CONSTRU-FE
      accent: [76, 175, 80],      // Verde para acentos
      text: [0, 0, 0],           // Negro
      gray: [100, 100, 100],     // Gris
      lightGray: [245, 245, 245], // Gris muy claro
      mediumGray: [200, 200, 200] // Gris medio
    }
    
    let currentPage = 1
    let yPosition = 20
    
    // Cargar logo de la empresa
    const addLogo = async () => {
      try {
        // Intentar cargar el logo generado
        const logoUrl = '/logo-constru-fe.png'
        pdf.addImage(logoUrl, 'PNG', pageWidth / 2 - 20, yPosition, 40, 40)
        yPosition += 50
      } catch (error) {
        // Si no se puede cargar el logo, usar el dibujado
        console.warn('No se pudo cargar el logo, usando diseño vectorial')
        drawVectorLogo()
        yPosition += 50
      }
    }
    
    // Función de respaldo para dibujar logo vectorial
    const drawVectorLogo = () => {
      const logoX = pageWidth / 2 - 15
      const logoY = yPosition
      
      // Círculo exterior rojo con borde
      pdf.setFillColor(...colors.primary)
      pdf.circle(logoX + 15, logoY + 15, 15, 'F')
      pdf.setDrawColor(139, 0, 0)
      pdf.setLineWidth(1)
      pdf.circle(logoX + 15, logoY + 15, 15, 'S')
      
      // Círculo interior azul
      pdf.setFillColor(...colors.secondary)
      pdf.circle(logoX + 15, logoY + 15, 12, 'F')
      
      // Espada mejorada
      pdf.setFillColor(255, 255, 255)
      // Hoja de espada
      pdf.rect(logoX + 13.5, logoY + 3, 3, 24, 'F')
      // Guardia
      pdf.rect(logoX + 10, logoY + 12, 10, 4, 'F')
      // Pomo
      pdf.circle(logoX + 15, logoY + 28, 2, 'F')
      
      // Texto FE
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.text('FE', logoX + 15, logoY + 18, { align: 'center' })
    }
    
    // Función para agregar nueva página
    const addNewPage = () => {
      pdf.addPage()
      currentPage++
      yPosition = 20
      addPageHeader()
    }
    
    // Función para verificar si necesitamos nueva página
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - 60) {
        addNewPage()
        return true
      }
      return false
    }
    
    // Función para agregar encabezado de página
    const addPageHeader = async () => {
      yPosition = 20
      
      // Logo en cada página
      await addLogo()
      
      // Nombre de la empresa con mejor tipografía
      pdf.setTextColor(...colors.primary)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(24)
      pdf.text('CONSTRU-FE', pageWidth / 2, yPosition, { align: 'center' })
      
      pdf.setTextColor(...colors.secondary)
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(14)
      pdf.text('CONSTRUIRLO ES POSIBLE', pageWidth / 2, yPosition + 8, { align: 'center' })
      
      yPosition += 25
      
      // Línea separadora doble
      pdf.setDrawColor(...colors.primary)
      pdf.setLineWidth(1)
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      pdf.setLineWidth(0.5)
      pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2)
      yPosition += 10
      
      // Número de página
      pdf.setTextColor(...colors.gray)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.text(`Página ${currentPage}`, pageWidth - 30, pageHeight - 10)
    }
    
    // Función para agregar texto con formato mejorado
    const addText = (
      text: string, 
      x: number, 
      y: number, 
      fontSize: number = 10, 
      isBold: boolean = false, 
      isItalic: boolean = false,
      color: number[] = colors.text,
      align: 'left' | 'center' | 'right' = 'left'
    ) => {
      pdf.setTextColor(...color)
      let fontStyle = 'normal'
      if (isBold && isItalic) fontStyle = 'bolditalic'
      else if (isBold) fontStyle = 'bold'
      else if (isItalic) fontStyle = 'italic'
      
      pdf.setFont('helvetica', fontStyle)
      pdf.setFontSize(fontSize)
      
      if (align === 'center') {
        pdf.text(text, x, y, { align: 'center' })
      } else if (align === 'right') {
        pdf.text(text, x, y, { align: 'right' })
      } else {
        pdf.text(text, x, y)
      }
    }
    
    // Función para agregar celda de tabla
    const addTableCell = (
      text: string, 
      x: number, 
      y: number, 
      width: number, 
      height: number,
      fontSize: number = 9,
      isBold: boolean = false,
      backgroundColor?: number[],
      borderColor?: number[]
    ) => {
      if (backgroundColor) {
        pdf.setFillColor(...backgroundColor)
        pdf.rect(x, y - height, width, height, 'F')
      }
      
      if (borderColor) {
        pdf.setDrawColor(...borderColor)
        pdf.setLineWidth(0.3)
        pdf.rect(x, y - height, width, height, 'S')
      }
      
      addText(text, x + 2, y - 2, fontSize, isBold)
    }
    
    // Función para agregar tabla de conceptos mejorada
    const addConceptTable = (concepts: ConceptItem[], startIndex: number = 0) => {
      const tableStartY = yPosition
      const rowHeight = 10
      const maxRowsPerPage = Math.floor((pageHeight - yPosition - 100) / rowHeight)
      
      // Encabezados de tabla con fondo
      const headers = [
        { text: 'CANTIDAD', width: 30 },
        { text: 'CONCEPTO', width: 80 },
        { text: 'UNIDAD', width: 30 },
        { text: 'P.U.', width: 35 },
        { text: 'IMPORTE', width: 35 }
      ]
      
      let currentX = 20
      headers.forEach(header => {
        addTableCell(
          header.text,
          currentX,
          yPosition + 8,
          header.width,
          rowHeight,
          9,
          true,
          colors.lightGray,
          colors.text
        )
        currentX += header.width
      })
      
      yPosition += rowHeight + 5
      
      let conceptsAdded = 0
      
      for (let i = startIndex; i < concepts.length && conceptsAdded < maxRowsPerPage; i++) {
        const concept = concepts[i]
        
        if (concept.type === 'title') {
          // Título de sección con fondo destacado
          checkPageBreak(15)
          addTableCell(
            concept.title || '',
            20,
            yPosition + 8,
            pageWidth - 40,
            rowHeight,
            11,
            true,
            colors.mediumGray,
            colors.text
          )
          yPosition += rowHeight + 3
        } else if (concept.type === 'concept') {
          // Concepto individual
          checkPageBreak(15)
          
          const quantity = concept.quantity || 0
          const description = concept.description || ''
          const unit = concept.unit || 'UNIDAD'
          const unitPrice = concept.unitPrice || 0
          const total = concept.total || 0
          
          // Cantidad
          addTableCell(
            quantity.toString(),
            20,
            yPosition + 8,
            30,
            rowHeight,
            9,
            false,
            undefined,
            colors.gray
          )
          
          // Descripción (con manejo de texto largo)
          const maxCharsPerLine = 35
          let descriptionHeight = rowHeight
          
          if (description.length > maxCharsPerLine) {
            const words = description.split(' ')
            let currentLine = ''
            let lineCount = 0
            
            words.forEach(word => {
              if ((currentLine + word).length <= maxCharsPerLine) {
                currentLine += (currentLine ? ' ' : '') + word
              } else {
                if (lineCount === 0) {
                  addTableCell(
                    currentLine,
                    50,
                    yPosition + 8,
                    80,
                    rowHeight,
                    9,
                    false,
                    undefined,
                    colors.gray
                  )
                } else {
                  addText(currentLine, 52, yPosition + 8 + (lineCount * 4), 9)
                }
                currentLine = word
                lineCount++
              }
            })
            
            if (currentLine) {
              if (lineCount === 0) {
                addTableCell(
                  currentLine,
                  50,
                  yPosition + 8,
                  80,
                  rowHeight,
                  9,
                  false,
                  undefined,
                  colors.gray
                )
              } else {
                addText(currentLine, 52, yPosition + 8 + (lineCount * 4), 9)
              }
            }
            
            descriptionHeight = rowHeight + (lineCount * 4)
          } else {
            addTableCell(
              description,
              50,
              yPosition + 8,
              80,
              rowHeight,
              9,
              false,
              undefined,
              colors.gray
            )
          }
          
          // Unidad
          addTableCell(
            unit,
            130,
            yPosition + 8,
            30,
            rowHeight,
            9,
            false,
            undefined,
            colors.gray
          )
          
          // Precio Unitario
          addTableCell(
            `$${unitPrice.toFixed(2)}`,
            160,
            yPosition + 8,
            35,
            rowHeight,
            9,
            false,
            undefined,
            colors.gray
          )
          
          // Importe
          addTableCell(
            `$${total.toFixed(2)}`,
            195,
            yPosition + 8,
            35,
            rowHeight,
            9,
            true,
            undefined,
            colors.gray
          )
          
          yPosition += descriptionHeight + 3
        }
        
        conceptsAdded++
      }
      
      // Línea final de la tabla
      pdf.setDrawColor(...colors.primary)
      pdf.setLineWidth(0.8)
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 15
      
      return conceptsAdded + startIndex
    }
    
    // === INICIO DEL DOCUMENTO ===
    
    // Primera página - Encabezado completo
    await addPageHeader()
    
    // Información de la empresa en tarjeta
    pdf.setFillColor(...colors.lightGray)
    pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 45, 3, 3, 'F')
    pdf.setDrawColor(...colors.gray)
    pdf.setLineWidth(0.5)
    pdf.roundedRect(15, yPosition - 5, pageWidth - 30, 45, 3, 3, 'S')
    
    yPosition += 5
    addText('MARICELA GONZALEZ TOLOSA', 25, yPosition, 12, true)
    yPosition += 6
    addText('RFC: GOTM5611245W5', 25, yPosition, 9)
    yPosition += 5
    addText('Tulipán #22, Col. 10 de Mayo, C.P. 80270', 25, yPosition, 9)
    yPosition += 5
    addText('Culiacán de Rosales, Culiacán, Sinaloa.', 25, yPosition, 9)
    yPosition += 5
    addText('CEL. (667)154 4098 | TEL. (667)718 3885', 25, yPosition, 9)
    
    // Fecha alineada a la derecha
    const date = new Date(budget.date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    addText(date, pageWidth - 25, yPosition - 10, 9, false, colors.text, 'right')
    
    yPosition += 20
    
    // Título del documento
    addText(
      budget.description || 'INSTALACIÓN DE VÁLVULA EN TUBERÍA EN CISTERNA', 
      pageWidth / 2, 
      yPosition, 
      18, 
      true, 
      false, 
      colors.primary, 
      'center'
    )
    yPosition += 8
    addText('ATENCIÓN', pageWidth / 2, yPosition, 14, true, false, colors.text, 'center')
    yPosition += 6
    addText(recipient.name, pageWidth / 2, yPosition, 14, true, false, colors.text, 'center')
    yPosition += 6
    addText(`COTIZACIÓN ${quoteNumber}`, pageWidth / 2, yPosition, 14, true, false, colors.primary, 'center')
    
    yPosition += 20
    
    // Tabla de conceptos (con soporte para múltiples páginas)
    let currentConceptIndex = 0
    while (currentConceptIndex < budget.concepts.length) {
      if (currentConceptIndex > 0) {
        addNewPage()
      }
      currentConceptIndex = addConceptTable(budget.concepts, currentConceptIndex)
    }
    
    // Totales en recuadro destacado
    yPosition += 10
    const totalsStartY = yPosition
    
    pdf.setFillColor(...colors.lightGray)
    pdf.roundedRect(140, totalsStartY - 5, 60, 80, 3, 3, 'F')
    pdf.setDrawColor(...colors.primary)
    pdf.setLineWidth(1)
    pdf.roundedRect(140, totalsStartY - 5, 60, 80, 3, 3, 'S')
    
    addText('Subtotal', 145, totalsStartY + 10, 11)
    addText(`$${budget.subtotal.toFixed(2)}`, 195, totalsStartY + 10, 11, false, colors.text, 'right')
    
    totalsStartY += 15
    addText(`I.V.A. ${budget.ivaPercentage}%`, 145, totalsStartY + 10, 11)
    addText(`$${budget.ivaAmount.toFixed(2)}`, 195, totalsStartY + 10, 11, false, colors.text, 'right')
    
    totalsStartY += 15
    pdf.setDrawColor(...colors.primary)
    pdf.setLineWidth(0.8)
    pdf.line(145, totalsStartY + 5, 195, totalsStartY + 5)
    
    totalsStartY += 10
    addText('TOTAL', 145, totalsStartY + 10, 14, true, false, colors.primary)
    addText(`$${budget.total.toFixed(2)}`, 195, totalsStartY + 10, 14, true, false, colors.primary, 'right')
    
    // Firma profesional
    yPosition = pageHeight - 70
    
    pdf.setDrawColor(...colors.text)
    pdf.setLineWidth(0.8)
    pdf.line(100, yPosition, 150, yPosition)
    
    addText('Ing. Francisco José Coviello Marcano', pageWidth / 2, yPosition + 8, 11, true, false, colors.text, 'center')
    addText('Director General', pageWidth / 2, yPosition + 15, 10, false, false, colors.gray, 'center')
    addText('Cel. (667)154 4098 | Tel. (667)718 3885', pageWidth / 2, yPosition + 22, 9, false, false, colors.gray, 'center')
    addText('constru_fe@hotmail.com', pageWidth / 2, yPosition + 29, 9, false, true, colors.gray, 'center')
    
    // Pie de página
    pdf.setDrawColor(...colors.secondary)
    pdf.setLineWidth(0.5)
    pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)
    
    addText(
      'CONSTRU-FE | Construirlo es Posible | www.constru-fe.com', 
      pageWidth / 2, 
      pageHeight - 12, 
      8, 
      false, 
      false, 
      colors.gray, 
      'center'
    )
    
    // Guardar el PDF
    const fileName = `Cotizacion_${budget.folio}_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    return true
  } catch (error) {
    console.error('Error generating enhanced PDF:', error)
    return false
  }
}