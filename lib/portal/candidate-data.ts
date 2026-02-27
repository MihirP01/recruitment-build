export type AssessmentStatus = "Completed" | "Pending" | "In Progress" | "Expired";

export type CandidateAssessment = {
  id: string;
  name: string;
  category: string;
  status: AssessmentStatus;
  assignedDate: string;
  deadline: string;
  deadlineCountdown: string;
  duration: string;
  integrityRequirements: string[];
  deviceEligibility: string[];
  actionLabel: "Start Assessment" | "Resume" | "View Result" | "Unavailable";
  actionHref?: string;
};

export type ActivityEntry = {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
};

export type AnnouncementEntry = {
  id: string;
  title: string;
  detail: string;
  publishedAt: string;
};

export type ConversationPreview = {
  id: string;
  title: string;
  from: string;
  lastMessage: string;
  updatedAt: string;
  unread: boolean;
};

export type ThreadMessage = {
  id: string;
  sender: "Candidate" | "Recruitment Operations" | "Assessment Support";
  body: string;
  timestamp: string;
};

export type SupportOption = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  actionHref: string;
};

export type SecuritySession = {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  status: "Active" | "Ended";
};

export type ApprovedDevice = {
  id: string;
  label: string;
  platform: string;
  enrolledAt: string;
  compliance: "Compliant" | "Review Required";
};

export type ConsentAgreement = {
  id: string;
  name: string;
  acceptedAt: string;
  status: "Accepted" | "Pending";
};

export const candidateAssessments: CandidateAssessment[] = [
  {
    id: "typing-speed",
    name: "Typing Speed Assessment (WPM Test)",
    category: "Communication",
    status: "Pending",
    assignedDate: "08 May 2026",
    deadline: "12 May 2026",
    deadlineCountdown: "Expires in 2 days",
    duration: "10 minutes",
    integrityRequirements: ["Single active browser session", "Clipboard paste blocked"],
    deviceEligibility: ["Desktop or laptop", "Minimum viewport width 1024px"],
    actionLabel: "Start Assessment",
    actionHref: "/portal/candidate/assessments/typing-speed"
  },
  {
    id: "situational-judgement",
    name: "Situational Judgement Test",
    category: "Decision Making",
    status: "In Progress",
    assignedDate: "09 May 2026",
    deadline: "15 May 2026",
    deadlineCountdown: "Expires in 5 days",
    duration: "25 minutes",
    integrityRequirements: ["Focus monitoring enabled", "Session bound to verified device"],
    deviceEligibility: ["Desktop required", "Stable broadband connection"],
    actionLabel: "Resume",
    actionHref: "/portal/candidate/assessments/situational-judgement"
  },
  {
    id: "incident-report",
    name: "Incident Report Writing",
    category: "Written Communication",
    status: "Completed",
    assignedDate: "27 Apr 2026",
    deadline: "03 May 2026",
    deadlineCountdown: "Completed",
    duration: "30 minutes",
    integrityRequirements: ["Server-side scoring only"],
    deviceEligibility: ["Desktop or laptop"],
    actionLabel: "View Result"
  },
  {
    id: "public-order-briefing",
    name: "Public Order Briefing Response",
    category: "Operational Communication",
    status: "Pending",
    assignedDate: "11 May 2026",
    deadline: "20 May 2026",
    deadlineCountdown: "Expires in 10 days",
    duration: "18 minutes",
    integrityRequirements: ["Continuous secure session validation"],
    deviceEligibility: ["Desktop required", "No touch-only devices"],
    actionLabel: "Start Assessment",
    actionHref: "/portal/candidate/assessments/public-order-briefing"
  },
  {
    id: "legacy-ethics",
    name: "Legacy Ethics Scenario",
    category: "Professional Standards",
    status: "Expired",
    assignedDate: "10 Apr 2026",
    deadline: "18 Apr 2026",
    deadlineCountdown: "Expired 23 days ago",
    duration: "20 minutes",
    integrityRequirements: ["Attempt window closed"],
    deviceEligibility: ["N/A"],
    actionLabel: "Unavailable"
  }
];

export const activityTimeline: ActivityEntry[] = [
  {
    id: "a-1",
    event: "Assessment Opened",
    detail: "Situational Judgement Test launch validated.",
    timestamp: "Today 09:21"
  },
  {
    id: "a-2",
    event: "Submission Recorded",
    detail: "Incident Report Writing marked complete.",
    timestamp: "Today 09:14"
  },
  {
    id: "a-3",
    event: "Session Verified",
    detail: "Secure session key refreshed successfully.",
    timestamp: "Today 09:11"
  },
  {
    id: "a-4",
    event: "Result Processed",
    detail: "Scoring engine output stored for review.",
    timestamp: "Today 08:52"
  }
];

export const recruiterAnnouncements: AnnouncementEntry[] = [
  {
    id: "r-1",
    title: "Assessment Window Reminder",
    detail: "Complete outstanding assessments before deadline to avoid workflow suspension.",
    publishedAt: "Today 08:45"
  },
  {
    id: "r-2",
    title: "Environment Policy Update",
    detail: "Touch-only devices remain restricted for secure assessment execution.",
    publishedAt: "Yesterday 16:12"
  }
];

export const secureConversations: ConversationPreview[] = [
  {
    id: "c-1",
    title: "Assessment Support Desk",
    from: "Assessment Support",
    lastMessage: "Please confirm whether your viewport warning is still present.",
    updatedAt: "Today 10:04",
    unread: true
  },
  {
    id: "c-2",
    title: "Recruitment Operations",
    from: "Recruitment Operations",
    lastMessage: "Your incident writing result has been forwarded for review.",
    updatedAt: "Today 09:18",
    unread: false
  },
  {
    id: "c-3",
    title: "Identity Verification",
    from: "Recruitment Operations",
    lastMessage: "Identity check accepted. No further action needed.",
    updatedAt: "Yesterday 14:32",
    unread: false
  }
];

export const selectedThread: ThreadMessage[] = [
  {
    id: "m-1",
    sender: "Assessment Support",
    body: "We received your environment restriction query. Please use a desktop browser for assessment launch.",
    timestamp: "Today 09:55"
  },
  {
    id: "m-2",
    sender: "Candidate",
    body: "Acknowledged. I will switch to my managed workstation and retry.",
    timestamp: "Today 09:58"
  },
  {
    id: "m-3",
    sender: "Assessment Support",
    body: "Once the environment check shows compliant, resume from the My Assessments page.",
    timestamp: "Today 10:04"
  }
];

export const supportOptions: SupportOption[] = [
  {
    id: "s-1",
    title: "Technical Issue",
    detail: "Report platform loading issues, login errors, or browser session instability.",
    actionLabel: "Open Technical Ticket",
    actionHref: "mailto:support@ctrl-platform.uk?subject=Technical%20Issue"
  },
  {
    id: "s-2",
    title: "Assessment Problem",
    detail: "Request review for assessment launch restrictions or interrupted session states.",
    actionLabel: "Report Assessment Problem",
    actionHref: "mailto:support@ctrl-platform.uk?subject=Assessment%20Problem"
  },
  {
    id: "s-3",
    title: "Accessibility Request",
    detail: "Submit accessibility adjustment requests for approved assessment accommodations.",
    actionLabel: "Request Accessibility Support",
    actionHref: "mailto:support@ctrl-platform.uk?subject=Accessibility%20Request"
  },
  {
    id: "s-4",
    title: "Recruitment Contact",
    detail: "Contact recruitment operations for workflow or process clarification.",
    actionLabel: "Contact Recruitment Operations",
    actionHref: "mailto:contact@ctrl-platform.uk?subject=Recruitment%20Contact"
  }
];

export const activeSessions: SecuritySession[] = [
  {
    id: "as-1",
    device: "Managed MacBook Pro",
    location: "London, UK",
    lastSeen: "Now",
    status: "Active"
  },
  {
    id: "as-2",
    device: "Recruitment Kiosk Terminal",
    location: "Croydon, UK",
    lastSeen: "Yesterday 16:42",
    status: "Ended"
  }
];

export const approvedDevices: ApprovedDevice[] = [
  {
    id: "ad-1",
    label: "CTRL-WS-14",
    platform: "macOS 14.6 / Chrome",
    enrolledAt: "03 May 2026",
    compliance: "Compliant"
  },
  {
    id: "ad-2",
    label: "CTRL-TERM-22",
    platform: "Windows 11 / Edge",
    enrolledAt: "29 Apr 2026",
    compliance: "Review Required"
  }
];

export const consentAgreements: ConsentAgreement[] = [
  {
    id: "ca-1",
    name: "Assessment Integrity Monitoring Consent",
    acceptedAt: "08 May 2026",
    status: "Accepted"
  },
  {
    id: "ca-2",
    name: "Data Processing and Candidate Records Consent",
    acceptedAt: "08 May 2026",
    status: "Accepted"
  },
  {
    id: "ca-3",
    name: "Device Eligibility Policy Confirmation",
    acceptedAt: "Pending",
    status: "Pending"
  }
];
