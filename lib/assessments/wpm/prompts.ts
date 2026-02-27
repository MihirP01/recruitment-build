export type WpmPrompt = {
  id: string;
  text: string;
};

export const WPM_PROMPTS: WpmPrompt[] = [
  {
    id: "WPM-01",
    text:
      "At 07:42 the control room received a report of a disturbance near the station entrance. The responding unit confirmed scene safety, recorded witness details, and submitted an incident summary for supervisory review before shift handover."
  },
  {
    id: "WPM-02",
    text:
      "Candidates must follow all assessment instructions exactly as issued. Any unauthorized assistance, copied text, or unexplained interruptions may trigger an integrity review and delay recruitment progression until verification is complete."
  },
  {
    id: "WPM-03",
    text:
      "Operational logs should be concise, factual, and time stamped. Include location, actions taken, and outcome status. Avoid assumptions, and escalate immediately when events involve public safety concerns or vulnerable individuals."
  },
  {
    id: "WPM-04",
    text:
      "During structured testing, applicants are expected to work independently and maintain continuous attention. System controls monitor session continuity, response timing, and event traces to support fair and defensible evaluation standards."
  },
  {
    id: "WPM-05",
    text:
      "A supervisor reviewed the overnight briefing and confirmed that all pending tasks were reassigned by priority level. The team acknowledged receipt, updated case notes, and closed duplicate entries in accordance with records policy."
  },
  {
    id: "WPM-06",
    text:
      "When drafting an incident narrative, write in plain language and preserve sequence accuracy. Document what was observed, what action was taken, and which authority approved the next step in the response workflow."
  },
  {
    id: "WPM-07",
    text:
      "Assessment completion windows are enforced to maintain consistency across candidate cohorts. Submissions outside the approved timeframe may be marked expired and moved to manual review under recruitment governance procedures."
  },
  {
    id: "WPM-08",
    text:
      "All activity within this session is recorded for audit traceability. If technical disruption occurs, report it through support channels with the assessment reference number and the exact time of the interruption."
  }
];

export function selectRandomPrompt(seed = Date.now()): WpmPrompt {
  const index = Math.abs(seed) % WPM_PROMPTS.length;
  return WPM_PROMPTS[index];
}
