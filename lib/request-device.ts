import { headers } from "next/headers";

export type ViewportMode = "desktop" | "mobile";

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export async function getInitialViewportMode(): Promise<ViewportMode> {
  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "";
  return MOBILE_USER_AGENT_PATTERN.test(userAgent) ? "mobile" : "desktop";
}
