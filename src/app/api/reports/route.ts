// API para integración con reporteador externo
// Esta API prepara los datos del presupuesto para que un reporteador externo pueda consumirlos fácilmente

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { prepareBudgetDataForReporting } from '@/lib/budget-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const budgetId = searchParams.get('budgetId')
    
    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }
    
    // Obtener el presupuesto con todas las relaciones
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        client: true,
        recipient: true
      }
    })
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    // Preparar datos para el reporteador
    const reportData = prepareBudgetDataForReporting(budget, budget.client, budget.recipient)
    
    return NextResponse.json({
      success: true,
      data: reportData,
      metadata: {
        budgetId: budget.id,
        folio: budget.folio,
        generatedAt: new Date().toISOString(),
        format: 'JSON'
      }
    })
    
  } catch (error) {
    console.error('Error preparing report data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Endpoint para generar reporte con diferentes formatos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { budgetId, format = 'json', template = 'default' } = body
    
    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }
    
    // Obtener datos del presupuesto
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
      include: {
        user: true,
        client: true,
        recipient: true
      }
    })
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    // Preparar datos según el formato solicitado
    const reportData = prepareBudgetDataForReporting(budget, budget.client, budget.recipient)
    
    // Aquí puedes integrar con diferentes herramientas de reportes
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json({
          success: true,
          format: 'json',
          data: reportData,
          downloadUrl: `/api/reports/data?budgetId=${budgetId}`
        })
        
      case 'xml':
        // Convertir a XML para herramientas como JasperReports
        const xmlData = convertToXML(reportData)
        return new NextResponse(xmlData, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="presupuesto_${budget.folio}.xml"`
          }
        })
        
      case 'csv':
        // Convertir a CSV para herramientas como Crystal Reports
        const csvData = convertToCSV(reportData)
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="presupuesto_${budget.folio}.csv"`
          }
        })
        
      default:
        return NextResponse.json({
          success: true,
          format: 'json',
          data: reportData,
          message: 'Use format parameter to specify: json, xml, csv'
        })
    }
    
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Funciones de conversión para diferentes formatos
function convertToXML(data: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<presupuesto>
  <folio>${data.budget.folio}</folio>
  <fecha>${data.budget.date}</fecha>
  <descripcion>${data.budget.description}</descripcion>
  <cliente>
    <nombre>${data.client.name}</nombre>
    <email>${data.client.email || ''}</email>
    <telefono>${data.client.phone || ''}</telefono>
    <direccion>${data.client.address || ''}</direccion>
  </cliente>
  <destinatario>
    <nombre>${data.recipient.name}</nombre>
    <email>${data.recipient.email || ''}</email>
    <telefono>${data.recipient.phone || ''}</telefono>
    <cargo>${data.recipient.position || ''}</cargo>
  </destinatario>
  <conceptos>
    ${data.concepts.map((concept: any) => `
    <concepto>
      <tipo>${concept.type}</tipo>
      <titulo>${concept.title || ''}</titulo>
      <descripcion>${concept.description || ''}</descripcion>
      <unidad>${concept.unit || ''}</unidad>
      <cantidad>${concept.quantity || 0}</cantidad>
      <precioUnitario>${concept.unitPrice || 0}</precioUnitario>
      <total>${concept.total || 0}</total>
    </concepto>`).join('')}
  </conceptos>
  <totales>
    <subtotal>${data.budget.subtotal}</subtotal>
    <iva>${data.budget.ivaAmount}</iva>
    <total>${data.budget.total}</total>
  </totales>
  <empresa>
    <nombre>${data.company.name}</nombre>
    <slogan>${data.company.slogan}</slogan>
    <contacto>${data.company.contactPerson}</contacto>
    <rfc>${data.company.rfc}</rfc>
    <direccion>${data.company.address}</direccion>
    <ciudad>${data.company.city}</ciudad>
    <telefono>${data.company.phone}</telefono>
  </empresa>
</presupuesto>`
}

function convertToCSV(data: any): string {
  const headers = [
    'Folio', 'Fecha', 'Cliente', 'Destinatario', 'Descripción',
    'Concepto', 'Unidad', 'Cantidad', 'Precio Unitario', 'Total',
    'Subtotal', 'IVA', 'Total General'
  ]
  
  const rows = data.concepts.map((concept: any) => [
    data.budget.folio,
    data.budget.date,
    data.client.name,
    data.recipient.name,
    data.budget.description || '',
    concept.description || concept.title || '',
    concept.unit || '',
    concept.quantity || 0,
    concept.unitPrice || 0,
    concept.total || 0,
    data.budget.subtotal,
    data.budget.ivaAmount,
    data.budget.total
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}