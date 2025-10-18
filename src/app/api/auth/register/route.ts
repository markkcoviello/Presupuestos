import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

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
    
    // Check if email already exists
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email }
      })
      
      if (existingEmail) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }
    
    // Hash password
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
    
    return NextResponse.json({
      user,
      message: 'User created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}