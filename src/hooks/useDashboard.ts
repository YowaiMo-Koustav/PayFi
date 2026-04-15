import { useState, useEffect } from 'react';

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

export function useDashboard() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboard = async (action: string, payload: any) => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update dashboard');
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
    update: updateDashboard,
  };
}
