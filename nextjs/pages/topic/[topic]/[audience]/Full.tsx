import Breadcrumbs from "@/components/Breadcrumbs";
import TopicMain from "@/components/TopicMain";
import TopicMini from "@/components/TopicMini";
import styles from "./Full.module.css";

export default function Full(props: any) {
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs
          parent={props.parent?.topic}
          grandparent={props.parent?.topic?.grandparent?.topic}
          audience={props.audience}
        />
      </div>
      <div className={styles.main}>
        <TopicMain
          name={props.name}
          image={props.image}
          description={props.descriptions?.[0].long}
        />
      </div>
      <div className={styles.related_container}>
        {props.relationships?.length > 0 && (
          <h1 className={styles.h1}>Read More</h1>
        )}
        {props.relationships?.map(({ to: topic, description }: any) => (
          <div className={styles.related} key={topic.slug}>
            <TopicMini
              slug={topic.slug}
              name={topic.name}
              image={topic.image}
              description={description}
              audience={props.audience}
              isGenerated={topic.descriptions?.aggregate?.count > 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
