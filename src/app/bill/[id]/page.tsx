'use client';

import { use, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { sendEmailAction, escalateTaskAction } from '@/lib/locusApi';

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [draftOpen, setDraftOpen] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [claimed, setClaimed] = useState(false);
  
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Mock static data for demo
  const serviceName = id === '1' ? 'Netflix' : id === '2' ? 'Adobe Creative Cloud' : id === '3' ? 'Gym Membership' : 'Subscription Service';
  const amount = id === '1' ? '$22.99/mo' : id === '2' ? '$85.00/mo' : '$120.00/mo';
  const recoverValue = id === '2' ? '$85.00' : null;

  const handleEscalate = async () => {
    setEscalated(true);
    try {
      await escalateTaskAction(id);
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
        to: `support@${serviceName.toLowerCase().replace(/\\s/g, '')}.com`,
        subject: `Cancellation Request - Acct #XXX`,
        body: bodyRef.current.value
      });
      alert('Email Sent successfully via Locus AgentMail! ($0.01 USDC paid)');
      setDraftOpen(false);
    } catch(e: any) {
      console.error("AgentMail Send error:", e);
      alert('Failed to send email via Locus: ' + e.message);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link href="/detector" className={styles.backLink}>← Back to Detector</Link>
        </div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{serviceName}</h1>
          <span className={styles.amount}>{amount}</span>
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
                  <span>To: support@{serviceName.toLowerCase().replace(/\\s/g, '')}.com</span>
                  <span>Subject: Cancellation Request - Acct #XXX</span>
                </div>
                <textarea 
                  ref={bodyRef}
                  className={styles.draftContent}
                  defaultValue={`Hello ${serviceName} Support,\n\nI am writing to formally request the immediate cancellation of my subscription and a refund for the recent unauthorized overcharge of ${amount}.\n\nPlease confirm when this has been processed.\n\nBest regards,\n[Your Name]`}
                />
                <button className={styles.btnSend} onClick={handleSendEmail}>Send Email via Locus API</button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidePanel}>
          {recoverValue ? (
            <div className={`${styles.card} ${styles.payoutCard}`}>
              <div className={styles.payoutIcon}>💸</div>
              <h3>Payout Available</h3>
              <div className={styles.payoutAmount}>{recoverValue}</div>
              <p>We successfully disputed this charge. Claim your recovered value.</p>
              
              {claimed ? (
                <div className={styles.successMsg}>Sent to your connected wallet!</div>
              ) : (
                <button className={styles.btnClaim} onClick={() => setClaimed(true)}>
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
