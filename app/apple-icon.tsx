import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fcfaf7"
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 42,
            border: "1px solid rgba(17,24,39,0.06)",
            background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(246,241,234,0.96))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ width: 84, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ width: 84, height: 18, borderRadius: 999, background: "#1f7a6f" }} />
            <div style={{ width: 60, height: 16, borderRadius: 999, background: "#203139" }} />
            <div style={{ width: 34, height: 14, borderRadius: 999, background: "#b4842f" }} />
          </div>
        </div>
      </div>
    ),
    size
  );
}
