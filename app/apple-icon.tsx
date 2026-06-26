import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0F",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 132,
            borderRadius: 18,
            padding: 4,
            background: "linear-gradient(135deg, #7C3AED, #B026FF, #38bdf8)",
            boxShadow: "0 0 30px rgba(176,38,255,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              borderRadius: 14,
              background: "#15121F",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#B026FF">
              <path d="M12 3l1.9 4 4.4.6-3.2 3.1.8 4.3L12 13l-3.9 2 .8-4.3L5.7 7.6 10.1 7 12 3z" />
            </svg>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
