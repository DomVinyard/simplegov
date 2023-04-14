import styles from "./Group.module.css";
import TopicMini from "./TopicMini";

export default function Group({ group, audience }: any) {
  if (!group) return null;
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>{group.name} </h1>
      <div className={styles.description}>{group.description}</div>
      <div>
        {group.items.map(({ topic }: any) => (
          <div className={styles.item} key={topic.slug}>
            <TopicMini
              slug={topic.slug}
              name={topic.name}
              image={topic.image}
              description={
                topic.descriptions?.[0]?.extra_short ||
                "Click to generate description"
              }
              audience={audience}
              isGenerated={!!topic.descriptions?.[0]?.extra_short}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
