'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '[01]' },
    { name: 'Upload Bills', path: '/upload', icon: '[02]' },
    { name: 'Detector', path: '/detector', icon: '[03]' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoIcon}>//</div>
        <h1>SubSaver</h1>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className={styles.escalationBox}>
        <h3>Need Help?</h3>
        <p>Hard cases get escalated.</p>
        <button className={styles.escalateBtn}>Agent Support</button>
      </div>
    </aside>
  );
}
