import Link from "next/link";
import styles from "./TopicMini.module.css";
import Loader from "react-spinners/ScaleLoader";

export default function TopicMini({
  slug,
  name,
  image,
  description,
  audience,
  isGenerated,
}: any) {
  return (
    <Link href={`/topic/${slug}/${audience}`}>
      <div className={styles.container}>
        <div>
          <h2 className={styles.h2}>
            {name}
            {!isGenerated && (
              <Loader
                color={"#ccc"}
                loading={true}
                speedMultiplier={0.3}
                height={10}
                width={3}
                aria-label="Loading Spinner"
                data-testid="loader"
                cssOverride={{ marginLeft: 5, paddingTop: 2 }}
              />
            )}
          </h2>
          <p className={styles.p}>{description}</p>
        </div>
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${image || "/placeholder.png"})` }}
        />
      </div>
    </Link>
  );
}
