import styles from "./index.module.css";

const QRCode = () => {
  return <div className={styles.qrcode}>
    <span className={styles.decorate1}></span>
    <span className={styles.decorate2}></span>
    <span className={styles.decorate3}></span>
    <div className={styles.text}>
      扫一扫
    </div>
  </div>;
};

export default QRCode;