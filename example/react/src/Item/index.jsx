import styles from "./index.module.css";

const Item = () => {
  return <div className={styles.wrapper}>
    <div className={styles.img}></div>
    <div className={styles.txt}></div>
  </div>;
};

export default Item;