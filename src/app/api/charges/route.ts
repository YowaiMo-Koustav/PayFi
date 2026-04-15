import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { detectRecurringCharges } from '@/lib/detector';

interface DetectedCharge {
  id: string;
  merchant: string;
  currentPrice: number;
  averagePrice: number;
  delta: number;
  confidence: 'High' | 'Medium' | 'Low';
  anomaly: string | null;
  status: string;
  frequency: string;
  detectedDate: string;
}

const DATA_FILE = join(process.cwd(), 'data', 'charges.json');

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await import('fs').then(fs => fs.promises.mkdir(dataDir, { recursive: true }));
  }
}

async function getCharges(): Promise<DetectedCharge[]> {
  await ensureDataDir();
  
  if (!existsSync(DATA_FILE)) {
    const defaultData: DetectedCharge[] = [];
    await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

async function updateChargesFromTransactions(): Promise<DetectedCharge[]> {
  // Get transactions from the transactions API
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/transactions`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      const charges = detectRecurringCharges(result.data);
      
      // Add detection metadata
      const enrichedCharges = charges.map(charge => ({
        ...charge,
        detectedDate: new Date().toISOString()
      }));
      
      await writeFile(DATA_FILE, JSON.stringify(enrichedCharges, null, 2));
      return enrichedCharges;
    }
  } catch (error) {
    console.error('Error updating charges from transactions:', error);
  }
  
  return [];
}

export async function GET() {
  try {
    let charges = await getCharges();
    
    // If no charges exist, try to generate from transactions
    if (charges.length === 0) {
      charges = await updateChargesFromTransactions();
    }
    
    return NextResponse.json({
      success: true,
      data: charges
    });
  } catch (error) {
    console.error('Error fetching charges:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch charges',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const charges = await getCharges();
    
    // Update charge status or add new charge
    const updatedCharges = charges.map(charge => 
      charge.id === body.id ? { ...charge, ...body.updates } : charge
    );
    
    await writeFile(DATA_FILE, JSON.stringify(updatedCharges, null, 2));
    
    return NextResponse.json({
      success: true,
      data: updatedCharges
    });
  } catch (error) {
    console.error('Error updating charge:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update charge',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Charge ID is required' },
        { status: 400 }
      );
    }
    
    const charges = await getCharges();
    const filteredCharges = charges.filter(c => c.id !== id);
    
    await writeFile(DATA_FILE, JSON.stringify(filteredCharges, null, 2));
    
    return NextResponse.json({
      success: true,
      data: filteredCharges
    });
  } catch (error) {
    console.error('Error deleting charge:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete charge',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
