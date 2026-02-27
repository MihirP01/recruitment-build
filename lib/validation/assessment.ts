import { z } from "zod";

export const assessmentEnvironmentPayloadSchema = z.object({
  touchDevice: z.boolean(),
  smallViewport: z.boolean(),
  webdriver: z.boolean(),
  lowCpuCores: z.boolean(),
  virtualizedGpu: z.boolean(),
  mobileUserAgent: z.boolean(),
  fullscreenCapable: z.boolean(),
  multiTabLockAvailable: z.boolean(),
  viewport: z.object({
    width: z.number().int().nonnegative(),
    height: z.number().int().nonnegative()
  }),
  hardwareConcurrency: z.number().int().positive().nullable(),
  gpuRenderer: z.string().max(500).nullable(),
  fingerprint: z.string().min(16).max(256),
  userAgent: z.string().max(1024),
  checkedAt: z.string().datetime()
});

export const assessmentStartSchema = z.object({
  environment: assessmentEnvironmentPayloadSchema
});

export const lockdownAssessmentStartSchema = z.object({
  assessmentId: z.string().min(1).max(200),
  deviceId: z.string().min(16).max(256),
  environment: assessmentEnvironmentPayloadSchema,
  acknowledged: z.boolean()
});

export const lockdownAssessmentHeartbeatSchema = z.object({
  sessionId: z.string().uuid(),
  deviceId: z.string().min(16).max(256),
  timerRemainingSec: z.number().int().nonnegative().optional()
});

export const lockdownAssessmentEventSchema = z.object({
  sessionId: z.string().uuid(),
  deviceId: z.string().min(16).max(256),
  eventType: z
    .enum([
      "SESSION_STARTED",
      "HEARTBEAT",
      "FOCUS_LOSS",
      "FOCUS_REGAINED",
      "FULLSCREEN_EXIT",
      "FULLSCREEN_ENTER",
      "PASTE_BLOCKED",
      "COPY_ATTEMPT",
      "CUT_ATTEMPT",
      "KEYBOARD_EVENT",
      "MULTI_TAB_DETECTED",
      "SUSPICIOUS_BURST",
      "EXIT_ATTEMPT",
      "ASSESSMENT_SUBMIT",
      "SESSION_TERMINATED"
    ]),
  severity: z.enum(["info", "warning", "critical"]),
  detail: z.string().min(1).max(1000)
});

export const lockdownAssessmentFinishSchema = z.object({
  sessionId: z.string().uuid(),
  deviceId: z.string().min(16).max(256),
  status: z.enum(["completed", "terminated"]),
  terminationReason: z.string().max(400).optional(),
  result: z
    .object({
      grossWpm: z.number().nonnegative(),
      netWpm: z.number().nonnegative(),
      accuracy: z.number().min(0).max(100),
      errors: z.number().int().nonnegative(),
      charactersTyped: z.number().int().nonnegative(),
      backspaces: z.number().int().nonnegative(),
      cadence: z.object({
        averageIntervalMs: z.number().nonnegative(),
        stdDevIntervalMs: z.number().nonnegative(),
        samples: z.number().int().nonnegative()
      }),
      integrity: z.object({
        score: z.number().min(0).max(100),
        focusLossCount: z.number().int().nonnegative(),
        fullscreenExitCount: z.number().int().nonnegative(),
        pasteAttempts: z.number().int().nonnegative(),
        multiTabDetected: z.boolean(),
        suspiciousBurstDetected: z.boolean(),
        warningsCount: z.number().int().nonnegative()
      })
    })
    .optional()
});

export const assessmentSubmitSchema = z.object({
  candidateAssessmentId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        selectedAnswer: z.string().min(1).max(500)
      })
    )
    .min(1)
});
