import { httpBatchLink } from "@trpc/client";
import { createTRPCProxyClient } from "@trpc/react-query";
import superjson from "superjson";

import type { AppRouter } from "@acme/api";

export type { RouterInputs, RouterOutputs } from "@acme/api";

const getBaseUrl = () => {
  return import.meta.env.SERVER_URL // process.env.SERVER_URL;
};

export const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

const getBasePublicUrl = () => {
  return import.meta.env.PUBLIC_SERVER_URL // process.env.PUBLIC_SERVER_URL;
};

export const apiPublic = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBasePublicUrl()}/api/trpc`,
    }),
  ],
});
