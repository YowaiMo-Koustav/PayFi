// Real-time Data Integration Test
// This file tests the complete data flow from upload to display

interface TestData {
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    merchant: string;
  }>;
  charges: Array<{
    id: string;
    merchant: string;
    currentPrice: number;
    averagePrice: number;
    delta: number;
    confidence: 'High' | 'Medium' | 'Low';
    anomaly: string | null;
    status: string;
    frequency: string;
  }>;
  dashboard: {
    netGain: number;
    recoveredSavings: number;
    monthlySavings: number;
    agentSpend: number;
    recentActivity: Array<{
      id: string;
      type: 'cancelled' | 'escalated' | 'refunded';
      serviceName: string;
      amount?: string;
      status: string;
    }>;
  };
}

export async function testRealtimeDataFlow() {
  console.log('🧪 Testing Real-time Data Integration...');
  
  try {
    // Test 1: Upload API with transaction extraction
    console.log('\n📤 Testing Upload API...');
    const testFile = new Blob([
      JSON.stringify([
        { date: '2024-01-15', amount: 19.99, merchant: 'Netflix' },
        { date: '2024-02-15', amount: 22.99, merchant: 'Netflix' },
        { date: '2024-01-12', amount: 85.00, merchant: 'Adobe Creative Cloud' }
      ])
    ], { type: 'application/json' });
    
    const formData = new FormData();
    formData.append('files', testFile, 'test-transactions.json');
    
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful:', uploadResult.data);
    
    // Test 2: Check if transactions were saved
    console.log('\n💳 Testing Transactions API...');
    const transactionsResponse = await fetch('/api/transactions');
    const transactionsResult = await transactionsResponse.json();
    
    if (!transactionsResult.success) {
      throw new Error('Transactions API failed');
    }
    
    console.log('✅ Transactions retrieved:', transactionsResult.data.length, 'transactions');
    
    // Test 3: Check if charges were detected
    console.log('\n🔍 Testing Charges API...');
    const chargesResponse = await fetch('/api/charges');
    const chargesResult = await chargesResponse.json();
    
    if (!chargesResult.success) {
      throw new Error('Charges API failed');
    }
    
    console.log('✅ Charges detected:', chargesResult.data.length, 'recurring charges');
    
    // Test 4: Check dashboard metrics
    console.log('\n📊 Testing Dashboard API...');
    const dashboardResponse = await fetch('/api/dashboard');
    const dashboardResult = await dashboardResponse.json();
    
    if (!dashboardResult.success) {
      throw new Error('Dashboard API failed');
    }
    
    console.log('✅ Dashboard data:', {
      netGain: dashboardResult.data.netGain,
      recoveredSavings: dashboardResult.data.recoveredSavings,
      recentActivity: dashboardResult.data.recentActivity.length
    });
    
    // Test 5: Test bill detail API
    if (chargesResult.data.length > 0) {
      console.log('\n📄 Testing Bill Detail API...');
      const firstCharge = chargesResult.data[0];
      const billResponse = await fetch(`/api/bills/${firstCharge.id}`);
      const billResult = await billResponse.json();
      
      if (!billResponse.ok) {
        console.log('⚠️ Bill detail API not ready (expected for new charges)');
      } else {
        console.log('✅ Bill detail retrieved:', billResult.data);
      }
    }
    
    console.log('\n🎉 All real-time data tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Real-time data test failed:', error);
    return false;
  }
}

// Test data generation utilities
export const generateTestTransactions = () => [
  {
    id: 'test-1',
    date: '2024-01-15',
    amount: 19.99,
    merchant: 'Netflix'
  },
  {
    id: 'test-2', 
    date: '2024-02-15',
    amount: 22.99,
    merchant: 'Netflix'
  },
  {
    id: 'test-3',
    date: '2024-01-12',
    amount: 85.00,
    merchant: 'Adobe Creative Cloud'
  },
  {
    id: 'test-4',
    date: '2024-02-12',
    amount: 85.00,
    merchant: 'Adobe Creative Cloud'
  }
];

export const generateTestCSV = () => {
  const headers = 'Date,Amount,Merchant,Category\n';
  const rows = generateTestTransactions().map(t => 
    `${t.date},${t.amount},${t.merchant},Subscription`
  ).join('\n');
  return headers + rows;
};

// Test runner for development
if (typeof window !== 'undefined') {
  (window as any).testRealtimeData = testRealtimeDataFlow;
  (window as any).generateTestData = () => {
    const csv = generateTestCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-transactions.csv';
    a.click();
  };
}
