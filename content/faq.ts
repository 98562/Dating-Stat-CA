export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  description: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "What this tool is",
    description: "A few quick answers for first-time visitors.",
    items: [
      {
        question: "What is this tool?",
        answer:
          "It is a light Canadian dating-pool calculator. You choose filters like age, education, language, height, and lifestyle preferences, and the app estimates how those choices change the size of the remaining pool."
      },
      {
        question: "Is this a dating service?",
        answer:
          "No. It does not match people, host profiles, or measure compatibility. It is a perspective tool built around public data, estimates, and a few user-controlled assumptions."
      },
      {
        question: "Is this based on real Canadian data?",
        answer:
          "Partly, yes. The calculator uses official Canadian population and census data where practical, then labels later steps as Estimated or Assumption when the public data stop short of the exact combination you selected."
      },
      {
        question: "Should I take the result literally?",
        answer:
          "Not really. The result is more useful as perspective than as a decision rule. It can show how fast preferences compound, but it is not a literal count of who is available, interested, or compatible."
      }
    ]
  },
  {
    title: "How the numbers work",
    description: "Why the pool changes so quickly and why some steps are estimates.",
    items: [
      {
        question: "Why do the numbers drop so quickly?",
        answer:
          "Because preferences compound faster than most people expect. A few individually reasonable filters can shrink a large starting population into a much smaller slice very quickly."
      },
      {
        question: "Why are some results estimated?",
        answer:
          "Statistics Canada does not publish every possible trait combination in one public table. When the exact cross-tab is unavailable, the calculator combines the closest compatible official distributions and labels the step as Estimated."
      },
      {
        question: "Why are some filters assumptions?",
        answer:
          "Because not every preference exists in a public dataset. Steps like attractiveness and custom personal filters are intentionally treated as your assumptions rather than disguised as official facts."
      },
      {
        question: "Why is height estimated?",
        answer:
          "Height is not published inside the same census cross-tabs as the main demographic filters. The app estimates height from official Canadian height percentiles and labels that step clearly as Estimated."
      },
      {
        question: "Why is drinking behavior estimated?",
        answer:
          "The alcohol-use source is a Canadian health survey rather than a census-style cross-tab that lines up with every other active filter. That is why drinking habits are usually treated as an Estimated step."
      },
      {
        question: "Does choosing more filters make the result less exact?",
        answer:
          "Often, yes. The more specific the stack becomes, the more likely the app has to interpolate across tables or lean on your own assumptions instead of a single published cross-tab."
      }
    ]
  },
  {
    title: "Filters, storage, and sharing",
    description: "Common questions about age limits, stored data, and share links.",
    items: [
      {
        question: "Why do age ranges start at 18?",
        answer:
          "The calculator only supports age ranges 18 and above. That is a product boundary for the dataset and filter system, not a statement about the whole internet."
      },
      {
        question: "Does the site store my calculator inputs?",
        answer:
          "Normal calculator use runs in the browser after the page loads. The site does not require an account, and the initial public launch does not turn on optional analytics or ad tracking."
      },
      {
        question: "How do share links work?",
        answer:
          "Share links restore the same calculator setup through a shorter share URL. They are only created when you choose to share, and they encode the selected calculator state so someone else can open the same result."
      },
      {
        question: "Will ads or analytics be added later?",
        answer:
          "Possibly, but not in the initial public launch. If that changes later, the Privacy page should be updated to explain what is active and what is still optional."
      },
      {
        question: "Can I choose more than one population group, height range, or drinking category?",
        answer:
          "Yes. Those filters use match-any-selected logic, so multiple selections are treated as a union rather than as contradictory requirements."
      },
      {
        question: "Does 'single' mean actively dating?",
        answer:
          "No. Public datasets usually capture legal marital status or household relationship status, not dating intent, app usage, or whether someone is currently looking."
      }
    ]
  }
];

export const faqItems: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const legacyFaqItems: FaqItem[] = [
  {
    question: "Is this meant for minors or teen dating ranges?",
    answer:
      "No. The calculator does not model under-18 age ranges, and the selectable range starts at 18 across the UI, readable URLs, and restored share links."
  },
  {
    question: "Is this scientifically rigorous?",
    answer:
      "No. It is informed by real Canadian data, but simplified on purpose for exploration. Think perspective, not lab conditions."
  },
  {
    question: "Should I take the result literally?",
    answer:
      "Probably not. It is more useful as a reality check on compounding preferences than as a decision rule about actual dating life."
  },
  {
    question: "Why did the number drop so quickly?",
    answer:
      "Because preferences compound faster than most people expect. A few reasonable-sounding filters can shrink a large population into a much smaller slice very quickly."
  },
  {
    question: "Is all of this based on official Canadian data?",
    answer:
      "Not entirely. Some steps come straight from published tables, some are estimated from compatible data, and some are user-defined on purpose."
  },
  {
    question: "Why are some filters estimated?",
    answer:
      "Statistics Canada does not publish every possible trait combination in one public table. When the exact cross-tab is unavailable, the calculator combines the closest official distributions and labels that step as Estimated."
  },
  {
    question: "Does 'single' mean actively dating?",
    answer:
      "No. Public datasets usually capture legal marital status or household relationship status, not dating intent, app usage, or emotional availability."
  },
  {
    question: "Why is income from an older year?",
    answer:
      "Census income tables use a reference year that predates the latest population estimate. In this version, the live population base is newer than the income year, and the interface calls that out so the estimate keeps its context."
  },
  {
    question: "How accurate is this?",
    answer:
      "It is directionally useful, especially when more of the funnel stays in Observed territory. Once Estimated or Assumption steps take over, treat it as a rough sketch rather than a literal count."
  },
  {
    question: "Does the site track my calculator inputs?",
    answer:
      "The live filtering logic runs in the browser once the page has loaded. Shared links can encode your selected filters in the URL, and any optional analytics or advertising tools should stay off unless they are actually enabled and consented to."
  },
  {
    question: "Can I choose more than one ethnicity or population group?",
    answer:
      "Yes. Multi-select uses OR logic, so selecting more than one category means the result matches any selected official population-group category rather than all of them at once."
  },
  {
    question: "Can I choose more than one acceptable height?",
    answer:
      "Yes. Height selections are merged into a union of acceptable ranges, so overlapping selections are combined instead of double counted."
  },
  {
    question: "Why is height estimated?",
    answer:
      "Height is not available in the same census cross-tabs as the main demographic filters. The app estimates height from official Canadian height percentiles and labels the step as Estimated."
  },
  {
    question: "Why is attractiveness just an assumption?",
    answer:
      "Because attraction is subjective and the app refuses to pretend otherwise. That step is always user-defined and always labelled Assumption."
  },
  {
    question: "Does choosing more filters make the result less exact?",
    answer:
      "Often, yes. The more specific the stack, the more likely the app has to interpolate across tables or apply your own assumptions rather than rely on a single direct cross-tab."
  },
  {
    question: "Can I filter for non-drinkers?",
    answer:
      "You can filter for the app's 'Does not drink' category. It is still a survey-based proxy rather than a permanent life label, because the source reflects recent self-reported behavior."
  },
  {
    question: "Why is drinking behavior estimated?",
    answer:
      "The alcohol-use source is a Canadian health survey, not a census cross-tab that lines up perfectly with geography, age, sex, and every other active filter. The calculator therefore treats drinking habits as an Estimated step in most real-world combinations."
  },
  {
    question: "Why can I choose more than one drinking category?",
    answer:
      "Because multi-select uses OR logic. Choosing more than one option means the result can match any selected drinking-habit category, and the calculator unions those source buckets instead of stacking them like contradictions."
  },
  {
    question: "What does 'Avoids heavy drinking' mean?",
    answer:
      "In this version it means the selected pool stays below the highest weekly alcohol-use bucket used in the survey. That is a normalized app category built from the official alcohol-risk table, not a diagnosis."
  },
  {
    question: "Why don't you use the word 'alcoholic'?",
    answer:
      "Because this feature is about survey-based drinking behavior, not clinical diagnosis or stigmatizing labels. The app keeps the language focused on habits and reported consumption instead."
  }
];
