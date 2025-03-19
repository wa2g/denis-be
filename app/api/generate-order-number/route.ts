import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the current counter value
    const counter = await prisma.counter.upsert({
      where: { id: 'invoice_counter' },
      update: { value: { increment: 1 } },
      create: { id: 'invoice_counter', value: 1 }
    });

    // Format the order number with leading zeros
    const orderNumber = `INV${counter.value.toString().padStart(6, '0')}`;

    return NextResponse.json({ orderNumber });
  } catch (error) {
    console.error('Error generating order number:', error);
    return NextResponse.json(
      { error: 'Failed to generate order number' },
      { status: 500 }
    );
  }
} 