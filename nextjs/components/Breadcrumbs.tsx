import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs({ parent, grandparent, audience }: any) {
  return (
    <div className={styles.container}>
      {grandparent && (
        <>
          <Link href={`/topic/${grandparent.slug}/${audience}`}>
            <span className={styles.link}>{grandparent.name}</span>
          </Link>
          <span className={styles.separator}>{">"}</span>
        </>
      )}
      {parent && (
        <Link href={`/topic/${parent.slug}/${audience}`}>
          <span className={styles.link}>{parent.name}</span>
        </Link>
      )}
    </div>
  );
}
