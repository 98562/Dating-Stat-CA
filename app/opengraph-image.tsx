import { ImageResponse } from "next/og";

import { SocialImage } from "@/components/brand/social-image";

export const alt = "Canada Dating Pool Calculator";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <SocialImage
        title="Canada Dating Pool Calculator, with assumptions labelled on purpose."
        subtitle="A light Canadian calculator that combines public data, careful estimates, and user-chosen filters to show how the pool narrows."
      />
    ),
    size
  );
}
