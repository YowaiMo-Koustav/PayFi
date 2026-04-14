import { NextRequest, NextResponse } from 'next/server';
import locusService, { LedgerEvent } from '@/lib/locus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, currency, fromAddress, toAddress, metadata } = body;

    if (!type || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: type, amount, currency' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const ledgerEvent: LedgerEvent = {
      type,
      amount,
      currency,
      fromAddress,
      toAddress,
      metadata,
      timestamp: new Date().toISOString(),
    };

    const result = await locusService.recordLedgerEvent(ledgerEvent);

    return NextResponse.json({
      success: true,
      data: result,
      mockMode: locusService.isMockMode(),
    });
  } catch (error) {
    console.error('Error recording ledger event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record ledger event',
        message: error instanceof Error ? error.message : 'Unknown error',
        mockMode: locusService.isMockMode(),
      },
      { status: 500 }
    );
  }
}
