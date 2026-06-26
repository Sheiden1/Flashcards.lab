import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Flashcards Lab — transforme qualquer conteúdo em flashcards de estudo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const cards = [
    { rot: -14, x: -200, holo: false },
    { rot: -7, x: -100, holo: false },
    { rot: 0, x: 0, holo: true },
    { rot: 7, x: 100, holo: false },
    { rot: 14, x: 200, holo: false },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 18%, #2A1145, #0A0A0F 72%)",
          color: "#F4F2F8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 10,
            color: "#B026FF",
            marginBottom: 28,
          }}
        >
          FLASHCARDS LAB
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 62,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 940,
            lineHeight: 1.12,
          }}
        >
          <span style={{ color: "#F4F2F8" }}>Transforme qualquer conteúdo em&nbsp;</span>
          <span
            style={{
              backgroundImage: "linear-gradient(100deg, #7C3AED, #B026FF, #38bdf8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            flashcards de estudo
          </span>
        </div>

        <div
          style={{
            display: "flex",
            position: "relative",
            marginTop: 70,
            height: 200,
            width: 600,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                display: "flex",
                width: c.holo ? 130 : 124,
                height: c.holo ? 180 : 174,
                borderRadius: 16,
                padding: c.holo ? 3 : 2,
                background: c.holo
                  ? "linear-gradient(135deg, #7C3AED, #B026FF, #38bdf8)"
                  : "#7C3AED",
                transform: `translateX(${c.x}px) rotate(${c.rot}deg)`,
                boxShadow: c.holo
                  ? "0 0 44px rgba(176,38,255,0.6)"
                  : "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  borderRadius: 13,
                  background: "#15121F",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  padding: 10,
                }}
              >
                {c.holo ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#B026FF">
                    <path d="M12 3l1.9 4 4.4.6-3.2 3.1.8 4.3L12 13l-3.9 2 .8-4.3L5.7 7.6 10.1 7 12 3z" />
                  </svg>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
