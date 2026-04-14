import Link from 'next/link';
import styles from './page.module.css';
import { detectRecurringCharges, MOCK_TRANSACTIONS } from '@/lib/detector';

export default function DetectorPage() {
  // Pass our mock transaction history into the detector rule engine
  const charges = detectRecurringCharges(MOCK_TRANSACTIONS);

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
                  <div style={{fontSize: '0.8rem', color: 'var(--tertiary)', marginTop: '4px'}}>{charge.frequency} • {charge.status}</div>
                </td>
                <td className={styles.amount}>${charge.currentPrice.toFixed(2)}</td>
                <td style={{color: 'var(--tertiary)'}}>${charge.averagePrice.toFixed(2)}</td>
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
      </div>
    </div>
  );
}
