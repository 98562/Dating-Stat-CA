export const homeHowItWorks = [
  {
    title: "Start with a real population base",
    body:
      "The funnel begins with the latest official Canadian population estimate for the geography you selected."
  },
  {
    title: "Narrow with published trait distributions",
    body:
      "Age, sex category, population group, relationship proxy, education, income, language, and drinking habits are applied using official Canadian tables or surveys whenever those data exist cleanly enough to support them."
  },
  {
    title: "Label uncertainty instead of hiding it",
    body:
      "Each step is marked as Observed, Estimated, or Assumption so you can see when the number is grounded in a direct table and when it becomes a careful approximation."
  }
];

export const aboutSections = [
  {
    title: "What this project is",
    body:
      "Canada Dating Pool Calculator is a public-facing probability tool for dating-age ranges 18+, built around official population statistics and a very deliberate refusal to fake precision."
  },
  {
    title: "Why it exists",
    body:
      "A lot of dating-probability calculators are funny but opaque. This one keeps a little wit, drops the faux certainty, and shows its working."
  },
  {
    title: "What we care about",
    body:
      "Transparency comes first. The app separates observed data from estimated combinations and from manual assumptions so users can tell the difference between evidence and vibes."
  },
  {
    title: "Support and contact",
    body:
      "The site keeps support intentionally lightweight. If a public contact link is offered, it should stay separate from ads and easy to find without taking over the product."
  }
];

export const privacySections = [
  {
    title: "Overview",
    body:
      "This version of the app does not require accounts or logins. In ordinary use, it is not designed to intentionally collect sensitive personal information, and the calculator is limited to age ranges 18 and above."
  },
  {
    title: "How calculator inputs are handled",
    body:
      "The normalized dataset is loaded by the app, but the live narrowing logic runs in the browser after the page loads. Shared result links may include encoded calculator state in the URL so the same setup can be restored later."
  },
  {
    title: "Analytics and advertising",
    body:
      "Optional analytics or advertising technology should only run when those categories are actually enabled and consented to. Reserved ad spaces may appear in the layout, but live ad-network scripts are not part of the app by default."
  },
  {
    title: "Storage and preferences",
    body:
      "The app keeps storage intentionally light. If privacy preferences are enabled, the site stores a small local browser record of those choices. Shared URLs can also carry calculator state so results remain portable."
  },
  {
    title: "Feedback and contact",
    body:
      "If you intentionally submit feedback or contact the site team, that message may include the information you choose to send. Provider-specific retention details can be listed here when a feedback channel is available."
  },
  {
    title: "Children and minors",
    body:
      "The calculator does not offer under-18 age ranges. Inputs below 18 are clamped to the supported range in the interface, shared URLs, and restored states."
  },
  {
    title: "Questions about privacy",
    body:
      "Privacy contact details can be listed here when available. This page is written in plain language as a practical overview of how the site handles data."
  }
];

export const termsSections = [
  {
    title: "Informational use",
    body:
      "This app is provided for informational and entertainment use. It estimates how many people match selected statistical traits, is not a matchmaking service, and supports age ranges 18 and above."
  },
  {
    title: "No guarantee",
    body:
      "Results are not guarantees of availability, compatibility, or dating success. Public demographic data have limits, and some outputs rely on estimated combinations."
  },
  {
    title: "No professional advice",
    body:
      "Nothing on the site should be treated as legal, financial, medical, relationship, or professional advice. The calculator is for perspective and curiosity, not decision-making."
  },
  {
    title: "Acceptable use",
    body:
      "Use the app lawfully and respectfully. Do not use it to harass, target, or demean people or groups."
  },
  {
    title: "Service availability and liability",
    body:
      "The site owner may change, suspend, or withdraw the site at any time. To the extent allowed by applicable law, the service is provided without guarantees and with limited liability for outages, errors, or reliance on the estimates."
  },
  {
    title: "Service changes",
    body:
      "The app, its datasets, and its methodology may change over time as the public data or the product evolve."
  },
  {
    title: "Governing law",
    body:
      "A governing-law line can stay simple for a small public web tool, and can be updated here when needed."
  }
];

export const methodologySections = [
  {
    title: "Observed",
    body:
      "An Observed step means the selected share comes directly from an official published cross-tab that already contains the relevant conditioning dimensions."
  },
  {
    title: "Estimated",
    body:
      "An Estimated step means the exact combination is not published together, so the app blends or combines the closest official distributions available. That can overstate or understate the true count. Drinking-habit filters usually live here because the alcohol-use data are survey-based and not census-grade cross-tabs."
  },
  {
    title: "Assumption",
    body:
      "An Assumption step is a user-controlled adjustment, such as attractiveness or another personal preference slider. These are not official census-backed traits in the current app and are labelled accordingly."
  }
];

export const methodologyFlow = [
  "Start with the latest official population estimate for the selected geography.",
  "Apply age and sex using direct census distributions where possible.",
  "Apply population group using official census categories with match-any-selected-category union logic when more than one is selected.",
  "Apply relationship-status proxy, education, income, and language using the best compatible public tables.",
  "Estimate drinking habits from Canadian health-survey alcohol-use distributions, with match-any-selected-option logic when more than one category is selected.",
  "Estimate height by merging acceptable selected ranges and interpolating across official Canadian height percentiles.",
  "Apply attractiveness only as a user assumption, never as a census-backed national fact.",
  "Mark each step with its quality level and explain when conditioning dimensions are missing.",
  "Interpret the final number as people matching selected traits, not literal dating intent or compatibility.",
  "Clamp age ranges to 18+ so the calculator stays within its supported range across the UI and shared states."
];
