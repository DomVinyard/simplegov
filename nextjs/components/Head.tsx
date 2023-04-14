import Head from "next/head";

const Favicon = () => (
  <>
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/favicon/apple-touch-icon.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/favicon/favicon-32x32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="/favicon/favicon-16x16.png"
    />
    <link rel="manifest" href="/favicon/site.webmanifest" />
    <link
      rel="mask-icon"
      href="/favicon/safari-pinned-tab.svg"
      color="#5bbad5"
    />
    <meta name="msapplication-TileColor" content="#2b5797" />
    <meta name="theme-color" content="#ffffff" />
  </>
);

export function TopicHead(props: any) {
  const description =
    props.descriptions?.[0]?.extra_short || "Generating Description";
  const audience = props.audience === "5" ? ` (Like I'm 5)` : "";
  const title = `Explain ${props.name}${audience}`;
  const image = props?.image || "/placeholder.png";
  return (
    <>
      <Head>
        <title>{title}</title>
        <Favicon />
        <meta name="description" content={description} />
        <meta name="author" content="Sigma Labs" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="image" content={image} />
        <meta property="og:site_name" content={"ExplainAI"} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
      </Head>
    </>
  );
}

export function GroupsHead() {
  return (
    <>
      <Head>
        <title>ExplainAI</title>
        <Favicon />
        <meta property="og:site_name" content={"ExplainAI"} />
        <meta
          name="description"
          content={`We asked AI to "Explain Everything"`}
        />
        <meta name="author" content="Sigma Labs" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
    </>
  );
}
