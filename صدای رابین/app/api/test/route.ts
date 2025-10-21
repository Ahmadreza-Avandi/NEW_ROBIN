import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userMessage } = await request.json();
    
    return NextResponse.json({
      response: `سلام! پیام شما دریافت شد: "${userMessage}"`,
      status: 'success'
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}