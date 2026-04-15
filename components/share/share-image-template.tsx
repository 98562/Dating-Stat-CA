import { siteConfig } from "@/config/site";
import type { SharePreviewData } from "@/lib/share/buildSharePreview";

interface ShareImageTemplateProps {
  preview: SharePreviewData;
  variant: "story" | "opengraph";
}

export function ShareImageTemplate({ preview, variant }: ShareImageTemplateProps) {
  const isStory = variant === "story";

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #fcfaf7 0%, #ffffff 48%, #f3f8f7 100%)",
        color: "#1b2730",
        padding: isStory ? "64px" : "56px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(31, 122, 111, 0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(180, 132, 47, 0.12), transparent 26%)"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          gap: 24
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: isStory ? 18 : 14,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#1f7a6f"
            }}
          >
            {siteConfig.productLabel}
          </div>
          <div style={{ fontSize: isStory ? 34 : 30, fontWeight: 700 }}>{siteConfig.shortName}</div>
        </div>
        <div
          style={{
            padding: isStory ? "12px 18px" : "10px 16px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(17,24,39,0.06)",
            fontSize: isStory ? 18 : 14,
            fontWeight: 600,
            color: "#44535b",
            alignSelf: "flex-start"
          }}
        >
          {preview.strictnessLabel}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: isStory ? 32 : 26,
          padding: isStory ? "42px" : "36px",
          borderRadius: isStory ? 40 : 34,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(17,24,39,0.06)",
          boxShadow: "0 24px 60px rgba(27,39,48,0.08)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: isStory ? 24 : 16, fontWeight: 600, color: "#66747c" }}>
            Estimated pool
          </div>
          <div
            style={{
              fontSize: isStory ? 82 : 58,
              lineHeight: 1.02,
              fontWeight: 700
            }}
          >
            {preview.estimatedPool}
          </div>
          <div style={{ fontSize: isStory ? 32 : 24, color: "#516069" }}>{preview.oneInX}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {preview.keyFilters.map((filter) => (
            <div
              key={filter}
              style={{
                padding: isStory ? "12px 18px" : "10px 14px",
                borderRadius: 999,
                background: "#ffffff",
                border: "1px solid rgba(17,24,39,0.08)",
                fontSize: isStory ? 20 : 16,
                color: "#304048"
              }}
            >
              {filter}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              fontSize: isStory ? 34 : 26,
              lineHeight: 1.2,
              fontWeight: 600
            }}
          >
            {preview.interpretation}
          </div>
          <div style={{ fontSize: isStory ? 22 : 18, lineHeight: 1.4, color: "#5b6971" }}>
            {preview.headline}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24
        }}
      >
        <div style={{ fontSize: isStory ? 22 : 18, color: "#516069" }}>
          {siteConfig.productLabel}
        </div>
        <div
          style={{
            padding: isStory ? "12px 18px" : "10px 16px",
            borderRadius: 999,
            background: "#f3eee7",
            color: "#24333b",
            fontSize: isStory ? 18 : 16,
            fontWeight: 600
          }}
        >
          {new URL(siteConfig.url).hostname.replace(/^www\./, "")}
        </div>
      </div>
    </div>
  );
}
