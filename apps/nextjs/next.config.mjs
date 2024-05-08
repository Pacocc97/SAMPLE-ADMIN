/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds and Linting.
 */
// !process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@acme/api", "@acme/auth", "@acme/db"],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI },
  reactStrictMode: true,
  output: "standalone",

  images: {
    deviceSizes: [64, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    domains: [
      process.env.NEXT_PUBLIC_AMAZON_CLOUDFRONT_URL?.replace("https://", "") ??
        "",
      "lh3.googleusercontent.com",
      "cloudflare-ipfs.com",
      "flowbite.com",
      "cdn.discordapp.com",
    ],
  },
};

export default config;
