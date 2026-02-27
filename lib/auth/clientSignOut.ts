"use client";

type SignOutListener = (pending: boolean) => void;

let signOutInProgress = false;
const signOutListeners = new Set<SignOutListener>();

function notifySignOutListeners() {
  for (const listener of signOutListeners) {
    listener(signOutInProgress);
  }
}

function setSignOutInProgress(next: boolean) {
  if (signOutInProgress === next) {
    return;
  }
  signOutInProgress = next;
  notifySignOutListeners();
}

export function getSignOutInProgress() {
  return signOutInProgress;
}

export function onSignOutStateChange(listener: SignOutListener) {
  signOutListeners.add(listener);
  return () => {
    signOutListeners.delete(listener);
  };
}

async function clearIndexedDbDatabases() {
  if (typeof indexedDB === "undefined") {
    return;
  }

  const factory = indexedDB as IDBFactory & {
    databases?: () => Promise<Array<{ name?: string }>>;
  };
  if (!factory.databases) {
    return;
  }

  const dbs = await factory.databases().catch(() => []);
  const deleteOps = dbs
    .map((db) => db.name)
    .filter((name): name is string => Boolean(name))
    .map(
      (name) =>
        new Promise<void>((resolve) => {
          const request = indexedDB.deleteDatabase(name);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        })
    );

  await Promise.all(deleteOps);
}

async function clearBrowserState() {
  try {
    window.localStorage.clear();
  } catch {}

  try {
    window.sessionStorage.clear();
  } catch {}

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {}

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch {}

  try {
    await clearIndexedDbDatabases();
  } catch {}

  try {
    await fetch("/api/auth/clear-site-data", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch {}
}

async function sendLogoutRequest() {
  try {
    const response = await fetch("/api/session/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      keepalive: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.ok;
  } catch {}
  return false;
}

export async function signOutToRoot() {
  if (signOutInProgress) {
    return;
  }

  setSignOutInProgress(true);

  const rootUrl = typeof window !== "undefined" ? `${window.location.origin}/` : "/";
  const fallbackUrl = typeof window !== "undefined" ? `${window.location.origin}/logout` : "/logout";
  const hardRedirectTimeout = typeof window !== "undefined"
    ? window.setTimeout(() => {
        window.location.assign(rootUrl);
      }, 1500)
    : null;

  try {
    const logoutApiOk = await Promise.race([
      sendLogoutRequest(),
      new Promise<void>((resolve) => {
        if (typeof window === "undefined") {
          resolve(undefined);
          return;
        }
        window.setTimeout(() => resolve(undefined), 700);
      })
    ]).then((value) => Boolean(value));

    await clearBrowserState();

    if (hardRedirectTimeout !== null) {
      window.clearTimeout(hardRedirectTimeout);
    }
    window.location.replace(logoutApiOk ? rootUrl : fallbackUrl);
  } catch {
    if (hardRedirectTimeout !== null) {
      window.clearTimeout(hardRedirectTimeout);
    }
    setSignOutInProgress(false);
    if (typeof window !== "undefined") {
      window.location.assign(fallbackUrl);
    }
  }
}
