import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'text/csv',
  'application/pdf',
  'application/json',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
  category?: string;
  description?: string;
}

async function extractTransactionsFromFile(file: File): Promise<Transaction[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const content = buffer.toString('utf-8');
  const transactions: Transaction[] = [];

  if (file.type === 'application/json') {
    try {
      const data = JSON.parse(content);
      const items = Array.isArray(data) ? data : [data];
      
      for (const item of items) {
        if (item.amount && item.merchant) {
          transactions.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: item.date || new Date().toISOString(),
            amount: parseFloat(item.amount),
            merchant: item.merchant,
            category: item.category,
            description: item.description
          });
        }
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length >= 3) {
          transactions.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: columns[0] || new Date().toISOString(),
            amount: parseFloat(columns[1]) || 0,
            merchant: columns[2] || 'Unknown Merchant',
            category: columns[3],
            description: columns[4]
          });
        }
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
  } else {
    // Simple text parsing - look for patterns like "$amount merchant"
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/\$(\d+\.?\d*)\s+(.+)/i);
      if (match) {
        transactions.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          amount: parseFloat(match[1]),
          merchant: match[2].trim()
        });
      }
    }
  }

  return transactions;
}

async function saveTransactions(transactions: Transaction[]) {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }

  const transactionsFile = join(dataDir, 'transactions.json');
  let existingTransactions: Transaction[] = [];

  if (existsSync(transactionsFile)) {
    const data = await readFile(transactionsFile, 'utf-8');
    existingTransactions = JSON.parse(data);
  }

  const updatedTransactions = [...existingTransactions, ...transactions];
  await writeFile(transactionsFile, JSON.stringify(updatedTransactions, null, 2));
}

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    const errors = [];
    const allTransactions: Transaction[] = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        continue;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: File type not allowed. Allowed types: CSV, PDF, JSON, Excel`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = join(UPLOAD_DIR, filename);
        
        // Write file
        await writeFile(filepath, buffer);
        
        // Extract transactions from file
        const transactions = await extractTransactionsFromFile(file);
        allTransactions.push(...transactions);
        
        uploadedFiles.push({
          originalName: file.name,
          filename,
          size: file.size,
          type: file.type,
          path: filepath,
          uploadTime: new Date().toISOString(),
          transactionsExtracted: transactions.length
        });
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        errors.push(`${file.name}: Failed to upload file`);
      }
    }

    // Save all extracted transactions
    if (allTransactions.length > 0) {
      await saveTransactions(allTransactions);
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadedFiles,
        errors: errors.length > 0 ? errors : null,
        totalFiles: files.length,
        successfulUploads: uploadedFiles.length,
        totalTransactionsExtracted: allTransactions.length
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // List uploaded files (for debugging/management)
    const fs = await import('fs');
    const path = await import('path');
    
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({
        success: true,
        data: { files: [] }
      });
    }

    const files = fs.readdirSync(UPLOAD_DIR);
    const fileInfos = files.map(filename => {
      const filepath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filepath);
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: { files: fileInfos }
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list files',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
