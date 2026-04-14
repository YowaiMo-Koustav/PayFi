"use client";

import Link from "next/link";
import styles from "./page.module.css";
import Card from "@/components/Card";
import { motion } from "framer-motion";

export default function Dashboard() {
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
           DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER. • DETECT. MANAGE. RECOVER.
        </motion.div>
      </div>

      <section className={styles.metricsGrid}>
        <Card 
          title="Net Gain" 
          value="$1,240" 
          trend="up" 
          trendValue="15%" 
          subtitle="vs last month"
          icon="[ $ ]"
          highlight={true}
        />
        <Card 
          title="Recovered Savings" 
          value="$1,500" 
          icon="[ + ]"
        />
        <Card 
          title="Monthly Savings" 
          value="$320" 
          trend="up"
          trendValue="5%"
          subtitle="Recurring reductions"
          icon="[ ↓ ]"
        />
        <Card 
          title="Agent Spend" 
          value="$260"
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
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>[ OK ]</div>
            <div className={styles.activityDetails}>
              <h4>Netflix Subscription Cancelled</h4>
              <p>Requested via automated draft</p>
            </div>
            <div className={styles.activityAmount}>+$22.99/mo</div>
          </div>
          
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>[ .. ]</div>
            <div className={styles.activityDetails}>
              <h4>Gym Membership Escalation</h4>
              <p>Under review by human agent</p>
            </div>
            <div className={styles.activityAmount}>Pending</div>
          </div>
          
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>[ TX ]</div>
            <div className={styles.activityDetails}>
              <h4>Refund Processed: Adobe Creative Cloud</h4>
              <p>Payout ready to be claimed</p>
            </div>
            <div className={`${styles.activityAmount} ${styles.positive}`}>+$85.00</div>
          </div>
        </div>
      </section>
    </div>
  );
}
