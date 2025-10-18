import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            budgets: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, name, email, role = 'user' } = await request.json()
    
    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Username, password and name are required' }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { username }
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }
    
    // Hash password
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
        role
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
  }
}