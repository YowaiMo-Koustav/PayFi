import { NextRequest, NextResponse } from 'next/server';
import locusService, { EmailRequest } from '@/lib/locus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionName, userEmail, reason } = body;

    if (!subscriptionName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionName, userEmail' },
        { status: 400 }
      );
    }

    const emailRequest = await locusService.generateCancellationEmail(
      subscriptionName,
      userEmail,
      reason
    );

    return NextResponse.json({
      success: true,
      data: emailRequest,
      mockMode: locusService.isMockMode(),
    });
  } catch (error) {
    console.error('Error generating cancellation email:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate cancellation email',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockMode: locusService.isMockMode(),
      },
      { status: 500 }
    );
  }
}
