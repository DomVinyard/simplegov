import Link from "next/link";

export async function getStaticProps() {
  const res = await fetch(
    "https://bills-api.parliament.uk/api/v1/Bills?CurrentHouse=All&OriginatingHouse=Commons&IsDefeated=false&IsWithdrawn=false&SortOrder=DateUpdatedDescending&Take=20"
  );
  const json = await res.json();
  console.log(json);

  return {
    props: {
      bills: json,
    },
  };
}

export default function Home(props: any) {
  // return <>{JSON.stringify(props.bills)}</>;
  return (
    <div>
      {props?.bills?.items?.map((bill: any) => (
        <Link key={bill.billId} href={`/bill/${bill.billId}`}>
          <h3>{bill.shortTitle}</h3>
          {/* <p>{JSON.stringify(bill)}</p> */}
        </Link>
      ))}
    </div>
  );
}
