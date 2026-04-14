export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchant: string;
}

export interface DetectedCharge {
  id: string;
  merchant: string;
  currentPrice: number;
  averagePrice: number;
  delta: number;
  confidence: 'High' | 'Medium' | 'Low';
  anomaly: string | null;
  status: string;
  frequency: string;
}

export function detectRecurringCharges(transactions: Transaction[]): DetectedCharge[] {
  // 1. Group by merchant
  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!grouped[t.merchant]) grouped[t.merchant] = [];
    grouped[t.merchant].push(t);
  });

  const candidates: DetectedCharge[] = [];

  for (const [merchant, history] of Object.entries(grouped)) {
    // Need at least 2 transactions to establish a baseline recurrence
    if (history.length < 2) continue;

    // Sort by date ascending
    history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let totalDays = 0;
    let duplicateDetected = false;

    // Detect average frequencies and potential duplicate overlapping charges
    for (let i = 1; i < history.length; i++) {
      const d1 = new Date(history[i-1].date).getTime();
      const d2 = new Date(history[i].date).getTime();
      const diffDays = (d2 - d1) / (1000 * 60 * 60 * 24);
      
      if (diffDays < 15) {
        duplicateDetected = true;
      }
      totalDays += diffDays;
    }
    
    const avgDays = totalDays / (history.length - 1);

    // Determine recurrence window
    const isMonthly = avgDays >= 20 && avgDays <= 45;
    const isYearly = avgDays >= 350 && avgDays <= 380;
    
    if (isMonthly || isYearly || duplicateDetected) {
      const latest = history[history.length - 1];
      const previous = history.slice(0, history.length - 1);
      
      const avgPrice = previous.reduce((acc, t) => acc + t.amount, 0) / (previous.length || 1);
      const delta = latest.amount - avgPrice;
      const percentIncrease = avgPrice > 0 ? delta / avgPrice : 0;

      let anomaly = null;
      let confidence: 'High' | 'Medium' | 'Low' = 'Medium';
      let status = 'Active';

      if (history.length >= 3) {
         confidence = 'High';
      }

      if (duplicateDetected) {
        anomaly = 'Hidden duplicate charge detected';
        status = 'Under Review';
        confidence = 'High';
      } else if (delta > 0 && percentIncrease > 0.05) {
        anomaly = `Price increased by $${delta.toFixed(2)} vs average`;
        status = 'Under Review';
      }

      candidates.push({
        id: merchant.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        merchant,
        currentPrice: latest.amount,
        averagePrice: avgPrice,
        delta,
        confidence,
        anomaly,
        status,
        frequency: isYearly ? 'Yearly' : 'Monthly'
      });
    }
  }

  // Sort candidates placing anomalies on top, then descending by pure delta
  return candidates.sort((a, b) => {
    if (a.anomaly && !b.anomaly) return -1;
    if (!a.anomaly && b.anomaly) return 1;
    return b.delta - a.delta;
  });
}

// Generate deterministic mock data to fuel the algorithm
export const MOCK_TRANSACTIONS: Transaction[] = [
  // Netflix increases price on the last charge
  ...Array.from({length: 4}).map((_, i) => ({
    id: `netflix-${i}`,
    date: new Date(2023, i, 15).toISOString(),
    amount: i === 3 ? 22.99 : 19.99, 
    merchant: 'Netflix'
  })),
  // Adobe maintains exactly the same baseline
  ...Array.from({length: 5}).map((_, i) => ({
    id: `adobe-${i}`,
    date: new Date(2023, i+1, 12).toISOString(),
    amount: 85.00,
    merchant: 'Adobe Creative Cloud'
  })),
  // Amazon happens exactly once a year
  ...Array.from({length: 3}).map((_, i) => ({
    id: `amzn-${i}`,
    date: new Date(2021 + i, 8, 20).toISOString(),
    amount: 139.00,
    merchant: 'Amazon Prime'
  })),
  // Gym membership has a baseline but gets a duplicate hidden charge on month 4
  ...Array.from({length: 3}).map((_, i) => ({
    id: `gym-${i}`,
    date: new Date(2023, i, 5).toISOString(),
    amount: 120.00,
    merchant: 'Gym Membership'
  })),
  { id: 'gym-dupe', date: new Date(2023, 2, 10).toISOString(), amount: 120.00, merchant: 'Gym Membership' },
];
