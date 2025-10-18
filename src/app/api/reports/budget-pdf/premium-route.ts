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
    
    // Generate premium PDF
    const pdfBuffer = generatePremiumBudgetPDF(budget)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="COTIZACION-${budget.folio}-CONSTRUFE.pdf"`
      }
    })
    
  } catch (error) {
    console.error('Error generating premium budget PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}

function generatePremiumBudgetPDF(budget: any): Buffer {
  const doc = new jsPDF()
  const concepts = budget.concepts as any[]
  
  // Paleta de colores corporativos CONSTRU-FE
  const colors = {
    primary: [220, 38, 38],          // Rojo principal
    primaryDark: [185, 28, 28],      // Rojo oscuro
    primaryLight: [254, 226, 226],   // Rojo claro
    secondary: [30, 58, 138],        // Azul oscuro
    accent: [59, 130, 246],          // Azul brillante
    gray: [107, 114, 128],           // Gris medio
    grayLight: [243, 244, 246],      // Gris claro
    grayDark: [31, 41, 55],          // Gris oscuro
    white: [255, 255, 255],
    black: [0, 0, 0]
  }
  
  // Función para formatear moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value)
  }
  
  // Función para dibujar header con gradiente simulado
  const drawHeader = () => {
    // Fondo gradiente simulado
    for (let i = 0; i < 15; i++) {
      const alpha = 1 - (i / 15)
      const color = [
        colors.primary[0],
        colors.primary[1] * alpha,
        colors.primary[2] * alpha
      ]
      doc.setFillColor(...color)
      doc.rect(0, i * 4, 210, 4, 'F')
    }
    
    // Línea decorativa
    doc.setDrawColor(...colors.primaryDark)
    doc.setLineWidth(2)
    doc.line(0, 60, 210, 60)
    
    doc.setDrawColor(...colors.primaryLight)
    doc.setLineWidth(1)
    doc.line(0, 62, 210, 62)
  }
  
  // Función para crear logo CONSTRU-FE (simulado)
  const drawLogo = (x: number, y: number) => {
    // Escudo simulado
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(2)
    
    // Forma de escudo
    doc.circle(x, y, 12, 'S')
    doc.line(x - 12, y, x - 12, y + 8)
    doc.line(x + 12, y, x + 12, y + 8)
    doc.line(x - 12, y + 8, x, y + 18)
    doc.line(x + 12, y + 8, x, y + 18)
    
    // Espada simulada
    doc.setDrawColor(...colors.secondary)
    doc.setLineWidth(3)
    doc.line(x + 8, y - 15, x + 8, y + 5) // Filo
    doc.setFillColor(...colors.gray)
    doc.circle(x + 8, y - 18, 3, 'F') // Guardia
    
    // Texto CONSTRU-FE
    doc.setTextColor(...colors.primary)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('CONSTRU-FE', x + 25, y + 3)
    
    doc.setTextColor(...colors.secondary)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('CONSTRUIRLO ES POSIBLE', x + 25, y + 8)
  }
  
  // ENCABEZADO PREMIUM
  drawHeader()
  drawLogo(20, 30)
  
  // Información de empresa en el header
  doc.setTextColor(...colors.white)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('MARICELA GONZALEZ TOLOSA', 105, 20, { align: 'center' })
  doc.text('RFC: GOTM5611245W5', 105, 25, { align: 'center' })
  doc.text('Tulipán #22, Col. 10 de Mayo, C.P. 80270', 105, 30, { align: 'center' })
  doc.text('Culiacán de Rosales, Culiacán, Sinaloa', 105, 35, { align: 'center' })
  doc.text('CEL. (667)154-4098 | TEL. (667)718-3885', 105, 40, { align: 'center' })
  doc.text('constru_fe@hotmail.com', 105, 45, { align: 'center' })
  
  // Título del documento
  doc.setFillColor(...colors.primary)
  doc.rect(15, 70, 180, 15, 'F')
  
  doc.setTextColor(...colors.white)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('COTIZACIÓN', 105, 80, { align: 'center' })
  
  doc.setTextColor(...colors.white)
  doc.setFontSize(10)
  doc.text(`FOLIO: ${budget.folio}`, 105, 86, { align: 'center' })
  
  // Fecha y atención
  doc.setTextColor(...colors.grayDark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`FECHA: ${budget.date}`, 20, 95)
  doc.text('ATENCIÓN:', 120, 95)
  
  doc.setTextColor(...colors.gray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(budget.recipient.name, 155, 95)
  
  // SECCIÓN DE CLIENTE MEJORADA
  doc.setFillColor(...colors.grayLight)
  doc.roundedRect(15, 105, 180, 30, 5, 5, 'F')
  
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(1)
  doc.roundedRect(15, 105, 180, 30, 5, 5, 'S')
  
  doc.setTextColor(...colors.primary)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', 25, 118)
  
  doc.setTextColor(...colors.grayDark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(budget.client.name, 25, 126)
  
  doc.setTextColor(...colors.gray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  let clientInfo = ''
  if (budget.client.email) clientInfo += `Email: ${budget.client.email} | `
  if (budget.client.phone) clientInfo += `Tel: ${budget.client.phone} | `
  if (budget.client.address) clientInfo += `Dirección: ${budget.client.address}`
  
  if (clientInfo) {
    const clientLines = doc.splitTextToSize(clientInfo, 160)
    clientLines.forEach((line: string, index: number) => {
      if (index === 0) {
        doc.text(line, 25, 132)
      }
    })
  }
  
  // Descripción del presupuesto
  if (budget.description) {
    doc.setFillColor(...colors.primaryLight)
    doc.roundedRect(15, 145, 180, 20, 5, 5, 'F')
    
    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.5)
    doc.roundedRect(15, 145, 180, 20, 5, 5, 'S')
    
    doc.setTextColor(...colors.primary)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DESCRIPCIÓN:', 25, 155)
    
    doc.setTextColor(...colors.grayDark)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const descLines = doc.splitTextToSize(budget.description, 150)
    descLines.forEach((line: string, index: number) => {
      doc.text(line, 25, 160 + (index * 4))
    })
  }
  
  // TABLA DE CONCEPTOS PREMIUM
  const tableStartY = budget.description ? 175 : 170
  
  // Preparar datos mejorados
  const tableData: any[] = []
  
  concepts.forEach((concept, index) => {
    if (concept.type === 'title') {
      tableData.push([
        { 
          content: concept.key || '', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 11,
            halign: 'center'
          } 
        },
        { 
          content: concept.title || '', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 11
          }, 
          colSpan: 5 
        }
      ])
    } else {
      const rowColor = index % 2 === 0 ? colors.white : colors.grayLight
      tableData.push([
        { 
          content: concept.key || '', 
          styles: { 
            fontStyle: 'bold',
            fontSize: 10,
            fillColor: rowColor,
            textColor: colors.grayDark,
            halign: 'center'
          } 
        },
        { 
          content: concept.description || '',
          styles: { 
            fontSize: 10,
            fillColor: rowColor,
            textColor: colors.grayDark
          }
        },
        { 
          content: concept.unit || '',
          styles: { 
            fontSize: 10, 
            fillColor: rowColor,
            textColor: colors.grayDark,
            halign: 'center' 
          }
        },
        { 
          content: concept.quantity?.toString() || '',
          styles: { 
            fontSize: 10, 
            fillColor: rowColor,
            textColor: colors.grayDark,
            halign: 'center' 
          }
        },
        { 
          content: formatCurrency(concept.unitPrice || 0),
          styles: { 
            fontSize: 10, 
            fillColor: rowColor,
            textColor: colors.grayDark,
            halign: 'right' 
          }
        },
        { 
          content: formatCurrency(concept.total || 0),
          styles: { 
            fontSize: 10, 
            fillColor: rowColor,
            textColor: colors.primary,
            halign: 'right', 
            fontStyle: 'bold' 
          }
        }
      ])
    }
  })
  
  // Generar tabla premium
  autoTable(doc, {
    head: [
      [
        { 
          content: 'CLAVE', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryDark,
            textColor: colors.white,
            fontSize: 11,
            halign: 'center'
          } 
        },
        { 
          content: 'CONCEPTO', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryDark,
            textColor: colors.white,
            fontSize: 11
          } 
        },
        { 
          content: 'UNIDAD', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryDark,
            textColor: colors.white,
            fontSize: 11,
            halign: 'center'
          } 
        },
        { 
          content: 'CANTIDAD', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryDark,
            textColor: colors.white,
            fontSize: 11,
            halign: 'center'
          } 
        },
        { 
          content: 'P. UNITARIO', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryDark,
            textColor: colors.white,
            fontSize: 11,
            halign: 'center'
          } 
        },
        { 
          content: 'IMPORTE', 
          styles: { 
            fontStyle: 'bold', 
            fillColor: colors.primaryDark,
            textColor: colors.white,
            fontSize: 11,
            halign: 'center'
          } 
        }
      ]
    ],
    body: tableData,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 5,
      lineColor: colors.gray
    },
    headStyles: {
      fillColor: colors.primaryDark,
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
    margin: { top: 10, right: 15, bottom: 10, left: 15 }
  })
  
  // SECCIÓN DE TOTALES PREMIUM
  const finalY = (doc as any).lastAutoTable.finalY + 15
  
  // Fondo premium para totales
  doc.setFillColor(...colors.primaryLight)
  doc.roundedRect(120, finalY - 5, 75, 40, 5, 5, 'F')
  
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(2)
  doc.roundedRect(120, finalY - 5, 75, 40, 5, 5, 'S')
  
  // Líneas separadoras doradas
  doc.setDrawColor(...colors.primaryDark)
  doc.setLineWidth(1)
  doc.line(125, finalY + 8, 190, finalY + 8)
  doc.line(125, finalY + 18, 190, finalY + 18)
  
  // Texto de totales
  doc.setTextColor(...colors.grayDark)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Subtotal:', 125, finalY + 5)
  
  doc.setTextColor(...colors.grayDark)
  doc.setFont('helvetica', 'bold')
  doc.text(`IVA (${budget.ivaPercentage}%):`, 125, finalY + 15)
  
  doc.setTextColor(...colors.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('TOTAL:', 125, finalY + 28)
  
  // Valores de totales
  doc.setTextColor(...colors.grayDark)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(formatCurrency(budget.subtotal), 190, finalY + 5, { align: 'right' })
  
  doc.setTextColor(...colors.grayDark)
  doc.text(formatCurrency(budget.ivaAmount), 190, finalY + 15, { align: 'right' })
  
  doc.setTextColor(...colors.primary)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(formatCurrency(budget.total), 190, finalY + 28, { align: 'right' })
  
  // PIE DE PÁGINA CORPORATIVO
  const footerY = 260
  
  // Línea decorativa doble
  doc.setDrawColor(...colors.primary)
  doc.setLineWidth(2)
  doc.line(20, footerY, 190, footerY)
  
  doc.setDrawColor(...colors.primaryLight)
  doc.setLineWidth(1)
  doc.line(20, footerY + 2, 190, footerY + 2)
  
  // Información corporativa
  doc.setTextColor(...colors.gray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Ing. Francisco José Coviello Marcano - Director General', 105, footerY + 8, { align: 'center' })
  doc.text('CONSTRU-FE | CONSTRUIRLO ES POSIBLE', 105, footerY + 13, { align: 'center' })
  doc.text('Cel. (667)154-4098 | Tel. (667)718-3885 | constru_fe@hotmail.com', 105, footerY + 18, { align: 'center' })
  doc.text(`Generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`, 105, footerY + 23, { align: 'center' })
  
  // Marca de agua sutil
  doc.setTextColor(...colors.primaryLight)
  doc.setFontSize(60)
  doc.setFont('helvetica', 'bold')
  doc.setGState(new doc.GState({ opacity: 0.1 }))
  doc.text('CONSTRU-FE', 105, 150, { align: 'center', angle: 45 })
  doc.setGState(new doc.GState({ opacity: 1 }))
  
  // Metadatos mejorados
  doc.setProperties({
    title: `COTIZACIÓN ${budget.folio} - CONSTRU-FE`,
    subject: `Presupuesto para ${budget.client.name}`,
    author: 'CONSTRU-FE - Ing. Francisco José Coviello Marcano',
    keywords: 'cotizacion, presupuesto, constru-fe, construccion, mexico',
    creator: 'Sistema de Presupuestos CONSTRU-FE',
    producer: 'CONSTRU-FE Premium PDF Generator'
  })
  
  // Convertir a Buffer
  return Buffer.from(doc.output('arraybuffer'))
}