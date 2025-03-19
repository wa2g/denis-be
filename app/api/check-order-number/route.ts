import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number');

  if (!number) {
    return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: number
      }
    });

    return NextResponse.json({ exists: !!order });
  } catch (error) {
    console.error('Error checking order number:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}