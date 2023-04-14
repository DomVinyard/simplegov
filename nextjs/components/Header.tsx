import Image from "next/image";
import Link from "next/link";
import { Inner } from "../pages/_app";
import styles from "./Header.module.css";

export default function Header({ slug, audience, page }: any) {
  const pagePath = page === "groups" ? "groups" : `topic/${slug}`;
  const audiencePath = audience === "5" ? `20` : "5";
  return (
    <header>
      <Inner>
        <div className={styles.container}>
          <Link href={`/groups/${audience || 20}`}>
            <Image
              className={styles.pointer}
              src="/logo.png"
              alt="Logo"
              width={160}
              height={43}
            />
          </Link>
          <div
            style={{
              pointerEvents: page === "stub" ? "none" : "auto",
              opacity: page === "stub" ? 0 : 1,
            }}
          >
            <Link href={`/${pagePath}/${audiencePath}`}>
              <Image
                className={styles.pointer}
                src={`/${audience === "5" ? "checked" : "unchecked"}.png`}
                alt="Switch"
                width={120}
                height={24}
              />
            </Link>
          </div>
        </div>
      </Inner>
    </header>
  );
}
