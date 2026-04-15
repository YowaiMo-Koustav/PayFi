import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category?: string;
  description?: string;
}

const DATA_FILE = join(process.cwd(), 'data', 'transactions.json');

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await import('fs').then(fs => fs.promises.mkdir(dataDir, { recursive: true }));
  }
}

async function getTransactions(): Promise<Transaction[]> {
  await ensureDataDir();
  
  if (!existsSync(DATA_FILE)) {
    // Start with empty array - transactions will come from uploaded files
    const defaultData: Transaction[] = [];
    await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  const data = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transactions = await getTransactions();
    
    // Add new transactions
    const newTransactions = Array.isArray(body) ? body : [body];
    const updatedTransactions = [...transactions, ...newTransactions];
    
    await writeFile(DATA_FILE, JSON.stringify(updatedTransactions, null, 2));
    
    return NextResponse.json({
      success: true,
      data: updatedTransactions
    });
  } catch (error) {
    console.error('Error adding transactions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add transactions',
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
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    const transactions = await getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    
    await writeFile(DATA_FILE, JSON.stringify(filteredTransactions, null, 2));
    
    return NextResponse.json({
      success: true,
      data: filteredTransactions
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
