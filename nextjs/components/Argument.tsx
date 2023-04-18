import styles from "./Argument.module.css";

export default function Argument({ argument, depth }: any) {
  // const style = depth === 0 ? styles.argument : styles.argumentChild;
  return (
    <div className={styles.argumentChild} style={{ marginLeft: `${0}px` }}>
      {/* <div className={styles.position}>{argument.position}</div> */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          className={styles.position}
          src={`/${argument.position}.svg`}
          alt={argument.position}
        />
        <span className={styles.user}>{argument.position}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.argumentP}>{argument.argument}</p>
        <div className={styles.childWrapper}>
          {argument.children?.map((child: any) => (
            <Argument key={child.argument} argument={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
