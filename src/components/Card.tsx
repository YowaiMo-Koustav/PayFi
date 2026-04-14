import styles from './Card.module.css';

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  highlight?: boolean;
}

export default function Card({ title, value, subtitle, trend, trendValue, icon, highlight }: CardProps) {
  return (
    <div className={`${styles.card} ${highlight ? styles.highlight : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        {(subtitle || trendValue) && (
          <div className={styles.footer}>
            {trendValue && (
              <span className={`${styles.trend} ${trend === 'up' ? styles.up : trend === 'down' ? styles.down : ''}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
              </span>
            )}
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
