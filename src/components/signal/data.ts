export const outputs = {
  "LinkedIn": `78% of long-form reports are never repurposed.\n\nThe problem isn't reach — it's the blank-page habit. High-performing editorial teams treat every platform as a verified split of one source.\n\nOne report. Four native formats. Every claim linked back to evidence. That's how content reuse stops being guesswork.`,
  "X Thread": `1/ Most long-form content disappears after publish day. Our research found 78% of reports receive zero derivative content. 🧵\n\n2/ The fix isn't “post more.” It's building a verified source signal first.\n\n3/ Extract the claims, lock the evidence, then adapt the delivery — never the facts.`,
  "Instagram Carousel": `SLIDE 1 — Your best report is probably underused.\n\nSLIDE 2 — 78% of long-form reports are never repurposed.\n\nSLIDE 3 — Start with one verified source.\n\nSLIDE 4 — Adapt the format, not the facts.\n\nSLIDE 5 — One source. Every platform. Zero factual drift.`,
  "Short Video / Reel": `[HOOK — 0:00]\nYou spent weeks on that report. Why did it become just one post?\n\n[INSIGHT — 0:04]\n78% of long-form reports are never repurposed. Not because teams lack ideas — because they restart from a blank page.\n\n[CLOSE — 0:14]\nLock the facts once. Then split the signal for every platform.`,
} as const;

export const claims = [
  { claim: "78% of long-form reports are never repurposed.", status: "Supported", passage: "The Content Reuse Gap survey found 78% of published reports receive zero derivative content.", explanation: "The generated statement matches the reported figure and population." },
  { claim: "Repurposed content doubles engagement.", status: "Context Warning", passage: "Repurposed campaign assets produced 2.1× engagement during the first 30 days among B2B respondents.", explanation: "The platform copy omits the 30-day window and B2B audience qualifier." },
  { claim: "Teams save 14 hours every week through reuse.", status: "Altered", passage: "Respondents reported saving an average of 11.4 hours per campaign cycle.", explanation: "The number and measurement period were changed from the source." },
  { claim: "Automated repurposing guarantees consistent brand voice.", status: "Unsupported", passage: "No source passage supports a guarantee of brand consistency.", explanation: "The source recommends editorial review and does not make this absolute claim." },
] as const;

export const quality = [
  { label: "Factual Consistency", value: 96, color: "bg-brand" },
  { label: "Source Coverage", value: 88, color: "bg-signal" },
  { label: "Brand Alignment", value: 92, color: "bg-amber" },
  { label: "Platform Suitability", value: 90, color: "bg-brand" },
];
