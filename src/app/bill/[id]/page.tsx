'use client';

import { use, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { sendEmailAction, escalateTaskAction } from '@/lib/locusApi';
import { useBill } from '@/hooks/useBill';
import { useDashboard } from '@/hooks/useDashboard';

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bill, loading, error, update: updateBill } = useBill(id);
  const { update: updateDashboard } = useDashboard();
  const [draftOpen, setDraftOpen] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [claimed, setClaimed] = useState(false);
  
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Error loading bill</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!bill) return null;

  const handleEscalate = async () => {
    setEscalated(true);
    try {
      await escalateTaskAction(id);
      await updateDashboard('escalation', { serviceName: bill.serviceName });
      await updateBill({ status: 'Escalated' });
    } catch(e: any) {
      console.error("AgentMail Escalate error:", e);
      alert('Failed to escalate: ' + e.message);
      setEscalated(false);
    }
  }

  const handleSendEmail = async () => {
    try {
      if(!bodyRef.current?.value) return;
      await sendEmailAction({
        to: `support@${bill.serviceName.toLowerCase().replace(/\\s/g, '')}.com`,
        subject: `Cancellation Request - Acct #XXX`,
        body: bodyRef.current.value
      });
      await updateDashboard('cancellation', { 
        serviceName: bill.serviceName, 
        amount: bill.amount 
      });
      await updateBill({ status: 'Cancellation Requested' });
      alert('Email Sent successfully via Locus AgentMail! ($0.01 USDC paid)');
      setDraftOpen(false);
    } catch(e: any) {
      console.error("AgentMail Send error:", e);
      alert('Failed to send email via Locus: ' + e.message);
    }
  };

  const handleClaimPayout = async () => {
    try {
      setClaimed(true);
      await updateDashboard('refund', { 
        serviceName: bill.serviceName, 
        amount: `$${bill.recoverableAmount}` 
      });
      await updateBill({ payoutStatus: 'claimed' });
      alert('Payout sent to your connected wallet!');
    } catch(e: any) {
      console.error("Payout error:", e);
      alert('Failed to claim payout: ' + e.message);
      setClaimed(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/detector" className={styles.backLink}>← Back to Detector</Link>
        </div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{bill.serviceName}</h1>
          <span className={styles.amount}>{bill.amount}</span>
        </div>
        <p className={styles.subtitle}>Charge ID: {id} • Detected via uploaded statement</p>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.mainPanel}>
          <div className={styles.card}>
            <h2>Automated Actions</h2>
            <p>We can attempt to cancel this subscription on your behalf.</p>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.btnPrimary}
                onClick={() => setDraftOpen(true)}
              >
                Draft Cancellation Email
              </button>
              
              <button 
                className={`${styles.btnSecondary} ${escalated ? styles.disabled : ''}`}
                onClick={handleEscalate}
                disabled={escalated}
              >
                {escalated ? 'Escalated to Agent (AgentMail Sent) ✓' : 'Escalate Hard Case 🛡️'}
              </button>
            </div>

            {draftOpen && (
              <div className={styles.draftBox}>
                <div className={styles.draftHeader}>
                  <span>To: support@{bill.serviceName.toLowerCase().replace(/\\s/g, '')}.com</span>
                  <span>Subject: Cancellation Request - Acct #XXX</span>
                </div>
                <textarea 
                  ref={bodyRef}
                  className={styles.draftContent}
                  aria-label="Cancellation email content"
                  placeholder="Enter your cancellation message..."
                  defaultValue={`Hello ${bill.serviceName} Support,\n\nI am writing to formally request the immediate cancellation of my subscription and a refund for the recent unauthorized overcharge of ${bill.amount}.\n\nPlease confirm when this has been processed.\n\nBest regards,\n[Your Name]`}
                />
                <button className={styles.btnSend} onClick={handleSendEmail}>Send Email via Locus API</button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidePanel}>
          {bill.recoverableAmount ? (
            <div className={`${styles.card} ${styles.payoutCard}`}>
              <div className={styles.payoutIcon}>💸</div>
              <h3>Payout Available</h3>
              <div className={styles.payoutAmount}>${bill.recoverableAmount}</div>
              <p>We successfully disputed this charge. Claim your recovered value.</p>
              
              {bill.payoutStatus === 'claimed' || claimed ? (
                <div className={styles.successMsg}>Sent to your connected wallet!</div>
              ) : (
                <button className={styles.btnClaim} onClick={handleClaimPayout}>
                  Claim via Wallet Link
                </button>
              )}
            </div>
          ) : (
            <div className={styles.card}>
              <h3>No Payouts Yet</h3>
              <p>When we successfully dispute charges, your recovered value will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
