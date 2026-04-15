import { siteConfig } from "@/config/site";
import type { SharePreviewData } from "@/lib/share/buildSharePreview";

type ShareCardImageVariant = "story";

const STORY_SIZE = {
  width: 720,
  height: 1280
} as const;

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient
) {
  context.save();
  context.fillStyle = fillStyle;
  drawRoundedRect(context, x, y, width, height, radius);
  context.fill();
  context.restore();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("canvas-blob-failed"));
    }, "image/png");
  });
}

export async function renderShareCardImageFile(
  preview: SharePreviewData,
  filename: string,
  variant: ShareCardImageVariant = "story"
) {
  const size = variant === "story" ? STORY_SIZE : STORY_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("canvas-context-unavailable");
  }

  const background = context.createLinearGradient(0, 0, 0, size.height);
  background.addColorStop(0, "#fcfaf7");
  background.addColorStop(0.5, "#ffffff");
  background.addColorStop(1, "#f3f8f7");
  context.fillStyle = background;
  context.fillRect(0, 0, size.width, size.height);

  context.save();
  context.globalAlpha = 0.12;
  const accentGlow = context.createRadialGradient(120, 120, 0, 120, 120, 220);
  accentGlow.addColorStop(0, "#1f7a6f");
  accentGlow.addColorStop(1, "rgba(31,122,111,0)");
  context.fillStyle = accentGlow;
  context.fillRect(0, 0, size.width, size.height);

  const goldGlow = context.createRadialGradient(size.width - 80, size.height - 120, 0, size.width - 80, size.height - 120, 240);
  goldGlow.addColorStop(0, "#c49d4f");
  goldGlow.addColorStop(1, "rgba(196,157,79,0)");
  context.fillStyle = goldGlow;
  context.fillRect(0, 0, size.width, size.height);
  context.restore();

  const pad = 44;
  const cardX = pad;
  const cardY = 176;
  const cardWidth = size.width - pad * 2;
  const cardHeight = 780;

  context.fillStyle = "rgba(22, 34, 42, 0.08)";
  context.shadowColor = "rgba(18, 28, 36, 0.12)";
  context.shadowBlur = 28;
  context.shadowOffsetY = 14;
  drawRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 32);
  context.fill();
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  fillRoundedRect(context, cardX, cardY, cardWidth, cardHeight, 32, "rgba(255,255,255,0.94)");

  context.fillStyle = "#1f7a6f";
  context.font = "700 14px sans-serif";
  context.fillText(siteConfig.productLabel.toUpperCase(), pad, 64);

  context.fillStyle = "#1b2730";
  context.font = "700 26px sans-serif";
  context.fillText(siteConfig.shortName, pad, 96);

  const badgeText = preview.strictnessLabel;
  context.font = "600 14px sans-serif";
  const badgeWidth = context.measureText(badgeText).width + 28;
  fillRoundedRect(
    context,
    size.width - pad - badgeWidth,
    44,
    badgeWidth,
    38,
    19,
    "rgba(255,255,255,0.92)"
  );
  context.fillStyle = "#44535b";
  context.fillText(badgeText, size.width - pad - badgeWidth + 14, 68);

  const cardInnerX = cardX + 34;
  let cursorY = cardY + 62;

  context.fillStyle = "#6a7880";
  context.font = "600 18px sans-serif";
  context.fillText("Estimated pool", cardInnerX, cursorY);

  cursorY += 68;
  context.fillStyle = "#1b2730";
  context.font = "700 60px Georgia, serif";
  context.fillText(preview.estimatedPool, cardInnerX, cursorY);

  cursorY += 42;
  context.fillStyle = "#56656d";
  context.font = "400 24px sans-serif";
  context.fillText(preview.oneInX, cardInnerX, cursorY);

  cursorY += 62;
  context.font = "600 16px sans-serif";
  let chipX = cardInnerX;

  for (const filter of preview.keyFilters.slice(0, 4)) {
    const chipWidth = Math.min(cardWidth - 68, context.measureText(filter).width + 28);
    if (chipX + chipWidth > cardX + cardWidth - 34) {
      chipX = cardInnerX;
      cursorY += 44;
    }

    fillRoundedRect(context, chipX, cursorY - 28, chipWidth, 34, 17, "#ffffff");
    context.strokeStyle = "rgba(17,24,39,0.08)";
    context.lineWidth = 1;
    drawRoundedRect(context, chipX, cursorY - 28, chipWidth, 34, 17);
    context.stroke();
    context.fillStyle = "#304048";
    context.fillText(filter, chipX + 14, cursorY - 6);
    chipX += chipWidth + 10;
  }

  cursorY += 72;
  context.fillStyle = "#1b2730";
  context.font = "600 28px sans-serif";
  for (const line of wrapText(context, preview.interpretation, cardWidth - 68).slice(0, 3)) {
    context.fillText(line, cardInnerX, cursorY);
    cursorY += 34;
  }

  context.fillStyle = "#5b6971";
  context.font = "400 18px sans-serif";
  for (const line of wrapText(context, preview.headline, cardWidth - 68).slice(0, 2)) {
    context.fillText(line, cardInnerX, cursorY + 10);
    cursorY += 28;
  }

  context.fillStyle = "#516069";
  context.font = "500 18px sans-serif";
  context.fillText(siteConfig.productLabel, pad, size.height - 54);

  const domain = new URL(siteConfig.url).hostname.replace(/^www\./, "");
  context.font = "600 16px sans-serif";
  const domainWidth = context.measureText(domain).width + 28;
  fillRoundedRect(
    context,
    size.width - pad - domainWidth,
    size.height - 82,
    domainWidth,
    38,
    19,
    "#f3eee7"
  );
  context.fillStyle = "#24333b";
  context.fillText(domain, size.width - pad - domainWidth + 14, size.height - 57);

  const blob = await canvasToBlob(canvas);
  return new File([blob], filename, {
    type: "image/png"
  });
}
