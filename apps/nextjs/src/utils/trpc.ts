import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import type { AppRouter } from "@acme/api/src/root";

/**
 * This is the client-side entrypoint for your tRPC API.
 * It is used to create the `trpc` object which contains the Next.js
 * App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types
 */
export const trpc = createTRPCNext<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     *
     * @see https://trpc.io/docs/ssr
     **/
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       **/
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       **/
      links: [
        /**
         * It allows you to see more clearly what operations are queries, mutations,
         * or subscriptions, their requests, and responses. The link, by default, prints
         * a prettified log to the browser's console. However, you can customize the logging
         * behavior and the way it prints to the console with your own implementations.
         *
         * @see https://trpc.io/docs/links/loggerLink
         **/
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),

        /**
         * httpBatchLink is a terminating link that batches an array of individual tRPC
         * operations into a single HTTP request that's sent to a single tRPC procedure.
         *
         * You can make use of batching by setting all your procedures in a Promise.all.
         * It will produce exactly one HTTP request and on the server exactly one database query.
         *
         * @see https://trpc.io/docs/links/httpBatchLink
         **/
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],

      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       **/
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   **/
  ssr: true,
});

/**
 * Inference helper for inputs
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Get the base URL for the API
 * @see https://trpc.io/docs/ssr
 *
 **/
function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // reference for vercel.com
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}
