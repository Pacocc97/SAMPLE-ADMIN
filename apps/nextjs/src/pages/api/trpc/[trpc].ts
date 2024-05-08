import { type NextApiRequest, type NextApiResponse } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import cors from "nextjs-cors";

import { appRouter, createTRPCContext } from "@acme/api";

import { env } from "~/env.mjs";

// export API handler

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "40MB",
    },
  },
};

// If you need to enable cors, you can do so like this:
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Enable cors
  await cors(req, res);

  // Let the tRPC handler do its magic
  return createNextApiHandler({
    /**
     * This is the router that contains all of your API endpoints.
     * You can import it from anywhere, but it's usually best to keep it in a
     * separate file.
     *
     * @see https://trpc.io/docs/router
     **/
    router: appRouter,

    /**
     * This is the actual context you will use in your router. It will be used to
     * process every request that goes through your tRPC endpoint.
     *
     * @see https://trpc.io/docs/context
     */
    createContext: createTRPCContext,

    /**
     * This is where you can handle errors that occur in your tRPC endpoint.
     * You can use this to log errors, send them to Sentry, etc.
     *
     * @see https://trpc.io/docs/error-handling
     */
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.error(`❌ tRPC failed on ${path}: ${error}`);
        }
        : undefined,

    /**
     * Enable query batching.
     * When batching, we combine all parallel procedure calls of the same HTTP method in one request using a data loader.
     *
     * @see https://trpc.io/docs/rpc#batching
     */
    batching: {
      enabled: true,
    },

    /**
     * Since all queries are normal HTTP GETs, we can use normal HTTP headers to cache responses,
     * make the responses snappy, give your database a rest, and easily scale your API to gazillions of users.
     *
     * @see https://trpc.io/docs/caching#api-response-caching
     */
    // responseMeta() {
    //   // ...
    // },
  })(req, res);
};

export default handler;
