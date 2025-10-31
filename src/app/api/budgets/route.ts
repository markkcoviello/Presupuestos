import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate unique consecutive folio
async function generateFolio(): Promise<string> {
  try {
    // Get the highest existing numeric folio
    const allBudgets = await db.budget.findMany({
      select: {
        folio: true
      }
    })
    
    let nextNumber = 1
    
    // Filter for numeric folios and find the highest
    const numericFolios = allBudgets
      .map(b => b.folio)
      .filter(folio => /^\d+$/.test(folio))
      .map(folio => parseInt(folio))
    
    if (numericFolios.length > 0) {
      const highestNumber = Math.max(...numericFolios)
      nextNumber = highestNumber + 1
    }
    
    return nextNumber.toString().padStart(4, '0')
  } catch (error) {
    console.error('Error generating folio:', error)
    // Fallback to timestamp-based folio
    return Date.now().toString()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const folio = searchParams.get('folio')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    
    const where: any = {}
    
    if (clientId) where.clientId = clientId
    if (folio) where.folio = { contains: folio }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) where.date.gte = dateFrom
      if (dateTo) where.date.lte = dateTo
    }
    if (minAmount || maxAmount) {
      where.total = {}
      if (minAmount) where.total.gte = parseFloat(minAmount)
      if (maxAmount) where.total.lte = parseFloat(maxAmount)
    }
    
    const budgets = await db.budget.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ error: 'Error fetching budgets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // 1. Se eliminó 'userId' de esta lista.
    const { 
      clientId, 
      recipientId, 
      date, 
      description, 
      concepts, 
      subtotal, 
      ivaPercentage, 
      ivaAmount, 
      total 
    } = body
    
    // 2. Se eliminó la validación de 'userId'.
    if (!clientId || !recipientId || !date || !concepts || concepts.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Generate unique consecutive folio
    const folio = await generateFolio()
    
    const budget = await db.budget.create({
      data: {
        folio,
        // 3. Se eliminó 'userId' de los datos a guardar.
        clientId,
        recipientId,
        date,
        description,
        concepts,
        subtotal,
        ivaPercentage,
        ivaAmount,
        total
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true
          }
        }
      }
    })
    
    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ error: 'Error creating budget' }, { status: 500 })
  }
}