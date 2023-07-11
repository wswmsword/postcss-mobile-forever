import { defineComponent } from "vue";
import styles from "./index.module.css";

export default defineComponent({
  emits: [],
  components: {},
  setup() {
    return () => <div className={styles.jsx}></div>;
  },
});
