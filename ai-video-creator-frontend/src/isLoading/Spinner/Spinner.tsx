import styles from './Spinner.module.css'

export const Spinner = () => (
  <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className={styles.track} cx="12" cy="12" r="9" />
    <path className={styles.arc} d="M12 3a9 9 0 0 1 9 9" />
  </svg>
)
