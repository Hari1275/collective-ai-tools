/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project API key. Safe to expose in the client bundle. */
  readonly VITE_POSTHOG_KEY?: string;
  /** PostHog host. Defaults to https://us.i.posthog.com when unset. */
  readonly VITE_POSTHOG_HOST?: string;
  /** Set to 'true' in .env.local to use a real backend instead of MSW mocks in dev. */
  readonly VITE_USE_REAL_API?: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
