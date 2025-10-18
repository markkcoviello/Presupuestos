import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    const recipients = await db.recipient.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(recipients)
  } catch (error) {
    console.error('Error fetching recipients:', error)
    return NextResponse.json({ error: 'Error fetching recipients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, name, email, phone, position } = body
    
    if (!clientId || !name) {
      return NextResponse.json({ error: 'Client ID and name are required' }, { status: 400 })
    }
    
    const recipient = await db.recipient.create({
      data: {
        clientId,
        name,
        email,
        phone,
        position
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    return NextResponse.json(recipient, { status: 201 })
  } catch (error) {
    console.error('Error creating recipient:', error)
    return NextResponse.json({ error: 'Error creating recipient' }, { status: 500 })
  }
}