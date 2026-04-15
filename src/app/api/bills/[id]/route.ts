import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface BillDetail {
  id: string;
  serviceName: string;
  amount: string;
  frequency: string;
  status: string;
  detectedDate: string;
  lastChargeDate: string;
  merchantEmail?: string;
  recoverableAmount?: number;
  payoutStatus?: 'pending' | 'claimed' | 'sent';
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
  }>;
}

const DATA_FILE = join(process.cwd(), 'data', 'bills.json');

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await import('fs').then(fs => fs.promises.mkdir(dataDir, { recursive: true }));
  }
}

async function getBills(): Promise<BillDetail[]> {
  await ensureDataDir();
  
  if (!existsSync(DATA_FILE)) {
    const defaultData: BillDetail[] = [];
    await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

async function getBillById(id: string): Promise<BillDetail | null> {
  const bills = await getBills();
  return bills.find(bill => bill.id === id) || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bill = await getBillById(id);
    
    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch bill',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const bills = await getBills();
    
    const billIndex = bills.findIndex(bill => bill.id === id);
    if (billIndex === -1) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // Update bill with new data
    bills[billIndex] = { ...bills[billIndex], ...body.updates };
    
    await writeFile(DATA_FILE, JSON.stringify(bills, null, 2));
    
    return NextResponse.json({
      success: true,
      data: bills[billIndex]
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update bill',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
