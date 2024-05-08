import type { NextApiRequest, NextApiResponse } from "next";

// import { getServerAuthSession } from "~/server/config/auth";

/**
 * Example of a restricted endpoint that only authenticated users can access from
 *
 * @see https://next-auth.js.org/getting-started/example
 **/
// eslint-disable-next-line @typescript-eslint/require-await
const restricted = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = false//await getServerAuthSession({ req, res });

  if (session) {
    res.send({
      content:
        "This is protected content. You can access this content because you are signed in.",
    });
  } else {
    res.send({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }
};

export default restricted;
