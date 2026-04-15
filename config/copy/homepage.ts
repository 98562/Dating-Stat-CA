import { seoConfig } from "@/config/seo";

export const homepageHero = {
  eyebrow: seoConfig.brandName,
  title: "See how statistically narrow your dating criteria are.",
  subtitle:
    "Canada Dating Pool Calculator, built from published data, careful estimates, and your own assumptions.",
  note: "This is a light statistical tool, not relationship science.",
  primaryCtaLabel: "Open full calculator",
  secondaryCtaLabel: "How it works"
};

export const homepageExplainer = [
  "We start with Canadian population data.",
  "We narrow it using your selected filters.",
  "Where no clean data exists, we estimate or let you choose the assumption.",
  "The result is best read as perspective, not precision."
];

export const homepageExamples = [
  {
    title: "Broad result",
    body: "Fairly open-ended by the standards of this tool."
  },
  {
    title: "Mid-range result",
    body: "Selective enough to notice, but still recognizably plausible."
  },
  {
    title: "Tiny result",
    body: "Useful as perspective. Probably not a life plan."
  }
];

export const homepageSections = {
  calculatorTitle: "Try the calculator",
  calculatorDescription:
    "The live tool comes first. Supporting notes and details sit lower on the page.",
  presetsTitle: "Preset profiles",
  presetsDescription:
    "Editable starting points that make the calculator quicker to explore.",
  reactionsTitle: "How to read the tone",
  reactionsDescription:
    "The commentary is meant to keep the numbers in perspective, not to psychoanalyze you.",
  faqTitle: "A few sensible questions",
  faqDescription:
    "Short answers for the part where the result starts feeling suspiciously small."
};
