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
    
    return nextNumber.toString().padStart(3, '0')
  } catch (error) {
    console.error('Error generating folio:', error)
    // Fallback to timestamp-based folio
    return Date.now().toString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { budgetId, newDate, newDescription } = await request.json()
    
    if (!budgetId) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }
    
    // Get the original budget
    const originalBudget = await db.budget.findUnique({
      where: { id: budgetId },
      include: {
        user: true,
        client: true,
        recipient: true
      }
    })
    
    if (!originalBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    // Generate new folio
    const newFolio = await generateFolio()
    
    // Create new budget with reused data
    const newBudget = await db.budget.create({
      data: {
        folio: newFolio,
        userId: originalBudget.userId, // Keep the same user
        clientId: originalBudget.clientId,
        recipientId: originalBudget.recipientId,
        date: newDate || new Date().toISOString().split('T')[0],
        description: newDescription || originalBudget.description,
        concepts: originalBudget.concepts,
        subtotal: originalBudget.subtotal,
        ivaPercentage: originalBudget.ivaPercentage,
        ivaAmount: originalBudget.ivaAmount,
        total: originalBudget.total,
        status: 'active'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
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
    
    return NextResponse.json(newBudget, { status: 201 })
  } catch (error) {
    console.error('Error reusing budget:', error)
    return NextResponse.json({ error: 'Error reusing budget' }, { status: 500 })
  }
}