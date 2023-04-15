import { useState } from "react";

const AdminBar = ({ id, shortTitle }: any) => {
  // Todo: get user. if admin, show, otherwise don't

  const [status, setStatus] = useState("");

  const regenerate = async () => {
    try {
      setStatus("Fetching from https://bills-api.parliament.uk");
      const extractRes = await fetch("/api/extractBill", {
        method: "POST",
        body: JSON.stringify({ event: { data: { new: { id, shortTitle } } } }),
      });
      if (extractRes.status === 200) setStatus("Extracted pdf");
      else throw new Error("Failed to extract pdf, summarising");
      const summariseRes = await fetch("/api/summariseBill", {
        method: "POST",
        body: JSON.stringify({ event: { data: { new: { id } } } }),
      });
      if (summariseRes.status === 200) setStatus("Created summary");
      else throw new Error("Failed to create summary");
      location.reload();
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message as string);
    }
  };

  return (
    <div>
      <button onClick={regenerate}>Regenerate</button>
      {status && <span>status: {status}</span>}
    </div>
  );
};

export default AdminBar;
