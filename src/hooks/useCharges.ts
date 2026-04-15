import { useState, useEffect } from 'react';

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

export function useCharges() {
  const [charges, setCharges] = useState<DetectedCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/charges');
      const result = await response.json();
      
      if (result.success) {
        setCharges(result.data);
      } else {
        setError(result.error || 'Failed to fetch charges');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateCharge = async (id: string, updates: Partial<DetectedCharge>) => {
    try {
      const response = await fetch('/api/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, updates }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCharges(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update charge');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const deleteCharge = async (id: string) => {
    try {
      const response = await fetch(`/api/charges?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCharges(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to delete charge');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchCharges();
    
    // Set up real-time updates every 60 seconds
    const interval = setInterval(fetchCharges, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    charges,
    loading,
    error,
    refetch: fetchCharges,
    update: updateCharge,
    delete: deleteCharge,
  };
}
