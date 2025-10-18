import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    
    // Preparar datos para Jasper Reports
    const jasperData = prepareJasperData(budget)
    
    return NextResponse.json({
      success: true,
      data: jasperData,
      message: 'Data prepared for Jasper Reports'
    })
    
  } catch (error) {
    console.error('Error preparing Jasper data:', error)
    return NextResponse.json(
      { error: 'Error preparing data for Jasper Reports' },
      { status: 500 }
    )
  }
}

function prepareJasperData(budget: any) {
  const concepts = budget.concepts as any[]
  
  return {
    // Datos del presupuesto
    presupuesto: {
      id: budget.id,
      folio: budget.folio,
      description: budget.description,
      date: budget.date,
      subtotal: budget.subtotal,
      ivaAmount: budget.ivaAmount,
      total: budget.total,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt
    },
    
    // Datos del cliente
    cliente: {
      id: budget.client?.id,
      name: budget.client?.name,
      email: budget.client?.email,
      phone: budget.client?.phone,
      address: budget.client?.address,
      createdAt: budget.client?.createdAt
    },
    
    // Datos del destinatario
    destinatario: {
      id: budget.recipient?.id,
      name: budget.recipient?.name,
      email: budget.recipient?.email,
      phone: budget.recipient?.phone,
      address: budget.recipient?.address,
      createdAt: budget.recipient?.createdAt
    },
    
    // Conceptos del presupuesto
    conceptos: concepts.map(concept => ({
      id: concept.id,
      quantity: concept.quantity,
      description: concept.description,
      unit: concept.unit,
      unitPrice: concept.unitPrice,
      total: concept.total,
      type: concept.type,
      title: concept.title
    })),
    
    // Datos de la empresa (CONSTRU-FE)
    empresa: {
      nombre: 'CONSTRU-FE',
      rfc: 'GOTM5611245W5',
      direccion: 'Tulipán #22, Col. 10 de Mayo, C.P. 80270',
      ciudad: 'Culiacán de Rosales, Culiacán, Sinaloa',
      telefono: '(667)718 3885',
      celular: '(667)154 4098',
      email: 'constru_fe@hotmail.com',
      slogan: 'CONSTRUIRLO ES POSIBLE'
    },
    
    // Datos del ingeniero/director
    ingeniero: {
      nombre: 'Ing. Francisco José Coviello Marcano',
      cargo: 'Director General',
      celular: '(667)154 4098',
      telefono: '(667)718 3885',
      email: 'constru_fe@hotmail.com'
    }
  }
}