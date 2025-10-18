import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { budgetId } = await request.json()
    
    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }
    
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
      include: {
        client: true,
        recipient: true
      }
    })
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    // Generate enhanced PDF
    const pdfBuffer = generateEnhancedBudgetPDF(budget)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="COTIZACION-${budget.folio}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating enhanced budget PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}

function generateEnhancedBudgetPDF(budget: any): Buffer {
  const doc = new jsPDF()
  const concepts = budget.concepts as any[]
  
  // Configuración de colores corporativos mejorados
  const colors = {
    primary: [220, 38, 38],      // red-600
    primaryLight: [254, 226, 226], // red-100
    secondary: [0, 0, 0],        // black
    gray: [107, 114, 128],       // gray-500
    grayLight: [243, 244, 246],  // gray-100
    accent: [59, 130, 246],      // blue-500
    white: [255, 255, 255]
  }
  
  // Función para formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value)
  }
  
  // Función para dibujar borde decorativo
  const drawDecorativeBorder = (x: number, y: number, width: number, height: number) => {
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(2)
    doc.rect(x, y, width, height)
    
    doc.setDrawColor(...colors.primaryLight)
    doc.setLineWidth(0.5)
    doc.rect(x + 2, y + 2, width - 4, height - 4)
  }
  
  // ENCABEZADO MEJORADO
  // Fondo del encabezado
  doc.setFillColor(...colors.primaryLight)
  doc.rect(0, 0, 210, 70, 'F')
  
  // Borde decorativo superior
  drawDecorativeBorder(15, 10, 180, 50)
  
  // Logo y nombre de la empresa (placeholder para logo)
  doc.setFillColor(...colors.primary)
  doc.circle(30, 35, 8, 'F')
  doc.setTextColor(...colors.white)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('CF', 30, 39, { align: 'center' })
  
  // Información de la empresa
  doc.setTextColor(...colors.primary)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('CONSTRU-FE', 50, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('CONSTRUIRLO ES POSIBLE', 50, 32)
  
  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.text('Sistema de Presupuestos Profesionales', 50, 37)
  doc.text('RFC: GOTM5611245W5', 50, 42)
  doc.text('Tel: (667) 154-4098 | (667) 718-3885', 50, 47)
  
  // Información de contacto derecha
  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.text('Culiacán, Sinaloa, México', 150, 32, { align: 'right' })
  doc.text('www.constru-fe.com', 150, 37, { align: 'right' })
  doc.text('constru_fe@hotmail.com', 150, 42, { align: 'right' })
  
  // TÍTULO DEL DOCUMENTO
  doc.setFillColor(...colors.primary)
  doc.rect(15, 70, 180, 12, 'F')
  doc.setTextColor(...colors.white)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('COTIZACIÓN', 105, 78, { align: 'center' })
  
  doc.setTextColor(...colors.white)
  doc.setFontSize(10)
  doc.text(`FOLIO: ${budget.folio}`, 105, 84, { align: 'center' })
  
  // SECCIÓN DE INFORMACIÓN EN DOS COLUMNAS
  let yPos = 90
  
  // Columna izquierda - Cliente
  doc.setFillColor(...colors.grayLight)
  doc.roundedRect(15, yPos, 85, 45, 3, 3, 'F')
  
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, yPos, 85, 45, 3, 3, 'S')
  
  doc.setTextColor(...colors.primary)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', 20, yPos + 8)
  
  doc.setTextColor(...colors.secondary)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(budget.client.name, 20, yPos + 16)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...colors.gray)
  let clientYPos = yPos + 22
  
  if (budget.client.email) {
    doc.text(`Email: ${budget.client.email}`, 20, clientYPos)
    clientYPos += 5
  }
  if (budget.client.phone) {
    doc.text(`Tel: ${budget.client.phone}`, 20, clientYPos)
    clientYPos += 5
  }
  if (budget.client.address) {
    const addressLines = doc.splitTextToSize(budget.client.address, 75)
    addressLines.forEach((line: string, index: number) => {
      if (clientYPos + (index * 4) < yPos + 40) {
        doc.text(line, 20, clientYPos + (index * 4))
      }
    })
  }
  
  // Columna derecha - Destinatario
  doc.setFillColor(...colors.grayLight)
  doc.roundedRect(110, yPos, 85, 45, 3, 3, 'F')
  
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(0.5)
  doc.roundedRect(110, yPos, 85, 45, 3, 3, 'S')
  
  doc.setTextColor(...colors.primary)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DESTINATARIO', 115, yPos + 8)
  
  doc.setTextColor(...colors.secondary)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(budget.recipient.name, 115, yPos + 16)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...colors.gray)
  let recipientYPos = yPos + 22
  
  if (budget.recipient.email) {
    doc.text(`Email: ${budget.recipient.email}`, 115, recipientYPos)
    recipientYPos += 5
  }
  if (budget.recipient.phone) {
    doc.text(`Tel: ${budget.recipient.phone}`, 115, recipientYPos)
    recipientYPos += 5
  }
  if (budget.recipient.position) {
    doc.text(`Puesto: ${budget.recipient.position}`, 115, recipientYPos)
  }
  
  // Información del presupuesto
  yPos = yPos + 55
  
  doc.setFillColor(...colors.grayLight)
  doc.roundedRect(15, yPos, 180, 25, 3, 3, 'F')
  
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, yPos, 180, 25, 3, 3, 'S')
  
  doc.setTextColor(...colors.primary)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMACIÓN DEL PRESUPUESTO', 20, yPos + 8)
  
  doc.setTextColor(...colors.gray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${budget.date}`, 20, yPos + 16)
  
  if (budget.description) {
    const descLines = doc.splitTextToSize(budget.description, 120)
    doc.text(descLines, 60, yPos + 16)
  }
  
  // TABLA DE CONCEPTOS MEJORADA
  const tableStartY = yPos + 35
  
  // Preparar datos para la tabla con mejor formato
  const tableData: any[] = []
  
  concepts.forEach(concept => {
    if (concept.type === 'title') {
      tableData.push([
        { 
          content: concept.key || '', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryLight,
            textColor: colors.primary,
            fontSize: 10
          } 
        },
        { 
          content: concept.title || '', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryLight,
            textColor: colors.primary,
            fontSize: 10
          }, 
          colSpan: 5 
        }
      ])
    } else {
      tableData.push([
        { 
          content: concept.key || '', 
          styles: { 
            fontStyle: 'bold',
            fontSize: 9
          } 
        },
        { 
          content: concept.description || '',
          styles: { fontSize: 9 }
        },
        { 
          content: concept.unit || '',
          styles: { fontSize: 9, halign: 'center' }
        },
        { 
          content: concept.quantity?.toString() || '',
          styles: { fontSize: 9, halign: 'center' }
        },
        { 
          content: formatCurrency(concept.unitPrice || 0),
          styles: { fontSize: 9, halign: 'right' }
        },
        { 
          content: formatCurrency(concept.total || 0),
          styles: { fontSize: 9, halign: 'right', fontStyle: 'bold' }
        }
      ])
    }
  })
  
  // Generar tabla mejorada
  autoTable(doc, {
    head: [
      [
        { 
          content: 'CLAVE', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10
          } 
        },
        { 
          content: 'CONCEPTO', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10
          } 
        },
        { 
          content: 'UNIDAD', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10
          } 
        },
        { 
          content: 'CANTIDAD', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10
          } 
        },
        { 
          content: 'P. UNITARIO', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10
          } 
        },
        { 
          content: 'IMPORTE', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10
          } 
        }
      ]
    ],
    body: tableData,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      lineColor: colors.gray
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: colors.grayLight
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' }, // Clave
      1: { cellWidth: 'auto' }, // Concepto
      2: { cellWidth: 25, halign: 'center' }, // Unidad
      3: { cellWidth: 25, halign: 'center' }, // Cantidad
      4: { cellWidth: 35, halign: 'right' }, // Precio Unitario
      5: { cellWidth: 35, halign: 'right' } // Importe
    },
    didDrawCell: (data) => {
      // Resaltar filas de título
      if (data.row.index !== undefined && data.row.raw[0].styles?.fillColor) {
        const fillColor = data.row.raw[0].styles.fillColor
        if (fillColor && fillColor[0] === colors.primaryLight[0]) {
          doc.setFillColor(...colors.primaryLight)
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F')
        }
      }
    }
  })
  
  // SECCIÓN DE TOTALES MEJORADA
  const finalY = (doc as any).lastAutoTable.finalY + 15
  
  // Fondo para totales
  doc.setFillColor(...colors.primaryLight)
  doc.roundedRect(120, finalY - 5, 75, 35, 3, 3, 'F')
  
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(1)
  doc.roundedRect(120, finalY - 5, 75, 35, 3, 3, 'S')
  
  // Líneas de totales
  doc.setDrawColor(...colors.gray)
  doc.setLineWidth(0.5)
  doc.line(125, finalY + 8, 190, finalY + 8)
  doc.line(125, finalY + 16, 190, finalY + 16)
  
  // Texto de totales
  doc.setTextColor(...colors.gray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 125, finalY + 5)
  
  doc.setTextColor(...colors.gray)
  doc.text(`IVA (${budget.ivaPercentage}%):`, 125, finalY + 13)
  
  doc.setTextColor(...colors.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', 125, finalY + 23)
  
  // Valores de totales
  doc.setTextColor(...colors.secondary)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(formatCurrency(budget.subtotal), 190, finalY + 5, { align: 'right' })
  
  doc.setTextColor(...colors.secondary)
  doc.text(formatCurrency(budget.ivaAmount), 190, finalY + 13, { align: 'right' })
  
  doc.setTextColor(...colors.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(formatCurrency(budget.total), 190, finalY + 23, { align: 'right' })
  
  // PIE DE PÁGINA PROFESIONAL
  const footerY = 270
  
  // Línea decorativa
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(1)
  doc.line(20, footerY, 190, footerY)
  
  // Información del pie
  doc.setTextColor(...colors.gray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Presupuesto generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`, 105, footerY + 5, { align: 'center' })
  doc.text('CONSTRU-FE | Sistema de Presupuestos Profesionales | constru_fe@hotmail.com', 105, footerY + 10, { align: 'center' })
  doc.text('Tel: (667) 154-4098 | (667) 718-3885 | Culiacán, Sinaloa, México', 105, footerY + 15, { align: 'center' })
  
  // Número de página
  doc.setTextColor(...colors.gray)
  doc.setFontSize(7)
  doc.text('Página 1 de 1', 105, 285, { align: 'center' })
  
  // Metadatos del PDF
  doc.setProperties({
    title: `COTIZACIÓN ${budget.folio}`,
    subject: `Presupuesto para ${budget.client.name}`,
    author: 'CONSTRU-FE',
    keywords: 'cotizacion, presupuesto, constru-fe',
    creator: 'Sistema de Presupuestos CONSTRU-FE'
  })
  
  // Convertir a Buffer
  return Buffer.from(doc.output('arraybuffer'))
}