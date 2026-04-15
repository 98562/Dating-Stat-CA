import { siteConfig } from "@/config/site";

interface SocialImageProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  badge?: string;
  footer?: string;
}

const shellStyle = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  background:
    "linear-gradient(180deg, #fcfaf7 0%, #f6f1ea 100%)",
  color: "#1b2730",
  padding: "56px",
  position: "relative" as const,
  overflow: "hidden"
};

const cardStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "28px",
  padding: "40px",
  borderRadius: "34px",
  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(17,24,39,0.06)",
  boxShadow: "0 24px 60px rgba(27,39,48,0.08)"
};

export function SocialImage({
  title,
  subtitle,
  eyebrow = siteConfig.productLabel,
  badge = "Observed / Estimated / Assumption",
  footer = "A probability tool, not a verdict."
}: SocialImageProps) {
  const siteHost = new URL(siteConfig.url).hostname.replace(/^www\./, "");

  return (
    <div style={shellStyle}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(31, 122, 111, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(180, 132, 47, 0.12), transparent 24%)"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(246,241,234,0.96))",
              border: "1px solid rgba(17,24,39,0.06)",
              boxShadow: "0 12px 30px rgba(27,39,48,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div style={{ width: 38, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
              <div style={{ width: 38, height: 10, borderRadius: 999, background: "#1f7a6f" }} />
              <div style={{ width: 28, height: 9, borderRadius: 999, background: "#22323a" }} />
              <div style={{ width: 18, height: 8, borderRadius: 999, background: "#b4842f" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#1f7a6f"
              }}
            >
              {eyebrow}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>{siteConfig.shortName}</div>
          </div>
        </div>

        <div
          style={{
            padding: "10px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(17,24,39,0.06)",
            fontSize: 14,
            fontWeight: 600,
            color: "#3f4f58"
          }}
        >
          {badge}
        </div>
      </div>

      <div style={{ ...cardStyle, zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 54,
              lineHeight: 1.05,
              fontWeight: 700,
              maxWidth: 920
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.45,
              color: "#516069",
              maxWidth: 920
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 32, alignItems: "flex-end" }}>
          <div style={{ fontSize: 18, color: "#516069" }}>{footer}</div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              background: "#f3eee7",
              color: "#24333b",
              fontSize: 16,
              fontWeight: 600
            }}
          >
            {siteHost}
          </div>
        </div>
      </div>
    </div>
  );
}
