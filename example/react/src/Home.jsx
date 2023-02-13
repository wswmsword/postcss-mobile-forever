import Card from "./Card";
import CardBack from "./CardBack"
import Item from "./Item"
import styles from "./Home.module.css";

const Hello = () => <div className={styles.appInnerRoot}>
  <div className={styles.top}>
    <Card />
    <CardBack />
  </div>
  <div className={styles.titleWrapper}>
    <h1 className={styles.title}>TAROTCARD</h1>
  </div>
  <div className={styles.content}>
    {new Array(12).fill().map(_ => <Item />)}
  </div>
</div>

export default Hello;