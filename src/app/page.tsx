"use client";

import Link from "next/link";
import styles from "./page.module.css";
import Card from "@/components/Card";
import { motion } from "framer-motion";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Error loading dashboard</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cancelled': return '[ OK ]';
      case 'escalated': return '[ .. ]';
      case 'refunded': return '[ TX ]';
      default: return '[ • ]';
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>SUB SAVER 2.0</h1>
          <p className={styles.heroSubtitle}>LET'S JUMP INTO THE NEW ERA OF SAVINGS</p>
        </div>
        <div className={styles.actions}>
          <Link href="/upload" className={styles.btnPrimary}>
            + Upload Bills
          </Link>
        </div>
      </header>

      <div className={styles.marqueeContainer}>
        <motion.div 
          className={styles.marqueeText}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
           DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER.
        </motion.div>
      </div>

      <section className={styles.metricsGrid}>
        <Card 
          title="Net Gain" 
          value={`$${data.netGain.toLocaleString()}`} 
          trend="up" 
          trendValue={`${data.netGainTrend}%`} 
          subtitle="vs last month"
          icon="[ $ ]"
          highlight={true}
        />
        <Card 
          title="Recovered Savings" 
          value={`$${data.recoveredSavings.toLocaleString()}`} 
          icon="[ + ]"
        />
        <Card 
          title="Monthly Savings" 
          value={`$${data.monthlySavings.toLocaleString()}`} 
          trend="up"
          trendValue={`${data.monthlySavingsTrend}%`}
          subtitle="Recurring reductions"
          icon="[ ↓ ]"
        />
        <Card 
          title="Agent Spend" 
          value={`$${data.agentSpend.toLocaleString()}`}
          subtitle="On hard escalations"
          icon="[ Δ ]"
        />
      </section>

      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Activity</h2>
          <Link href="/detector" className={styles.link}>View all</Link>
        </div>
        
        <div className={styles.activityList}>
          {data.recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>{getActivityIcon(activity.type)}</div>
              <div className={styles.activityDetails}>
                <h4>
                  {activity.type === 'cancelled' && `${activity.serviceName} Subscription Cancelled`}
                  {activity.type === 'escalated' && `${activity.serviceName} Escalation`}
                  {activity.type === 'refunded' && `Refund Processed: ${activity.serviceName}`}
                </h4>
                <p>{activity.status}</p>
              </div>
              <div className={`${styles.activityAmount} ${activity.type === 'refunded' ? styles.positive : ''}`}>
                {activity.amount || (activity.type === 'escalated' ? 'Pending' : '')}
              </div>
            </div>
          ))}
          
          {data.recentActivity.length === 0 && (
            <div className={styles.noActivity}>
              <p>No recent activity. Upload bills to get started!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
