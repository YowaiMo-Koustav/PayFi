import { useState, useEffect } from 'react';

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

export function useBill(id: string) {
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBill = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/bills/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setBill(result.data);
      } else {
        setError(result.error || 'Failed to fetch bill details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateBill = async (updates: Partial<BillDetail>) => {
    try {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBill(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update bill');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (id) {
      fetchBill();
    }
  }, [id]);

  return {
    bill,
    loading,
    error,
    refetch: fetchBill,
    update: updateBill,
  };
}
