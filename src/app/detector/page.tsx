'use client';

import Link from 'next/link';
import styles from './page.module.css';
import { useCharges } from '@/hooks/useCharges';

export default function DetectorPage() {
  const { charges, loading, error } = useCharges();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Detecting recurring charges...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Error detecting charges</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Recurring Charges</h1>
        <p className={styles.subtitle}>Automatically detected subscriptions from your uploaded bills.</p>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Current Price</th>
              <th>Avg Price</th>
              <th>Delta</th>
              <th>Confidence</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <tr key={charge.id} className={charge.anomaly ? styles.anomalyRow : ''}>
                <td>
                  <div className={styles.serviceName}>{charge.merchant}</div>
                  {charge.anomaly && <div className={styles.anomalyBadge}>[!] {charge.anomaly}</div>}
                  <div className={styles.frequencyInfo}>{charge.frequency} • {charge.status}</div>
                </td>
                <td className={styles.amount}>${charge.currentPrice.toFixed(2)}</td>
                <td className={styles.averagePrice}>${charge.averagePrice.toFixed(2)}</td>
                <td className={charge.delta > 0 ? styles.statusReview : ''}>
                  {charge.delta > 0 ? `+$${charge.delta.toFixed(2)}` : '-'}
                </td>
                <td>{charge.confidence}</td>
                <td>
                  <Link href={`/bill/${charge.id}`} className={styles.actionBtn}>
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {charges.length === 0 && (
          <div className={styles.noCharges}>
            <h3>No recurring charges detected</h3>
            <p>Upload your bills to automatically detect subscriptions and recurring charges.</p>
            <Link href="/upload" className={styles.uploadBtn}>
              Upload Bills
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
