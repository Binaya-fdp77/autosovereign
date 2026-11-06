import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, paypalEmail, role } = await request.json();
    const db = prisma as any;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required.' }, { status: 400 });
    }

    // Ensure paypalEmail is never an empty string to satisfy UNIQUE constraint
    const finalPaypalEmail = paypalEmail && paypalEmail.trim() !== '' 
      ? paypalEmail.trim() 
      : `paypal-${Date.now()}-${Math.floor(Math.random() * 1000)}@autosovereign.test`;

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email.trim() },
          { paypalEmail: finalPaypalEmail }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'A user with this Email or PayPal Email is already registered.' 
      }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        paypalEmail: finalPaypalEmail,
        role: role || 'CLIENT',
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint error: Email or PayPal Email already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}