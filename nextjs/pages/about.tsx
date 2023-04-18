import { Inner } from "./_app";
import styles from "./about.module.css";

export default function About() {
  // return <>{JSON.stringify(props)}</>;
  return (
    <div className={styles.wrapper}>
      <Inner>
        <h1 className={styles.h1}>Created for UK citizens</h1>
        <p className={styles.p}>
          All of the content on this project is generated in realtime by a
          machine learning model interfacing with the official government API.
          We released this because we think laws and policy should be more
          transparent and open to everybody. We do not make any money from this
          website.
        </p>
        {/* <p className={styles.p}>
          We can help consult on your next AI project,{" "}
          <a
            style={{ color: "#1d70b8", fontWeight: "bold" }}
            href="mailto:test@test.com"
          >
            drop us a message
          </a>
          .
        </p> */}
      </Inner>
    </div>
  );
}
