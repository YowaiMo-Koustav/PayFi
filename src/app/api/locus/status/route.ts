import { NextResponse } from 'next/server';
import locusService from '@/lib/locus';

export async function GET() {
  try {
    const status = {
      mockMode: locusService.isMockMode(),
      emailsEnabled: locusService.areEmailsEnabled(),
      paymentsEnabled: locusService.arePaymentsEnabled(),
      humanTasksEnabled: locusService.areHumanTasksEnabled(),
    };

    // Try to get balance if payments are enabled
    let balance = null;
    if (status.paymentsEnabled && !status.mockMode) {
      try {
        balance = await locusService.getBalance();
      } catch (error) {
        console.error('Failed to get balance:', error);
        balance = { error: 'Failed to retrieve balance' };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        balance,
      },
    });
  } catch (error) {
    console.error('Error getting Locus status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get Locus status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
