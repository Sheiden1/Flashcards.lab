import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Flashcards Lab — transforme qualquer conteúdo em cartas de estudo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
            "radial-gradient(circle at 50% 0%, #2A1145, #0A0A0F 70%)",
          color: "#F4F2F8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            color: "#B026FF",
            marginBottom: 24,
          }}
        >
          FLASHCARDS LAB
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.15,
          }}
        >
          Transforme qualquer conteúdo em cartas de estudo
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 90,
                height: 126,
                borderRadius: 12,
                background: "#15121F",
                border:
                  i === 2 ? "2px solid #B026FF" : "2px solid #7C3AED",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
