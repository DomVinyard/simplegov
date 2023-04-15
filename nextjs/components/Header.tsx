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
          <Link href={`/`}>
            <Image
              className={styles.pointer}
              src="/logo.png"
              alt="Logo"
              width={240}
              height={38}
            />
          </Link>
        </div>
      </Inner>
    </header>
  );
}
