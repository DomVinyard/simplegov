import styles from "./TopicMain.module.css";

export default function TopicMain({
  name = "",
  description = "",
  image = "",
}: any) {
  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.h2}>{name}</h2>
        {`${description}`.split("\n\n").map((paragraph: string, i: number) => (
          <p className={styles.p} key={i}>
            {paragraph}
          </p>
        ))}
      </div>
      <div className={styles.image_container}>
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${image || "/placeholder.png"})` }}
        />
      </div>
    </div>
  );
}

//  <Image
//    src={image || "/placeholder.png"}
//    loader={({ src }) => src}
//    width={240}
//    height={240}
//    // layout="fill"
//    // objectFit="cover"
//    quality={100}
//    alt={""}
//  />;
