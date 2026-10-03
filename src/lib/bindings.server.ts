// Server-only access to runtime bindings. Cloudflare Workers provides a global
// `env` object, while Vercel/Nitro provides process.env. Keeping this adapter
// runtime-neutral lets the same app build on both platforms.
// Import the binding types directly — NOT via the global tsconfig `types` list,
// which would clobber the DOM globals the client/SSR React code relies on.
import type {
  D1Database,
  DurableObjectNamespace,
  KVNamespace,
  R2Bucket,
} from "@cloudflare/workers-types";

type AppEnv = {
  DB?: D1Database;
  STORAGE?: R2Bucket;
  KV?: KVNamespace;
  // The container's Durable Object — present only when "container" is set in
  // the manifest. Reach an instance with env.CONTAINER.getByName(id), then
  // .fetch(). See skills/containers.md.
  CONTAINER?: DurableObjectNamespace;
  HF_ENV?: string;
  APP_SLUG?: string;
  ADMIN_EMAIL?: string;
  ADMIN_INITIAL_PASSWORD?: string;
  RESEND_API_KEY?: string;
  MAIL_FROM?: string;
};

export function bindings(): AppEnv {
  const workerEnv = (globalThis as typeof globalThis & { env?: unknown }).env;
  if (workerEnv && typeof workerEnv === "object") return workerEnv as AppEnv;

  if (typeof process !== "undefined" && process.env) {
    return process.env as unknown as AppEnv;
  }

  return {};
}
