import React from "react";
import Image from "next/image";
import Link from "next/link";

const Splash = () => {
  return (
    <>
      <div
        style={{
          backgroundColor: "#111",
          position: "relative",
          height: "auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundImage: `url("/glow.svg")`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            height: "100%",
          }}
        >
          <main
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Image
              alt={`We asked AI to "Explain Everything"`}
              style={{ marginTop: 60 }}
              width={340}
              height={410}
              src="/byline.png"
            />
            <img src="/bot.png" style={{ width: "440px", marginBottom: -15 }} />
          </main>
        </div>
        <div
          style={{
            background: "#000",
            textAlign: "center",
            padding: 16,
          }}
        >
          <Link href="/about">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fff" }}>Powered By</span>
              <img
                style={{ marginLeft: 4, marginTop: 2 }}
                height={19}
                src="/sigma.png"
                alt="Sigma Labs"
              />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Splash;
