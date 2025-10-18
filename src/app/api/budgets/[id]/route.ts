import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const budget = await db.budget.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            position: true
          }
        }
      }
    })
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json({ error: 'Error fetching budget' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      clientId, 
      recipientId, 
      date, 
      description, 
      concepts, 
      subtotal, 
      ivaPercentage, 
      ivaAmount, 
      total,
      status
    } = body
    
    // Check if budget exists
    const existingBudget = await db.budget.findUnique({
      where: { id }
    })
    
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    const budget = await db.budget.update({
      where: { id },
      data: {
        clientId,
        recipientId,
        date,
        description,
        concepts,
        subtotal,
        ivaPercentage,
        ivaAmount,
        total,
        status: status || existingBudget.status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
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
    
    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json({ error: 'Error updating budget' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if budget exists
    const existingBudget = await db.budget.findUnique({
      where: { id }
    })
    
    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }
    
    await db.budget.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json({ error: 'Error deleting budget' }, { status: 500 })
  }
}