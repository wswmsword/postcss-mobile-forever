import styles from "./index.module.css";

const QRCode = () => {
  return <div className={styles.qrcode}>
    <span className={styles.decorate1}></span>
    <span className={styles.decorate2}></span>
    <span className={styles.decorate3}></span>
    <div className={styles.text}>
      <span className={styles.scan}>SCAN</span>
      <span className={styles.me}>ME</span>
    </div>
  </div>;
};

export default QRCode;