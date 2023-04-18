import { Inner } from "@/pages/_app";
import styles from "./InfoPanel.module.css";

export default function InfoPanel({ member }: any) {
  return (
    <div
      style={{
        background: `#${member?.partyColour || "444"}`,
        padding: "24px 0",
      }}
    >
      <Inner>
        <div className={styles.content}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img width={30} src={`/parties/${member.party}.png`} />
            <span
              style={{
                color: "#fff",
                marginLeft: 8,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              {member.party}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              width={30}
              src={member.memberPhoto}
              style={{ borderRadius: "100%" }}
            />
            <span
              style={{
                color: "#fff",
                marginLeft: 8,
                fontSize: 20,
              }}
            >
              {member.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img width={28} src={"/house.png"} />
            <span
              style={{
                color: "#fff",
                marginLeft: 8,
                fontSize: 20,
              }}
            >
              {member.house}
            </span>
          </div>
        </div>
      </Inner>
    </div>
  );
}
