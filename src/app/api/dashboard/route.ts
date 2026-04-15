import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface DashboardMetrics {
  netGain: number;
  netGainTrend: number;
  recoveredSavings: number;
  monthlySavings: number;
  monthlySavingsTrend: number;
  agentSpend: number;
  recentActivity: Array<{
    id: string;
    type: 'cancelled' | 'escalated' | 'refunded';
    serviceName: string;
    amount?: string;
    status: string;
    timestamp: string;
  }>;
}

// In a real app, this would come from a database
// For now, we'll store data in a JSON file for persistence
const DATA_FILE = join(process.cwd(), 'data', 'dashboard.json');

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await import('fs').then(fs => fs.promises.mkdir(dataDir, { recursive: true }));
  }
}

async function getDashboardData(): Promise<DashboardMetrics> {
  await ensureDataDir();
  
  if (!existsSync(DATA_FILE)) {
    // Initialize with default data
    const defaultData: DashboardMetrics = {
      netGain: 1240,
      netGainTrend: 15,
      recoveredSavings: 1500,
      monthlySavings: 320,
      monthlySavingsTrend: 5,
      agentSpend: 260,
      recentActivity: [
        {
          id: '1',
          type: 'cancelled',
          serviceName: 'Netflix',
          amount: '+$22.99/mo',
          status: 'Requested via automated draft',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'escalated',
          serviceName: 'Gym Membership',
          status: 'Under review by human agent',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'refunded',
          serviceName: 'Adobe Creative Cloud',
          amount: '+$85.00',
          status: 'Payout ready to be claimed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    await import('fs').then(fs => 
      fs.promises.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2))
    );
    return defaultData;
  }
  
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentData = await getDashboardData();
    
    // Update metrics based on the action
    const updatedData = { ...currentData };
    
    if (body.action === 'cancellation') {
      updatedData.netGain += parseFloat(body.amount.replace(/[^0-9.]/g, ''));
      updatedData.monthlySavings += parseFloat(body.amount.replace(/[^0-9.]/g, ''));
      
      // Add to recent activity
      updatedData.recentActivity.unshift({
        id: Date.now().toString(),
        type: 'cancelled',
        serviceName: body.serviceName,
        amount: body.amount,
        status: body.status || 'Cancelled successfully',
        timestamp: new Date().toISOString()
      });
    } else if (body.action === 'escalation') {
      updatedData.agentSpend += 5; // Assume $5 cost for escalation
      
      updatedData.recentActivity.unshift({
        id: Date.now().toString(),
        type: 'escalated',
        serviceName: body.serviceName,
        status: 'Escalated to human agent',
        timestamp: new Date().toISOString()
      });
    } else if (body.action === 'refund') {
      updatedData.recoveredSavings += parseFloat(body.amount.replace(/[^0-9.]/g, ''));
      
      updatedData.recentActivity.unshift({
        id: Date.now().toString(),
        type: 'refunded',
        serviceName: body.serviceName,
        amount: body.amount,
        status: 'Refund processed',
        timestamp: new Date().toISOString()
      });
    }
    
    // Keep only last 10 activities
    updatedData.recentActivity = updatedData.recentActivity.slice(0, 10);
    
    // Save updated data
    await import('fs').then(fs => 
      fs.promises.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2))
    );
    
    return NextResponse.json({
      success: true,
      data: updatedData
    });
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
