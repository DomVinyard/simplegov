import Image from "next/image";
import Link from "next/link";
import { Inner } from "../pages/_app";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header>
      <Inner>
        <div className={styles.container}>
          <Link href={`/`}>
            <Image
              className={styles.pointer}
              src="/logo.png"
              alt="Logo"
              width={232}
              height={38}
            />
          </Link>
        </div>
      </Inner>
    </header>
  );
}
