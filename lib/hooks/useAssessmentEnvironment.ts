"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ASSESSMENT_MIN_CPU_CORES,
  ASSESSMENT_MIN_VIEWPORT_WIDTH,
  AssessmentEnvironmentChecks,
  AssessmentEnvironmentPayload,
  evaluateAssessmentEnvironment,
  isVirtualizedGpuRenderer,
  isMobileLikeUserAgent,
  isWebdriverLikeUserAgent
} from "@/lib/security/assessment-environment";

type AssessmentEnvironmentState = {
  ready: boolean;
  valid: boolean;
  checks: AssessmentEnvironmentChecks;
  reasons: string[];
  warnings: string[];
  payload: AssessmentEnvironmentPayload | null;
  refresh: () => Promise<void>;
};

const ENVIRONMENT_CACHE_KEY = "ctrl_assessment_environment_v1";
const ENVIRONMENT_CACHE_TTL_MS = 5 * 60 * 1000;

const DEFAULT_CHECKS: AssessmentEnvironmentChecks = {
  touchDevice: false,
  smallViewport: false,
  webdriver: false,
  lowCpuCores: false,
  virtualizedGpu: false
};

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, "0");
  }

  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function useAssessmentEnvironment(): AssessmentEnvironmentState {
  const [payload, setPayload] = useState<AssessmentEnvironmentPayload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(ENVIRONMENT_CACHE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        cachedAt?: number;
        payload?: AssessmentEnvironmentPayload;
      };

      if (!parsed?.cachedAt || !parsed.payload) {
        window.sessionStorage.removeItem(ENVIRONMENT_CACHE_KEY);
        return;
      }

      if (Date.now() - parsed.cachedAt > ENVIRONMENT_CACHE_TTL_MS) {
        window.sessionStorage.removeItem(ENVIRONMENT_CACHE_KEY);
        return;
      }

      setPayload(parsed.payload);
      setReady(true);
    } catch {
      window.sessionStorage.removeItem(ENVIRONMENT_CACHE_KEY);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const userAgent = navigator.userAgent || "";
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const hardwareConcurrency =
      typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null;

    const touchDevice =
      navigator.maxTouchPoints > 0 ||
      ("matchMedia" in window && window.matchMedia("(any-pointer: coarse)").matches);
    const smallViewport = viewport.width < ASSESSMENT_MIN_VIEWPORT_WIDTH;
    const webdriver =
      Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver) ||
      isWebdriverLikeUserAgent(userAgent);
    const mobileUserAgent = isMobileLikeUserAgent(userAgent);
    const lowCpuCores =
      typeof hardwareConcurrency === "number" &&
      hardwareConcurrency > 0 &&
      hardwareConcurrency < ASSESSMENT_MIN_CPU_CORES;

    const getWebGlRenderer = (): string | null => {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl", {
        antialias: false,
        depth: false,
        stencil: false
      }) ??
        canvas.getContext("experimental-webgl", {
          antialias: false,
          depth: false,
          stencil: false
        })) as WebGLRenderingContext | null;

      if (!gl) {
        return null;
      }

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info") as { UNMASKED_RENDERER_WEBGL: number } | null;
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return typeof renderer === "string" ? renderer : null;
      }

      const fallbackRenderer = gl.getParameter(gl.RENDERER);
      return typeof fallbackRenderer === "string" ? fallbackRenderer : null;
    };

    const gpuRenderer = getWebGlRenderer();
    const virtualizedGpu = isVirtualizedGpuRenderer(gpuRenderer);
    const fullscreenCapable = typeof document.documentElement.requestFullscreen === "function";
    let multiTabLockAvailable = false;
    try {
      const probeKey = "__ctrl_lock_probe__";
      window.localStorage.setItem(probeKey, "ok");
      window.localStorage.removeItem(probeKey);
      multiTabLockAvailable = true;
    } catch {
      multiTabLockAvailable = false;
    }

    const fingerprintSource = [
      userAgent,
      navigator.platform || "",
      navigator.language || "",
      hardwareConcurrency?.toString() ?? "null",
      viewport.width.toString(),
      viewport.height.toString(),
      screen.width.toString(),
      screen.height.toString(),
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      gpuRenderer || ""
    ].join("|");

    const fingerprint = await sha256Hex(fingerprintSource);

    const nextPayload: AssessmentEnvironmentPayload = {
      touchDevice,
      smallViewport,
      webdriver,
      lowCpuCores,
      virtualizedGpu,
      mobileUserAgent,
      fullscreenCapable,
      multiTabLockAvailable,
      viewport,
      hardwareConcurrency,
      gpuRenderer,
      fingerprint,
      userAgent,
      checkedAt: new Date().toISOString()
    };

    try {
      window.sessionStorage.setItem(
        ENVIRONMENT_CACHE_KEY,
        JSON.stringify({
          cachedAt: Date.now(),
          payload: nextPayload
        })
      );
    } catch {}
    setPayload(nextPayload);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const revalidate = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);

    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: number | undefined;
    const revalidateOnResize = () => {
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        void refresh();
      }, 180);
    };

    window.addEventListener("resize", revalidateOnResize);
    window.addEventListener("orientationchange", revalidateOnResize);

    return () => {
      window.removeEventListener("resize", revalidateOnResize);
      window.removeEventListener("orientationchange", revalidateOnResize);
      if (typeof timeoutId === "number") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [refresh]);

  const checks = useMemo(
    () =>
      payload
        ? {
            touchDevice: payload.touchDevice,
            smallViewport: payload.smallViewport,
            webdriver: payload.webdriver,
            lowCpuCores: payload.lowCpuCores,
            virtualizedGpu: payload.virtualizedGpu
          }
        : DEFAULT_CHECKS,
    [payload]
  );

  const policy = useMemo(
    () =>
      evaluateAssessmentEnvironment({
        ...checks,
        mobileUserAgent: payload?.mobileUserAgent,
        fullscreenCapable: payload?.fullscreenCapable,
        multiTabLockAvailable: payload?.multiTabLockAvailable
      }),
    [checks, payload?.fullscreenCapable, payload?.mobileUserAgent, payload?.multiTabLockAvailable]
  );
  const reasons = policy.blockingReasons;
  const warnings = policy.warnings;
  const valid = ready && reasons.length === 0;

  return {
    ready,
    valid,
    checks,
    reasons,
    warnings,
    payload,
    refresh
  };
}
