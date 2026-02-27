export const ASSESSMENT_MIN_VIEWPORT_WIDTH = 1024;
export const ASSESSMENT_MIN_CPU_CORES = 4;

export const VIRTUALIZED_GPU_INDICATORS = [
  "swiftshader",
  "llvmpipe",
  "virtualbox",
  "vmware",
  "parallels",
  "virgl",
  "software rasterizer",
  "mesa offscreen",
  "gdi generic",
  "microsoft basic render",
  "angle (microsoft"
];

export type AssessmentEnvironmentChecks = {
  touchDevice: boolean;
  smallViewport: boolean;
  webdriver: boolean;
  lowCpuCores: boolean;
  virtualizedGpu: boolean;
};

export type AssessmentEnvironmentPolicyInput = AssessmentEnvironmentChecks & {
  mobileUserAgent?: boolean;
  fullscreenCapable?: boolean;
  multiTabLockAvailable?: boolean;
};

export type AssessmentEnvironmentPolicyResult = {
  blockingReasons: string[];
  warnings: string[];
};

export type AssessmentEnvironmentPayload = AssessmentEnvironmentChecks & {
  mobileUserAgent: boolean;
  fullscreenCapable: boolean;
  multiTabLockAvailable: boolean;
  viewport: {
    width: number;
    height: number;
  };
  hardwareConcurrency: number | null;
  gpuRenderer: string | null;
  fingerprint: string;
  userAgent: string;
  checkedAt: string;
};

export function isVirtualizedGpuRenderer(renderer: string | null | undefined): boolean {
  if (!renderer) return false;
  const normalized = renderer.toLowerCase();
  return VIRTUALIZED_GPU_INDICATORS.some((indicator) => normalized.includes(indicator));
}

export function isMobileLikeUserAgent(userAgent: string): boolean {
  return /(android|iphone|ipad|ipod|mobile|tablet|iemobile|opera mini)/i.test(userAgent);
}

export function isWebdriverLikeUserAgent(userAgent: string): boolean {
  return /(headlesschrome|playwright|puppeteer|cypress|phantomjs)/i.test(userAgent);
}

export function buildAssessmentEnvironmentReasons(checks: AssessmentEnvironmentChecks): string[] {
  return evaluateAssessmentEnvironment(checks).blockingReasons;
}

export function evaluateAssessmentEnvironment(
  input: AssessmentEnvironmentPolicyInput
): AssessmentEnvironmentPolicyResult {
  const blockingReasons: string[] = [];
  const warnings: string[] = [];

  if (input.touchDevice) {
    blockingReasons.push("Touch input devices are restricted for controlled assessment execution.");
  }
  if (input.smallViewport || input.mobileUserAgent) {
    blockingReasons.push("Minimum desktop viewport width is required to maintain assessment integrity.");
  }
  if (input.lowCpuCores) {
    blockingReasons.push(`Minimum ${ASSESSMENT_MIN_CPU_CORES} logical CPU cores are required.`);
  }
  if (input.virtualizedGpu) {
    blockingReasons.push("Virtualized or software-rendered graphics environment detected.");
  }
  if (input.fullscreenCapable === false) {
    blockingReasons.push("Fullscreen capability is required to enter secure assessment mode.");
  }
  if (input.multiTabLockAvailable === false) {
    blockingReasons.push("Single-session storage lock is unavailable in this browser environment.");
  }
  if (input.webdriver) {
    warnings.push("Automation runtime indicator detected and recorded for audit review.");
  }

  return { blockingReasons, warnings };
}
