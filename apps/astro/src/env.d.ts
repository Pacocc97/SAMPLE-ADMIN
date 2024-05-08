/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SERVER_URL: string;
  readonly PUBLIC_OPENPAY_MERCHANT_ID: string;
  readonly PUBLIC_OPENPAY_PUBLIC_API_KEY: string;
  readonly PUBLIC_SERVER_URL: string;
  readonly VERCEL_URL: string;
  readonly PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
