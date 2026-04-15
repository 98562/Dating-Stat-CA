export const legalConfig = {
  operatorName: process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "",
  supportUrl:
    process.env.NEXT_PUBLIC_SUPPORT_URL ?? process.env.NEXT_PUBLIC_FEEDBACK_URL ?? "",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? "",
  governingLaw: process.env.NEXT_PUBLIC_GOVERNING_LAW ?? "",
  launchReviewNotice:
    "Plain-language notes covering privacy, support, and how the site handles data."
} as const;

export const legalLinks = {
  supportHref: legalConfig.supportUrl || "",
  privacyEmailHref: legalConfig.privacyEmail ? `mailto:${legalConfig.privacyEmail}` : ""
} as const;
