import styles from './ProgressBar.module.css';

function ProgressBar({ value }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.labelRow}>
        <span>Прогресс по задачам</span>
        <strong>{value}%</strong>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
