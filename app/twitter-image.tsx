import { ImageResponse } from "next/og";

import { SocialImage } from "@/components/brand/social-image";

export const alt = "Canada Dating Pool Calculator";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <SocialImage
        title="See how statistically narrow your dating criteria are."
        subtitle="Canada Dating Pool Calculator: public data where practical, estimates where necessary."
      />
    ),
    size
  );
}
