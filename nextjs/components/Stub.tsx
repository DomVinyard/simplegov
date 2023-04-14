import styles from "./Stub.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "react-spinners/ScaleLoader";

export default function Stub(props: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState() as any;
  useEffect(() => {
    const DISABLE_GENERATE = false;
    (async () => {
      try {
        if (DISABLE_GENERATE) return;
        const response = await fetch(`/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: props.name }),
        });
        // const { success, reload, error } = await response.json();
        const { success, reload, error } = await response.json();
        if (success || reload) {
          setIsLoading(false);
          setTimeout(() => location.reload(), 1000);
        } else {
          setError(error);
          return;
        }
        // router.replace(`/${props.slug}/${props.audience}`);
      } catch (error) {
        setError("Generation timed out. Please try again later.");
      }
    })();
  }, [props.slug, props.audience, props, router]);

  return (
    <div className={styles.container}>
      <div className={styles.image_container}>
        <div
          className={styles.image}
          style={{
            backgroundImage: `url(${props.image || "/placeholder.png"})`,
          }}
        />
      </div>
      {!error && (
        <>
          <h1 className={styles.h1}>Generating {props.name}</h1>
          <p className={styles.p}>
            You are the first person to visit this topic. Please wait while an
            AI description is generated
          </p>
        </>
      )}
      {error && (
        <>
          <h1 className={styles.h1}>Error Generating {props.name}</h1>
          <p className={styles.p}>{error || "Error generating topic"}</p>
        </>
      )}
      {!error && (
        <div className={styles.loader}>
          <Loader
            color={"#fff"}
            loading={isLoading}
            aria-label="Loading Spinner"
            data-testid="loader"
            speedMultiplier={0.8}
          />
        </div>
      )}
    </div>
  );
}
