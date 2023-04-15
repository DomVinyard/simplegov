import { useState } from "react";
import styles from "./AdminBar.module.css";

const AdminBar = ({ id, shortTitle }: any) => {
  // Todo: get user. if admin, show, otherwise don't

  const [status, setStatus] = useState("");

  const regenerate = async (stages: string[]) => {
    try {
      if (stages.includes("pdf")) {
        setStatus("Fetching from https://bills-api.parliament.uk");
        const extractRes = await fetch("/api/extractBill", {
          method: "POST",
          body: JSON.stringify({
            event: { data: { new: { id, shortTitle } } },
          }),
        });
        if (extractRes.status !== 200) throw new Error("Failed to extract pdf");
      }
      if (stages.includes("ai")) {
        setStatus("Summarising text");
        const summariseRes = await fetch("/api/summariseBill", {
          method: "POST",
          body: JSON.stringify({ event: { data: { new: { id } } } }),
        });
        if (summariseRes.status !== 200)
          throw new Error("Failed to create summary");
      }
      if (stages.includes("arguments")) {
        setStatus("Generating arguments for and against");
        const argueRes = await fetch("/api/generateArguments", {
          method: "POST",
          body: JSON.stringify({ event: { data: { new: { billID: id } } } }),
        });
        if (argueRes.status !== 200)
          throw new Error("Failed to generate arguments");
      }

      location.reload();
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message as string);
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => regenerate(["pdf", "summary", "arguments"])}>
        Regenerate PDF
      </button>
      <button onClick={() => regenerate(["summary", "arguments"])}>
        Regenerate AI summary
      </button>
      <button onClick={() => regenerate(["arguments"])}>
        Regenerate Arguments
      </button>
      {status && <span>status: {status}</span>}
    </div>
  );
};

export default AdminBar;
