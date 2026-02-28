import type { Metadata } from "next";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import Script from "next/script";
import { AuthProvider } from "@/components/auth/providers";
import { AuthUIProvider } from "@/components/AuthUIProvider";
import PublicSiteFrame from "@/components/PublicSiteFrame";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { plexMono, plexSans } from "@/app/ui/fonts";
import { authOptions } from "@/lib/auth/auth";
import { CTRL_LOCKUP } from "@/lib/brand";
import { inferTenantFromEmail, TenantSlug } from "@/lib/portal/tenant";
import { CTRL_THEMES, DEFAULT_CTRL_THEME } from "@/lib/theme/constants";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: CTRL_LOCKUP,
  description: "CTRL secure recruitment and assessment platform",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: "/apple-icon.png",
    shortcut: "/icon.png"
  }
};

type UiRole = "candidate" | "client" | "admin";

function resolveUiRole(role?: Role): UiRole {
  if (role === Role.CLIENT) {
    return "client";
  }

  if (role === Role.SUPER_ADMIN || role === Role.RECRUITER) {
    return "admin";
  }

  return "candidate";
}

function resolveTenant(email?: string | null): TenantSlug {
  if (!email) {
    return "met-police";
  }
  return inferTenantFromEmail(email);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const uiRole = resolveUiRole(session?.user?.role);
  const tenant = resolveTenant(session?.user?.email);
  const themeBootstrapScript = `(() => {
    try {
      const key = "ctrl-theme";
      const themes = ${JSON.stringify(CTRL_THEMES)};
      const stored = window.localStorage.getItem(key);
      if (stored && themes.includes(stored)) {
        document.documentElement.dataset.theme = stored;
      }
    } catch {}
  })();`;

  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
      data-theme={DEFAULT_CTRL_THEME}
      data-tone="0"
      data-role={uiRole}
      data-tenant={tenant}
    >
      <body className="font-sans">
        <Script id="ctrl-theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrapScript}
        </Script>
        <ThemeProvider>
          <AuthProvider session={session}>
            <AuthUIProvider>
              <PublicSiteFrame>{children}</PublicSiteFrame>
            </AuthUIProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
