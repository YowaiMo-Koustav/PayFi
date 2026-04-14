import { NextRequest, NextResponse } from 'next/server';
import locusService, { PayoutRequest } from '@/lib/locus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipient, amount, currency, memo } = body;

    if (!recipient || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: recipient, amount' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const payoutRequest: PayoutRequest = {
      recipient,
      amount,
      currency: currency || 'USDC',
      memo,
    };

    const result = await locusService.sendRecoveredPayout(payoutRequest);

    return NextResponse.json({
      success: true,
      data: result,
      mockMode: locusService.isMockMode(),
    });
  } catch (error) {
    console.error('Error sending recovered payout:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send recovered payout',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockMode: locusService.isMockMode(),
      },
      { status: 500 }
    );
  }
}
