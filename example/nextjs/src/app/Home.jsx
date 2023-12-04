import Card from "./Card";
import CardBack from "./CardBack";
import Item from "./Item";
import QRCode from "./QRCode";
import styles from "./Home.module.css";

const Hello = () => {
  const title = "React Mobile Viewport";
  const letters = ['✨', ' '].concat(title.split(''), '🐰');
  const lettersSpan = letters.map((t, i) => <span key={i} style={{ transform: `rotate(${i * 5}deg)` }}>{t}</span>)
  return <div className={styles.appInnerRoot}>
    <main className={styles.main}>
      <div className={styles.top}>
        <div className={styles.bgTitleWrapper + ' ' + styles.DEMO_MODE}><div className={styles.bgTitle}>{lettersSpan}</div></div>
        <div className={styles.cardWrapper}>
          <Card />
          <CardBack />
        </div>
      </div>
      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>TAROTCARD</h1>
      </div>
      <div className={styles.content}>
        {new Array(12).fill().map((_, i) => <Item key={i} />)}
      </div>
      <button className={styles.backToTop}>TOP</button>
    </main>
    <footer className={styles.footer}>
      <QRCode />
    </footer>
  </div>;
};

export default Hello;