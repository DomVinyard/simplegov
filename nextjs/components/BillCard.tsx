import { stages, indexes } from "@/lib/stages";
import Link from "next/link";
import styles from "./BillCard.module.css";

export default function BillCard({ bill }: any) {
  const stage = stages.find((s) => s.id === bill.stage) as any;
  const index = indexes.indexOf(stage.id);
  return (
    <Link href={`/bill/${bill.id}`} key={bill.id}>
      <div className={styles.billWrapper}>
        <div
          className={styles.partyWrapper}
          style={{ background: `#${bill.partyColour || "444"}` }}
        >
          <img width={30} src={`/parties/${bill.party}.png`} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div className={styles.billInner}>
            <h3 className={styles.h3}>{bill.shortTitle}</h3>
            <p className={styles.p}>
              {bill.description?.simplifiedShort || "Awaiting description"}
            </p>
            {/* <p className={styles.p}>stage {JSON.stringify({ stage, index })}</p> */}
            {index > 0 && (
              <div
                style={{
                  display: "flex",
                  // justifyContent: "space-between",
                  width: "100%",
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                {Array.from(Array(12)).map((x, i) => {
                  return (
                    <div
                      key={i}
                      style={{
                        height: 8,
                        width: 12,
                        marginRight: 2,
                        background: i <= index ? "#1d70b8" : "#ccc",
                      }}
                    ></div>
                  );
                })}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    color: "#1d70b8",
                    marginLeft: 3,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    src="/hourglass.png"
                    width={11}
                    style={{ marginRight: 2 }}
                  />
                  {Math.floor(((index + 1) / 12) * 100)}%
                </div>
              </div>
            )}
          </div>
          <div className={styles.commentWrapper}>
            <img
              src="/debate.png"
              height={14}
              style={{ marginRight: 4, marginBottom: -2 }}
            />
            <span style={{ fontWeight: "bold", color: "#444" }}>
              {bill?.arguments_aggregate?.aggregate?.count || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
